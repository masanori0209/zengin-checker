// 文字コード判定ユーティリティ

export type EncodingType = 'Shift_JIS' | 'Unknown';
export type LineEndingType = 'CRLF' | 'LF' | 'CR' | 'Mixed' | 'None';

export interface LineEndingInfo {
  type: LineEndingType;
  count: number;
  details: {
    crlf: number;
    lf: number;
    cr: number;
  };
  totalLength: number; // 改行コード含む文字列長
  contentLength: number; // 改行コード除く文字列長
}

export interface EncodingDetectionResult {
  encoding: EncodingType;
  confidence: number;
  rawContent: string;
  decodedContent: string;
  isValidShiftJIS: boolean;
  error?: string;
  debugInfo?: string;
  browserSupport?: string;
  lineEndingInfo?: LineEndingInfo;
}

// ブラウザのShift_JIS対応チェック
const checkShiftJISSupport = (): boolean => {
  try {
    const testBytes = new Uint8Array([0x82, 0xA0]); // "あ" in Shift_JIS
    const decoder = new TextDecoder('shift_jis', { fatal: true });
    const result = decoder.decode(testBytes);
    return result.length > 0;
  } catch (error) {
    return false;
  }
};

// 改行コード検出関数
const detectLineEndings = (content: string): LineEndingInfo => {
  // CRLF を最初にカウント
  const crlfCount = (content.match(/\r\n/g) || []).length;
  
  // CRLF を一時的に置換してから LF と CR をカウント
  const tempContent = content.replace(/\r\n/g, '');
  const lfCount = (tempContent.match(/\n/g) || []).length;
  const crCount = (tempContent.match(/\r/g) || []).length;
  
  const totalLineEndings = crlfCount + lfCount + crCount;
  
  let type: LineEndingType;
  if (totalLineEndings === 0) {
    type = 'None';
  } else if (crlfCount > 0 && lfCount === 0 && crCount === 0) {
    type = 'CRLF';
  } else if (lfCount > 0 && crlfCount === 0 && crCount === 0) {
    type = 'LF';
  } else if (crCount > 0 && crlfCount === 0 && lfCount === 0) {
    type = 'CR';
  } else {
    type = 'Mixed';
  }
  
  const totalLength = content.length;
  const contentLength = content.replace(/\r\n|\r|\n/g, '').length;
  
  return {
    type,
    count: totalLineEndings,
    details: {
      crlf: crlfCount,
      lf: lfCount,
      cr: crCount
    },
    totalLength,
    contentLength
  };
};

// バイト配列から文字コードを推定（Shift_JISのみ対応）
export const detectEncoding = async (file: File): Promise<EncodingDetectionResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      
      // ブラウザのShift_JIS対応状況をチェック
      const browserSupportsShiftJIS = checkShiftJISSupport();
      const browserSupport = browserSupportsShiftJIS ? 'TextDecoder対応' : 'TextDecoder非対応（フォールバック使用）';
      
      // Shift_JISの判定
      const scoreResult = calculateShiftJisScore(bytes);
      const isValidShiftJIS = scoreResult.score > 0.3; // より現実的な閾値
      
      let decodedContent: string;
      let error: string | undefined;
      let lineEndingInfo: LineEndingInfo | undefined;
      
      if (isValidShiftJIS) {
        try {
          decodedContent = decodeShiftJIS(bytes);
          // デコード後の内容をチェック
          if (!decodedContent || decodedContent.length === 0) {
            throw new Error('デコード結果が空です');
          }
          // 改行コード検出
          lineEndingInfo = detectLineEndings(decodedContent);
        } catch (decodeError) {
          // フォールバック: より寛容なデコード
          try {
            const decoder = new TextDecoder('shift_jis', { fatal: false });
            decodedContent = decoder.decode(bytes);
            if (!decodedContent || decodedContent.length === 0) {
              throw new Error('フォールバックデコードも失敗');
            }
            // 改行コード検出
            lineEndingInfo = detectLineEndings(decodedContent);
          } catch (fallbackError) {
            decodedContent = '';
            error = `Shift_JISでのデコードに失敗しました: ${decodeError}`;
          }
        }
      } else {
        decodedContent = '';
        error = `このファイルはShift_JISエンコードされていません。判定スコア: ${scoreResult.score.toFixed(3)} (閾値: 0.3)`;
      }
      
      resolve({
        encoding: isValidShiftJIS ? 'Shift_JIS' : 'Unknown',
        confidence: scoreResult.score,
        rawContent: new TextDecoder('utf-8', { fatal: false }).decode(bytes),
        decodedContent,
        isValidShiftJIS,
        error,
        debugInfo: scoreResult.debugInfo,
        browserSupport,
        lineEndingInfo
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Shift_JISの判定スコア計算（改善版）
const calculateShiftJisScore = (bytes: Uint8Array): { score: number; debugInfo: string } => {
  let score = 0;
  let totalBytes = bytes.length;
  let asciiCount = 0;
  let halfKanaCount = 0;
  let doubleByteCount = 0;
  let invalidBytes = 0;
  let debugInfo = '';
  
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    
    // ASCII範囲（制御文字も含む）
    if (byte <= 0x7F) {
      asciiCount++;
      score += 0.5; // ASCIIのスコアを上げる
      continue;
    }
    
    // 半角カナ
    if (byte >= 0xA1 && byte <= 0xDF) {
      halfKanaCount++;
      score += 1.0;
      continue;
    }
    
    // Shift_JIS 2バイト文字の1バイト目
    if (((byte >= 0x81 && byte <= 0x9F) || (byte >= 0xE0 && byte <= 0xFC)) && 
        i + 1 < bytes.length) {
      const nextByte = bytes[i + 1];
      // 2バイト目の有効範囲チェック
      if ((nextByte >= 0x40 && nextByte <= 0x7E) || (nextByte >= 0x80 && nextByte <= 0xFC)) {
        doubleByteCount += 2;
        score += 1.5; // 2バイト文字のスコア
        i++; // 次のバイトをスキップ
      } else {
        invalidBytes++;
      }
    } else {
      // 無効なバイト
      invalidBytes++;
    }
  }
  
  // デバッグ情報
  debugInfo = `総バイト数: ${totalBytes}, ASCII: ${asciiCount}, 半角カナ: ${halfKanaCount}, 2バイト文字: ${doubleByteCount/2}, 無効: ${invalidBytes}`;
  
  // スコア計算の調整
  const finalScore = Math.min(score / totalBytes, 1.0);
  
  // 無効なバイトが多すぎる場合は大幅にスコアを下げる
  if (invalidBytes > totalBytes * 0.2) {
    return { score: finalScore * 0.1, debugInfo: debugInfo + ' (無効バイト多数)' };
  }
  
  // 全てASCIIの場合でも、Shift_JISとして有効
  if (asciiCount === totalBytes && totalBytes > 0) {
    return { score: 0.8, debugInfo: debugInfo + ' (全ASCII)' };
  }
  
  return { score: finalScore, debugInfo };
};

// Shift_JISでデコード（改善版）
const decodeShiftJIS = (bytes: Uint8Array): string => {
  try {
    // まず厳密モードでトライ
    const decoder = new TextDecoder('shift_jis', { fatal: true });
    return decoder.decode(bytes);
  } catch (error) {
    // 厳密モードで失敗した場合、寛容モードでトライ
    try {
      const decoder = new TextDecoder('shift_jis', { fatal: false });
      const result = decoder.decode(bytes);
      if (result && result.length > 0) {
        return result;
      }
    } catch (fallbackError) {
      // TextDecoderが対応していない場合のフォールバック
      console.warn('TextDecoder for Shift_JIS not supported, using fallback');
    }
    
    // フォールバック: 簡易Shift_JISデコード
    return fallbackShiftJISDecoder(bytes);
  }
};

// 簡易Shift_JISデコーダー（フォールバック用）
const fallbackShiftJISDecoder = (bytes: Uint8Array): string => {
  let result = '';
  
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    
    // ASCII範囲
    if (byte <= 0x7F) {
      result += String.fromCharCode(byte);
      continue;
    }
    
    // 半角カナ
    if (byte >= 0xA1 && byte <= 0xDF) {
      // 半角カナをそのまま文字として扱う（簡易版）
      result += String.fromCharCode(byte);
      continue;
    }
    
    // Shift_JIS 2バイト文字
    if (((byte >= 0x81 && byte <= 0x9F) || (byte >= 0xE0 && byte <= 0xFC)) && 
        i + 1 < bytes.length) {
      const nextByte = bytes[i + 1];
      if ((nextByte >= 0x40 && nextByte <= 0x7E) || (nextByte >= 0x80 && nextByte <= 0xFC)) {
        // 2バイト文字として処理（簡易版：そのまま文字コードとして扱う）
        result += String.fromCharCode((byte << 8) | nextByte);
        i++; // 次のバイトをスキップ
      } else {
        // 無効な2バイト目の場合、代替文字を使用
        result += '?';
      }
    } else {
      // その他の場合は代替文字
      result += '?';
    }
  }
  
  return result;
};

// エンコーディング名の日本語表示
export const getEncodingDisplayName = (encoding: EncodingType): string => {
  switch (encoding) {
    case 'Shift_JIS':
      return 'Shift_JIS';
    default:
      return '不明';
  }
};

// エンコーディングの詳細情報
export const getEncodingDetails = (result: EncodingDetectionResult): string => {
  if (result.isValidShiftJIS) {
    return `文字コード: ${getEncodingDisplayName(result.encoding)} (信頼度: ${Math.round(result.confidence * 100)}%)`;
  } else {
    return result.error || '対応していない文字コードです';
  }
};

// 改行コードの表示名を取得
export const getLineEndingDisplayName = (type: LineEndingType): string => {
  switch (type) {
    case 'CRLF':
      return 'CRLF (Windows)';
    case 'LF':
      return 'LF (Unix/Linux/Mac)';
    case 'CR':
      return 'CR (Classic Mac)';
    case 'Mixed':
      return '混在';
    case 'None':
      return 'なし';
    default:
      return '不明';
  }
};

// 改行コード情報の詳細を取得
export const getLineEndingDetails = (lineEndingInfo: LineEndingInfo): string => {
  if (lineEndingInfo.count === 0) {
    return '改行なし';
  }
  
  const details = [];
  if (lineEndingInfo.details.crlf > 0) {
    details.push(`CRLF: ${lineEndingInfo.details.crlf}`);
  }
  if (lineEndingInfo.details.lf > 0) {
    details.push(`LF: ${lineEndingInfo.details.lf}`);
  }
  if (lineEndingInfo.details.cr > 0) {
    details.push(`CR: ${lineEndingInfo.details.cr}`);
  }
  
  return details.join(', ');
}; 
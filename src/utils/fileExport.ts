import type { ParsedRecord } from './zenginLayout';
import { zenginLayout } from './zenginLayout';

export interface ExportOptions {
  encoding: 'shift_jis' | 'utf-8';
  lineEnding: 'crlf' | 'lf';
}

/**
 * ParsedRecordから固定長フォーマットの文字列を再構築
 */
export const reconstructRecord = (record: ParsedRecord): string => {
  const layout = zenginLayout.find(l => l.recordType === record.recordType);
  if (!layout) {
    // レイアウトが見つからない場合は元の生データを返す
    return record.rawData;
  }

  // 固定長レコードの長さを計算
  const maxEnd = Math.max(...layout.fields.map(f => f.start + f.length - 1));
  const recordLength = maxEnd;
  
  // 空文字で埋めた配列を作成
  const chars = new Array(recordLength).fill(' ');

  // 各フィールドの値を配置
  layout.fields.forEach(field => {
    const value = record.fields[field.name] || '';
    const paddedValue = value.padEnd(field.length, ' ').substring(0, field.length);
    
    // 1-based indexを0-basedに変換
    const startIndex = field.start - 1;
    
    for (let i = 0; i < paddedValue.length; i++) {
      chars[startIndex + i] = paddedValue[i];
    }
  });

  return chars.join('');
};

/**
 * 文字列をShift_JISでエンコード（近似）
 * 注意: ブラウザでは完全なShift_JISエンコードは困難なため、
 * 可能な限り近い形でエンコードします
 */
const encodeShiftJIS = (text: string): Uint8Array => {
  // TextEncoderでは直接Shift_JISをサポートしていないため、
  // 代替手段として文字コード変換を行います
  
  const encoder = new TextEncoder();
  
  // 基本的なASCII文字と半角カナの変換テーブル
  const shiftJISMap: { [key: string]: number[] } = {
    // 半角カナ
    'ｱ': [0xB1], 'ｲ': [0xB2], 'ｳ': [0xB3], 'ｴ': [0xB4], 'ｵ': [0xB5],
    'ｶ': [0xB6], 'ｷ': [0xB7], 'ｸ': [0xB8], 'ｹ': [0xB9], 'ｺ': [0xBA],
    'ｻ': [0xBB], 'ｼ': [0xBC], 'ｽ': [0xBD], 'ｾ': [0xBE], 'ｿ': [0xBF],
    'ﾀ': [0xC0], 'ﾁ': [0xC1], 'ﾂ': [0xC2], 'ﾃ': [0xC3], 'ﾄ': [0xC4],
    'ﾅ': [0xC5], 'ﾆ': [0xC6], 'ﾇ': [0xC7], 'ﾈ': [0xC8], 'ﾉ': [0xC9],
    'ﾊ': [0xCA], 'ﾋ': [0xCB], 'ﾌ': [0xCC], 'ﾍ': [0xCD], 'ﾎ': [0xCE],
    'ﾏ': [0xCF], 'ﾐ': [0xD0], 'ﾑ': [0xD1], 'ﾒ': [0xD2], 'ﾓ': [0xD3],
    'ﾔ': [0xD4], 'ﾕ': [0xD5], 'ﾖ': [0xD6],
    'ﾗ': [0xD7], 'ﾘ': [0xD8], 'ﾙ': [0xD9], 'ﾚ': [0xDA], 'ﾛ': [0xDB],
    'ﾜ': [0xDC], 'ﾝ': [0xDD],
    'ﾞ': [0xDE], 'ﾟ': [0xDF],
    'ｧ': [0xA7], 'ｨ': [0xA8], 'ｩ': [0xA9], 'ｪ': [0xAA], 'ｫ': [0xAB],
    'ｬ': [0xAC], 'ｭ': [0xAD], 'ｮ': [0xAE], 'ｯ': [0xAF],
    'ｰ': [0xB0],
    '｡': [0xA1], '｢': [0xA2], '｣': [0xA3], '､': [0xA4], '･': [0xA5]
  };

  const result: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charCode = char.charCodeAt(0);

    if (shiftJISMap[char]) {
      // 半角カナ文字
      result.push(...shiftJISMap[char]);
    } else if (charCode <= 0x7F) {
      // ASCII文字
      result.push(charCode);
    } else {
      // その他の文字はUTF-8でエンコード（近似）
      const utf8Bytes = encoder.encode(char);
      result.push(...Array.from(utf8Bytes));
    }
  }

  return new Uint8Array(result);
};

/**
 * レコード配列をファイルとしてダウンロード
 */
export const downloadRecords = (
  records: ParsedRecord[],
  filename: string = 'zengin_data.txt',
  options: ExportOptions = { encoding: 'shift_jis', lineEnding: 'crlf' }
): void => {
  // レコードを固定長フォーマットに再構築
  const lines = records.map(record => reconstructRecord(record));
  
  // 改行コードを適用
  const lineEnding = options.lineEnding === 'crlf' ? '\r\n' : '\n';
  const content = lines.join(lineEnding);

  let blob: Blob;

  if (options.encoding === 'shift_jis') {
    // Shift_JISでエンコード
    const encodedData = encodeShiftJIS(content);
    blob = new Blob([encodedData], { type: 'text/plain' });
  } else {
    // UTF-8でエンコード
    blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  }

  // ダウンロード実行
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 選択されたレコードのみをダウンロード
 */
export const downloadSelectedRecords = (
  records: ParsedRecord[],
  selectedIndices: number[],
  filename: string = 'zengin_data_selected.txt',
  options: ExportOptions = { encoding: 'shift_jis', lineEnding: 'crlf' }
): void => {
  const selectedRecords = selectedIndices.map(index => records[index]).filter(Boolean);
  downloadRecords(selectedRecords, filename, options);
};

/**
 * CSVフォーマットでダウンロード（デバッグ用）
 */
export const downloadAsCSV = (
  records: ParsedRecord[],
  filename: string = 'zengin_data.csv'
): void => {
  if (records.length === 0) return;

  // 全フィールド名を収集
  const allFieldNames = new Set<string>();
  records.forEach(record => {
    Object.keys(record.fields).forEach(fieldName => {
      allFieldNames.add(fieldName);
    });
  });

  const fieldNames = Array.from(allFieldNames);
  
  // CSVヘッダー
  const headers = ['行番号', 'レコード種別', '状態', ...fieldNames];
  
  // CSVデータ
  const csvRows = [headers.join(',')];
  
  records.forEach(record => {
    const row = [
      record.lineNumber.toString(),
      record.recordType,
      record.validation.isValid ? '正常' : 'エラー',
      ...fieldNames.map(fieldName => {
        const value = record.fields[fieldName] || '';
        // CSVエスケープ
        return `"${value.replace(/"/g, '""')}"`;
      })
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 
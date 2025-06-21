import { useState, useCallback } from 'react';
import { detectEncoding, type EncodingDetectionResult } from '../utils/detectEncoding';
import { parseRecord, type ParsedRecord } from '../utils/zenginLayout';

export interface ZenginParseResult {
  encodingResult: EncodingDetectionResult | null;
  parsedRecords: ParsedRecord[];
  totalRecords: number;
  errorCount: number;
  headerRecord: ParsedRecord | null;
  dataRecords: ParsedRecord[];
  trailerRecord: ParsedRecord | null;
  endRecord: ParsedRecord | null;
  allErrors: string[];
}

export interface UseZenginParserReturn {
  parseResult: ZenginParseResult | null;
  isLoading: boolean;
  error: string | null;
  parseFile: (file: File) => Promise<void>;
  clearData: () => void;
  updateRecord: (index: number, updatedRecord: ParsedRecord) => void;
}

// const initialParseResult: ZenginParseResult = {
//   encodingResult: null,
//   parsedRecords: [],
//   totalRecords: 0,
//   errorCount: 0,
//   headerRecord: null,
//   dataRecords: [],
//   trailerRecord: null,
//   allErrors: []
// };

export const useZenginParser = (): UseZenginParserReturn => {
  const [parseResult, setParseResult] = useState<ZenginParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // ファイル拡張子チェック
      const allowedExtensions = ['.txt', '.dat'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error(`サポートされていないファイル形式です。${allowedExtensions.join(', ')} のみ対応しています。`);
      }

      // 文字コード判定
      const encodingResult = await detectEncoding(file);
      
      // Shift_JISでない場合はエラー
      if (!encodingResult.isValidShiftJIS) {
        throw new Error(encodingResult.error || 'このファイルはShift_JISエンコードされていません。Shift_JISでエンコードされたファイルのみ対応しています。');
      }

      // デコードされたコンテンツが空の場合もエラー
      if (!encodingResult.decodedContent || encodingResult.decodedContent.trim().length === 0) {
        throw new Error('ファイルの内容を正しく読み込めませんでした。Shift_JISでエンコードされたファイルかご確認ください。');
      }
      
      // ファイル内容を行ごとに分割
      const lines = encodingResult.decodedContent
        .split(/\r?\n/)
        .filter(line => line.trim().length > 0); // 空行を除外

      if (lines.length === 0) {
        throw new Error('ファイルが空です。');
      }

      // 各行を解析
      const parsedRecords: ParsedRecord[] = [];
      const allErrors: string[] = [];
      let headerRecord: ParsedRecord | null = null;
      const dataRecords: ParsedRecord[] = [];
      let trailerRecord: ParsedRecord | null = null;
      let endRecord: ParsedRecord | null = null;

      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const parsedRecord = parseRecord(line, lineNumber);
        
        parsedRecords.push(parsedRecord);
        
        // エラー収集
        if (!parsedRecord.validation.isValid) {
          allErrors.push(...parsedRecord.validation.errors);
        }
        
        // レコード種別ごとに分類
        switch (parsedRecord.recordType) {
          case 'header':
            if (headerRecord) {
              allErrors.push(`行 ${lineNumber}: ヘッダーレコードが複数存在します。`);
            } else {
              headerRecord = parsedRecord;
            }
            break;
          case 'data':
            dataRecords.push(parsedRecord);
            break;
          case 'trailer':
            if (trailerRecord) {
              allErrors.push(`行 ${lineNumber}: トレーラーレコードが複数存在します。`);
            } else {
              trailerRecord = parsedRecord;
            }
            break;
          case 'end':
            if (endRecord) {
              allErrors.push(`行 ${lineNumber}: エンドレコードが複数存在します。`);
            } else {
              endRecord = parsedRecord;
            }
            break;
          case 'unknown':
            allErrors.push(`行 ${lineNumber}: 不明なレコード区分です。`);
            break;
        }
      });

      // 構造チェック
      if (!headerRecord) {
        allErrors.push('ヘッダーレコードが見つかりません。');
      }
      
      if (!trailerRecord) {
        allErrors.push('トレーラーレコードが見つかりません。');
      }
      
      if (dataRecords.length === 0) {
        allErrors.push('データレコードが見つかりません。');
      }

      // エンドレコードは任意（ファイル終端を示すため）
      if (!endRecord) {
        // 警告レベル（エラーではない）
        console.warn('エンドレコードが見つかりません。');
      }

      // トレーラーの件数チェック
      if (trailerRecord && (trailerRecord as ParsedRecord).fields['合計件数']) {
        const expectedCount = parseInt((trailerRecord as ParsedRecord).fields['合計件数'], 10);
        if (!isNaN(expectedCount) && expectedCount !== dataRecords.length) {
          allErrors.push(`データ件数が一致しません。期待値: ${expectedCount}, 実際: ${dataRecords.length}`);
        }
      }

      // 結果をセット
      const result: ZenginParseResult = {
        encodingResult,
        parsedRecords,
        totalRecords: lines.length,
        errorCount: allErrors.length,
        headerRecord,
        dataRecords,
        trailerRecord,
        endRecord,
        allErrors
      };

      setParseResult(result);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました。';
      setError(errorMessage);
      setParseResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setParseResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const updateRecord = useCallback((index: number, updatedRecord: ParsedRecord) => {
    if (!parseResult) return;

    const newParsedRecords = [...parseResult.parsedRecords];
    newParsedRecords[index] = updatedRecord;

    // エラー数を再計算
    const errorCount = newParsedRecords.filter(record => !record.validation.isValid).length;
    
    // 全エラーを再収集
    const allErrors: string[] = [];
    newParsedRecords.forEach(record => {
      if (!record.validation.isValid) {
        allErrors.push(...record.validation.errors);
      }
    });

    // レコード種別ごとに再分類
    let headerRecord: ParsedRecord | null = null;
    const dataRecords: ParsedRecord[] = [];
    let trailerRecord: ParsedRecord | null = null;
    let endRecord: ParsedRecord | null = null;

    newParsedRecords.forEach(record => {
      switch (record.recordType) {
        case 'header':
          headerRecord = record;
          break;
        case 'data':
          dataRecords.push(record);
          break;
        case 'trailer':
          trailerRecord = record;
          break;
        case 'end':
          endRecord = record;
          break;
      }
    });

    const updatedResult: ZenginParseResult = {
      ...parseResult,
      parsedRecords: newParsedRecords,
      errorCount,
      allErrors,
      headerRecord,
      dataRecords,
      trailerRecord,
      endRecord
    };

    setParseResult(updatedResult);
  }, [parseResult]);

  return {
    parseResult,
    isLoading,
    error,
    parseFile,
    clearData,
    updateRecord
  };
}; 
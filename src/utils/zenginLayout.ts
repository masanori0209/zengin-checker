// 全銀フォーマットのレイアウト定義

export interface ZenginField {
  name: string;
  start: number;
  length: number;
  type: 'numeric' | 'alphanumeric' | 'kana' | 'date';
  required: boolean;
  description: string;
  validation?: (value: string) => boolean;
}

export interface ZenginRecordLayout {
  recordType: string;
  description: string;
  fields: ZenginField[];
}

// JIS X 0201に基づく全銀フォーマット用半角カナ文字の定義
const ZENGIN_HALFWIDTH_KANA = {
  // 句読点・記号 (0xA1-0xA5)
  PUNCTUATION: 'ｦｧｨｩｪｫｬｭｮｯ',
  // 長音記号 (0xB0)
  LONG_VOWEL: 'ｰ',
  // 基本カタカナ (0xB1-0xDD)
  BASIC_KANA: 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ',
  // 濁点・半濁点 (0xDE-0xDF)
  DIACRITICS: 'ﾞﾟ',
  // 小文字カタカナ (0xA7-0xAF)
  SMALL_KANA: 'ｧｨｩｪｫｬｭｮｯ',
  // 記号類
  SYMBOLS: '｡｢｣､･'
};

// 全銀フォーマットで使用可能な全ての半角カナ文字
const ZENGIN_VALID_KANA_CHARS = 
  ZENGIN_HALFWIDTH_KANA.PUNCTUATION +
  ZENGIN_HALFWIDTH_KANA.LONG_VOWEL +
  ZENGIN_HALFWIDTH_KANA.BASIC_KANA +
  ZENGIN_HALFWIDTH_KANA.DIACRITICS +
  ZENGIN_HALFWIDTH_KANA.SMALL_KANA +
  ZENGIN_HALFWIDTH_KANA.SYMBOLS;

// 全銀フォーマット用半角カナバリデーション
const isValidZenginKana = (text: string): boolean => {
  if (!text) return true; // 空文字は有効
  
  // 各文字が全銀フォーマットで使用可能な半角カナかチェック
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    
    // スペースは許可
    if (char === ' ') continue;
    
    // 全銀フォーマット用半角カナ文字かチェック
    if (!ZENGIN_VALID_KANA_CHARS.includes(char)) {
      return false;
    }
  }
  
  return true;
};

// 金融機関コードの妥当性チェック（簡易版）
const isValidBankCode = (code: string): boolean => {
  return /^\d{4}$/.test(code) && code !== '0000';
};

// 支店コードの妥当性チェック
const isValidBranchCode = (code: string): boolean => {
  return /^\d{3}$/.test(code) && code !== '000';
};

// 口座番号の妥当性チェック
const isValidAccountNumber = (number: string): boolean => {
  return /^\d{1,7}$/.test(number);
};

// 年月日の妥当性チェック（MMDD形式）
const isValidMMDD = (date: string): boolean => {
  if (!/^\d{4}$/.test(date)) return false;
  
  const month = parseInt(date.substring(0, 2), 10);
  const day = parseInt(date.substring(2, 4), 10);
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // 簡易的な日付チェック
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
};

// 預金種目コードの妥当性チェック
const isValidDepositType = (type: string): boolean => {
  // 1:普通 2:当座
  return ['1', '2'].includes(type);
};

// データ区分の妥当性チェック
const isValidDataType = (type: string): boolean => {
  // 総合振込:1 など
  return /^\d$/.test(type);
};

// 種別コードの妥当性チェック
const isValidTypeCode = (code: string): boolean => {
  return /^\d{2}$/.test(code);
};

// コード区分の妥当性チェック
const isValidCodeType = (type: string): boolean => {
  return /^\d$/.test(type);
};

// 委託者コードの妥当性チェック
const isValidClientCode = (code: string): boolean => {
  return /^\d{10}$/.test(code);
};

// 手形交換所番号の妥当性チェック（空白許容）
const isValidClearingHouseNumber = (number: string): boolean => {
  if (!number || number.trim() === '') return true; // 空白許容
  return /^\d{4}$/.test(number.trim());
};

// 振込金額の妥当性チェック
const isValidTransferAmount = (amount: string): boolean => {
  return /^\d{10}$/.test(amount);
};

// 新規コードの妥当性チェック
const isValidNewCode = (code: string): boolean => {
  return /^\d$/.test(code);
};

// 全銀フォーマットレイアウト定義（ユーザー仕様に基づく）
export const zenginLayout: ZenginRecordLayout[] = [
  // ヘッダーレコード（1）
  {
    recordType: '1',
    description: 'ヘッダレコード',
    fields: [
      {
        name: 'データ区分',
        start: 1,
        length: 1,
        type: 'numeric',
        required: true,
        description: 'データ区分',
        validation: isValidDataType
      },
      {
        name: '種別コード',
        start: 2,
        length: 2,
        type: 'numeric',
        required: true,
        description: '種別コード',
        validation: isValidTypeCode
      },
      {
        name: 'コード区分',
        start: 4,
        length: 1,
        type: 'numeric',
        required: true,
        description: 'コード区分',
        validation: isValidCodeType
      },
      {
        name: '委託者コード',
        start: 5,
        length: 10,
        type: 'numeric',
        required: true,
        description: '委託者コード',
        validation: isValidClientCode
      },
      {
        name: '委託者名',
        start: 15,
        length: 40,
        type: 'alphanumeric',
        required: true,
        description: '委託者名'
      },
      {
        name: '取組日 (MMDD)',
        start: 55,
        length: 4,
        type: 'numeric',
        required: true,
        description: '取組日 (MMDD)',
        validation: isValidMMDD
      },
      {
        name: '仕向銀行番号',
        start: 59,
        length: 4,
        type: 'numeric',
        required: true,
        description: '仕向銀行番号',
        validation: isValidBankCode
      },
      {
        name: '仕向銀行名',
        start: 63,
        length: 15,
        type: 'alphanumeric',
        required: true,
        description: '仕向銀行名'
      },
      {
        name: '仕向支店番号',
        start: 78,
        length: 3,
        type: 'numeric',
        required: true,
        description: '仕向支店番号',
        validation: isValidBranchCode
      },
      {
        name: '仕向支店名',
        start: 81,
        length: 15,
        type: 'alphanumeric',
        required: true,
        description: '仕向支店名'
      },
      {
        name: '預金種目',
        start: 96,
        length: 1,
        type: 'numeric',
        required: true,
        description: '預金種目',
        validation: isValidDepositType
      },
      {
        name: '口座番号',
        start: 97,
        length: 7,
        type: 'numeric',
        required: true,
        description: '口座番号',
        validation: isValidAccountNumber
      },
      {
        name: 'ダミー/予備',
        start: 104,
        length: 17,
        type: 'alphanumeric',
        required: false,
        description: 'ダミー/予備'
      }
    ]
  },
  // データレコード（2）
  {
    recordType: '2',
    description: 'データレコード',
    fields: [
      {
        name: 'データ区分',
        start: 1,
        length: 1,
        type: 'numeric',
        required: true,
        description: 'データ区分',
        validation: (value: string) => value === '2'
      },
      {
        name: '被仕向金融機関番号',
        start: 2,
        length: 4,
        type: 'numeric',
        required: true,
        description: '被仕向金融機関番号',
        validation: isValidBankCode
      },
      {
        name: '被仕向銀行名',
        start: 6,
        length: 15,
        type: 'alphanumeric',
        required: true,
        description: '被仕向銀行名'
      },
      {
        name: '被仕向支店番号',
        start: 21,
        length: 3,
        type: 'numeric',
        required: true,
        description: '被仕向支店番号',
        validation: isValidBranchCode
      },
      {
        name: '被仕向支店名',
        start: 24,
        length: 15,
        type: 'alphanumeric',
        required: true,
        description: '被仕向支店名'
      },
              {
          name: '手形交換所番号',
          start: 39,
          length: 4,
          type: 'numeric',
          required: false,
          description: '手形交換所番号',
          validation: isValidClearingHouseNumber
        },
      {
        name: '預金種目',
        start: 43,
        length: 1,
        type: 'numeric',
        required: true,
        description: '預金種目',
        validation: isValidDepositType
      },
      {
        name: '口座番号',
        start: 44,
        length: 7,
        type: 'numeric',
        required: true,
        description: '口座番号',
        validation: isValidAccountNumber
      },
      {
        name: '受取人名',
        start: 51,
        length: 30,
        type: 'alphanumeric',
        required: true,
        description: '受取人名'
      },
      {
        name: '振込金額',
        start: 81,
        length: 10,
        type: 'numeric',
        required: true,
        description: '振込金額',
        validation: isValidTransferAmount
      },
      {
        name: '新規コード',
        start: 91,
        length: 1,
        type: 'numeric',
        required: true,
        description: '新規コード',
        validation: isValidNewCode
      },
      {
        name: '顧客コード1',
        start: 92,
        length: 10,
        type: 'alphanumeric',
        required: false,
        description: '顧客コード1'
      },
      {
        name: '顧客コード2',
        start: 102,
        length: 10,
        type: 'alphanumeric',
        required: false,
        description: '顧客コード2'
      },
              {
          name: 'EDI情報',
          start: 112,
          length: 9,
          type: 'alphanumeric',
          required: false,
          description: 'EDI情報'
        }
    ]
  },
  // トレーラレコード（8）
  {
    recordType: '8',
    description: 'トレーラレコード',
    fields: [
      {
        name: 'データ区分',
        start: 1,
        length: 1,
        type: 'numeric',
        required: true,
        description: 'データ区分',
        validation: (value: string) => value === '8'
      },
      {
        name: '合計件数',
        start: 2,
        length: 6,
        type: 'numeric',
        required: true,
        description: '合計件数'
      },
      {
        name: '合計金額',
        start: 8,
        length: 12,
        type: 'numeric',
        required: true,
        description: '合計金額'
      },
      {
        name: 'ダミー/予備',
        start: 20,
        length: 101,
        type: 'alphanumeric',
        required: false,
        description: 'ダミー/予備'
      }
    ]
  },
  // エンドレコード（9）
  {
    recordType: '9',
    description: 'エンドレコード',
    fields: [
      {
        name: 'データ区分',
        start: 1,
        length: 1,
        type: 'numeric',
        required: true,
        description: 'データ区分',
        validation: (value: string) => value === '9'
      },
      {
        name: 'ダミー/予備',
        start: 2,
        length: 118,
        type: 'alphanumeric',
        required: false,
        description: 'ダミー/予備'
      }
    ]
  }
];

// レコード種別から対応するレイアウトを取得
export const getRecordLayout = (recordType: string): ZenginRecordLayout | undefined => {
  return zenginLayout.find(layout => layout.recordType === recordType);
};

// レイアウト定義の整合性検証（開発用）
export const validateLayoutIntegrity = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  zenginLayout.forEach(layout => {
    let totalBytes = 0;
    let lastEndPosition = 0;
    
    layout.fields.forEach((field, index) => {
      // 開始位置の連続性チェック
      if (index === 0) {
        if (field.start !== 1) {
          errors.push(`${layout.description}: 最初のフィールド「${field.name}」の開始位置が1ではありません (${field.start})`);
        }
      } else {
        const expectedStart = lastEndPosition + 1;
        if (field.start !== expectedStart) {
          errors.push(`${layout.description}: フィールド「${field.name}」の開始位置が不正です (期待値: ${expectedStart}, 実際: ${field.start})`);
        }
      }
      
      lastEndPosition = field.start + field.length - 1;
      totalBytes += field.length;
    });
    
    // 総バイト数チェック（エンドレコードは119、その他は120）
    const expectedBytes = layout.recordType === '9' ? 119 : 120;
    if (totalBytes !== expectedBytes) {
      errors.push(`${layout.description}: 総バイト数が${expectedBytes}ではありません (${totalBytes})`);
    }
    
    // 最終位置チェック
    if (lastEndPosition !== expectedBytes) {
      errors.push(`${layout.description}: 最終フィールドの終了位置が${expectedBytes}ではありません (${lastEndPosition})`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// レコード種別に応じた文字列長チェック
export const validateRecordLength = (record: string, recordType?: string): boolean => {
  if (!record) return false;
  
  // レコード種別を判定
  const typeCode = recordType || record.charAt(0);
  
  switch (typeCode) {
    case '9': // エンドレコード（改行コードなし）
      return record.length === 119;
    default:
      return record.length === 120;
  }
};

// フィールド値の妥当性チェック
export const validateField = (field: ZenginField, value: string): boolean => {
  // 必須チェック
  if (field.required && (!value || value.trim() === '')) {
    return false;
  }

  // 長さチェック
  if (value.length > field.length) {
    return false;
  }

  // 型チェック
  switch (field.type) {
    case 'numeric':
      // 手形交換所番号など、空白が許容される数値フィールドの場合
      if (field.name === '手形交換所番号') {
        if (!value || value.trim() === '' || /^\s*$/.test(value)) {
          return true; // 空白許容
        }
        // 空白でない場合は4桁の数字かチェック
        return /^\d{4}$/.test(value.trim());
      }
      if (!/^\d*$/.test(value)) return false;
      break;
    case 'alphanumeric':
      // 英数字と一部記号
      break;
    case 'kana':
      // 全銀フォーマット用半角カナ
      return isValidZenginKana(value);
    case 'date':
      // 日付形式（MMDD）
      return isValidMMDD(value);
  }

  // カスタムバリデーション
  if (field.validation && !field.validation(value)) {
    return false;
  }

  return true;
};

// レコード全体の妥当性チェック
export const validateRecord = (recordType: string, record: string): { isValid: boolean; errors: string[] } => {
  const layout = getRecordLayout(recordType);
  const errors: string[] = [];

  if (!layout) {
    errors.push(`未知のレコード種別: ${recordType}`);
    return { isValid: false, errors };
  }

  // レコード長チェック
  if (!validateRecordLength(record, recordType)) {
    let expectedLength: string;
    if (recordType === '9') {
      expectedLength = '119文字';
    } else {
      expectedLength = '120文字';
    }
    errors.push(`レコード長が不正です。期待値: ${expectedLength}, 実際: ${record.length}文字`);
  }

  // 各フィールドの妥当性チェック
  for (const field of layout.fields) {
    const value = record.substring(field.start - 1, field.start - 1 + field.length);
    if (!validateField(field, value)) {
      errors.push(`${field.name}の値が不正です: "${value}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 後方互換性のためのインターフェース
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ParsedRecord {
  recordType: string;
  fields: { [key: string]: string };
  rawData: string;
  lineNumber: number;
  validation: ValidationResult;
}

// レコード区分の判定（後方互換性のため）
export const getRecordType = (line: string): string => {
  if (!line || line.length === 0) return 'unknown';
  
  const recordTypeCode = line.charAt(0);
  switch (recordTypeCode) {
    case '1':
      return 'header';
    case '2':
      return 'data';
    case '8':
      return 'trailer';
    case '9':
      return 'end';
    default:
      return 'unknown';
  }
};

// レコード全体の解析（後方互換性のため）
export const parseRecord = (line: string, lineNumber: number): ParsedRecord => {
  const recordTypeCode = line.charAt(0);
  const recordType = getRecordType(line);
  const layout = getRecordLayout(recordTypeCode);
  
  if (!layout) {
    return {
      recordType: 'unknown',
      fields: {},
      rawData: line,
      lineNumber,
      validation: {
        isValid: false,
        errors: [`行 ${lineNumber}: 不明なレコード区分です`]
      }
    };
  }

  const fields: { [key: string]: string } = {};
  const allErrors: string[] = [];
  
  // 行の長さチェック
  if (!validateRecordLength(line, recordTypeCode)) {
    let expectedLength: string;
    if (recordTypeCode === '9') {
      expectedLength = '119文字';
    } else {
      expectedLength = '120文字';
    }
    allErrors.push(`行 ${lineNumber}: 行の長さが不正です (期待値: ${expectedLength}, 実際: ${line.length}文字)`);
  }
  
  // 各フィールドの解析と検証
  layout.fields.forEach(field => {
    const startIndex = field.start - 1; // 1-indexedから0-indexedに変換
    const endIndex = startIndex + field.length;
    const value = line.substring(startIndex, endIndex) || '';
    
    fields[field.name] = value;
    
    if (!validateField(field, value)) {
      allErrors.push(`行 ${lineNumber}: ${field.name}の値が不正です: "${value}"`);
    }
  });
  
  return {
    recordType,
    fields,
    rawData: line,
    lineNumber,
    validation: {
      isValid: allErrors.length === 0,
      errors: allErrors
    }
  };
};
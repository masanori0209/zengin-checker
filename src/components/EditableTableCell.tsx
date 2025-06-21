import React, { useState, useEffect } from 'react';

interface EditableTableCellProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  fieldName: string;
  fieldType: 'numeric' | 'alphanumeric' | 'kana' | 'date';
  maxLength: number;
  required: boolean;
  hasError?: boolean;
}

const EditableTableCell: React.FC<EditableTableCellProps> = ({
  value,
  onChange,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  fieldName,
  fieldType,
  maxLength,
  required,
  hasError = false
}) => {
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange(editValue);
      onSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      onCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // 文字数制限チェック
    if (newValue.length > maxLength) {
      return;
    }

    // フィールドタイプによる入力制限
    switch (fieldType) {
      case 'numeric':
        if (!/^\d*$/.test(newValue)) {
          return;
        }
        break;
      case 'date':
        if (!/^\d*$/.test(newValue)) {
          return;
        }
        break;
      // alphanumeric と kana は基本的に制限なし（バリデーションは別途）
    }

    setEditValue(newValue);
  };

  const handleSave = () => {
    onChange(editValue);
    onSave();
  };

  const handleCancel = () => {
    setEditValue(value);
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="editable-cell editing">
        <input
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={`editable-input ${hasError ? 'error' : ''}`}
          maxLength={maxLength}
          autoFocus
          title={`${fieldName} (最大${maxLength}文字)`}
        />
        <div className="edit-actions">
          <button
            type="button"
            onClick={handleSave}
            className="btn-save"
            title="保存"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="btn-cancel"
            title="キャンセル"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`editable-cell ${hasError ? 'error' : ''}`}
      onClick={onEdit}
      title={`クリックして編集: ${fieldName}`}
    >
      <span className="cell-value">
        {value || (required ? '(必須)' : '(空)')}
      </span>
      <span className="edit-icon">✏️</span>
    </div>
  );
};

export default EditableTableCell; 
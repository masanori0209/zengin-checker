import React, { useState, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import EditableTableCell from './EditableTableCell';
import type { ParsedRecord } from '../utils/zenginLayout';
import { zenginLayout, type ZenginField } from '../utils/zenginLayout';

interface VirtualizedTableProps {
  records: ParsedRecord[];
  onRecordChange: (index: number, updatedRecord: ParsedRecord) => void;
  onDownload: () => void;
}

interface EditingCell {
  recordIndex: number;
  fieldName: string;
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  records,
  onRecordChange,
  onDownload
}) => {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());

  // レコードタイプのマッピング
  const getLayoutRecordType = (recordType: string): string => {
    switch (recordType) {
      case 'header': return '1';
      case 'data': return '2';
      case 'trailer': return '8';
      case 'end': return '9';
      default: return recordType;
    }
  };

  // 全レコードから共通のフィールドを取得
  const allFields = useMemo(() => {
    const fieldMap = new Map<string, ZenginField>();
    
    console.log('VirtualizedTable - Processing records:', records.length);
    
    records.forEach((record, index) => {
      const layoutRecordType = getLayoutRecordType(record.recordType);
      const layout = zenginLayout.find(l => l.recordType === layoutRecordType);
      
      if (index === 0) {
        console.log('First record:', record);
        console.log('Layout record type:', layoutRecordType);
        console.log('Found layout:', layout);
        console.log('Record fields:', record.fields);
      }
      
      if (layout) {
        layout.fields.forEach(field => {
          fieldMap.set(field.name, field);
        });
      }
    });
    
    const fields = Array.from(fieldMap.values());
    console.log('All fields:', fields);
    return fields;
  }, [records]);

  // 仮想スクロールの設定
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // 行の高さ
    overscan: 10, // 表示範囲外のアイテム数
  });

  const handleCellEdit = useCallback((recordIndex: number, fieldName: string) => {
    setEditingCell({ recordIndex, fieldName });
  }, []);

  const handleCellSave = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleCellChange = useCallback((recordIndex: number, fieldName: string, value: string) => {
    const record = records[recordIndex];
    const updatedRecord = {
      ...record,
      fields: {
        ...record.fields,
        [fieldName]: value
      }
    };
    onRecordChange(recordIndex, updatedRecord);
  }, [records, onRecordChange]);

  const handleSelectRecord = useCallback((recordIndex: number) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordIndex)) {
      newSelected.delete(recordIndex);
    } else {
      newSelected.add(recordIndex);
    }
    setSelectedRecords(newSelected);
  }, [selectedRecords]);

  const handleSelectAll = useCallback(() => {
    if (selectedRecords.size === records.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(records.map((_, index) => index)));
    }
  }, [selectedRecords.size, records.length]);

  const getRecordTypeDisplay = (recordType: string): string => {
    switch (recordType) {
      case 'header':
        return 'ヘッダー';
      case 'data':
        return 'データ';
      case 'trailer':
        return 'トレーラー';
      case 'end':
        return 'エンド';
      default:
        return '不明';
    }
  };

  const getRecordTypeIcon = (recordType: string): string => {
    switch (recordType) {
      case 'header': return '📋';
      case 'data': return '📊';
      case 'trailer': return '📄';
      case 'end': return '🔚';
      default: return '❓';
    }
  };

  const getFieldForRecord = (record: ParsedRecord, fieldName: string): ZenginField | undefined => {
    const layoutRecordType = getLayoutRecordType(record.recordType);
    const layout = zenginLayout.find(l => l.recordType === layoutRecordType);
    return layout?.fields.find(f => f.name === fieldName);
  };

  return (
    <div className="virtualized-table-container">
      <div className="table-header">
        <div className="table-controls">
          <button
            onClick={onDownload}
            className="btn btn-primary"
            disabled={records.length === 0}
          >
            📥 ダウンロード
          </button>
          <div className="selection-info">
            <label className="select-all-label">
              <input
                type="checkbox"
                checked={selectedRecords.size === records.length && records.length > 0}
                onChange={handleSelectAll}
              />
              全選択 ({selectedRecords.size}/{records.length})
            </label>
          </div>
        </div>
      </div>

      <div className="table-wrapper" ref={parentRef}>
        <div className="table-header-row">
          <div className="table-cell header-cell checkbox-cell">
            <input
              type="checkbox"
              checked={selectedRecords.size === records.length && records.length > 0}
              onChange={handleSelectAll}
            />
          </div>
          <div className="table-cell header-cell line-number-cell">行番号</div>
          <div className="table-cell header-cell record-type-cell">レコード種別</div>
          <div className="table-cell header-cell status-cell">状態</div>
          {allFields.map(field => (
            <div key={field.name} className="table-cell header-cell data-cell" title={field.description}>
              <div className="field-header-content">
                <span className="field-name">{field.name}</span>
                <span className="field-info">
                  ({field.length}文字, {field.type})
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const record = records[virtualItem.index];
            const isSelected = selectedRecords.has(virtualItem.index);
            const hasError = !record.validation.isValid;

            return (
              <div
                key={virtualItem.index}
                className={`table-row ${isSelected ? 'selected' : ''} ${hasError ? 'error' : ''}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className="table-cell checkbox-cell">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectRecord(virtualItem.index)}
                  />
                </div>
                <div className="table-cell line-number-cell">
                  {record.lineNumber}
                </div>
                <div className="table-cell record-type-cell">
                  <span className="record-type-icon">
                    {getRecordTypeIcon(record.recordType)}
                  </span>
                  <span className="record-type-text">
                    {getRecordTypeDisplay(record.recordType)}
                  </span>
                </div>
                <div className="table-cell status-cell">
                  {hasError ? (
                    <span className="status-error" title={record.validation.errors.join(', ')}>
                      ❌ エラー
                    </span>
                  ) : (
                    <span className="status-success">✅ 正常</span>
                  )}
                </div>
                {allFields.map(field => {
                  const fieldForRecord = getFieldForRecord(record, field.name);
                  const value = record.fields[field.name] || '';
                  const isEditing = editingCell?.recordIndex === virtualItem.index && 
                                   editingCell?.fieldName === field.name;
                  const hasFieldError = record.validation.errors.some(error => 
                    error.includes(field.name)
                  );

                  // デバッグ用ログ
                  if (virtualItem.index === 0) {
                    console.log('Field:', field.name, 'Value:', value, 'FieldForRecord:', fieldForRecord);
                  }

                  return (
                    <div key={field.name} className="table-cell data-cell">
                      {fieldForRecord ? (
                        <EditableTableCell
                          value={value}
                          onChange={(newValue) => 
                            handleCellChange(virtualItem.index, field.name, newValue)
                          }
                          isEditing={isEditing}
                          onEdit={() => handleCellEdit(virtualItem.index, field.name)}
                          onSave={handleCellSave}
                          onCancel={handleCellCancel}
                          fieldName={field.name}
                          fieldType={field.type}
                          maxLength={field.length}
                          required={field.required}
                          hasError={hasFieldError}
                        />
                      ) : (
                        <span className="cell-not-applicable">-</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedTable; 
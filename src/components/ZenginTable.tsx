import React, { useState, useMemo } from 'react';
import type { ZenginParseResult } from '../hooks/useZenginParser';
import { zenginLayout, type ZenginField, type ParsedRecord } from '../utils/zenginLayout';
import VirtualizedTable from './VirtualizedTable';
import { downloadRecords, downloadAsCSV } from '../utils/fileExport';

interface ZenginTableProps {
  parseResult: ZenginParseResult;
  onClearData: () => void;
  onRecordUpdate: (index: number, updatedRecord: ParsedRecord) => void;
}

const ZenginTable: React.FC<ZenginTableProps> = ({ parseResult, onClearData, onRecordUpdate }) => {
  const [selectedRecordType, setSelectedRecordType] = useState<string>('all');
  const [showErrorsOnly, setShowErrorsOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'compact' | 'detailed'>('table');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getRecordTypeDisplay = (recordType: string): string => {
    switch (recordType) {
      case 'header':
        return 'ヘッダー';
      case 'data':
        return 'データ';
      case 'trailer':
        return 'トレーラー';
      default:
        return '不明';
    }
  };



  const getRecordTypeIcon = (recordType: string): string => {
    switch (recordType) {
      case 'header': return '📋';
      case 'data': return '📊';
      case 'trailer': return '📄';
      default: return '❓';
    }
  };

  const filteredRecords = useMemo(() => {
    let records = parseResult.parsedRecords;
    
    if (selectedRecordType !== 'all') {
      records = records.filter((record: ParsedRecord) => record.recordType === selectedRecordType);
    }
    
    if (showErrorsOnly) {
      records = records.filter((record: ParsedRecord) => !record.validation.isValid);
    }

    if (searchTerm) {
      records = records.filter((record: ParsedRecord) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          record.rawData.toLowerCase().includes(searchLower) ||
          Object.values(record.fields).some(value => 
            value && value.toString().toLowerCase().includes(searchLower)
          ) ||
          record.validation.errors.some(error => 
            error.toLowerCase().includes(searchLower)
          )
        );
      });
    }
    
    return records;
  }, [parseResult.parsedRecords, selectedRecordType, showErrorsOnly, searchTerm]);

  const handleDownload = () => {
    downloadRecords(filteredRecords, 'zengin_edited_data.txt');
  };

  const handleDownloadCSV = () => {
    downloadAsCSV(filteredRecords, 'zengin_data.csv');
  };

  const getFieldLayout = (recordType: string): ZenginField[] => {
    const layout = zenginLayout.find(l => l.recordType === recordType);
    return layout?.fields || [];
  };

  // 重要フィールドを特定する関数
  const getImportantFields = (recordType: string): string[] => {
    switch (recordType) {
      case 'header':
        return ['dataKubun', 'requestDate', 'clientCode'];
      case 'data':
        return ['bankCode', 'branchCode', 'accountType', 'accountNumber', 'amount', 'recipientName'];
      case 'trailer':
        return ['totalCount', 'totalAmount'];
      default:
        return [];
    }
  };

  const renderRecordCard = (record: ParsedRecord, index: number) => {
    const fields = getFieldLayout(record.recordType);
    const importantFields = getImportantFields(record.recordType);
    const hasErrors = !record.validation.isValid;

    return (
      <div
        key={index}
        className={`zengin-record-card ${hasErrors ? 'error' : ''}`}
      >
        {/* カードヘッダー */}
        <div className="zengin-record-header">
          <div className="zengin-record-info">
            <div className="zengin-record-icon">{getRecordTypeIcon(record.recordType)}</div>
            <div>
              <div className="zengin-record-meta">
                <span className={`zengin-record-type ${record.recordType}`}>
                  {getRecordTypeDisplay(record.recordType)}
                </span>
                <span className="zengin-record-line">行 {record.lineNumber}</span>
              </div>
            </div>
          </div>
          
          <div className="zengin-record-status">
            {hasErrors ? (
              <div className="zengin-status-badge error">
                <span className="zengin-icon-md zengin-icon-error"></span>
                <span>エラー</span>
              </div>
            ) : (
              <div className="zengin-status-badge success">
                <span className="zengin-icon-md zengin-icon-success"></span>
                <span>正常</span>
              </div>
            )}
          </div>
        </div>

        {/* 重要フィールド */}
        {importantFields.length > 0 && (
          <div className="zengin-important-fields">
            <h4>⭐ 重要項目</h4>
            <div className="zengin-fields-grid">
              {importantFields.map(fieldName => {
                const field = fields.find(f => f.name === fieldName);
                if (!field) return null;
                
                const value = record.fields[field.name] || '';
                const hasFieldError = record.validation.errors.some(error => error.includes(field.name));
                
                return (
                  <div key={field.name} className={`zengin-field-item ${hasFieldError ? 'error' : 'normal'}`}>
                    <div className="zengin-field-label">{field.description || field.name}</div>
                    <div className={`zengin-field-value ${hasFieldError ? 'error' : 'normal'}`}>
                      {value || '-'}
                    </div>
                    {hasFieldError && (
                      <div className="zengin-field-error">
                        <span className="zengin-icon-sm zengin-icon-error"></span>
                        エラーあり
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 詳細フィールド（折りたたみ可能） */}
        {viewMode === 'detailed' && (
          <details className="zengin-details">
            <summary>
              <span className="zengin-icon-md zengin-icon-chevron-right"></span>
              <span>全フィールド詳細</span>
            </summary>
            <div className="zengin-details-content">
              {fields.filter(field => !importantFields.includes(field.name)).map(field => {
                const value = record.fields[field.name] || '';
                const hasFieldError = record.validation.errors.some(error => error.includes(field.name));
                
                return (
                  <div key={field.name} className={`zengin-detail-field ${hasFieldError ? 'error' : 'normal'}`}>
                    <div className="zengin-detail-field-name" title={field.description}>
                      {field.name}
                    </div>
                    <div className={`zengin-detail-field-value ${hasFieldError ? 'error' : 'normal'}`}>
                      {value || '-'}
                    </div>
                    <div className="zengin-detail-field-position">
                      {field.start}-{field.start + field.length - 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        )}

        {/* エラー詳細 */}
        {hasErrors && (
          <div className="zengin-record-errors">
            <h4>🚨 エラー詳細</h4>
            <ul>
              {record.validation.errors.map((error, errorIndex) => (
                <li key={errorIndex}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 生データ（コンパクト表示） */}
        <div className="zengin-raw-data">
          <div className="zengin-raw-data-label">生データ</div>
          <div className="zengin-raw-data-content">
            {record.rawData}
          </div>
        </div>
      </div>
    );
  };

  const renderCompactView = () => {
    return (
      <div className="zengin-compact-view">
        {filteredRecords.map((record, index) => (
          <div
            key={index}
            className={`zengin-compact-record ${!record.validation.isValid ? 'error' : ''}`}
          >
            <div className="zengin-compact-left">
              <div className="zengin-compact-icon">{getRecordTypeIcon(record.recordType)}</div>
              <div className="zengin-compact-info">
                <div className="zengin-compact-meta">
                  <span className={`zengin-compact-type ${record.recordType}`}>
                    {getRecordTypeDisplay(record.recordType)}
                  </span>
                  <span className="zengin-compact-line">行 {record.lineNumber}</span>
                </div>
                <div className="zengin-compact-data">
                  {record.rawData}
                </div>
              </div>
            </div>
            
            <div className="zengin-compact-right">
              {!record.validation.isValid ? (
                <div className="zengin-compact-status error">
                  <span className="zengin-icon-md zengin-icon-error"></span>
                  <span className="zengin-compact-status-text">エラー ({record.validation.errors.length})</span>
                </div>
              ) : (
                <div className="zengin-compact-status success">
                  <span className="zengin-icon-md zengin-icon-success"></span>
                  <span className="zengin-compact-status-text">正常</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="zengin-table">
      <div className="zengin-table-header">
        <div className="zengin-table-title">
          <div className="icon">📊</div>
          <h2>データ解析結果</h2>
        </div>
        <button
          onClick={onClearData}
          className="btn-secondary icon-hover"
        >
          🗑️ データクリア
        </button>
      </div>

      {/* 統計情報 */}
      <div className="zengin-stats-grid">
        <div className="zengin-stat-card">
          <div className="zengin-stat-card-header">
            <h3 className="zengin-stat-card-title">総レコード数</h3>
            <div className="zengin-stat-card-icon">📊</div>
          </div>
          <div className="zengin-stat-card-value blue">
            {parseResult.totalRecords.toLocaleString()}
          </div>
          <div className="zengin-stat-card-label">全体</div>
        </div>
        
        <div className="zengin-stat-card">
          <div className="zengin-stat-card-header">
            <h3 className="zengin-stat-card-title">データレコード</h3>
            <div className="zengin-stat-card-icon">📈</div>
          </div>
          <div className="zengin-stat-card-value green">
            {parseResult.dataRecords.length.toLocaleString()}
          </div>
          <div className="zengin-stat-card-label">処理対象</div>
        </div>
        
        <div className="zengin-stat-card">
          <div className="zengin-stat-card-header">
            <h3 className="zengin-stat-card-title">エラー件数</h3>
            <div className="zengin-stat-card-icon">⚠️</div>
          </div>
          <div className="zengin-stat-card-value red">
            {parseResult.errorCount.toLocaleString()}
          </div>
          <div className="zengin-stat-card-label">要修正</div>
        </div>
        
        <div className="zengin-stat-card">
          <div className="zengin-stat-card-header">
            <h3 className="zengin-stat-card-title">エラー率</h3>
            <div className="zengin-stat-card-icon">📉</div>
          </div>
          <div className={`zengin-stat-card-value ${
            parseResult.totalRecords > 0 && (parseResult.errorCount / parseResult.totalRecords) > 0.1 
              ? 'red' : 'green'
          }`}>
            {parseResult.totalRecords > 0 
              ? ((parseResult.errorCount / parseResult.totalRecords) * 100).toFixed(1)
              : '0.0'
            }%
          </div>
          <div className="zengin-stat-card-label">品質指標</div>
        </div>
      </div>

      {/* コントロールパネル */}
      <div className="zengin-control-panel">
        <h3>🎛️ 表示設定</h3>
        
        <div className="zengin-control-grid">
          {/* 表示モード */}
          <div className="zengin-control-group">
            <label>表示モード</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'table' | 'cards' | 'compact' | 'detailed')}
              className="zengin-control-select"
            >
              <option value="table">📋 テーブル表示（編集可能）</option>
              <option value="cards">🎴 カード表示</option>
              <option value="compact">📋 コンパクト表示</option>
              <option value="detailed">📖 詳細表示</option>
            </select>
          </div>

          {/* レコード種別 */}
          <div className="zengin-control-group">
            <label>レコード種別</label>
            <select
              value={selectedRecordType}
              onChange={(e) => setSelectedRecordType(e.target.value)}
              className="zengin-control-select"
            >
              <option value="all">🔍 すべて表示</option>
              <option value="header">📋 ヘッダーレコード</option>
              <option value="data">📊 データレコード</option>
              <option value="trailer">📄 トレーラーレコード</option>
            </select>
          </div>

          {/* 検索 */}
          <div className="zengin-control-group">
            <label>検索</label>
            <div className="zengin-search-wrapper">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="データを検索..."
                className="zengin-control-input search"
              />
              <span className="zengin-icon-md zengin-icon-search"></span>
            </div>
          </div>

          {/* エラーフィルター */}
          <div className="zengin-control-group">
            <label className="zengin-checkbox-wrapper">
              <input
                type="checkbox"
                checked={showErrorsOnly}
                onChange={(e) => setShowErrorsOnly(e.target.checked)}
                className="zengin-checkbox"
              />
              <span className="zengin-checkbox-label">
                <span>⚠️</span>
                <span>エラーのみ表示</span>
              </span>
            </label>
          </div>
        </div>

        {/* 結果数表示とダウンロード */}
        <div className="zengin-result-count">
          <div>
            <span className="zengin-icon-md zengin-icon-chart-bar"></span>
            <span>表示中: {filteredRecords.length}件 / 全{parseResult.totalRecords}件</span>
          </div>
          <div className="download-buttons">
            <button onClick={handleDownload} className="btn btn-primary btn-sm">
              📥 TXTダウンロード
            </button>
            <button onClick={handleDownloadCSV} className="btn btn-secondary btn-sm">
              📊 CSVダウンロード
            </button>
          </div>
        </div>
      </div>

      {/* エラー一覧 */}
      {parseResult.allErrors.length > 0 && (
        <div className="zengin-error-summary">
          <h3>🚨 検証エラー ({parseResult.allErrors.length}件)</h3>
          <div className="zengin-error-list">
            <ul>
              {parseResult.allErrors.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* データ表示エリア */}
      <div className="zengin-records-container">
        {filteredRecords.length === 0 ? (
          <div className="zengin-empty-state">
            <span className="zengin-icon-xl zengin-icon-document"></span>
            <div>
              <h3>表示するデータがありません</h3>
              <p>フィルター条件を変更してください</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <VirtualizedTable
                records={filteredRecords}
                onRecordChange={(filteredIndex, updatedRecord) => {
                  // フィルタリングされた配列のインデックスから元の配列のインデックスを取得
                  const originalIndex = parseResult.parsedRecords.findIndex(
                    record => record.lineNumber === updatedRecord.lineNumber
                  );
                  if (originalIndex !== -1) {
                    onRecordUpdate(originalIndex, updatedRecord);
                  }
                }}
                onDownload={handleDownload}
              />
            ) : viewMode === 'compact' ? (
              renderCompactView()
            ) : (
              <div>
                {filteredRecords.map((record, index) => renderRecordCard(record, index))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ZenginTable; 
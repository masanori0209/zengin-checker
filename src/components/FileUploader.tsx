import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading, error }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragActive(false);
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/octet-stream': ['.dat']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    disabled: isLoading
  });

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h2 className="card-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          ファイルアップロード
        </h2>
      </div>
      
      <div className="file-upload">
        <div
          {...getRootProps()}
          className={`file-upload-area ${isDragActive ? 'drag-active' : ''}`}
        >
          <input {...getInputProps()} />
          
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="loading-spinner"></div>
              <p style={{ color: 'var(--color-primary)', fontWeight: 500 }}>ファイルを解析中...</p>
            </div>
          ) : (
            <>
              <div className="file-upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              
              <div className="file-upload-text">
                {isDragActive ? 
                  'ファイルをドロップしてください' : 
                  'ファイルをドラッグ&ドロップ または クリックして選択'
                }
              </div>
              <div className="file-upload-hint">
                対応形式: .txt, .dat (Shift_JISエンコード, 最大10MB)
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="alert alert-error slide-in-left">
            <div className="alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>エラーが発生しました</h4>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>{error}</p>
            </div>
          </div>
        )}

        {/* 機能説明 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>自動検証</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Shift_JIS文字コード & フォーマット準拠をチェック
            </p>
          </div>
          
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>可視化</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              データ構造を表形式で表示
            </p>
          </div>
          
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>セキュア</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              ローカル処理で安全
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader; 
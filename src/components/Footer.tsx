import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          © 2025 全銀フォーマットチェッカー - 
          <a 
            href="https://github.com/masanori0209/zengin-checker" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: 'var(--color-primary)', 
              textDecoration: 'none',
              marginLeft: '0.5rem',
              fontWeight: 500
            }}
          >
            GitHub
          </a>
        </p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          すべての処理はブラウザ内で完結します。データは外部に送信されません。
        </p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--color-text-tertiary)' }}>
          ※ 本アプリケーションは個人が開発した非公式ツールです。「全銀」は全国銀行協会の登録商標です。
          <br />
          全国銀行協会およびその関連組織とは一切関係ありません。
        </p>
      </div>
    </footer>
  );
};

export default Footer; 
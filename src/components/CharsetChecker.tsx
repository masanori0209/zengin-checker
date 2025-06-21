import React from 'react';
import { 
  getEncodingDisplayName, 
  getEncodingDetails, 
  getLineEndingDisplayName,
  getLineEndingDetails,
  type EncodingDetectionResult 
} from '../utils/detectEncoding';

interface CharsetCheckerProps {
  encodingResult: EncodingDetectionResult | null;
}

const CharsetChecker: React.FC<CharsetCheckerProps> = ({ encodingResult }) => {
  if (!encodingResult) return null;

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'zengin-charset-confidence-green';
    if (confidence >= 0.6) return 'zengin-charset-confidence-yellow';
    return 'zengin-charset-confidence-red';
  };
  const getConfidenceBg = (confidence: number): string => {
    if (confidence >= 0.8) return 'zengin-charset-confidence-bg-green';
    if (confidence >= 0.6) return 'zengin-charset-confidence-bg-yellow';
    return 'zengin-charset-confidence-bg-red';
  };
  const getConfidenceGradient = (confidence: number): string => {
    if (confidence >= 0.8) return 'zengin-charset-confidence-gradient-green';
    if (confidence >= 0.6) return 'zengin-charset-confidence-gradient-yellow';
    return 'zengin-charset-confidence-gradient-red';
  };
  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return '高';
    if (confidence >= 0.6) return '中';
    return '低';
  };

  const isValidShiftJIS = encodingResult.isValidShiftJIS;
  const hasError = !isValidShiftJIS || encodingResult.error;

  return (
    <div className="zengin-charset-card card fade-in">
      {/* タイトル */}
      <div className="zengin-charset-header">
        <span className="zengin-charset-icon-wrap">
          <span className="zengin-icon-xl zengin-icon-info zengin-charset-icon-info"></span>
        </span>
        <h2 className="zengin-charset-title">文字コード判定結果</h2>
      </div>

      {/* サマリーグリッド */}
      <div className="zengin-charset-summary-grid">
        {/* 文字コード */}
        <div className="zengin-charset-section zengin-charset-section-encoding">
          <div className="zengin-charset-section-header">
            <span className="zengin-charset-section-label">文字コード</span>
            <span className={`zengin-charset-status-dot ${isValidShiftJIS ? 'success' : 'error'}`}></span>
          </div>
          <div className="zengin-charset-encoding-row">
            <span className={`zengin-charset-encoding-name ${isValidShiftJIS ? 'success' : 'error'}`}>{getEncodingDisplayName(encodingResult.encoding)}</span>
            {!isValidShiftJIS && (
              <span className="zengin-icon-lg zengin-icon-error zengin-charset-encoding-error"></span>
            )}
          </div>
          <div className="zengin-charset-encoding-detail">{getEncodingDetails(encodingResult)}</div>
          {encodingResult.debugInfo && (
            <div className="zengin-charset-debug-info">{encodingResult.debugInfo}</div>
          )}
          {encodingResult.browserSupport && (
            <div className="zengin-charset-browser-support">ブラウザ: {encodingResult.browserSupport}</div>
          )}
        </div>

        {/* 信頼度 */}
        <div className="zengin-charset-section zengin-charset-section-confidence">
          <div className="zengin-charset-section-header">
            <span className="zengin-charset-section-label">信頼度</span>
            <span className="zengin-charset-confidence-dot"></span>
          </div>
          <div className="zengin-charset-confidence-row">
            <span className={`zengin-charset-confidence-value ${getConfidenceColor(encodingResult.confidence)}`}>{(encodingResult.confidence * 100).toFixed(1)}%</span>
            <span className={`zengin-charset-confidence-label ${getConfidenceBg(encodingResult.confidence)}`}>{getConfidenceLabel(encodingResult.confidence)}</span>
          </div>
          <div className="zengin-charset-confidence-bar-bg">
            <div className={`zengin-charset-confidence-bar ${getConfidenceGradient(encodingResult.confidence)}`} style={{ width: `${encodingResult.confidence * 100}%` }} />
          </div>
        </div>

        {/* ファイル情報 */}
        <div className="zengin-charset-section zengin-charset-section-fileinfo">
          <div className="zengin-charset-section-header">
            <span className="zengin-charset-section-label">ファイル情報</span>
            <span className="zengin-charset-fileinfo-dot"></span>
          </div>
          {isValidShiftJIS ? (
            <>
              <div className="zengin-charset-fileinfo-chars">
                {encodingResult.lineEndingInfo?.totalLength.toLocaleString() || encodingResult.decodedContent.length.toLocaleString()}
                <span className="zengin-charset-fileinfo-chars-label">文字 (改行含む)</span>
              </div>
              <div className="zengin-charset-fileinfo-content-chars">
                {encodingResult.lineEndingInfo?.contentLength.toLocaleString() || encodingResult.decodedContent.replace(/\r\n|\r|\n/g, '').length.toLocaleString()}
                <span className="zengin-charset-fileinfo-chars-label">文字 (改行除く)</span>
              </div>
              <div className="zengin-charset-fileinfo-bytes">
                {new Blob([encodingResult.decodedContent]).size.toLocaleString()} バイト
              </div>
              <div className="zengin-charset-fileinfo-status success">
                <span className="zengin-charset-fileinfo-status-dot"></span>
                <span>処理完了</span>
              </div>
            </>
          ) : (
            <>
              <div className="zengin-charset-fileinfo-error">エラー</div>
              <div className="zengin-charset-fileinfo-error-detail">読み込み失敗</div>
              <div className="zengin-charset-fileinfo-status error">
                <span className="zengin-charset-fileinfo-status-dot"></span>
                <span>処理失敗</span>
              </div>
            </>
          )}
        </div>

        {/* 改行コード情報 */}
        {isValidShiftJIS && encodingResult.lineEndingInfo && (
          <div className="zengin-charset-section zengin-charset-section-lineending">
            <div className="zengin-charset-section-header">
              <span className="zengin-charset-section-label">改行コード</span>
              <span className="zengin-charset-lineending-dot"></span>
            </div>
            <div className="zengin-charset-lineending-row">
              <span className="zengin-charset-lineending-type">
                {getLineEndingDisplayName(encodingResult.lineEndingInfo.type)}
              </span>
              {encodingResult.lineEndingInfo.type !== 'None' && (
                <span className="zengin-charset-lineending-count">
                  {encodingResult.lineEndingInfo.count}行
                </span>
              )}
            </div>
            <div className="zengin-charset-lineending-details">
              {getLineEndingDetails(encodingResult.lineEndingInfo)}
            </div>
            {encodingResult.lineEndingInfo.totalLength === 121 && (
              <div className="zengin-charset-lineending-highlight">
                ✓ 全銀フォーマット想定長 (121文字)
              </div>
            )}
          </div>
        )}
      </div>

      {/* エラーメッセージ */}
      {hasError && (
        <div className="alert alert-error slide-in-left zengin-charset-error-alert">
          <span className="zengin-charset-error-icon-wrap">
            <span className="zengin-icon-lg zengin-icon-error"></span>
          </span>
          <div>
            <h4 className="zengin-charset-error-title">❌ 文字コードエラー</h4>
            <div className="zengin-charset-error-detail">
              <p>
                <span className="zengin-charset-error-dot"></span>
                <span>{encodingResult.error || 'ファイルの文字コードが対応していません'}</span>
              </p>
              <p>
                <span className="zengin-charset-error-dot"></span>
                <span>このアプリケーションはShift_JISエンコードのファイルのみ対応しています。</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 対応文字コード情報 */}
      <div className="alert alert-info slide-in-right zengin-charset-info-alert">
        <span className="zengin-charset-info-icon-wrap">
          <span className="zengin-icon-lg zengin-icon-info"></span>
        </span>
        <div>
          <h4 className="zengin-charset-info-title">💡 対応文字コード</h4>
          <div className="zengin-charset-info-detail">
            <p>
              このアプリケーションは <strong className="zengin-charset-info-highlight">Shift_JIS</strong> エンコードのファイルのみ対応しています。
            </p>
            <p>
              全銀フォーマットファイルは通常Shift_JISで作成されるため、ファイルの文字コードをご確認ください。
            </p>
            <p className="zengin-charset-info-note">
              ※ UTF-8、EUC-JP、その他の文字コードには対応していません。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharsetChecker; 
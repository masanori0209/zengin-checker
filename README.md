# 全銀フォーマットチェッカー 🏦

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646cff.svg)](https://vitejs.dev/)

全国銀行協会の全銀フォーマット（固定長120文字）ファイルを解析・検証・可視化するWebアプリケーションです。
Shift_JIS エンコードされた .txt/.dat ファイルをドラッグ&ドロップするだけで、データ構造を直感的に確認できます。

## 🚀 ライブデモ

**[https://masanori0209.github.io/zengin-checker/](https://masanori0209.github.io/zengin-checker/)**

## ✨ 主な機能

### 📤 ファイル処理
- **ドラッグ&ドロップ対応**: .txt / .dat ファイルの簡単アップロード
- **文字コード自動判定**: Shift_JIS エンコードの自動検出と検証
- **改行コード対応**: CRLF / LF / CR の混在パターンにも対応
- **セキュアな処理**: ファイルはブラウザ内でのみ処理（サーバー送信なし）

### 🔍 データ解析・検証
- **全銀フォーマット準拠チェック**: レコード区分（1:ヘッダー、2:データ、8:トレーラー、9:エンド）の自動判定
- **フィールド単位検証**: データ型・長さ・必須項目・文字種の詳細チェック
- **構造整合性検証**: ヘッダー・データ・トレーラーの構成確認
- **件数整合性チェック**: トレーラーの件数とデータ件数の照合

### 📊 可視化・表示
- **複数ビューモード**: 
  - テーブル表示（仮想化対応で大量データも高速）
  - カード表示（重要項目をハイライト）
  - コンパクト表示
  - 詳細表示（全フィールド展開）
- **高度なフィルタリング**: レコード種別・エラー有無・キーワード検索
- **エラーハイライト**: 不正データの視覚的な識別
- **リアルタイム編集**: セル内容の直接編集機能

### �� 統計・分析
- **解析結果サマリー**: 総件数・エラー件数・エラー率の表示
- **文字コード詳細情報**: エンコード判定の信頼度とデバッグ情報
- **改行コード分析**: 使用されている改行コードの詳細統計

### 💾 エクスポート機能
- **修正データの出力**: 編集後のデータを全銀フォーマットで出力
- **CSV出力**: デバッグ用のCSV形式エクスポート
- **選択データ出力**: フィルタリング結果のみを出力

## 🛠️ 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **Frontend** | React | 19.1.0 | UIフレームワーク |
| **言語** | TypeScript | 5.8.3 | 型安全な開発 |
| **ビルドツール** | Vite | 6.3.5 | 高速な開発・ビルド |
| **仮想化** | @tanstack/react-virtual | 3.13.10 | 大量データの高速表示 |
| **ファイル処理** | react-dropzone | 14.3.8 | ドラッグ&ドロップUI |
| **デプロイ** | GitHub Pages | - | 静的ホスティング |
| **CI/CD** | GitHub Actions | - | 自動デプロイ |

## 📋 セットアップ

### 前提条件
- Node.js 18.x 以上
- npm または yarn

### インストール手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/masanori0209/zengin-checker.git
cd zengin-checker

# 2. 依存関係をインストール
npm install

# 3. 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:5173 にアクセスしてください。

### ビルドとプレビュー

```bash
# プロダクションビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 🚀 デプロイ

### GitHub Pages への自動デプロイ

このプロジェクトは GitHub Actions を使用して自動デプロイされます。

```bash
# main ブランチにプッシュすると自動デプロイ
git add .
git commit -m "Update application"
git push origin main
```

### 手動デプロイ

```bash
npm run deploy
```

## 📁 プロジェクト構成

```
zengin-checker/
├── src/
│   ├── components/           # Reactコンポーネント
│   │   ├── Header.tsx       # アプリケーションヘッダー
│   │   ├── FileUploader.tsx # ファイルアップロード機能
│   │   ├── CharsetChecker.tsx # 文字コード判定結果表示
│   │   ├── ZenginTable.tsx  # メインデータテーブル
│   │   ├── VirtualizedTable.tsx # 仮想化テーブル
│   │   ├── EditableTableCell.tsx # 編集可能セル
│   │   ├── ThemeToggle.tsx  # ダーク/ライトモード切替
│   │   └── Footer.tsx       # フッター
│   ├── hooks/               # カスタムフック
│   │   ├── useZenginParser.ts # 全銀データ解析ロジック
│   │   └── useTheme.ts      # テーマ管理
│   ├── utils/               # ユーティリティ
│   │   ├── zenginLayout.ts  # 全銀フォーマット定義
│   │   ├── detectEncoding.ts # 文字コード判定
│   │   └── fileExport.ts    # ファイルエクスポート
│   ├── App.tsx              # メインアプリケーション
│   └── main.tsx             # エントリーポイント
├── public/                  # 静的ファイル
├── package.json            # 依存関係とスクリプト
├── vite.config.ts          # Vite設定
├── tsconfig.json           # TypeScript設定
└── eslint.config.js        # ESLint設定
```

## 🔧 全銀フォーマット仕様

### サポートするレコード種別

| レコード区分 | 名称 | 説明 | 必須 |
|-------------|------|------|------|
| **1** | ヘッダーレコード | ファイル全体の情報 | ✅ |
| **2** | データレコード | 振込データ | ✅ |
| **8** | トレーラーレコード | 集計情報 | ✅ |
| **9** | エンドレコード | ファイル終端 | ⚪ |

### 主要フィールド例

#### ヘッダーレコード
- データ区分（1桁）
- 種別コード（2桁）
- 委託者コード（10桁）
- 委託者名（40桁）
- 取組日（4桁：MMDD）

#### データレコード
- 銀行コード（4桁）
- 支店コード（3桁）
- 預金種目（1桁：1=普通、2=当座）
- 口座番号（7桁）
- 受取人名（30桁：半角カナ）
- 振込金額（10桁）

#### トレーラーレコード
- 合計件数（6桁）
- 合計金額（12桁）

## 🎨 カスタマイズ

### レイアウト定義の変更

全銀フォーマットの定義は `src/utils/zenginLayout.ts` で管理されています。

```typescript
export const zenginLayout: ZenginRecordLayout[] = [
  {
    recordType: '1', // レコード区分
    description: 'ヘッダレコード',
    fields: [
      {
        name: 'データ区分',
        start: 1,        // 開始位置（1-based）
        length: 1,       // 長さ
        type: 'numeric', // データ型
        required: true,  // 必須フラグ
        description: 'データ区分',
        validation: (value) => /^\d$/.test(value) // カスタム検証
      },
      // ... 他のフィールド
    ]
  }
];
```

### 文字コード判定のカスタマイズ

`src/utils/detectEncoding.ts` で文字コード判定ロジックを調整できます。

```typescript
// 判定スコアの閾値を調整
const isValidShiftJIS = scoreResult.score > 0.3; // デフォルト: 0.3
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 変更をコミット
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. ブランチにプッシュ
   ```bash
   git push origin feature/amazing-feature
   ```
5. Pull Requestを作成

### 開発ガイドライン

- TypeScriptの型安全性を保つ
- ESLintとPrettierの設定に従う
- コンポーネントは単一責任の原則に従う
- パフォーマンスを考慮した実装を心がける

```bash
# コード品質チェック
npm run lint
npm run format:check

# 自動修正
npm run lint:fix
npm run format
```

## 📝 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## ⚠️ 重要な注意事項

### セキュリティ
- **完全ローカル処理**: アップロードされたファイルはサーバーに送信されません
- **ブラウザ内完結**: 全ての処理がクライアントサイドで実行されます
- **データ保護**: ファイル内容はメモリ上でのみ処理され、永続化されません

### 使用上の注意
- **検証目的**: このツールは全銀フォーマットの理解と検証を支援するためのものです
- **業務利用前の確認**: 実際の業務で使用する前には十分なテストを実施してください
- **ブラウザ対応**: モダンブラウザ（Chrome, Firefox, Safari, Edge）での動作を想定しています

### 免責事項
- 本アプリケーションは個人が開発した非公式ツールです
- 「全銀」は全国銀行協会の登録商標です
- 全国銀行協会およびその関連組織とは一切関係ありません
- 本ツールの使用により生じた損害について、開発者は一切の責任を負いません

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/masanori0209/zengin-checker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/masanori0209/zengin-checker/discussions)
- **Wiki**: [プロジェクトWiki](https://github.com/masanori0209/zengin-checker/wiki)

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトの恩恵を受けています：

- [React](https://reactjs.org/) - UIライブラリ
- [Vite](https://vitejs.dev/) - ビルドツール
- [TanStack Virtual](https://tanstack.com/virtual) - 仮想化ライブラリ
- [react-dropzone](https://react-dropzone.js.org/) - ファイルドロップ機能

---

<div align="center">

**Made with ❤️ in Japan**

[![GitHub stars](https://img.shields.io/github/stars/masanori0209/zengin-checker?style=social)](https://github.com/masanori0209/zengin-checker/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/masanori0209/zengin-checker?style=social)](https://github.com/masanori0209/zengin-checker/network/members)

</div>

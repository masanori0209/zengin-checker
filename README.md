# 全銀フォーマットチェッカー

全銀フォーマットファイルの構造を可視化・検証するWebアプリケーションです。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-22.x-green.svg)
![React](https://img.shields.io/badge/react-19.x-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)

## 🚀 デモ

[https://masanori0209.github.io/zengin-checker/](https://masanori0209.github.io/zengin-checker/)

## ✨ 機能

- **ファイルアップロード**: .txt / .dat ファイルのドラッグ&ドロップ対応
- **文字コード自動判定**: Shift_JIS / UTF-8 / EUC-JP の自動判定
- **データ構造解析**: 全銀フォーマットに基づく項目別解析
- **検証機能**: データ型・長さ・必須項目の検証
- **可視化**: テーブル形式での直感的なデータ表示
- **エラーハイライト**: 不正データの赤色表示
- **統計情報**: 総件数・エラー件数・エラー率の表示
- **プライバシー保護**: ファイルはブラウザ内でのみ処理（サーバー送信なし）

## 🛠️ 技術スタック

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📋 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/masanori0209/zengin-checker.git
cd zengin-checker
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 にアクセスしてください。

### 4. ビルド

```bash
npm run build
```

### 5. プレビュー

```bash
npm run preview
```

## 🚀 デプロイ手順

### GitHub Pagesへのデプロイ

1. **リポジトリ設定**
   - GitHubリポジトリの Settings > Pages
   - Source を "Deploy from a branch" に設定
   - Branch を "gh-pages" に設定

2. **自動デプロイ**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin master
   ```
   
   GitHub Actionsが自動的に実行され、`gh-pages`ブランチにデプロイされます。

3. **手動デプロイ**
   ```bash
   npm run build
   npm run deploy
   ```

## 📁 プロジェクト構成

```
zengin-checker/
├── .github/
│   └── workflows/
│       └── gh-pages.yml          # GitHub Actions設定
├── src/
│   ├── components/               # Reactコンポーネント
│   │   ├── Header.tsx           # ヘッダー
│   │   ├── FileUploader.tsx     # ファイルアップロード
│   │   ├── CharsetChecker.tsx   # 文字コード判定結果
│   │   ├── ZenginTable.tsx      # データテーブル
│   │   └── Footer.tsx           # フッター
│   ├── hooks/
│   │   └── useZenginParser.ts   # データ解析フック
│   ├── utils/
│   │   ├── detectEncoding.ts    # 文字コード判定
│   │   └── zenginLayout.ts      # 全銀レイアウト定義
│   ├── App.tsx                  # メインアプリ
│   └── main.tsx                 # エントリーポイント
├── package.json
├── vite.config.ts               # Vite設定
├── tailwind.config.js           # Tailwind設定
└── README.md
```

## 🔧 開発者向け情報

### 全銀データレイアウト

このツールは以下の全銀フォーマットに対応しています：

- **ヘッダーレコード** (レコード区分: 1)
- **データレコード** (レコード区分: 2)
- **トレーラーレコード** (レコード区分: 8)

各レコードは固定長120文字で構成されています。

### カスタマイズ

レイアウト定義は `src/utils/zenginLayout.ts` で管理されています。
新しいフォーマットを追加する場合は、このファイルを編集してください。

### 文字コード対応

- UTF-8
- Shift_JIS
- EUC-JP
- ASCII

文字コード判定ロジックは `src/utils/detectEncoding.ts` で実装されています。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## ⚠️ 注意事項

- このツールは全銀フォーマットの理解と検証を支援するために作成されました
- 実際の業務での使用前には、必ず十分なテストを行ってください
- ファイル処理はすべてブラウザ内で完結し、サーバーには送信されません

## 📋 免責事項

- 本アプリケーションは個人が開発した非公式ツールです
- 「全銀」は全国銀行協会の登録商標です
- 全国銀行協会およびその関連組織とは一切関係ありません
- 本ツールの使用により生じた損害について、開発者は一切の責任を負いません

## 📞 サポート

問題や質問がある場合は、[GitHub Issues](https://github.com/masanori0209/zengin-checker/issues) でお知らせください。

---

Made with ❤️ in Japan

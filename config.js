/**
 * ==============================
 * Ola lea Refine Program - 設定ファイル
 * ここを書き換えるだけで別クライアント用サイトに転用できます
 * ==============================
 */
const SITE_CONFIG = {

  // ===== ブランド設定 =====
  brand: {
    name: 'Ola lea',
    programName: 'Ola lea Refine Program',
    tagline: '6ヶ月間のオンライン養成プログラム',
    gradientStart: '#b87cbf',
    gradientMid1:  '#e8789a',
    gradientMid2:  '#e87848',
    gradientMid3:  '#f5a23c',
    gradientEnd:   '#f5c842',
    navyDark:  '#0f2d4a',
    navyLight: '#1a4a72',
  },

  // ===== GAS エンドポイント =====
  gasUrl: 'https://script.google.com/macros/s/AKfycbxZHpPn8N6KQJP0DUGhN2pNFHnwLo6XpqCcFbL3Tu2wmf_x4mfCsfOkDdLm6qXYrSRt/exec',

  // ===== 各種リンクURL =====
  links: {
    memberPage:  'https://mosh.jp/user/memberships/341756/posts',
    glcon:       null,
    consult:     null,
    bonus:       null,
    bonusDrive:  'https://drive.google.com/drive/folders/1y8QWtvR6P6WmjXytNxUkzBr0AJbVdSDe',
    bonusSheet:  'https://docs.google.com/spreadsheets/d/1QgeIZIG9fU_vaf8GBXYX0cpqbXx00fhUX3Kuxz0m-ZY/edit',
  },

  // ===== 個別コンサル案内テキスト =====
  consultInfo: 'LINEにて「コンサル希望」とメッセージをお送りください。\n\n【料金】\n・6ヶ月の間、3回まで無料\n・4回目以降は有料\n　30分：10,000円\n　60分：18,000円',

  // ===== フェーズ定義 =====
  phases: [
    {
      id: 1,
      name: 'ブランディング\nストア設定',
      color: '#e8789a',
      lessons: [
        { id: 'branding',    title: 'ブランディング', stepCount: 3 },
        { id: 'store_setup', title: 'ストア設定',     stepCount: 5 },
      ]
    },
    {
      id: 2,
      name: '商品撮影',
      color: '#f5a23c',
      lessons: [
        { id: 'photo_main', title: '商品撮影の基本', stepCount: 4 },
        { id: 'photo_edit', title: '写真編集',       stepCount: 3 },
      ]
    },
    {
      id: 3,
      name: 'SNS集客',
      color: '#f5c842',
      lessons: [
        { id: 'sns_roadmap', title: 'SNSロードマップ', stepCount: 3 },
        { id: 'instagram',   title: 'Instagram運用',  stepCount: 4 },
      ]
    },
    {
      id: 4,
      name: '商品登録\n販売',
      color: '#3aaa8a',
      lessons: [
        { id: 'product_register', title: '商品登録',      stepCount: 3 },
        { id: 'sales_boost',      title: '売上UPの仕組み', stepCount: 3 },
      ]
    },
    {
      id: 5,
      name: 'スケール\n自走',
      color: '#9b59b6',
      lessons: [
        { id: 'scale',    title: 'スケールアップ', stepCount: 3 },
        { id: 'self_run', title: '自走・継続',     stepCount: 2 },
      ]
    },
  ],

  // ===== 入会特典リスト =====
  bonusItems: [
    {
      title: '特典1：素材・テンプレートデータ',
      description: 'Canvaテンプレート、撮影小物リストなど',
      linkKey: 'drive',
      urlLabel: 'Googleドライブを開く',
    },
    {
      title: '特典2：おすすめツール・資材リスト',
      description: 'Canva・梱包資材・印刷サービスまとめ',
      linkKey: null,
      content: '後日公開予定',
    },
    {
      title: '特典3：収支表',
      description: '売上・材料費・利益を自動計算するスプレッドシート',
      linkKey: 'sheet',
      urlLabel: 'スプレッドシートを開く',
    },
  ],

  // ===== 静的お知らせ（GASから取れない場合のフォールバック） =====
  staticAnnouncements: [
    {
      date: '2026-05-01',
      tag: 'お知らせ',
      title: '5月のグループコンサル日程が確定しました',
      body: '5月15日（金）20:00〜 開催予定です。詳細はグルコンページをご確認ください。',
    },
    {
      date: '2026-04-20',
      tag: '更新',
      title: 'フェーズ2の商品撮影コンテンツを追加しました',
      body: '写真編集の基礎から応用まで、新しいコンテンツをご確認ください。',
    },
    {
      date: '2026-04-10',
      tag: 'ご案内',
      title: 'ご入会ありがとうございます',
      body: '6ヶ月間、一緒に頑張りましょう。わからないことはいつでも質問してください。',
    },
  ],
};

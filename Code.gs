/**
 * 海レジンアート養成講座 - 会員サイト GAS バックエンド
 *
 * セットアップ手順:
 * 1. Google スプレッドシートを開く
 * 2. 拡張機能 → Apps Script
 * 3. このコードを貼り付けて保存
 * 4. initSheets() を一度実行（シート初期化）
 * 5. デプロイ → 新しいデプロイ → ウェブアプリ
 *    - 実行ユーザー: 自分
 *    - アクセス: 全員
 * 6. デプロイURLをコピーして index.html の GAS_URL に設定
 */

// === スプレッドシートID（自動で現在のスプレッドシートを使用） ===
function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

// === 初期化: シートを作成 ===
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 会員一覧シート
  if (!ss.getSheetByName('会員一覧')) {
    const s = ss.insertSheet('会員一覧');
    s.appendRow(['ID', '名前', 'イニシャル', '説明', 'カラー', 'パスワード', '登録日']);
    s.getRange('1:1').setFontWeight('bold').setBackground('#e8f4f8');
    s.setFrozenRows(1);
  }

  // 進捗シート
  if (!ss.getSheetByName('進捗')) {
    const s = ss.insertSheet('進捗');
    s.appendRow(['会員ID', '月', 'レッスン番号', 'タイトル', '動画完了', 'テキスト完了', '更新日時']);
    s.getRange('1:1').setFontWeight('bold').setBackground('#e8f4f8');
    s.setFrozenRows(1);
  }

  // ワークシート
  if (!ss.getSheetByName('ワーク')) {
    const s = ss.insertSheet('ワーク');
    s.appendRow(['会員ID', '月', 'レッスン番号', 'タイトル', '提出済み', '提出日', '内容', 'フィードバック', 'FB日時']);
    s.getRange('1:1').setFontWeight('bold').setBackground('#e8f4f8');
    s.setFrozenRows(1);
  }

  // メモシート
  if (!ss.getSheetByName('メモ')) {
    const s = ss.insertSheet('メモ');
    s.appendRow(['会員ID', 'タイプ', '日付', '内容', '返信', '返信日時']);
    s.getRange('1:1').setFontWeight('bold').setBackground('#e8f4f8');
    s.setFrozenRows(1);
  }

  // グルコンシート
  if (!ss.getSheetByName('グルコン')) {
    const s = ss.insertSheet('グルコン');
    s.appendRow(['開催日', 'タイトル', '動画URL', '説明', '公開']);
    s.getRange('1:1').setFontWeight('bold').setBackground('#e8f4f8');
    s.setFrozenRows(1);
    // サンプルデータ
    s.appendRow(['2026/4/26', '4月グルコン：商品設計を深掘り', 'https://vimeo.com/xxxxxxx/yyyy', '商品設計のリアルなQ&Aが盛り上がりました', '公開']);
  }

  // お知らせシート
  if (!ss.getSheetByName('お知らせ')) {
    const s = ss.insertSheet('お知らせ');
    s.appendRow(['投稿日', '種別', 'タイトル', '本文']);
    s.getRange('1:1').setFontWeight('bold').setBackground('#e8f4f8');
    s.setFrozenRows(1);
    // サンプルデータ
    s.appendRow(['2026/4/26', '重要', 'グループコンサル日程のお知らせ', '今月のグループコンサルの日程が決まりました。Zoomリンクは前日にお送りします。']);
    s.appendRow(['2026/4/1', 'コンテンツ', '1ヶ月目のコンテンツを公開しました', '「土台づくり」のコンテンツとマインドアップ音声をアップしました。']);
  }
}

// === Web API エントリポイント ===
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const params = e.parameter;
  const action = params.action;

  let result;
  try {
    switch (action) {
      case 'getAll':
        result = getAllMembers();
        break;
      case 'getGlcon':
        result = getGlcon();
        break;
      case 'getAnnouncements':
        result = getAnnouncements();
        break;
      case 'addMember':
        result = addMember(JSON.parse(e.postData.contents));
        break;
      case 'updateLesson':
        result = updateLesson(JSON.parse(e.postData.contents));
        break;
      case 'submitWork':
        result = submitWork(JSON.parse(e.postData.contents));
        break;
      case 'sendFeedback':
        result = sendFeedback(JSON.parse(e.postData.contents));
        break;
      case 'addMemo':
        result = addMemo(JSON.parse(e.postData.contents));
        break;
      case 'replyMemo':
        result = replyMemo(JSON.parse(e.postData.contents));
        break;
      case 'deleteMember':
        result = deleteMember(JSON.parse(e.postData.contents));
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// === 全会員データ取得 ===
function getAllMembers() {
  const memberSheet = getSheet('会員一覧');
  const lessonSheet = getSheet('進捗');
  const workSheet = getSheet('ワーク');
  const memoSheet = getSheet('メモ');

  if (!memberSheet) return { members: {} };

  const memberRows = memberSheet.getDataRange().getValues();
  const lessonRows = lessonSheet ? lessonSheet.getDataRange().getValues() : [];
  const workRows = workSheet ? workSheet.getDataRange().getValues() : [];
  const memoRows = memoSheet ? memoSheet.getDataRange().getValues() : [];

  const members = {};

  // ヘッダー行をスキップ (i=1 から)
  for (let i = 1; i < memberRows.length; i++) {
    const row = memberRows[i];
    const id = row[0];
    if (!id) continue;

    members[id] = {
      name: row[1],
      initial: row[2],
      sub: row[3],
      color: row[4],
      password: String(row[5] || ''),
      registeredDate: row[6],
      progress: { content: 0, work: '0/6', audio: '0/6', contentPct: 0, workPct: 0, audioPct: 0 },
      lessons: [],
      works: [],
      memos: []
    };
  }

  // 進捗データ
  for (let i = 1; i < lessonRows.length; i++) {
    const row = lessonRows[i];
    const memberId = row[0];
    if (!memberId || !members[memberId]) continue;

    members[memberId].lessons.push({
      month: row[1],
      index: row[2],
      title: row[3],
      done: row[4] === true || row[4] === 'TRUE',
      textDone: row[5] === true || row[5] === 'TRUE'
    });
  }

  // ワークデータ
  for (let i = 1; i < workRows.length; i++) {
    const row = workRows[i];
    const memberId = row[0];
    if (!memberId || !members[memberId]) continue;

    members[memberId].works.push({
      month: row[1],
      index: row[2],
      title: row[3],
      submitted: row[4] === true || row[4] === 'TRUE',
      date: row[5],
      content: row[6],
      feedback: row[7],
      feedbackDate: row[8],
      url: row[9] ? String(row[9]) : '',
      image: row[10] ? String(row[10]) : ''
    });
  }

  // メモデータ
  for (let i = 1; i < memoRows.length; i++) {
    const row = memoRows[i];
    const memberId = row[0];
    if (!memberId || !members[memberId]) continue;

    members[memberId].memos.push({
      type: row[1],
      date: row[2],
      text: row[3],
      reply: row[4],
      replyDate: row[5]
    });
  }

  // 進捗率を計算
  Object.keys(members).forEach(id => {
    const m = members[id];
    const totalLessons = m.lessons.length || 1;
    const doneLessons = m.lessons.filter(l => l.done).length;
    const doneWorks = m.works.filter(w => w.submitted).length;
    const totalWorks = m.works.length || 1;

    m.progress = {
      content: Math.round((doneLessons / totalLessons) * 100),
      work: doneWorks + '/' + m.works.length,
      audio: '0/6',
      contentPct: Math.round((doneLessons / totalLessons) * 100),
      workPct: Math.round((doneWorks / totalWorks) * 100),
      audioPct: 0
    };
  });

  return { members: members };
}

// === 会員追加 ===
function addMember(data) {
  const sheet = getSheet('会員一覧');
  const lessonSheet = getSheet('進捗');
  const workSheet = getSheet('ワーク');

  const id = data.id || 'member_' + new Date().getTime();
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');

  // 会員一覧に追加
  sheet.appendRow([
    id,
    data.name,
    data.name.charAt(0),
    data.sub || '',
    data.color || 'linear-gradient(135deg, #a8dce5, #1fa8b8)',
    data.password,
    now
  ]);

  // 5Phase 全22ステップの初期データ
  const allLessons = data.lessons || [
    // Phase 1: 基盤づくり
    { month: 1, index: 0, title: 'ショップ名・ブランドイメージ' },
    { month: 1, index: 1, title: 'ブランドカラー・世界観' },
    { month: 1, index: 2, title: 'ロゴ・ショップカード・商品台紙' },
    { month: 1, index: 3, title: '自己紹介文' },
    { month: 1, index: 4, title: 'ストア基本設定' },
    { month: 1, index: 5, title: '法律関係（特商法・返品）' },
    // Phase 2: 商品準備
    { month: 2, index: 0, title: '撮影環境・5ショット構成' },
    { month: 2, index: 1, title: 'メイン写真の撮り方' },
    { month: 2, index: 2, title: '使用・サイズ・編集' },
    { month: 2, index: 3, title: '商品登録' },
    // Phase 3: 集客の仕組みづくり
    { month: 3, index: 0, title: 'SNS選び・投稿設計' },
    { month: 3, index: 1, title: 'ハッシュタグ戦略' },
    { month: 3, index: 2, title: 'プロフィール・最初の10投稿' },
    { month: 3, index: 3, title: 'ファン作り3本柱' },
    // Phase 4: 販売力強化
    { month: 4, index: 0, title: '季節イベント・キャンペーン' },
    { month: 4, index: 1, title: '新作スケジュール・リピーター特典' },
    { month: 4, index: 2, title: 'メルマガ・LINE公式' },
    { month: 4, index: 3, title: '分析・PDCA' },
    // Phase 5: 運営の安定化
    { month: 5, index: 0, title: '梱包・発送ルーティン' },
    { month: 5, index: 1, title: '在庫管理・顧客対応テンプレ' },
    { month: 5, index: 2, title: 'サンキューカード' },
    { month: 5, index: 3, title: 'レビュー・リピーター施策' }
  ];

  allLessons.forEach(function(lesson) {
    lessonSheet.appendRow([id, lesson.month, lesson.index, lesson.title, false, false, '']);
    workSheet.appendRow([id, lesson.month, lesson.index, lesson.title, false, '', '', '', '']);
  });

  return { success: true, id: id };
}

// === レッスン進捗更新 ===
function updateLesson(data) {
  // data: { memberId, month, index, field, value }
  const sheet = getSheet('進捗');
  const rows = sheet.getDataRange().getValues();
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.memberId &&
        Number(rows[i][1]) === Number(data.month) &&
        Number(rows[i][2]) === Number(data.index)) {

      if (data.field === 'video' || data.field === 'done') {
        sheet.getRange(i + 1, 5).setValue(data.value); // 動画完了列
      }
      if (data.field === 'text') {
        sheet.getRange(i + 1, 6).setValue(data.value); // テキスト完了列
      }
      sheet.getRange(i + 1, 7).setValue(now); // 更新日時

      return { success: true };
    }
  }

  return { error: 'Lesson not found' };
}

// === ワーク提出 ===
function submitWork(data) {
  // data: { memberId, month, index, content, url, image }
  const sheet = getSheet('ワーク');
  const rows = sheet.getDataRange().getValues();
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
  const dateStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年M月d日');

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.memberId &&
        Number(rows[i][1]) === Number(data.month) &&
        Number(rows[i][2]) === Number(data.index)) {

      sheet.getRange(i + 1, 5).setValue(true);                    // 提出済み
      sheet.getRange(i + 1, 6).setValue(dateStr);                  // 提出日
      sheet.getRange(i + 1, 7).setValue(data.content || '');       // 内容
      if (data.url)   sheet.getRange(i + 1, 10).setValue(data.url);   // URL (col J)
      if (data.image) sheet.getRange(i + 1, 11).setValue(data.image); // 画像 base64 (col K)

      return { success: true, date: dateStr };
    }
  }

  return { error: 'Work not found' };
}

// === フィードバック送信 ===
function sendFeedback(data) {
  // data: { memberId, month, index, feedback }
  const sheet = getSheet('ワーク');
  const rows = sheet.getDataRange().getValues();
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.memberId &&
        Number(rows[i][1]) === Number(data.month) &&
        Number(rows[i][2]) === Number(data.index)) {

      sheet.getRange(i + 1, 8).setValue(data.feedback);  // フィードバック
      sheet.getRange(i + 1, 9).setValue(now);             // FB日時

      return { success: true };
    }
  }

  return { error: 'Work not found' };
}

// === メモ追加 ===
function addMemo(data) {
  // data: { memberId, type, text }
  const sheet = getSheet('メモ');
  const dateStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年M月d日');

  sheet.appendRow([
    data.memberId,
    data.type || 'memo',
    dateStr,
    data.text,
    '',
    ''
  ]);

  return { success: true, date: dateStr };
}

// === メモ返信 ===
function replyMemo(data) {
  // data: { memberId, memoIndex, reply }
  const sheet = getSheet('メモ');
  const rows = sheet.getDataRange().getValues();
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');

  // 該当会員のメモをカウントして特定
  let count = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.memberId) {
      count++;
      if (count === data.memoIndex) {
        sheet.getRange(i + 1, 5).setValue(data.reply);   // 返信
        sheet.getRange(i + 1, 6).setValue(now);           // 返信日時
        return { success: true };
      }
    }
  }

  return { error: 'Memo not found' };
}

// === 会員削除 ===
function deleteMember(data) {
  // data: { memberId }
  const sheets = ['会員一覧', '進捗', 'ワーク', 'メモ'];

  sheets.forEach(sheetName => {
    const sheet = getSheet(sheetName);
    if (!sheet) return;

    const rows = sheet.getDataRange().getValues();
    // 下から削除（行番号がずれないように）
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][0] === data.memberId) {
        sheet.deleteRow(i + 1);
      }
    }
  });

  return { success: true };
}

// === グルコンアーカイブ取得 ===
function getGlcon() {
  const sheet = getSheet('グルコン');
  if (!sheet) return { success: false, error: 'シートが見つかりません' };

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: true, data: [] };

  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const dateVal = row[0];
    const title   = row[1];
    const url     = row[2];
    const desc    = row[3];
    const status  = row[4];

    // 「公開」のみ表示
    if (String(status).trim() !== '公開') continue;
    if (!title) continue;

    // 日付を YYYY-MM-DD 形式に変換
    let dateStr = '';
    if (dateVal instanceof Date) {
      dateStr = Utilities.formatDate(dateVal, 'Asia/Tokyo', 'yyyy-MM-dd');
    } else {
      dateStr = String(dateVal).replace(/\//g, '-');
    }

    data.push({ date: dateStr, title: String(title), url: String(url || ''), description: String(desc || '') });
  }

  // 新しい順にソート
  data.sort(function(a, b) { return b.date.localeCompare(a.date); });

  return { success: true, data: data };
}

// === お知らせ取得 ===
function getAnnouncements() {
  const sheet = getSheet('お知らせ');
  if (!sheet) return { success: false, error: 'シートが見つかりません' };

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: true, data: [] };

  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const dateVal = row[0];
    const tag     = row[1];
    const title   = row[2];
    const body    = row[3];

    if (!title) continue;

    let dateStr = '';
    if (dateVal instanceof Date) {
      dateStr = Utilities.formatDate(dateVal, 'Asia/Tokyo', 'yyyy-MM-dd');
    } else {
      dateStr = String(dateVal).replace(/\//g, '-');
    }

    data.push({ date: dateStr, tag: String(tag || 'お知らせ'), title: String(title), body: String(body || '') });
  }

  // 新しい順にソート
  data.sort(function(a, b) { return b.date.localeCompare(a.date); });

  return { success: true, data: data };
}

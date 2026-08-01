/* =====================================================================
   ideas.js
   「アイデアメモ」機能だけを担当するファイル。
   フェーズ1のお手本として、以下の一連の流れをこの1ファイルの中で完結させる：
     データ(DATA.ideas) ⇄ 保存(saveData) ⇄ 画面表示(renderIdeas) ⇄ 操作(追加/削除)

   1件分のデータの形（イメージ）:
   { id: "abc123", text: "こういうイラスト描きたい", createdAt: "2026-08-02T10:00:00.000Z" }
===================================================================== */

/**
 * DATA.ideas が存在しない場合に空配列で初期化する。
 * 新規ユーザーや、まだ一度も保存していない状態でエラーにならないようにするため。
 */
function ensureIdeasData(){
  if(!Array.isArray(DATA.ideas)){
    DATA.ideas = [];
  }
}

/**
 * アイデア一覧を画面に描画する
 */
function renderIdeas(){
  ensureIdeasData();
  const listEl = document.getElementById("idea-list");
  if(!listEl) return;

  if(DATA.ideas.length === 0){
    listEl.innerHTML = `<li class="empty-msg">まだアイデアがありません。上の欄から追加してみましょう。</li>`;
    return;
  }

  // 新しいものが上に来るように並べ替えて表示
  const sorted = [...DATA.ideas].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  listEl.innerHTML = sorted.map(idea => `
    <li class="idea-item">
      <span class="idea-text">${escapeHtml(idea.text)}</span>
      <button type="button" class="idea-delete" onclick="deleteIdea('${idea.id}')" aria-label="削除">✕</button>
    </li>
  `).join("");
}

/**
 * 入力欄の内容をアイデアとして1件追加する
 */
function addIdea(text){
  const trimmed = (text || "").trim();
  if(!trimmed) return; // 空欄なら何もしない

  ensureIdeasData();
  DATA.ideas.push({
    id: generateId(),
    text: trimmed,
    createdAt: new Date().toISOString()
  });

  saveData();
  renderIdeas();
}

/**
 * 指定したIDのアイデアを削除する
 */
function deleteIdea(id){
  ensureIdeasData();
  DATA.ideas = DATA.ideas.filter(idea => idea.id !== id);
  saveData();
  renderIdeas();
}

/**
 * フォーム（入力欄＋追加ボタン）にイベントを設定する
 */
function initIdeasForm(){
  const form = document.getElementById("idea-form");
  const input = document.getElementById("idea-input");
  if(!form || !input) return;

  form.addEventListener("submit", event => {
    event.preventDefault(); // ページの再読み込みを防ぐ
    addIdea(input.value);
    input.value = "";
    input.focus();
  });
}

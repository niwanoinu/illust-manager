/* =====================================================================
   utils.js
   特定の機能に属さない、小さな共通処理をまとめる場所。
   「アイデアメモ」に限らず、今後どの機能からも使う想定の関数はここに置く。
===================================================================== */

/**
 * HTMLとして表示しても安全な文字列に変換する
 * （ユーザーが入力した文字にたまたま < や " が含まれていても
 * 　画面が崩れたり動作がおかしくなったりしないようにする）
 */
function escapeHtml(str){
  if(str == null) return "";
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

/**
 * データ1件ごとに付ける、他と重複しないID文字列を作る
 */
function generateId(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * 今日の日付を "YYYY-MM-DD" 形式で返す（端末のタイムゾーン基準）
 */
function todayStr(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 画面下に短いメッセージを一瞬だけ表示する（操作した内容の確認用）
 */
function toast(message){
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 1800);
}

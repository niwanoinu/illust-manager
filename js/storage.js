/* =====================================================================
   storage.js
   「データの保存・読み込み」だけを担当するファイル。
   他のファイル（画面表示など）は、ここにある saveData() / loadData() を
   呼び出すだけで済むようにする。中身の仕組み（保存先）は今後変わっても、
   呼び出し方（関数名）は変えない、というルールで作る。
===================================================================== */

// アプリの全データを保持する場所（今はまだ空っぽ）。
// フェーズ1以降、ここに ideas / works / accounts などを追加していく。
let DATA = {};

// 保存先のキー名（localStorageの中でこの名前で保存される）
const STORAGE_KEY = "illust-manager-data";

/**
 * DATAの中身を保存する
 * 今はまだ中身は空でOK。「呼べば保存される」という形だけ先に作る。
 */
function saveData(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
  }catch(err){
    console.error("保存に失敗しました:", err);
  }
}

/**
 * 保存されているデータを読み込んでDATAに反映する
 * データが無い場合は空のオブジェクトのままにする。
 */
function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      DATA = JSON.parse(raw);
    }
  }catch(err){
    console.error("読み込みに失敗しました:", err);
  }
}

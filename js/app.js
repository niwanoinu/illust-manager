/* =====================================================================
   app.js
   アプリ起動時の「最初に1回だけやること」をまとめる場所。
   storage.js / router.js の関数を呼び出して組み立てるだけで、
   保存の仕組みそのものやページ切り替えの仕組みそのものはここには書かない。
===================================================================== */

function init(){
  // 1. 保存されているデータを読み込む
  loadData();

  // 2. ナビゲーションのボタンにクリックイベントを設定
  initRouter();

  // 3. 各機能の初期化・初回描画
  //    機能が増えるたびに、ここに1行ずつ追加していく
  initIdeasForm();
  renderIdeas();

  // 4. 前回開いていたページ（なければホーム）を表示
  const lastPage = sessionStorage.getItem("currentPage") || "home";
  showPage(lastPage);
}

document.addEventListener("DOMContentLoaded", init);

/* ===== PWA: Service Workerの登録 ===== */
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("service-worker.js")
      .catch(err=>console.warn("Service Workerの登録に失敗しました:", err));
  });
}

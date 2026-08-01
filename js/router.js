/* =====================================================================
   router.js
   「どのページを表示するか」だけを担当するファイル。
   仕組み：
     - HTML側で .page というクラスのついたブロックをページ単位で用意する
     - 表示したいページの要素だけに .active クラスをつけて、他は消す
     - ナビゲーションのボタンにも .active をつけて、今どこにいるか分かるようにする
===================================================================== */

/**
 * 指定した名前のページを表示する
 * @param {string} name  例: "home", "sample"
 */
function showPage(name){
  // すべての.pageから active を外す → 該当ページだけ active をつける
  document.querySelectorAll(".page").forEach(el=>{
    el.classList.toggle("active", el.id === `page-${name}`);
  });

  // ナビゲーションのボタンの見た目も切り替える
  document.querySelectorAll(".nav-item").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.page === name);
  });

  // 次回起動時も同じページを開けるように、今開いているページ名だけ覚えておく
  // （データそのものではなく「表示状態」なのでsessionStorageを使う）
  sessionStorage.setItem("currentPage", name);
}

/**
 * ナビゲーションのボタンにクリックイベントを設定する
 * （HTML側の data-page="ページ名" を見て自動でひもづける）
 */
function initRouter(){
  document.querySelectorAll(".nav-item").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      showPage(btn.dataset.page);
    });
  });
}

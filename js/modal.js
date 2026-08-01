/* =====================================================================
   modal.js
   「入力フォームなどを、画面の上に重ねて表示する」仕組みだけを担当する。
   何を表示するか（フォームの中身）は、呼び出す側（production.js など）が決める。
   ここでは「開く」「閉じる」という共通の型だけを提供する。
===================================================================== */

/**
 * モーダルを開く
 * @param {string} html  モーダルの中に表示したいHTML
 */
function openModal(html){
  const root = document.getElementById("modal-root");
  if(!root) return;
  root.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this) closeModal()">
      <div class="modal-box">${html}</div>
    </div>
  `;
}

/**
 * モーダルを閉じる
 */
function closeModal(){
  const root = document.getElementById("modal-root");
  if(root) root.innerHTML = "";
}

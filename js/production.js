/* =====================================================================
   production.js
   「制作管理（カンバン）」機能を担当するファイル。
   1件分のデータ（work）のイメージ：
   {
     id, title,
     type: "original" | "fan" | "request",   // オリジナル / 二次創作 / 依頼
     fanGenre,       // type が fan のときだけ使う
     accountName,    // 投稿予定アカウント（今は自由入力。将来アカウント管理と連携予定）
     deadline,       // type が original/fan のときの締切（任意）
     request: { source, amount, deadline },  // type が request のときだけ使う
     status,         // PRODUCTION_STATUSES のいずれか
     memo,
     startDate, endDate
   }
===================================================================== */

const PRODUCTION_STATUSES = ["未着手", "下書き", "線画", "着色", "完了"];
const PRODUCTION_TYPE_LABELS = { original: "オリジナル", fan: "二次創作", request: "依頼" };

function ensureProductionData(){
  if(!Array.isArray(DATA.works)) DATA.works = [];
}

/* ----------------------------------------------------------------
   一覧表示（カンバン）
---------------------------------------------------------------- */

function renderProduction(){
  ensureProductionData();
  const wrap = document.getElementById("kanban-wrap");
  if(!wrap) return;

  wrap.innerHTML = PRODUCTION_STATUSES.map(status => {
    const items = DATA.works.filter(w => w.status === status);
    return `
      <div class="kanban-col">
        <h4>${status}<span class="count">${items.length}</span></h4>
        <div class="kanban-col-body">
          ${items.length === 0
            ? `<div class="empty-msg-small">なし</div>`
            : items.map(w => workCardHtml(w)).join("")}
        </div>
      </div>
    `;
  }).join("");

  // カードごとにスワイプ操作を設定する（描画のたびに設定し直す）
  wrap.querySelectorAll(".kanban-card").forEach(card => attachSwipe(card));
}

function workCardHtml(w){
  const typeLabel = PRODUCTION_TYPE_LABELS[w.type] || "";
  const deadlineText = w.type === "request"
    ? (w.request && w.request.deadline ? `納期: ${w.request.deadline}` : "")
    : (w.deadline ? `締切: ${w.deadline}` : "");

  return `
    <div class="kanban-card" data-id="${w.id}" onclick="openWorkDetail('${w.id}')">
      <div class="k-title">${escapeHtml(w.title)}</div>
      <div class="k-meta">
        <span class="k-badge k-badge-${w.type}">${typeLabel}</span>
        ${w.type === "fan" && w.fanGenre ? `<span class="k-badge">${escapeHtml(w.fanGenre)}</span>` : ""}
        ${deadlineText ? `<span>${escapeHtml(deadlineText)}</span>` : ""}
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   スワイプでステータス移動
   右にスワイプ → 次の工程へ進める／左にスワイプ → 前の工程に戻す
---------------------------------------------------------------- */

function attachSwipe(card){
  let startX = 0;
  let currentX = 0;
  let dragging = false;
  const threshold = 60; // これ以上動かしたら「移動する」と判定する距離(px)

  card.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    dragging = true;
    card.classList.add("swiping");
  }, { passive: true });

  card.addEventListener("touchmove", e => {
    if(!dragging) return;
    currentX = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${currentX}px)`;
  }, { passive: true });

  card.addEventListener("touchend", () => {
    if(!dragging) return;
    dragging = false;
    card.classList.remove("swiping");
    card.style.transform = "";

    if(Math.abs(currentX) > threshold){
      moveWorkStatus(card.dataset.id, currentX > 0 ? 1 : -1);
    }
    currentX = 0;
  });
}

function moveWorkStatus(id, direction){
  ensureProductionData();
  const w = DATA.works.find(x => x.id === id);
  if(!w) return;

  const idx = PRODUCTION_STATUSES.indexOf(w.status);
  const nextIdx = idx + direction;
  if(nextIdx < 0 || nextIdx >= PRODUCTION_STATUSES.length) return; // 端では何もしない

  w.status = PRODUCTION_STATUSES[nextIdx];
  w.endDate = w.status === "完了" ? todayStr() : "";

  saveData();
  renderProduction();
  toast(`「${w.title}」を${w.status}に移動しました`);
}

/* ----------------------------------------------------------------
   追加・編集フォーム（モーダル）
---------------------------------------------------------------- */

function openAddWorkModal(){
  openModal(workFormHtml(null));
  bindWorkFormEvents();
}

function openWorkDetail(id){
  ensureProductionData();
  const w = DATA.works.find(x => x.id === id);
  if(!w) return;
  openModal(workFormHtml(w));
  bindWorkFormEvents();
}

function workFormHtml(w){
  const editing = !!w;
  const d = w || {
    id: "", title: "", type: "original", fanGenre: "", accountName: "",
    deadline: "", status: "未着手", memo: "",
    request: { source: "", amount: "", deadline: "" }
  };
  const req = d.request || { source: "", amount: "", deadline: "" };

  return `
    <h3>${editing ? "制作物を編集" : "制作物を追加"}</h3>
    <form id="work-form">
      <input type="hidden" id="w-id" value="${d.id || ""}">

      <label>タイトル
        <input type="text" id="w-title" value="${escapeHtml(d.title)}" required>
      </label>

      <label>種別
        <select id="w-type">
          <option value="original" ${d.type === "original" ? "selected" : ""}>オリジナル</option>
          <option value="fan" ${d.type === "fan" ? "selected" : ""}>二次創作</option>
          <option value="request" ${d.type === "request" ? "selected" : ""}>依頼</option>
        </select>
      </label>

      <div id="w-fangenre-field" class="field">
        <label>ジャンル・原作名
          <input type="text" id="w-fangenre" value="${escapeHtml(d.fanGenre || "")}" placeholder="例：〇〇（原作名）">
        </label>
      </div>

      <div id="w-account-field" class="field">
        <label>投稿アカウント（任意）
          <input type="text" id="w-account" value="${escapeHtml(d.accountName || "")}" placeholder="例：メインアカウント">
        </label>
      </div>

      <div id="w-deadline-field" class="field">
        <label>締切（任意）
          <input type="date" id="w-deadline" value="${d.deadline || ""}">
        </label>
      </div>

      <div id="w-request-fields" class="field">
        <label>依頼主
          <input type="text" id="w-req-source" value="${escapeHtml(req.source || "")}">
        </label>
        <label>金額（円）
          <input type="number" id="w-req-amount" value="${req.amount || ""}" min="0">
        </label>
        <label>納期
          <input type="date" id="w-req-deadline" value="${req.deadline || ""}">
        </label>
      </div>

      <label>ステータス
        <select id="w-status">
          ${PRODUCTION_STATUSES.map(s => `<option value="${s}" ${d.status === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </label>

      <label>メモ（任意）
        <textarea id="w-memo" rows="3">${escapeHtml(d.memo || "")}</textarea>
      </label>

      <div class="modal-actions">
        ${editing ? `<button type="button" class="btn-danger" onclick="deleteWork('${d.id}')">削除</button>` : `<span></span>`}
        <div>
          <button type="button" class="btn-secondary" onclick="closeModal()">キャンセル</button>
          <button type="submit" class="btn-primary">${editing ? "保存" : "追加"}</button>
        </div>
      </div>
    </form>
  `;
}

/**
 * フォーム内の「種別」に応じて表示する項目を切り替え、送信イベントを設定する
 */
function bindWorkFormEvents(){
  const typeSel = document.getElementById("w-type");
  const fanField = document.getElementById("w-fangenre-field");
  const accountField = document.getElementById("w-account-field");
  const deadlineField = document.getElementById("w-deadline-field");
  const requestFields = document.getElementById("w-request-fields");

  function syncFieldVisibility(){
    const type = typeSel.value;
    fanField.classList.toggle("hidden", type !== "fan");
    accountField.classList.toggle("hidden", type === "request");
    deadlineField.classList.toggle("hidden", type === "request");
    requestFields.classList.toggle("hidden", type !== "request");
  }
  typeSel.addEventListener("change", syncFieldVisibility);
  syncFieldVisibility();

  document.getElementById("work-form").addEventListener("submit", event => {
    event.preventDefault();
    saveWorkFromForm();
  });
}

function saveWorkFromForm(){
  ensureProductionData();

  const id = document.getElementById("w-id").value;
  const type = document.getElementById("w-type").value;
  const title = document.getElementById("w-title").value.trim();

  if(!title){
    alert("タイトルを入力してください");
    return;
  }

  const work = {
    id: id || generateId(),
    title,
    type,
    fanGenre: type === "fan" ? document.getElementById("w-fangenre").value.trim() : "",
    accountName: type !== "request" ? document.getElementById("w-account").value.trim() : "",
    deadline: type !== "request" ? document.getElementById("w-deadline").value : "",
    request: type === "request" ? {
      source: document.getElementById("w-req-source").value.trim(),
      amount: Number(document.getElementById("w-req-amount").value) || 0,
      deadline: document.getElementById("w-req-deadline").value
    } : { source: "", amount: 0, deadline: "" },
    status: document.getElementById("w-status").value,
    memo: document.getElementById("w-memo").value.trim()
  };

  const idx = DATA.works.findIndex(x => x.id === work.id);
  if(idx >= 0){
    work.startDate = DATA.works[idx].startDate || todayStr();
    DATA.works[idx] = work;
  }else{
    work.startDate = todayStr();
    DATA.works.push(work);
  }

  // 完了ならその日を完了日として記録。完了以外に戻したら完了日は消す
  work.endDate = work.status === "完了" ? (work.endDate || todayStr()) : "";

  saveData();
  closeModal();
  renderProduction();
  toast(idx >= 0 ? "保存しました" : "追加しました");
}

function deleteWork(id){
  if(!confirm("この制作物を削除しますか？")) return;
  ensureProductionData();
  DATA.works = DATA.works.filter(w => w.id !== id);
  saveData();
  closeModal();
  renderProduction();
  toast("削除しました");
}

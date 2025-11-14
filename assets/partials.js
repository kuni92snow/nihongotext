// ===============================
// Learning 印刷機能（例文も含む完全版）
// ===============================
function printLearning() {
  const modal = document.querySelector('#learningModal');
  if (!modal) return alert("Learning content not found.");

  // モーダル内のプリント対象
  const title = modal.querySelector(".learning-title")?.outerHTML || "";
  const sentences = modal.querySelector(".learning-examples")?.outerHTML || "";
  const grammar = modal.querySelector(".learning-grammar")?.outerHTML || "";

  // 例文など含めてまとめる
  const contentHTML = `
    <div style="padding:20px; font-family: sans-serif;">
      ${title}
      <hr>
      ${sentences}
      <hr>
      ${grammar}
    </div>
  `;

  // 印刷用レイヤー生成
  const printLayer = document.createElement("div");
  printLayer.id = "print-area-learning";
  printLayer.innerHTML = contentHTML;
  document.body.appendChild(printLayer);

  // 印刷実行
  window.print();

  // 印刷後削除
  setTimeout(() => {
    printLayer.remove();
  }, 500);
}

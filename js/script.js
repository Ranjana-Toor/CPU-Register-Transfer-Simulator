/* UI controller: connects form controls to the CPU model. */
(() => {
  const $ = id => document.getElementById(id);
  const registerSelectIds = ["loadRegister","transferSource","transferDestination","arithmeticA","arithmeticB","arithmeticDestination","logicalA","logicalB","logicalDestination"];
  const names = RegisterBank.names;
  let operationNumber = 0;

  function populateSelects() {
    registerSelectIds.forEach(id => {
      const select = $(id);
      select.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join("");
    });
    $("transferDestination").value = "R1";
    $("arithmeticA").value = "R1"; $("arithmeticB").value = "R2"; $("arithmeticDestination").value = "R3";
    $("logicalA").value = "R1"; $("logicalB").value = "R2"; $("logicalDestination").value = "R0";
  }
  function showMessage(message, type = "success") {
    const el = $("message"); el.textContent = message; el.className = `message ${type}`;
    $("statusText").textContent = type === "error" ? "Check input" : "Simulator ready";
  }
  function renderRegisters() {
    $("registerGrid").innerHTML = names.map(name => {
      const value = RegisterBank.get(name);
      return `<article class="register-card"><div class="register-head"><span class="register-name">${name}</span><span class="register-tag">8-BIT REGISTER</span></div><div class="register-decimal">${value}</div><div class="register-label">Decimal value</div><div class="binary-row"><code>${RegisterBank.binary(value)}</code><button class="copy-btn" data-copy="${RegisterBank.binary(value)}" aria-label="Copy ${name} binary">Copy</button></div><div class="hex-row">HEX <strong>0x${RegisterBank.hex(value)}</strong></div><div class="card-actions"><button class="text-btn" data-clear="${name}">Clear ${name}</button></div></article>`;
    }).join("");
    $("operationCount").textContent = operationNumber;
  }
  function renderHistory() {
    const rows = OperationHistory.all();
    $("historyBody").innerHTML = rows.length ? rows.map(item => `<tr><td>${item.id}</td><td>${escapeHtml(item.operation)}</td><td><code>${escapeHtml(item.rtl)}</code></td><td>${item.result} <span class="muted">(${item.binary})</span></td><td>${item.time.toLocaleString()}</td></tr>`).join("") : '<tr><td colspan="5" class="empty">No operations yet. Try loading a value into a register.</td></tr>';
  }
  function escapeHtml(text) { return String(text).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function record(operation, rtl, result, highlight = [], alu = null) {
    operationNumber++;
    OperationHistory.add({ operation, rtl, result, binary: RegisterBank.binary(result) });
    renderRegisters(); renderHistory(); highlightArchitecture(highlight, Boolean(alu));
    if (alu) updateALU(alu.a, alu.b, alu.label, result, alu.destination);
    showMessage(`Success: ${rtl} · result = ${result} (0x${RegisterBank.hex(result)})`);
  }
  function highlightArchitecture(registers, useAlu) {
    document.querySelectorAll(".arch-register").forEach(el => el.classList.toggle("active", registers.includes(el.dataset.register)));
    $("archALU").classList.toggle("active", useAlu);
    $("controlUnit").classList.add("active");
  }
  function updateALU(a, b, label, result, destination) {
    $("aluA").textContent = RegisterBank.binary(a); $("aluADec").textContent = `${a} (decimal)`;
    $("aluB").textContent = RegisterBank.binary(b); $("aluBDec").textContent = `${b} (decimal)`;
    $("aluOperation").textContent = label.toUpperCase();
    $("aluResult").textContent = RegisterBank.binary(result); $("aluResultDec").textContent = `${result} (decimal)`;
    $("aluDestination").textContent = destination;
  }
  function validRegister(name) { return names.includes(name); }
  function load() {
    const name = $("loadRegister").value, raw = $("loadValue").value;
    if (!validRegister(name) || raw.trim() === "" || !Number.isInteger(Number(raw)) || Number(raw) < 0 || Number(raw) > 255) return showMessage("Enter a whole number from 0 to 255 and select a register.", "error");
    const value = Number(raw); RegisterBank.set(name, value);
    record("Load value", `${name} ← ${value}`, value, [name]); $("loadValue").value = "";
  }
  function transfer() {
    const source = $("transferSource").value, destination = $("transferDestination").value;
    if (!validRegister(source) || !validRegister(destination)) return showMessage("Please select valid source and destination registers.", "error");
    const value = RegisterBank.get(source); RegisterBank.set(destination, value);
    record("Register transfer", `${destination} ← ${source}`, value, [source, destination]);
  }
  function arithmetic() {
    const type = $("arithmeticType").value, aName = $("arithmeticA").value, bName = $("arithmeticB").value, dest = $("arithmeticDestination").value;
    if (![aName,bName,dest].every(validRegister)) return showMessage("Please select valid registers.", "error");
    const a = RegisterBank.get(aName), b = RegisterBank.get(bName), usesB = type === "add" || type === "subtract";
    const raw = CPUOperations.runArithmetic(type, a, b), result = RegisterBank.normalize(raw);
    const expression = CPUOperations.describe(type, aName, bName);
    const rtl = `${dest} ← ${expression}`;
    RegisterBank.set(dest, result);
    const wrap = raw > 255 ? " (overflow: wrapped to 8 bits)" : raw < 0 ? " (underflow: wrapped to 8 bits)" : "";
    record(`Arithmetic: ${type}`, rtl + wrap, result, [aName, ...(usesB ? [bName] : []), dest], { a, b: usesB ? b : 0, label: expression, destination: dest });
  }
  function logical() {
    const type = $("logicalType").value, aName = $("logicalA").value, bName = $("logicalB").value, dest = $("logicalDestination").value;
    if (![aName,bName,dest].every(validRegister)) return showMessage("Please select valid registers.", "error");
    const a = RegisterBank.get(aName), b = RegisterBank.get(bName), usesB = type !== "not";
    const result = RegisterBank.normalize(CPUOperations.runLogical(type, a, b));
    const expression = CPUOperations.describe(type, aName, bName);
    const rtl = `${dest} ← ${expression}`;
    RegisterBank.set(dest, result);
    record(`Logical: ${type.toUpperCase()}`, rtl, result, [aName, ...(usesB ? [bName] : []), dest], { a, b: usesB ? b : 0, label: expression, destination: dest });
  }
  function clearRegister(name) {
    if (!validRegister(name)) return;
    RegisterBank.clear(name); renderRegisters(); highlightArchitecture([name], false); showMessage(`${name} cleared to zero.`);
  }
  function resetCPU() {
    RegisterBank.clearAll(); OperationHistory.clear(); operationNumber = 0;
    $("aluA").textContent = "00000000"; $("aluADec").textContent = "0 (decimal)";
    $("aluB").textContent = "00000000"; $("aluBDec").textContent = "0 (decimal)";
    $("aluResult").textContent = "00000000"; $("aluResultDec").textContent = "0 (decimal)";
    $("aluOperation").textContent = "WAITING"; $("aluDestination").textContent = "—";
    document.querySelectorAll(".arch-register,.arch-unit").forEach(el => el.classList.remove("active"));
    renderRegisters(); renderHistory(); showMessage("CPU initialized. All registers are zero.");
  }
  function bindEvents() {
    $("loadBtn").addEventListener("click", load); $("transferBtn").addEventListener("click", transfer);
    $("arithmeticBtn").addEventListener("click", arithmetic); $("logicalBtn").addEventListener("click", logical);
    $("resetBtn").addEventListener("click", resetCPU); $("clearAllBtn").addEventListener("click", () => { RegisterBank.clearAll(); renderRegisters(); showMessage("All four registers cleared to zero."); });
    $("clearHistoryBtn").addEventListener("click", () => { OperationHistory.clear(); renderHistory(); showMessage("Operation history cleared."); });
    $("registerGrid").addEventListener("click", event => {
      const clear = event.target.closest("[data-clear]"), copy = event.target.closest("[data-copy]");
      if (clear) clearRegister(clear.dataset.clear);
      if (copy) {
        const text = copy.dataset.copy;
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => showMessage(`Copied binary value ${text}.`)).catch(() => showMessage(`Binary: ${text} (clipboard access unavailable)`, "error"));
        else showMessage(`Binary value: ${text} (clipboard requires a secure browser context).`, "error");
      }
    });
    document.querySelectorAll(".op-tab").forEach(tab => tab.addEventListener("click", () => {
      document.querySelectorAll(".op-tab").forEach(item => item.classList.toggle("active", item === tab));
      document.querySelectorAll(".operation-panel").forEach(panel => panel.classList.toggle("active", panel.id === tab.dataset.panel));
    }));
    $("arithmeticType").addEventListener("change", () => { $("arithmeticBWrap").style.display = ["increment","decrement"].includes($("arithmeticType").value) ? "none" : "flex"; });
    $("logicalType").addEventListener("change", () => { $("logicalBWrap").style.display = $("logicalType").value === "not" ? "none" : "flex"; });
  }
  populateSelects(); bindEvents(); renderRegisters(); renderHistory();
})();
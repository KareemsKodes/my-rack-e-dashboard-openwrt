"use strict";

const token = document.querySelector('meta[name="mx65-token"]').content;
const DEFAULT_ROUTER_HOST = "192.168.1.1";

const els = {
  host: document.getElementById("hostInput"),
  user: document.getElementById("userInput"),
  connect: document.getElementById("connectBtn"),
  refresh: document.getElementById("refreshBtn"),
  key: document.getElementById("keyBtn"),
  state: document.getElementById("connectionState"),
  toast: document.getElementById("toast"),
  keyPanel: document.getElementById("keyPanel"),
  keyCommand: document.getElementById("keyCommand"),
  releaseLine: document.getElementById("releaseLine"),
  healthGrid: document.getElementById("healthGrid"),
  routeCount: document.getElementById("routeCount"),
  readinessScore: document.getElementById("readinessScore"),
  readinessList: document.getElementById("readinessList"),
  audit: document.getElementById("auditBtn"),
  auditScore: document.getElementById("auditScore"),
  auditList: document.getElementById("auditList"),
  auditOutput: document.getElementById("auditOutput"),
  historyCount: document.getElementById("historyCount"),
  snapshotHistory: document.getElementById("snapshotHistory"),
  interfaceSummary: document.getElementById("interfaceSummary"),
  serviceList: document.getElementById("serviceList"),
  logPreview: document.getElementById("logPreview"),
  portMap: document.getElementById("portMap"),
  portsTable: document.getElementById("portsTable"),
  lanState: document.getElementById("lanState"),
  wanState: document.getElementById("wanState"),
  lanJson: document.getElementById("lanJson"),
  wanJson: document.getElementById("wanJson"),
  lanIpInput: document.getElementById("lanIpInput"),
  lanMaskInput: document.getElementById("lanMaskInput"),
  lanDhcpStart: document.getElementById("lanDhcpStart"),
  lanDhcpLimit: document.getElementById("lanDhcpLimit"),
  planLanProfile: document.getElementById("planLanProfile"),
  commitLanProfile: document.getElementById("commitLanProfile"),
  lanPlanOutput: document.getElementById("lanPlanOutput"),
  zonesTable: document.getElementById("zonesTable"),
  forwardingsTable: document.getElementById("forwardingsTable"),
  redirectsTable: document.getElementById("redirectsTable"),
  trafficRulesTable: document.getElementById("trafficRulesTable"),
  pfName: document.getElementById("pfName"),
  pfProto: document.getElementById("pfProto"),
  pfSrcPort: document.getElementById("pfSrcPort"),
  pfDestIp: document.getElementById("pfDestIp"),
  pfDestPort: document.getElementById("pfDestPort"),
  addPortForward: document.getElementById("addPortForward"),
  leaseCount: document.getElementById("leaseCount"),
  leasesTable: document.getElementById("leasesTable"),
  reservationCount: document.getElementById("reservationCount"),
  reservationsTable: document.getElementById("reservationsTable"),
  dhcpName: document.getElementById("dhcpName"),
  dhcpMac: document.getElementById("dhcpMac"),
  dhcpIp: document.getElementById("dhcpIp"),
  addDhcpHost: document.getElementById("addDhcpHost"),
  diagTarget: document.getElementById("diagTarget"),
  diagOutput: document.getElementById("diagOutput"),
  backup: document.getElementById("backupBtn"),
  backupOutput: document.getElementById("backupOutput"),
  checkRouterManager: document.getElementById("checkRouterManager"),
  updateRouterManager: document.getElementById("updateRouterManager"),
  rollbackRouterManager: document.getElementById("rollbackRouterManager"),
  deployRouterManager: document.getElementById("deployRouterManager"),
  routerManagerResult: document.getElementById("routerManagerResult"),
  routerManagerOutput: document.getElementById("routerManagerOutput"),
  cfStatus: document.getElementById("cfStatusBtn"),
  cfToken: document.getElementById("cfToken"),
  cfInstall: document.getElementById("cfInstallBtn"),
  cfOutput: document.getElementById("cfOutput"),
  uciPath: document.getElementById("uciPath"),
  uciValue: document.getElementById("uciValue"),
  uciCommit: document.getElementById("uciCommit"),
  uciSet: document.getElementById("uciSetBtn"),
  loadChanges: document.getElementById("loadChangesBtn"),
  pendingChanges: document.getElementById("pendingChanges"),
  uciFilter: document.getElementById("uciFilter"),
  uciTable: document.getElementById("uciTable"),
  actionLog: document.getElementById("actionLog"),
  clearActionLog: document.getElementById("clearActionLog"),
};

const state = {
  snapshot: null,
  busy: false,
  uciRows: [],
  actions: [],
  audit: null,
  changes: null,
  history: [],
};

const historyKey = "mx65-manager-snapshot-history";

function loadSettings() {
  els.host.value = localStorage.getItem("mx65-manager-host") || DEFAULT_ROUTER_HOST;
  els.user.value = localStorage.getItem("mx65-manager-user") || "root";
}

function saveSettings() {
  localStorage.setItem("mx65-manager-host", els.host.value.trim() || DEFAULT_ROUTER_HOST);
  localStorage.setItem("mx65-manager-user", els.user.value.trim() || "root");
}

function loadHistory() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(historyKey) || "[]");
    state.history = Array.isArray(parsed) ? parsed.slice(0, 12) : [];
  } catch {
    state.history = [];
  }
}

function saveHistory() {
  sessionStorage.setItem(historyKey, JSON.stringify(state.history.slice(0, 12)));
}

function pushSnapshotHistory(snapshot) {
  if (!snapshot) return;
  const routeLines = (snapshot.raw?.routes || "").split("\n").filter(Boolean);
  const entry = {
    at: snapshot.checked_at,
    host: snapshot.host,
    release: snapshot.release?.DISTRIB_RELEASE || "OpenWrt",
    revision: snapshot.release?.DISTRIB_REVISION || "",
    lan: ifAddress(snapshot.lan),
    wan: ifAddress(snapshot.wan),
    wanUp: Boolean(snapshot.wan?.up),
    routes: routeLines.length,
    leases: (snapshot.leases || []).length,
  };
  state.history = [entry, ...state.history.filter((item) => item.at !== entry.at)].slice(0, 12);
  saveHistory();
}

async function api(path, body = {}) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-MX65-Token": token,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return payload;
}

function profile(extra = {}) {
  return { host: els.host.value.trim() || DEFAULT_ROUTER_HOST, user: els.user.value.trim() || "root", ...extra };
}

function setBusy(button, busy, label = "Working") {
  if (!button) return;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = label;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function setConnection(text, kind = "warn") {
  els.state.textContent = text;
  els.state.className = `state-pill ${kind}`;
}

function showToast(text, kind = "") {
  els.toast.hidden = false;
  els.toast.textContent = text;
  els.toast.className = `toast ${kind}`;
}

function recordAction(label, detail, kind = "ok") {
  state.actions.unshift({
    at: new Date().toLocaleTimeString(),
    label,
    detail: String(detail || ""),
    kind,
  });
  state.actions = state.actions.slice(0, 40);
  renderActionLog();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tableEmpty(colspan, text) {
  return `<tr><td class="empty-row" colspan="${colspan}">${escapeHtml(text)}</td></tr>`;
}

function tag(text, kind = "") {
  return `<span class="tag ${kind}">${escapeHtml(text)}</span>`;
}

function service(name) {
  return (state.snapshot?.services || []).find((item) => item.name === name);
}

function ifAddress(ifstatus) {
  const first = ifstatus?.["ipv4-address"]?.[0];
  if (first?.address) return `${first.address}/${first.mask}`;
  return "none";
}

function statusKind(value) {
  return value ? "ok" : "bad";
}

function formatRaw(value) {
  if (!value) return "No data.";
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function allUciRows(snapshot) {
  const rows = [];
  for (const name of ["network", "dhcp", "firewall"]) {
    for (const entry of snapshot?.uci?.[name]?.entries || []) {
      rows.push(entry);
    }
  }
  return rows.sort((a, b) => a.path.localeCompare(b.path));
}

function uciSections(packageName, typeName) {
  return (state.snapshot?.uci?.[packageName]?.sections || []).filter((section) => {
    return section.type === typeName || section.section.startsWith(`@${typeName}[`);
  });
}

function uciValue(path) {
  return state.uciRows.find((row) => row.path === path)?.value || "";
}

function portMeta(name) {
  const match = name.match(/^lan(\d+)$/);
  if (name === "wan1") return { physical: "WAN 1", role: "Upstream", order: 1 };
  if (name === "wan2") return { physical: "WAN 2", role: "Upstream", order: 2 };
  if (match) {
    const number = Number(match[1]);
    return { physical: `LAN ${number}`, role: "Lab LAN", order: 10 + number };
  }
  if (name === "br-lan") return { physical: "Bridge", role: "LAN bridge", order: 90 };
  if (name === "br-wan") return { physical: "Bridge", role: "WAN bridge", order: 91 };
  return { physical: name, role: "System", order: 200 };
}

function readinessChecks() {
  const dnsmasq = service("dnsmasq");
  const firewall = service("firewall");
  const routes = state.snapshot?.raw?.routes || "";
  const storage = state.snapshot?.raw?.storage || "";
  const checks = [
    ["LAN reachable", ifAddress(state.snapshot?.lan) !== "none", ifAddress(state.snapshot?.lan)],
    ["DHCP enabled", uciValue("dhcp.lan.ignore") === "0", `ignore=${uciValue("dhcp.lan.ignore") || "unknown"}`],
    ["DHCP/DNS running", Boolean(dnsmasq?.status.includes("running")), dnsmasq?.status || "unknown"],
    ["Firewall active", Boolean(firewall?.enabled === "enabled" || firewall?.status.includes("running")), firewall?.status || firewall?.enabled || "unknown"],
    ["Persistent overlay", storage.includes("/overlay"), "overlay mounted"],
    ["Default route", routes.includes("default"), routes.split("\n").find((line) => line.startsWith("default")) || "none"],
  ];
  return checks;
}

function checkKind(status) {
  if (status === "pass") return "ok";
  if (status === "fail") return "bad";
  return "warn";
}

function renderHealth() {
  const snap = state.snapshot;
  if (!snap) {
    const cards = [
      ["System", "Awaiting data", "Connect over SSH"],
      ["WAN", "Unknown", "No live status"],
      ["LAN", "Unknown", "No live status"],
      ["DHCP/DNS", "Unknown", "No live status"],
      ["Storage", "Unknown", "No live status"],
    ];
    els.healthGrid.innerHTML = cards
      .map(([label, value, sub]) => `<article class="health-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><em>${escapeHtml(sub)}</em></article>`)
      .join("");
    return;
  }
  const release = snap.release?.DISTRIB_RELEASE || "unknown";
  const revision = snap.release?.DISTRIB_REVISION || "";
  const lanIp = ifAddress(snap.lan);
  const wanIp = ifAddress(snap.wan);
  const dnsmasq = service("dnsmasq");
  const firewall = service("firewall");
  const overlay = (snap.raw?.storage || "").split("\n").find((line) => line.includes("/overlay")) || "overlay unknown";
  const cards = [
    ["System", release, revision],
    ["WAN", snap.wan?.up ? "Online" : "Down", wanIp],
    ["LAN", lanIp, "br-lan"],
    ["DHCP/DNS", dnsmasq?.status || "unknown", dnsmasq?.enabled || ""],
    ["Storage", overlay.split(/\s+/).slice(-3).join(" "), overlay],
  ];
  els.healthGrid.innerHTML = cards
    .map(([label, value, sub]) => `<article class="health-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><em>${escapeHtml(sub)}</em></article>`)
    .join("");
  els.releaseLine.textContent = `${snap.release?.DISTRIB_DESCRIPTION || "OpenWrt"} on ${snap.release?.DISTRIB_TARGET || "unknown target"}`;
  const routeLines = (snap.raw?.routes || "").split("\n").filter(Boolean);
  els.routeCount.textContent = `${routeLines.length} route${routeLines.length === 1 ? "" : "s"}`;
  renderSummary(firewall);
}

function renderReadiness() {
  if (!state.snapshot) {
    els.readinessScore.textContent = "0 checks";
    els.readinessList.innerHTML = "";
    return;
  }
  const checks = readinessChecks();
  const passed = checks.filter(([, pass]) => pass).length;
  els.readinessScore.textContent = `${passed}/${checks.length} passing`;
  els.readinessList.innerHTML = checks
    .map(([label, pass, detail]) => {
      return `<div class="readiness-item"><div>${tag(pass ? "pass" : "check", pass ? "ok" : "warn")}</div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(detail)}</span></div>`;
    })
    .join("");
}

function renderAudit() {
  const audit = state.audit;
  if (!audit) {
    els.auditScore.textContent = "Not run";
    els.auditList.innerHTML = "<div class=\"empty-row\">Run the audit after connecting.</div>";
    els.auditOutput.textContent = "No audit run yet.";
    return;
  }
  const summary = audit.summary || {};
  els.auditScore.textContent = `${summary.pass || 0} pass / ${summary.warn || 0} warn / ${summary.fail || 0} fail`;
  els.auditList.innerHTML = (audit.checks || [])
    .map((check) => {
      return `<div class="check-item ${escapeHtml(check.status)}">${tag(check.status, checkKind(check.status))}<strong>${escapeHtml(check.label)}</strong><span>${escapeHtml(check.detail)}</span></div>`;
    })
    .join("");
  const raw = audit.raw || {};
  els.auditOutput.textContent = [
    `Checked: ${audit.checked_at}`,
    "",
    "__ routes __",
    raw.routes || "No route output.",
    "",
    "__ gateway ping __",
    raw.gateway_ping || "No gateway ping output.",
    "",
    "__ internet ping __",
    raw.internet_ping || "No internet ping output.",
    "",
    "__ dns lookup __",
    raw.dns_lookup || "No DNS lookup output.",
  ].join("\n");
}

function renderHistory() {
  els.historyCount.textContent = `${state.history.length} snapshot${state.history.length === 1 ? "" : "s"}`;
  els.snapshotHistory.innerHTML = state.history.length
    ? state.history
        .map((item) => {
          const wan = item.wanUp ? tag("WAN up", "ok") : tag("WAN down", "warn");
          return `<div class="timeline-row"><span>${escapeHtml(item.at)}</span><strong>${escapeHtml(item.host)}</strong><em>${escapeHtml(item.lan)} LAN · ${escapeHtml(item.wan)} WAN · ${item.routes} routes · ${item.leases} leases</em>${wan}</div>`;
        })
        .join("")
    : "<div class=\"empty-row\">Snapshots from this browser session will appear here.</div>";
}

function renderSummary(firewall) {
  const snap = state.snapshot;
  const wan = snap.wan?.up ? tag("up", "ok") : tag("down", "bad");
  const lan = snap.lan?.up ? tag("up", "ok") : tag("down", "bad");
  els.interfaceSummary.innerHTML = [
    ["LAN", ifAddress(snap.lan), lan],
    ["WAN", ifAddress(snap.wan), wan],
    ["Default route", (snap.raw?.routes || "").split("\n").find((line) => line.startsWith("default")) || "none", ""],
  ]
    .map(([label, value, badge]) => `<div class="summary-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${badge}</div>`)
    .join("");
  els.serviceList.innerHTML = (snap.services || [])
    .map((item) => {
      const kind = item.status.includes("running") || item.enabled === "enabled" ? "ok" : "warn";
      return `<div class="summary-row"><span>${escapeHtml(item.name)}</span><strong>${escapeHtml(item.status || "unknown")}</strong>${tag(item.enabled, kind)}</div>`;
    })
    .join("") || "<div class=\"empty-row\">No service status returned.</div>";
  if (firewall) {
    const serviceRows = els.serviceList.innerHTML;
    els.serviceList.innerHTML = serviceRows;
  }
  els.logPreview.textContent = snap.raw?.logs || "No logs returned.";
}

function renderPorts() {
  const rows = state.snapshot?.interfaces || [];
  const physicalRows = rows
    .filter((row) => /^(wan\d+|lan\d+|br-lan|br-wan)$/.test(row.name))
    .map((row) => ({ ...row, meta: portMeta(row.name) }))
    .sort((a, b) => a.meta.order - b.meta.order);
  els.portMap.innerHTML = physicalRows.length
    ? physicalRows
        .map((row) => {
          const up = row.carrier;
          return `<article class="port-tile ${up ? "up" : ""}"><div class="port-icon"></div><strong>${escapeHtml(row.meta.physical)}</strong><span>${escapeHtml(row.name)} · ${escapeHtml(row.meta.role)}</span>${tag(row.operstate, up ? "ok" : "bad")}</article>`;
        })
        .join("")
    : "";
  els.portsTable.innerHTML = rows.length
    ? rows
        .map((row) => {
          const meta = portMeta(row.name);
          const kind = row.carrier ? "ok" : "bad";
          return `<tr><td><strong>${escapeHtml(meta.physical)}</strong></td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(meta.role)}</td><td>${tag(row.operstate, kind)}</td><td>${escapeHtml((row.addresses || []).join(" "))}</td></tr>`;
        })
        .join("")
    : tableEmpty(5, "No interfaces returned.");
}

function renderNetwork() {
  const lanUp = Boolean(state.snapshot?.lan?.up);
  const wanUp = Boolean(state.snapshot?.wan?.up);
  els.lanState.textContent = lanUp ? "Up" : "Down";
  els.lanState.className = `state-pill ${statusKind(lanUp)}`;
  els.wanState.textContent = wanUp ? "Up" : "Down";
  els.wanState.className = `state-pill ${statusKind(wanUp)}`;
  els.lanJson.textContent = formatRaw(state.snapshot?.lan);
  els.wanJson.textContent = formatRaw(state.snapshot?.wan);
  if (state.snapshot && !els.lanIpInput.value) {
    const address = ifAddress(state.snapshot.lan).split("/")[0];
    els.lanIpInput.value = address === "none" ? DEFAULT_ROUTER_HOST : address;
    els.lanMaskInput.value = uciValue("network.lan.netmask") || "255.255.255.0";
    els.lanDhcpStart.value = uciValue("dhcp.lan.start") || "100";
    els.lanDhcpLimit.value = uciValue("dhcp.lan.limit") || "150";
  }
}

function renderFirewall() {
  const zones = uciSections("firewall", "zone");
  els.zonesTable.innerHTML = zones.length
    ? zones
        .map((section) => {
          const options = section.options || {};
          return `<tr><td><strong>${escapeHtml(options.name || section.section)}</strong></td><td>${escapeHtml(options.network || "")}</td><td>${tag(options.input || "")}</td><td>${tag(options.forward || "")}</td><td>${tag(options.output || "")}</td></tr>`;
        })
        .join("")
    : tableEmpty(5, "No firewall zones returned.");

  const forwardings = uciSections("firewall", "forwarding");
  els.forwardingsTable.innerHTML = forwardings.length
    ? forwardings
        .map((section) => {
          const options = section.options || {};
          const enabled = options.enabled === "0" ? tag("disabled", "bad") : tag("enabled", "ok");
          return `<tr><td>${escapeHtml(options.src || "")}</td><td>${escapeHtml(options.dest || "")}</td><td>${enabled}</td></tr>`;
        })
        .join("")
    : tableEmpty(3, "No forwarding rules returned.");

  const redirects = uciSections("firewall", "redirect");
  els.redirectsTable.innerHTML = redirects.length
    ? redirects
        .map((section) => {
          const options = section.options || {};
          const enabled = options.enabled === "0" ? tag("disabled", "bad") : tag("enabled", "ok");
          const dest = `${options.dest_ip || ""}${options.dest_port ? `:${options.dest_port}` : ""}`;
          return `<tr><td><strong>${escapeHtml(options.name || section.section)}</strong></td><td>${escapeHtml(options.proto || "any")}</td><td>${escapeHtml(options.src_dport || "")}</td><td>${escapeHtml(dest)}</td><td>${enabled}</td></tr>`;
        })
        .join("")
    : tableEmpty(5, "No port forwards configured.");

  const rules = uciSections("firewall", "rule");
  els.trafficRulesTable.innerHTML = rules.length
    ? rules
        .map((section) => {
          const options = section.options || {};
          const enabled = options.enabled === "0" ? tag("disabled", "bad") : tag(options.target || "enabled", "ok");
          return `<tr><td><strong>${escapeHtml(options.name || section.section)}</strong></td><td>${escapeHtml(options.src || "any")}</td><td>${escapeHtml(options.dest || "router")}</td><td>${escapeHtml(options.proto || "any")}</td><td>${enabled}</td></tr>`;
        })
        .join("")
    : tableEmpty(5, "No traffic rules returned.");
}

function renderDhcp() {
  const leases = state.snapshot?.leases || [];
  els.leaseCount.textContent = `${leases.length} client${leases.length === 1 ? "" : "s"}`;
  els.leasesTable.innerHTML = leases.length
    ? leases
        .map((lease) => `<tr><td><strong>${escapeHtml(lease.hostname)}</strong></td><td>${escapeHtml(lease.ip)}</td><td>${escapeHtml(lease.mac)}</td><td>${escapeHtml(lease.expires)}</td></tr>`)
        .join("")
    : tableEmpty(4, "No active DHCP leases.");

  const reservations = uciSections("dhcp", "host");
  els.reservationCount.textContent = `${reservations.length} static host${reservations.length === 1 ? "" : "s"}`;
  els.reservationsTable.innerHTML = reservations.length
    ? reservations
        .map((section) => {
          const options = section.options || {};
          const details = Object.entries(options)
            .filter(([key]) => !["name", "ip", "mac"].includes(key))
            .map(([key, value]) => `${key}=${value}`)
            .join(" ");
          return `<tr><td><strong>${escapeHtml(options.name || section.section)}</strong></td><td>${escapeHtml(options.ip || "")}</td><td>${escapeHtml(options.mac || "")}</td><td>${escapeHtml(details || "none")}</td></tr>`;
        })
        .join("")
    : tableEmpty(4, "No DHCP reservations configured.");
}

function renderUci() {
  const filter = els.uciFilter.value.trim().toLowerCase();
  const rows = state.uciRows.filter((row) => !filter || row.path.toLowerCase().includes(filter) || row.value.toLowerCase().includes(filter));
  els.uciTable.innerHTML = rows.length
    ? rows.map((row) => `<tr><td><code>${escapeHtml(row.path)}</code></td><td>${escapeHtml(row.value)}</td></tr>`).join("")
    : tableEmpty(2, "No matching configuration values.");
}

function renderPendingChanges() {
  const packages = state.changes?.packages || {};
  const names = ["network", "dhcp", "firewall"];
  els.pendingChanges.innerHTML = names
    .map((name) => {
      const lines = packages[name] || [];
      const content = lines.length ? lines.join("\n") : "No pending changes.";
      const kind = lines.length ? "warn" : "ok";
      return `<article class="pending-card"><div><strong>${escapeHtml(name)}</strong>${tag(`${lines.length} change${lines.length === 1 ? "" : "s"}`, kind)}</div><pre class="terminal compact">${escapeHtml(content)}</pre></article>`;
    })
    .join("");
}

function renderActionLog() {
  els.actionLog.innerHTML = state.actions.length
    ? state.actions
        .map((item) => `<div class="action-row"><span>${escapeHtml(item.at)}</span><strong>${escapeHtml(item.label)}</strong>${tag(item.kind)}</div><div class="action-row"><span></span><span>${escapeHtml(item.detail)}</span><span></span></div>`)
        .join("")
    : "<div class=\"empty-row\">No actions recorded in this browser session.</div>";
}

function renderAll() {
  renderHealth();
  renderReadiness();
  renderAudit();
  renderHistory();
  renderPorts();
  renderNetwork();
  renderFirewall();
  renderDhcp();
  renderPendingChanges();
  renderUci();
  renderActionLog();
}

async function refreshSnapshot(button = els.refresh) {
  saveSettings();
  setBusy(button, true, "Loading");
  setConnection("Connecting", "warn");
  try {
    const result = await api("/api/openwrt/snapshot", profile());
    state.snapshot = result.snapshot;
    state.uciRows = allUciRows(state.snapshot);
    pushSnapshotHistory(state.snapshot);
    renderAll();
    setConnection("Connected", "ok");
    showToast(`Loaded ${state.snapshot.host} at ${state.snapshot.checked_at}.`, "ok");
    recordAction("Snapshot loaded", `${state.snapshot.host} ${state.snapshot.release?.DISTRIB_REVISION || ""}`, "ok");
  } catch (error) {
    setConnection("Offline", "bad");
    showToast(error.message, "bad");
    recordAction("Connection failed", error.message, "bad");
  } finally {
    setBusy(button, false);
  }
}

async function runService(button) {
  const serviceName = button.dataset.service;
  const action = button.dataset.action;
  setBusy(button, true, "Running");
  try {
    const result = await api("/api/openwrt/service", profile({ service: serviceName, action }));
    showToast(`${serviceName} ${action}: ${result.result.stdout || "done"}`, "ok");
    recordAction(`${serviceName} ${action}`, result.result.stdout || "done", "ok");
    await refreshSnapshot();
  } catch (error) {
    showToast(error.message, "bad");
    recordAction(`${serviceName} ${action}`, error.message, "bad");
  } finally {
    setBusy(button, false);
  }
}

async function runDiagnostic(kind, button) {
  const target = els.diagTarget.value.trim();
  setBusy(button, true, "Running");
  try {
    const result = await api("/api/openwrt/diagnostic", profile({ kind, target }));
    const output = result.result.stdout || result.result.stderr || "Command completed.";
    els.diagOutput.textContent = output;
    if (kind === "logs") els.logPreview.textContent = output;
    showToast(`${kind} completed.`, "ok");
    recordAction(`Diagnostic ${kind}`, output.slice(0, 500), "ok");
  } catch (error) {
    els.diagOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction(`Diagnostic ${kind}`, error.message, "bad");
  } finally {
    setBusy(button, false);
  }
}

async function runAudit(button = els.audit) {
  saveSettings();
  setBusy(button, true, "Auditing");
  try {
    const result = await api("/api/openwrt/audit", profile());
    state.audit = result.audit;
    renderAudit();
    const summary = result.audit.summary || {};
    const kind = summary.fail ? "bad" : summary.warn ? "warn" : "ok";
    showToast(`Audit complete: ${summary.pass || 0} pass, ${summary.warn || 0} warn, ${summary.fail || 0} fail.`, kind);
    recordAction("Audit run", `${summary.pass || 0} pass / ${summary.warn || 0} warn / ${summary.fail || 0} fail`, kind);
  } catch (error) {
    state.audit = null;
    renderAudit();
    els.auditOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction("Audit failed", error.message, "bad");
  } finally {
    setBusy(button, false);
  }
}

async function loadPendingChanges(button = els.loadChanges) {
  saveSettings();
  setBusy(button, true, "Loading");
  try {
    const result = await api("/api/openwrt/uci-changes", profile());
    state.changes = result.changes;
    renderPendingChanges();
    const total = result.changes.total || 0;
    showToast(total ? `${total} pending configuration changes found.` : "No pending configuration changes.", total ? "warn" : "ok");
    recordAction("Pending changes loaded", `${total} changes`, total ? "warn" : "ok");
  } catch (error) {
    showToast(error.message, "bad");
    recordAction("Pending changes failed", error.message, "bad");
  } finally {
    setBusy(button, false);
  }
}

async function runUciPackageAction(packageName, action, button) {
  const endpoint = action === "commit" ? "/api/openwrt/uci-commit" : "/api/openwrt/uci-revert";
  setBusy(button, true, action === "commit" ? "Committing" : "Reverting");
  try {
    await api(endpoint, profile({ package: packageName }));
    showToast(`${packageName} ${action} complete.`, "ok");
    recordAction(`Configuration ${action}`, packageName, "ok");
    await loadPendingChanges();
    await refreshSnapshot();
  } catch (error) {
    showToast(error.message, "bad");
    recordAction(`Configuration ${action} failed`, `${packageName}: ${error.message}`, "bad");
  } finally {
    setBusy(button, false);
  }
}

function bindNav() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`[data-panel-id="${button.dataset.panel}"]`)?.classList.add("active");
    });
  });
}

async function setupKey() {
  setBusy(els.key, true, "Preparing");
  try {
    const result = await api("/api/openwrt/key", {});
    els.keyCommand.value = result.key.install_command;
    els.keyPanel.hidden = false;
    showToast("Paste the install command into the router shell once, then click Connect.", "ok");
    recordAction("SSH key prepared", result.key.public_key, "ok");
  } catch (error) {
    showToast(error.message, "bad");
    recordAction("SSH key failed", error.message, "bad");
  } finally {
    setBusy(els.key, false);
  }
}

async function addPortForward() {
  setBusy(els.addPortForward, true, "Adding");
  try {
    await api(
      "/api/openwrt/firewall/redirect",
      profile({
        name: els.pfName.value,
        proto: els.pfProto.value,
        src_dport: els.pfSrcPort.value,
        dest_ip: els.pfDestIp.value,
        dest_port: els.pfDestPort.value,
      }),
    );
    showToast("Port forward added and firewall reloaded.", "ok");
    recordAction("Port forward added", `${els.pfSrcPort.value} -> ${els.pfDestIp.value}:${els.pfDestPort.value}`, "ok");
    await refreshSnapshot();
  } catch (error) {
    showToast(error.message, "bad");
    recordAction("Port forward failed", error.message, "bad");
  } finally {
    setBusy(els.addPortForward, false);
  }
}

async function addDhcpHost() {
  setBusy(els.addDhcpHost, true, "Adding");
  try {
    await api(
      "/api/openwrt/dhcp/host",
      profile({
        name: els.dhcpName.value,
        mac: els.dhcpMac.value,
        ip: els.dhcpIp.value,
      }),
    );
    showToast("DHCP reservation added and DHCP/DNS restarted.", "ok");
    recordAction("DHCP reservation added", `${els.dhcpName.value} ${els.dhcpIp.value}`, "ok");
    await refreshSnapshot();
  } catch (error) {
    showToast(error.message, "bad");
    recordAction("DHCP reservation failed", error.message, "bad");
  } finally {
    setBusy(els.addDhcpHost, false);
  }
}

async function setUciValue() {
  setBusy(els.uciSet, true, "Setting");
  try {
    const result = await api(
      "/api/openwrt/uci-set",
      profile({
        path: els.uciPath.value,
        value: els.uciValue.value,
        commit: els.uciCommit.checked,
      }),
    );
    showToast(`${result.result.path} set${result.result.committed ? " and committed" : ""}.`, "ok");
    recordAction("Advanced value set", `${result.result.path}=${result.result.value}`, "ok");
    await refreshSnapshot();
  } catch (error) {
    showToast(error.message, "bad");
    recordAction("Advanced edit failed", error.message, "bad");
  } finally {
    setBusy(els.uciSet, false);
  }
}

async function createBackup() {
  setBusy(els.backup, true, "Backing up");
  try {
    const result = await api("/api/router/backup", profile());
    els.backupOutput.textContent = JSON.stringify(result.backup, null, 2);
    showToast(`Backup written to ${result.backup.path}.`, "ok");
    recordAction("Backup created", result.backup.path, "ok");
  } catch (error) {
    els.backupOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction("Backup failed", error.message, "bad");
  } finally {
    setBusy(els.backup, false);
  }
}

function renderRouterManagerCards(data = {}, includeToken = false) {
  const manifest = data.manifest || {};
  const cards = [];
  if (data.url) {
    cards.push(`<div class="deploy-card"><span>Local URL</span><a href="${escapeHtml(data.url)}" target="_blank" rel="noreferrer">${escapeHtml(data.url)}</a></div>`);
  }
  if (data.version || manifest.version) {
    cards.push(`<div class="deploy-card"><span>Version</span><code>${escapeHtml(data.version || manifest.version)}</code></div>`);
  }
  if (data.archive_sha256) {
    cards.push(`<div class="deploy-card"><span>Archive SHA-256</span><code>${escapeHtml(data.archive_sha256)}</code></div>`);
  }
  if (data.backup) {
    cards.push(`<div class="deploy-card"><span>Backup</span><code>${escapeHtml(data.backup)}</code></div>`);
  }
  if (includeToken) {
    cards.push(`<div class="deploy-card"><span>Manager Token</span><code>${escapeHtml(data.token || "not returned")}</code></div>`);
  } else if (typeof data.token_present === "boolean") {
    cards.push(`<div class="deploy-card"><span>Token</span><code>${data.token_present ? "installed" : "missing"}</code></div>`);
  }
  els.routerManagerResult.innerHTML = cards.length ? cards.join("") : "<div class=\"empty-row\">No manager status returned.</div>";
}

async function checkRouterManager() {
  setBusy(els.checkRouterManager, true, "Checking");
  try {
    const result = await api("/api/openwrt/router-manager/status", profile());
    renderRouterManagerCards(result.manager || {});
    els.routerManagerOutput.textContent = result.manager?.stdout || "No status output.";
    showToast("Router manager status loaded.", "ok");
    recordAction("Router manager status", result.manager?.url || "loaded", "ok");
  } catch (error) {
    els.routerManagerOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction("Router manager status failed", error.message, "bad");
  } finally {
    setBusy(els.checkRouterManager, false);
  }
}

async function deployRouterManager() {
  setBusy(els.deployRouterManager, true, "Deploying");
  try {
    const result = await api("/api/openwrt/router-manager/deploy", profile());
    const deploy = result.deploy || {};
    renderRouterManagerCards(deploy, true);
    els.routerManagerOutput.textContent = deploy.stdout || JSON.stringify(deploy, null, 2);
    showToast(deploy.url ? `Router manager deployed at ${deploy.url}.` : "Router manager deploy completed.", "ok");
    recordAction("Router manager deployed", deploy.url || "no URL returned", "ok");
  } catch (error) {
    els.routerManagerOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction("Router manager deploy failed", error.message, "bad");
  } finally {
    setBusy(els.deployRouterManager, false);
  }
}

async function updateRouterManager() {
  setBusy(els.updateRouterManager, true, "Updating");
  try {
    const result = await api("/api/openwrt/router-manager/update", profile());
    const update = result.update || {};
    renderRouterManagerCards(update, true);
    els.routerManagerOutput.textContent = update.stdout || JSON.stringify(update, null, 2);
    showToast("Trusted router manager update applied.", "ok");
    recordAction("Router manager updated", update.version || update.archive_sha256 || "applied", "ok");
  } catch (error) {
    els.routerManagerOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction("Router manager update failed", error.message, "bad");
  } finally {
    setBusy(els.updateRouterManager, false);
  }
}

async function rollbackRouterManager() {
  if (!window.confirm("Restore the latest router manager backup on the MX?")) return;
  setBusy(els.rollbackRouterManager, true, "Rolling back");
  try {
    const result = await api("/api/openwrt/router-manager/rollback", profile());
    const rollback = result.rollback || {};
    els.routerManagerResult.innerHTML = rollback.backup
      ? `<div class="deploy-card"><span>Restored Backup</span><code>${escapeHtml(rollback.backup)}</code></div>`
      : "<div class=\"empty-row\">Rollback completed.</div>";
    els.routerManagerOutput.textContent = rollback.stdout || JSON.stringify(rollback, null, 2);
    showToast("Router manager rollback completed.", "ok");
    recordAction("Router manager rollback", rollback.backup || "completed", "ok");
  } catch (error) {
    els.routerManagerOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction("Router manager rollback failed", error.message, "bad");
  } finally {
    setBusy(els.rollbackRouterManager, false);
  }
}

async function cloudflareStatus(button = els.cfStatus) {
  setBusy(button, true, "Loading");
  try {
    const result = await api("/api/openwrt/cloudflare/status", profile());
    els.cfOutput.textContent = result.result.stdout || result.result.stderr || "No Cloudflare Tunnel output.";
    showToast("Cloudflare Tunnel status loaded.", "ok");
    recordAction("Cloudflare status", "loaded", "ok");
  } catch (error) {
    els.cfOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction("Cloudflare status failed", error.message, "bad");
  } finally {
    setBusy(button, false);
  }
}

async function installCloudflareTunnel() {
  setBusy(els.cfInstall, true, "Installing");
  try {
    const result = await api("/api/openwrt/cloudflare/install", profile({ token: els.cfToken.value.trim() }));
    els.cfOutput.textContent = result.result.stdout || result.result.stderr || "Install command completed.";
    els.cfToken.value = "";
    showToast("Cloudflare Tunnel installed or updated.", "ok");
    recordAction("Cloudflare tunnel installed", result.result.asset || "cloudflared", "ok");
  } catch (error) {
    els.cfOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction("Cloudflare install failed", error.message, "bad");
  } finally {
    setBusy(els.cfInstall, false);
  }
}

async function cloudflareServiceAction(action, button) {
  setBusy(button, true, "Running");
  try {
    const result = await api("/api/openwrt/service", profile({ service: "cloudflared", action }));
    els.cfOutput.textContent = result.result.stdout || result.result.stderr || `${action} complete.`;
    showToast(`Cloudflare Tunnel ${action} complete.`, "ok");
    recordAction(`Cloudflare ${action}`, "cloudflared", "ok");
  } catch (error) {
    els.cfOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction(`Cloudflare ${action} failed`, error.message, "bad");
  } finally {
    setBusy(button, false);
  }
}

async function runLanProfile(commit, button) {
  setBusy(button, true, commit ? "Committing" : "Planning");
  try {
    const result = await api(
      "/api/openwrt/lan-profile",
      profile({
        ipaddr: els.lanIpInput.value,
        netmask: els.lanMaskInput.value,
        dhcp_start: els.lanDhcpStart.value,
        dhcp_limit: els.lanDhcpLimit.value,
        commit,
      }),
    );
    els.lanPlanOutput.textContent = commit ? JSON.stringify(result.result, null, 2) : result.result.plan;
    showToast(commit ? "LAN profile committed for next reboot." : "LAN profile plan generated.", "ok");
    recordAction(commit ? "LAN profile committed" : "LAN profile previewed", `${els.lanIpInput.value}/${els.lanMaskInput.value}`, "ok");
    if (commit) await refreshSnapshot();
  } catch (error) {
    els.lanPlanOutput.textContent = error.message;
    showToast(error.message, "bad");
    recordAction(commit ? "LAN profile failed" : "LAN profile plan failed", error.message, "bad");
  } finally {
    setBusy(button, false);
  }
}

function bindActions() {
  els.connect.addEventListener("click", () => refreshSnapshot(els.connect));
  els.refresh.addEventListener("click", () => refreshSnapshot(els.refresh));
  els.key.addEventListener("click", setupKey);
  els.audit.addEventListener("click", () => runAudit(els.audit));
  els.addPortForward.addEventListener("click", addPortForward);
  els.addDhcpHost.addEventListener("click", addDhcpHost);
  els.planLanProfile.addEventListener("click", () => runLanProfile(false, els.planLanProfile));
  els.commitLanProfile.addEventListener("click", () => runLanProfile(true, els.commitLanProfile));
  els.uciSet.addEventListener("click", setUciValue);
  els.loadChanges.addEventListener("click", () => loadPendingChanges(els.loadChanges));
  els.backup.addEventListener("click", createBackup);
  els.checkRouterManager.addEventListener("click", checkRouterManager);
  els.updateRouterManager.addEventListener("click", updateRouterManager);
  els.rollbackRouterManager.addEventListener("click", rollbackRouterManager);
  els.deployRouterManager.addEventListener("click", deployRouterManager);
  els.cfStatus.addEventListener("click", () => cloudflareStatus(els.cfStatus));
  els.cfInstall.addEventListener("click", installCloudflareTunnel);
  els.uciFilter.addEventListener("input", renderUci);
  els.clearActionLog.addEventListener("click", () => {
    state.actions = [];
    renderActionLog();
  });
  document.querySelectorAll("[data-service]").forEach((button) => button.addEventListener("click", () => runService(button)));
  document.querySelectorAll("[data-diag]").forEach((button) => button.addEventListener("click", () => runDiagnostic(button.dataset.diag, button)));
  document.querySelectorAll("[data-commit-package]").forEach((button) => {
    button.addEventListener("click", () => runUciPackageAction(button.dataset.commitPackage, "commit", button));
  });
  document.querySelectorAll("[data-revert-package]").forEach((button) => {
    button.addEventListener("click", () => runUciPackageAction(button.dataset.revertPackage, "revert", button));
  });
  document.querySelectorAll("[data-cf-service-action]").forEach((button) => {
    button.addEventListener("click", () => cloudflareServiceAction(button.dataset.cfServiceAction, button));
  });
}

function init() {
  loadSettings();
  loadHistory();
  bindNav();
  bindActions();
  setConnection("Not connected", "warn");
  renderAll();
}

init();

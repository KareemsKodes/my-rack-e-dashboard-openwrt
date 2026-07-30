"use strict";

const els = {
  token: document.getElementById("tokenInput"),
  saveToken: document.getElementById("saveTokenBtn"),
  refresh: document.getElementById("refreshBtn"),
  toast: document.getElementById("toast"),
  releaseLine: document.getElementById("releaseLine"),
  statusMeta: document.getElementById("statusMeta"),
  healthGrid: document.getElementById("healthGrid"),
  deviceSummary: document.getElementById("deviceSummary"),
  uplinkSummary: document.getElementById("uplinkSummary"),
  dhcpUtilization: document.getElementById("dhcpUtilization"),
  dashboardPortStrip: document.getElementById("dashboardPortStrip"),
  quickDiagTarget: document.getElementById("quickDiagTarget"),
  liveToolsStatus: document.getElementById("liveToolsStatus"),
  nextActionScore: document.getElementById("nextActionScore"),
  nextActionList: document.getElementById("nextActionList"),
  accessScore: document.getElementById("accessScore"),
  accessGrid: document.getElementById("accessGrid"),
  readinessScore: document.getElementById("readinessScore"),
  readinessList: document.getElementById("readinessList"),
  servicesList: document.getElementById("servicesList"),
  logOutput: document.getElementById("logOutput"),
  routeCards: document.getElementById("routeCards"),
  routeTable: document.getElementById("routeTableBody"),
  routeOutput: document.getElementById("routeOutput"),
  interfaceCount: document.getElementById("interfaceCount"),
  interfacesTable: document.getElementById("interfacesTable"),
  routesOutput: document.getElementById("routesOutput"),
  ifstatusOutput: document.getElementById("ifstatusOutput"),
  addressingCards: document.getElementById("addressingCards"),
  deploymentTable: document.getElementById("deploymentTable"),
  staticRouteTable: document.getElementById("staticRouteTable"),
  dynamicDnsStatus: document.getElementById("dynamicDnsStatus"),
  refreshNetwork: document.getElementById("refreshNetworkBtn"),
  saveLan: document.getElementById("saveLanBtn"),
  lanIp: document.getElementById("lanIpInput"),
  lanMask: document.getElementById("lanMaskInput"),
  lanDhcpStart: document.getElementById("lanDhcpStartInput"),
  lanDhcpLimit: document.getElementById("lanDhcpLimitInput"),
  lanAutoDhcp: document.getElementById("lanAutoDhcpBtn"),
  lanDhcpPreview: document.getElementById("lanDhcpPreview"),
  lanLease: document.getElementById("lanLeaseInput"),
  lanChangeNotice: document.getElementById("lanChangeNotice"),
  vlanCards: document.getElementById("vlanCards"),
  saveVlan: document.getElementById("saveVlanBtn"),
  vlanId: document.getElementById("vlanIdInput"),
  vlanName: document.getElementById("vlanNameInput"),
  vlanIp: document.getElementById("vlanIpInput"),
  vlanMask: document.getElementById("vlanMaskInput"),
  vlanDhcpStart: document.getElementById("vlanDhcpStartInput"),
  vlanDhcpLimit: document.getElementById("vlanDhcpLimitInput"),
  vlanAutoDhcp: document.getElementById("vlanAutoDhcpBtn"),
  vlanDhcpPreview: document.getElementById("vlanDhcpPreview"),
  vlanLease: document.getElementById("vlanLeaseInput"),
  vlanPortPicker: document.getElementById("vlanPortPicker"),
  vlanTable: document.getElementById("vlanTable"),
  networkOutput: document.getElementById("networkOutput"),
  portLive: document.getElementById("portLiveBtn"),
  refreshPorts: document.getElementById("refreshPortsBtn"),
  portCards: document.getElementById("portCards"),
  mxFaceplate: document.getElementById("mxFaceplate"),
  portMap: document.getElementById("portMap"),
  selectedPortName: document.getElementById("selectedPortName"),
  portDetail: document.getElementById("portDetail"),
  portEnable: document.getElementById("portEnableBtn"),
  portDisable: document.getElementById("portDisableBtn"),
  portNotePort: document.getElementById("portNotePort"),
  portNoteLabel: document.getElementById("portNoteLabel"),
  portNotePurpose: document.getElementById("portNotePurpose"),
  savePortNote: document.getElementById("savePortNoteBtn"),
  savePortVlan: document.getElementById("savePortVlanBtn"),
  portVlanMode: document.getElementById("portVlanModeInput"),
  portAccessVlan: document.getElementById("portAccessVlanInput"),
  portNativeVlan: document.getElementById("portNativeVlanInput"),
  portAllowedVlans: document.getElementById("portAllowedVlansInput"),
  portVlanSummary: document.getElementById("portVlanSummary"),
  portTable: document.getElementById("portTable"),
  firewallOutput: document.getElementById("securityOutput"),
  firewallFilter: document.getElementById("firewallFilter"),
  firewallTable: document.getElementById("firewallTable"),
  securityStatus: document.getElementById("securityStatusBtn"),
  securityApply: document.getElementById("securityApplyBtn"),
  securityRollback: document.getElementById("securityRollbackBtn"),
  securityCards: document.getElementById("securityCards"),
  securityList: document.getElementById("securityList"),
  securityOutput: document.getElementById("securityOutput"),
  firewallOutbound: document.getElementById("firewallOutbound"),
  firewallWanServices: document.getElementById("firewallWanServices"),
  firewallLayer7: document.getElementById("firewallLayer7"),
  outboundRuleId: document.getElementById("outboundRuleIdInput"),
  outboundPolicy: document.getElementById("outboundPolicyInput"),
  outboundProtocol: document.getElementById("outboundProtocolInput"),
  outboundSource: document.getElementById("outboundSourceInput"),
  outboundDestination: document.getElementById("outboundDestinationInput"),
  outboundDestPort: document.getElementById("outboundDestPortInput"),
  outboundComment: document.getElementById("outboundCommentInput"),
  outboundEnabled: document.getElementById("outboundEnabledInput"),
  saveOutboundRule: document.getElementById("saveOutboundRuleBtn"),
  outboundRuleTable: document.getElementById("outboundRuleTable"),
  natCards: document.getElementById("natCards"),
  saveForward: document.getElementById("saveForwardBtn"),
  forwardId: document.getElementById("forwardIdInput"),
  forwardDescription: document.getElementById("forwardDescriptionInput"),
  forwardUplink: document.getElementById("forwardUplinkInput"),
  forwardProtocol: document.getElementById("forwardProtocolInput"),
  forwardPublicPort: document.getElementById("forwardPublicPortInput"),
  forwardLanIp: document.getElementById("forwardLanIpInput"),
  forwardLocalPort: document.getElementById("forwardLocalPortInput"),
  forwardAllowedIps: document.getElementById("forwardAllowedIpsInput"),
  forwardEnabled: document.getElementById("forwardEnabledInput"),
  forwardTable: document.getElementById("forwardTable"),
  oneToOneNatStatus: document.getElementById("oneToOneNatStatus"),
  oneToManyNatStatus: document.getElementById("oneToManyNatStatus"),
  trafficCards: document.getElementById("trafficCards"),
  trafficTable: document.getElementById("trafficTable"),
  trafficOutput: document.getElementById("trafficOutput"),
  refreshDevices: document.getElementById("refreshDevicesBtn"),
  refreshDhcpConfig: document.getElementById("refreshDhcpConfigBtn"),
  deviceCards: document.getElementById("deviceCards"),
  deviceFilter: document.getElementById("deviceFilter"),
  deviceTable: document.getElementById("deviceTable"),
  noteMac: document.getElementById("noteMac"),
  noteLabel: document.getElementById("noteLabel"),
  noteModel: document.getElementById("noteModel"),
  noteSerial: document.getElementById("noteSerial"),
  noteRole: document.getElementById("noteRole"),
  noteExpected: document.getElementById("noteExpected"),
  saveDeviceNote: document.getElementById("saveDeviceNoteBtn"),
  dhcpFilter: document.getElementById("dhcpFilter"),
  dhcpTable: document.getElementById("dhcpTable"),
  dhcpConfigCards: document.getElementById("dhcpConfigCards"),
  dhcpConfigTable: document.getElementById("dhcpConfigTable"),
  saveReservation: document.getElementById("saveReservationBtn"),
  reservationName: document.getElementById("reservationNameInput"),
  reservationMac: document.getElementById("reservationMacInput"),
  reservationIp: document.getElementById("reservationIpInput"),
  reservationLease: document.getElementById("reservationLeaseInput"),
  reservationTable: document.getElementById("reservationTable"),
  saveRoute: document.getElementById("saveRouteBtn"),
  routeId: document.getElementById("routeIdInput"),
  routeName: document.getElementById("routeNameInput"),
  routeSubnet: document.getElementById("routeSubnetInput"),
  routeGateway: document.getElementById("routeGatewayInput"),
  routeInterface: document.getElementById("routeInterfaceInput"),
  routeEnabled: document.getElementById("routeEnabledInput"),
  diagTarget: document.getElementById("diagTarget"),
  diagSummary: document.getElementById("diagSummary"),
  diagOutput: document.getElementById("diagOutput"),
  eventLogSummary: document.getElementById("eventLogSummary"),
  eventLogOutput: document.getElementById("eventLogOutput"),
  tunnelStatus: document.getElementById("tunnelStatusBtn"),
  tunnelCards: document.getElementById("tunnelCards"),
  tunnelOutput: document.getElementById("tunnelOutput"),
  managerStatus: document.getElementById("managerStatusBtn"),
  managerRollback: document.getElementById("managerRollbackBtn"),
  managerCards: document.getElementById("managerCards"),
  managerOutput: document.getElementById("managerOutput"),
  uciFilter: document.getElementById("uciFilter"),
  uciTable: document.getElementById("uciTable"),
};

const state = {
  sections: {},
  uciRows: [],
  selectedPort: "lan3",
  portStats: {},
  portStatsDelta: {},
  portLiveTimer: 0,
  toastTimer: 0,
  lanAddressTimer: 0,
  vlanAddressTimer: 0,
};

const CERTIFIED_MX65_PORTS = [
  { id: "wan1", label: "Internet 1", group: "Internet", role: "WAN", bridge: "br-wan" },
  { id: "wan2", label: "Internet 2", group: "Internet", role: "WAN", bridge: "br-wan" },
  { id: "lan3", label: "LAN 3", group: "LAN", role: "LAN", bridge: "br-lan" },
  { id: "lan4", label: "LAN 4", group: "LAN", role: "LAN", bridge: "br-lan" },
  { id: "lan5", label: "LAN 5", group: "LAN", role: "LAN", bridge: "br-lan" },
  { id: "lan6", label: "LAN 6", group: "LAN", role: "LAN", bridge: "br-lan" },
  { id: "lan7", label: "LAN 7", group: "LAN", role: "LAN", bridge: "br-lan" },
  { id: "lan8", label: "LAN 8", group: "LAN", role: "LAN", bridge: "br-lan" },
  { id: "lan9", label: "LAN 9", group: "LAN", role: "LAN", bridge: "br-lan" },
  { id: "lan10", label: "LAN 10", group: "LAN", role: "LAN", bridge: "br-lan" },
  { id: "lan11", label: "LAN 11", group: "LAN", role: "LAN", bridge: "br-lan" },
  { id: "lan12", label: "LAN 12", group: "LAN", role: "LAN", bridge: "br-lan" },
];

function parseJsonObject(text) {
  try {
    const value = JSON.parse(String(text || "").trim());
    return value && typeof value === "object" ? value : {};
  } catch (_error) {
    return {};
  }
}

function applianceModel() {
  const board = parseJsonObject(state.sections.board || "");
  return board.model || "My-Rack-E appliance";
}

function portSortValue(portId) {
  const certifiedIndex = CERTIFIED_MX65_PORTS.findIndex((port) => port.id === portId);
  if (certifiedIndex >= 0) return certifiedIndex;
  const match = String(portId).match(/^(wan|lan)(\d+)$/);
  if (!match) return 10000;
  return (match[1] === "wan" ? 100 : 1000) + Number(match[2]);
}

function portDefinition(portId) {
  const certified = CERTIFIED_MX65_PORTS.find((port) => port.id === portId);
  if (certified) return certified;
  const match = String(portId).match(/^(wan|lan)(\d+)$/);
  if (!match) return null;
  const role = match[1] === "wan" ? "WAN" : "LAN";
  const index = Number(match[2]);
  return {
    id: portId,
    label: role === "WAN" ? `Internet ${index}` : `LAN ${index}`,
    group: role === "WAN" ? "Internet" : "LAN",
    role,
    bridge: role === "WAN" ? "br-wan" : "br-lan",
  };
}

function discoveredPortDefinitions(extraIds = []) {
  const interfaces = parseIpBrief(state.sections.ip_brief || "");
  const discovered = new Set();
  interfaces.forEach((item) => {
    const id = item.id || item.name;
    if (/^(wan|lan)\d+$/.test(id)) discovered.add(id);
  });
  Object.keys(state.portStats || {}).forEach((id) => {
    if (/^(wan|lan)\d+$/.test(id)) discovered.add(id);
  });
  extraIds.forEach((id) => {
    if (/^(wan|lan)\d+$/.test(id)) discovered.add(id);
  });
  const ids = discovered.size ? discovered : new Set(CERTIFIED_MX65_PORTS.map((port) => port.id));
  return [...ids]
    .sort((a, b) => portSortValue(a) - portSortValue(b))
    .map(portDefinition)
    .filter(Boolean);
}

function lanPortDefinitions() {
  return discoveredPortDefinitions().filter((port) => port.role === "LAN");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tag(text, kind = "") {
  return `<span class="tag ${kind}">${escapeHtml(text)}</span>`;
}

function tableEmpty(colspan, text) {
  return `<tr><td class="empty-row" colspan="${colspan}">${escapeHtml(text)}</td></tr>`;
}

function statusCard(label, value, sub = "", kind = "") {
  return `<article class="health-card ${kind}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${sub ? `<em>${escapeHtml(sub)}</em>` : ""}</article>`;
}

function actionRow(label, detail, kind = "ok", targetPanel = "") {
  const nav = targetPanel ? `<button data-goto-panel="${escapeHtml(targetPanel)}">Open</button>` : "";
  return `<div class="action-row ${kind}"><div>${tag(kind === "ok" ? "ok" : kind === "bad" ? "fix" : "check", kind)}</div><div class="action-copy"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(detail)}</span></div>${nav}</div>`;
}

function showToast(text, kind = "") {
  window.clearTimeout(state.toastTimer);
  els.toast.hidden = false;
  els.toast.textContent = text;
  els.toast.className = `toast ${kind}`;
  if (kind !== "bad") {
    state.toastTimer = window.setTimeout(() => {
      els.toast.hidden = true;
    }, 6000);
  }
}

function cookieToken() {
  const match = document.cookie.match(/(?:^|;\s*)mx65_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function csrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)mx65_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function browserToken() {
  try {
    return window.localStorage?.getItem("mx65-local-token") || "";
  } catch (_error) {
    return "";
  }
}

function token() {
  return els.token.value.trim() || browserToken() || cookieToken();
}

function clearLegacyBrowserToken() {
  try {
    window.localStorage?.removeItem("mx65-local-token");
  } catch (_error) {
    // Some locked-down browsers disable localStorage.
  }
}

async function saveToken() {
  const value = els.token.value.trim();
  if (!value) {
    showToast("Paste the manager token first.", "bad");
    return;
  }
  try {
    await api("session", {}, { tokenOverride: value, skipCsrf: true });
    clearLegacyBrowserToken();
    els.token.value = "";
    showToast("Secure manager session saved.", "ok");
    await refresh();
  } catch (error) {
    showToast(error.message, "bad");
  }
}

const MUTATION_OPS = new Set([
  "service",
  "security-apply",
  "security-rollback",
  "device-note-save",
  "port-note-save",
  "port-action",
  "network-lan-save",
  "network-vlan-save",
  "network-vlan-delete",
  "route-save",
  "route-delete",
  "reservation-save",
  "reservation-delete",
  "port-vlan-save",
  "outbound-rule-save",
  "outbound-rule-delete",
  "port-forward-save",
  "port-forward-delete",
  "manager-rollback",
]);

async function api(op, params = {}, options = {}) {
  const url = new URL("/cgi-bin/mx65-api", window.location.origin);
  url.searchParams.set("op", op);
  const currentToken = options.tokenOverride ?? token();
  const usePost = op === "session" || MUTATION_OPS.has(op);
  const bodyParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (usePost) bodyParams.set(key, value);
    else url.searchParams.set(key, value);
  });
  const headers = {};
  if (currentToken) headers["X-MX65-Token"] = currentToken;
  const csrf = csrfToken();
  if (csrf && !options.skipCsrf) headers["X-MX65-CSRF"] = csrf;
  if (op === "session" && currentToken) bodyParams.set("token", currentToken);
  if (MUTATION_OPS.has(op) && csrf) bodyParams.set("csrf", csrf);
  const response = await fetch(url, {
    method: usePost ? "POST" : "GET",
    credentials: "same-origin",
    headers,
    body: usePost ? bodyParams : undefined,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return text;
}

function splitSections(text) {
  const sections = {};
  let current = "";
  text.split(/\r?\n/).forEach((line) => {
    const match = line.trim().match(/^__MX65_SECTION__\s+([A-Za-z0-9_-]+)$/);
    if (match) {
      current = match[1];
      sections[current] = [];
      return;
    }
    if (current) sections[current].push(line);
  });
  return Object.fromEntries(Object.entries(sections).map(([key, lines]) => [key, lines.join("\n").trim()]));
}

function parseRelease(text) {
  const out = {};
  text.split(/\r?\n/).forEach((line) => {
    const index = line.indexOf("=");
    if (index <= 0) return;
    out[line.slice(0, index)] = line.slice(index + 1).replace(/^['"]|['"]$/g, "");
  });
  return out;
}

function parseIpBrief(text) {
  const lines = text.split(/\r?\n/);
  const fullRows = [];
  let current = null;
  lines.forEach((line) => {
    const iface = line.match(/^\d+:\s+([^:]+):\s+<([^>]*)>.*\sstate\s+(\S+)/);
    if (iface) {
      const master = line.match(/\smaster\s+(\S+)/)?.[1] || "";
      const name = iface[1];
      current = {
        name,
        id: name.split("@")[0],
        state: iface[3],
        flags: iface[2].split(",").filter(Boolean),
        master,
        addresses: [],
      };
      fullRows.push(current);
      return;
    }
    const address = line.trim().match(/^inet6?\s+(\S+)/);
    if (current && address) current.addresses.push(address[1]);
    const mac = line.trim().match(/^link\/ether\s+(\S+)/);
    if (current && mac) current.mac = mac[1];
  });
  if (fullRows.length) return fullRows;
  return lines
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length >= 2)
    .map((parts) => ({ name: parts[0], id: parts[0].split("@")[0], state: parts[1], flags: [], master: "", addresses: parts.slice(2) }));
}

function ipv4Addresses(item) {
  return (item?.addresses || []).filter((address) => /^\d+\.\d+\.\d+\.\d+\//.test(address));
}

function parseServices(text) {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const parts = line.trim().split(/\s+/);
      return { name: parts[0], enabled: parts[1] || "unknown", status: parts.slice(2).join(" ") };
    });
}

function serviceNamed(name) {
  return parseServices(state.sections.services || "").find((item) => item.name === name);
}

function serviceUp(service) {
  const status = service?.status?.toLowerCase() || "";
  return status.includes("running") || status.includes("active");
}

function parseLeases(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length >= 4)
    .map((parts) => ({ expires: parts[0], mac: parts[1].toLowerCase(), ip: parts[2], host: parts[3], clientId: parts.slice(4).join(" ") }));
}

function parseUci(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return {
        path: line.slice(0, index),
        value: line.slice(index + 1).replace(/^['"]|['"]$/g, ""),
      };
    });
}

function parseKeyValue(text) {
  const out = {};
  text.split(/\r?\n/).forEach((line) => {
    const index = line.indexOf("=");
    if (index <= 0) return;
    out[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  });
  return out;
}

function parseInlineKeyValues(text) {
  const values = {};
  String(text || "")
    .trim()
    .split(/\s+/)
    .forEach((part) => {
      const index = part.indexOf("=");
      if (index <= 0) return;
      values[part.slice(0, index)] = part.slice(index + 1);
    });
  return values;
}

function parsePortStats(text) {
  const stats = {};
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const firstSpace = trimmed.indexOf(" ");
    if (firstSpace <= 0) return;
    const port = trimmed.slice(0, firstSpace);
    const values = parseInlineKeyValues(trimmed.slice(firstSpace + 1));
    stats[port] = {
      rxBytes: Number(values.rx_bytes || 0),
      txBytes: Number(values.tx_bytes || 0),
      rxPackets: Number(values.rx_packets || 0),
      txPackets: Number(values.tx_packets || 0),
      rxErrors: Number(values.rx_errors || 0),
      txErrors: Number(values.tx_errors || 0),
      carrier: values.carrier || "0",
      operstate: values.operstate || "unknown",
    };
  });
  return stats;
}

function portStatsDelta(previous, current) {
  const out = {};
  Object.entries(current).forEach(([port, stats]) => {
    const old = previous[port] || {};
    out[port] = {
      rxBytes: Math.max(0, stats.rxBytes - (old.rxBytes || stats.rxBytes)),
      txBytes: Math.max(0, stats.txBytes - (old.txBytes || stats.txBytes)),
      rxPackets: Math.max(0, stats.rxPackets - (old.rxPackets || stats.rxPackets)),
      txPackets: Math.max(0, stats.txPackets - (old.txPackets || stats.txPackets)),
      totalBytes: Math.max(0, stats.rxBytes + stats.txBytes - ((old.rxBytes || stats.rxBytes) + (old.txBytes || stats.txBytes))),
      totalPackets: Math.max(0, stats.rxPackets + stats.txPackets - ((old.rxPackets || stats.rxPackets) + (old.txPackets || stats.txPackets))),
    };
  });
  return out;
}

function parseUciSections(text, packageName) {
  const sections = {};
  parseUci(text).forEach((row) => {
    const match = row.path.match(new RegExp(`^${packageName.replace(".", "\\.")}\\.([^.]+)(?:\\.(.+))?$`));
    if (!match) return;
    const section = `${packageName}.${match[1]}`;
    sections[section] ||= { path: section, values: {} };
    if (match[2]) sections[section].values[match[2]] = row.value;
    else sections[section].type = row.value;
  });
  return Object.values(sections);
}

function parseUciList(value) {
  return String(value || "")
    .match(/'[^']+'|"[^"]+"|\S+/g)
    ?.map((item) => item.replace(/^['"]|['"]$/g, ""))
    .filter(Boolean) || [];
}

function parseDeviceNotes(text) {
  const notes = {};
  text.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    const [mac, label = "", model = "", serial = "", role = "", expected = "auto"] = line.split("|");
    if (!mac) return;
    notes[mac.toLowerCase()] = { label, model, serial, role, expected };
  });
  return notes;
}

function parsePortNotes(text) {
  const notes = {};
  text.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    const [port, label = "", purpose = ""] = line.split("|");
    if (!port) return;
    notes[port] = { label, purpose };
  });
  return notes;
}

function parseNeighbors(text) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 4) return null;
      const ip = parts[0];
      const devIndex = parts.indexOf("dev");
      const llIndex = parts.indexOf("lladdr");
      const dev = devIndex >= 0 ? parts[devIndex + 1] : "";
      const mac = llIndex >= 0 ? parts[llIndex + 1]?.toLowerCase() : "";
      const state = parts[parts.length - 1] || "";
      if (!ip || !dev) return null;
      return { ip, dev, mac, state };
    })
    .filter(Boolean);
}

function parseArp(text) {
  return text
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length >= 6 && /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(parts[3]))
    .map((parts) => ({ ip: parts[0], mac: parts[3].toLowerCase(), flags: parts[2], dev: parts[5] }));
}

function parseFdb(text) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const brctlPort = line.trim().match(/^(\d+)\s+(([0-9a-f]{2}:){5}[0-9a-f]{2})\s+(yes|no)\s+(.+)$/i);
      if (brctlPort) return { mac: brctlPort[2].toLowerCase(), local: brctlPort[4].toLowerCase() === "yes", dev: "", portNo: brctlPort[1], age: brctlPort[5].trim() };
      const bridge = line.trim().match(/^(([0-9a-f]{2}:){5}[0-9a-f]{2})\s+dev\s+(\S+).*/i);
      if (bridge) return { mac: bridge[1].toLowerCase(), local: /\blocal\b/.test(line), dev: bridge[3], portNo: "", age: "" };
      return null;
    })
    .filter(Boolean);
}

function parseStpPorts(text) {
  const map = {};
  text.split(/\r?\n/).forEach((line) => {
    const match = line.trim().match(/^(\S+)\s+\((\d+)\)$/);
    if (match) map[match[2]] = match[1];
  });
  return map;
}

function ipv4ToNumber(ip) {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return null;
  return parts.reduce((acc, part) => (acc << 8) + part, 0) >>> 0;
}

function numberToIpv4(value) {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

function cidrInfo(cidr) {
  const match = String(cidr || "").match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
  if (!match) return null;
  const ip = ipv4ToNumber(match[1]);
  const prefix = Number(match[2]);
  if (ip == null || prefix < 0 || prefix > 32) return null;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return { ip, prefix, mask, network: (ip & mask) >>> 0 };
}

function inCidr(ip, cidr) {
  const info = cidrInfo(cidr);
  const value = ipv4ToNumber(ip);
  return info && value != null ? ((value & info.mask) >>> 0) === info.network : false;
}

function dhcpPoolRange(lanCidr, dhcpLan) {
  const info = cidrInfo(lanCidr);
  if (!info) return null;
  const start = Number(dhcpLan?.start || 0);
  const limit = Number(dhcpLan?.limit || 0);
  if (!start || !limit) return null;
  const startNum = (info.network + start) >>> 0;
  const endNum = (info.network + start + limit - 1) >>> 0;
  return { start: numberToIpv4(startNum), end: numberToIpv4(endNum), startNum, endNum };
}

function usableHostBounds(info) {
  if (!info || info.prefix < 1 || info.prefix > 30) return null;
  const blockSize = 2 ** (32 - info.prefix);
  return {
    first: 1,
    last: blockSize - 2,
    blockSize,
  };
}

function hostOffsetInSubnet(ip, info) {
  const value = ipv4ToNumber(ip);
  if (!info || value == null || ((value & info.mask) >>> 0) !== info.network) return null;
  return value - info.network;
}

function offsetAddress(info, offset) {
  return numberToIpv4((info.network + offset) >>> 0);
}

function autoDhcpPlan(ipaddr, netmask) {
  const info = cidrInfo(cidrFromIpMask(ipaddr, netmask));
  const bounds = usableHostBounds(info);
  if (!info || !bounds) return null;
  const gatewayOffset = hostOffsetInSubnet(ipaddr, info);
  if (!gatewayOffset || gatewayOffset < bounds.first || gatewayOffset > bounds.last) return null;
  let startOffset = gatewayOffset + 1;
  let endOffset = bounds.last;
  if (bounds.last >= 200) {
    startOffset = 50;
    endOffset = Math.min(199, bounds.last);
  } else if (bounds.last >= 100) {
    startOffset = 20;
    endOffset = Math.max(startOffset, bounds.last - 10);
  } else if (bounds.last >= 50) {
    startOffset = 10;
  }
  if (gatewayOffset >= startOffset && gatewayOffset <= endOffset) startOffset = gatewayOffset + 1;
  if (startOffset > bounds.last) return null;
  if (endOffset < startOffset) endOffset = bounds.last;
  return {
    startOffset,
    endOffset,
    limit: endOffset - startOffset + 1,
    startIp: offsetAddress(info, startOffset),
    endIp: offsetAddress(info, endOffset),
    reservedLow: startOffset > 2 ? `${offsetAddress(info, 2)} - ${offsetAddress(info, startOffset - 1)}` : "",
    reservedHigh: endOffset < bounds.last ? `${offsetAddress(info, endOffset + 1)} - ${offsetAddress(info, bounds.last)}` : "",
  };
}

function dhcpStartOffset(rawStart, ipaddr, netmask) {
  const value = String(rawStart || "").trim();
  const info = cidrInfo(cidrFromIpMask(ipaddr, netmask));
  const bounds = usableHostBounds(info);
  if (!value || !info || !bounds) return null;
  if (value.includes(".")) {
    const offset = hostOffsetInSubnet(value, info);
    return offset && offset >= bounds.first && offset <= bounds.last ? offset : null;
  }
  if (!/^\d{1,5}$/.test(value)) return null;
  const offset = Number(value);
  return offset >= bounds.first && offset <= bounds.last ? offset : null;
}

function dhcpPoolFromInputs(ipaddr, netmask, startValue, limitValue) {
  const info = cidrInfo(cidrFromIpMask(ipaddr, netmask));
  const bounds = usableHostBounds(info);
  const startOffset = dhcpStartOffset(startValue, ipaddr, netmask);
  const limit = Number(String(limitValue || "").trim());
  if (!info || !bounds || !startOffset || !Number.isInteger(limit) || limit < 1) return null;
  const endOffset = startOffset + limit - 1;
  if (endOffset > bounds.last) return null;
  return {
    startOffset,
    endOffset,
    limit,
    startIp: offsetAddress(info, startOffset),
    endIp: offsetAddress(info, endOffset),
  };
}

function renderDhcpPreview(previewEl, pool, autoPlan = null) {
  if (!previewEl) return;
  if (!pool) {
    previewEl.textContent = "DHCP range needs a valid subnet, first client, and size.";
    previewEl.classList.add("warn");
    return;
  }
  const reserveText = autoPlan
    ? [
        autoPlan.reservedLow ? `reserved low ${autoPlan.reservedLow}` : "",
        autoPlan.reservedHigh ? `reserved high ${autoPlan.reservedHigh}` : "",
      ].filter(Boolean).join("; ")
    : "";
  previewEl.textContent = `DHCP clients: ${pool.startIp} - ${pool.endIp}${reserveText ? `. ${reserveText}.` : "."}`;
  previewEl.classList.remove("warn");
}

function updateDhcpPreview(input, maskSelect, startInput, limitInput, previewEl) {
  const normalized = normalizeGatewayInput(input.value, maskSelect.value);
  if (!normalized) {
    renderDhcpPreview(previewEl, null);
    return null;
  }
  const pool = dhcpPoolFromInputs(normalized.ipaddr, normalized.netmask, startInput.value, limitInput.value);
  renderDhcpPreview(previewEl, pool);
  return pool;
}

function applyAutoDhcpPlan(input, maskSelect, startInput, limitInput, previewEl) {
  const normalized = setGatewayFields(input, maskSelect);
  if (!normalized) {
    renderDhcpPreview(previewEl, null);
    return null;
  }
  const plan = autoDhcpPlan(normalized.ipaddr, normalized.netmask);
  if (!plan) {
    renderDhcpPreview(previewEl, null);
    return null;
  }
  startInput.value = plan.startIp;
  limitInput.value = String(plan.limit);
  renderDhcpPreview(previewEl, plan, plan);
  return plan;
}

function scheduleCidrNormalization(timerKey, input, maskSelect, startInput, limitInput, previewEl) {
  window.clearTimeout(state[timerKey]);
  updateDhcpPreview(input, maskSelect, startInput, limitInput, previewEl);
  const value = input.value.trim();
  if (!value.includes("/") || !normalizeGatewayInput(value, maskSelect.value)) return;
  state[timerKey] = window.setTimeout(() => {
    if (input.value.trim() === value) applyAutoDhcpPlan(input, maskSelect, startInput, limitInput, previewEl);
  }, 250);
}

function ipInPool(ip, pool) {
  const value = ipv4ToNumber(ip);
  return pool && value != null && value >= pool.startNum && value <= pool.endNum;
}

function cidrBounds(cidr) {
  const info = cidrInfo(cidr);
  if (!info || info.prefix < 0 || info.prefix > 32) return null;
  const blockSize = info.prefix === 32 ? 1 : 2 ** (32 - info.prefix);
  return { info, first: info.network, last: info.network + blockSize - 1 };
}

function cidrOverlaps(a, b) {
  const left = cidrBounds(a);
  const right = cidrBounds(b);
  return Boolean(left && right && left.first <= right.last && right.first <= left.last);
}

function localNetworks() {
  const model = buildLocalNetworkModel();
  return [
    { name: "lan", label: "Primary LAN", vlanId: "1", ipaddr: model.primary.ipaddr, netmask: model.primary.netmask, dhcp: model.primary.dhcp },
    ...model.vlans.map((vlan) => ({ name: vlan.name, label: `VLAN ${vlan.vlanId}`, vlanId: String(vlan.vlanId), ipaddr: vlan.ipaddr, netmask: vlan.netmask, dhcp: vlan.dhcp })),
  ].filter((network) => network.ipaddr && network.netmask);
}

function hostStatusInNetwork(ip, network) {
  const info = cidrInfo(cidrFromIpMask(network.ipaddr, network.netmask));
  const value = ipv4ToNumber(ip);
  if (!info || value == null || info.prefix < 1 || info.prefix > 30) return "invalid";
  const blockSize = 2 ** (32 - info.prefix);
  const networkNum = info.network;
  const broadcast = networkNum + blockSize - 1;
  if (((value & info.mask) >>> 0) !== networkNum) return "outside";
  if (value === networkNum) return "network";
  if (value === broadcast) return "broadcast";
  if (value === ipv4ToNumber(network.ipaddr)) return "gateway";
  return "host";
}

function localHostCheck(ip) {
  for (const network of localNetworks()) {
    const status = hostStatusInNetwork(ip, network);
    if (status !== "outside" && status !== "invalid") return { network, status, ok: status === "host" };
  }
  return { ok: false, status: "outside", network: null };
}

function dhcpPoolForNetwork(network) {
  return dhcpPoolRange(cidrFromIpMask(network.ipaddr, network.netmask), network.dhcp || {});
}

function reservationForIp(ip) {
  return buildDeviceInventory().reservations.find((reservation) => reservation.ip === ip);
}

function portRangeSpan(spec) {
  const match = String(spec || "").trim().match(/^(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  const first = Number(match[1]);
  const last = Number(match[2] || match[1]);
  return first >= 1 && last >= first && last <= 65535 ? last - first + 1 : null;
}

function networkCidrIsBase(cidr) {
  const info = cidrInfo(cidr);
  if (!info) return null;
  return info.ip === info.network ? true : `${numberToIpv4(info.network)}/${info.prefix}`;
}

function vlanIdsConfigured() {
  return new Set(localNetworks().map((network) => String(network.vlanId)));
}

function hostValue(value) {
  return value && value !== "*" ? value : "";
}

function makeDeviceKey(mac, ip) {
  return mac || `ip:${ip}`;
}

function buildDeviceInventory() {
  const devices = new Map();
  const leases = parseLeases(state.sections.leases || "");
  const neighbors = parseNeighbors(state.sections.neighbors || "");
  const arps = parseArp(state.sections.arp || "");
  const fdb = parseFdb(state.sections.fdb || "");
  const stpPorts = parseStpPorts(state.sections.stp || "");
  const notes = parseDeviceNotes(state.sections.device_notes || "");
  const dhcpSections = parseUciSections(state.sections.uci_dhcp || "", "dhcp");
  const dhcpLan = dhcpSections.find((section) => section.path === "dhcp.lan")?.values || {};
  const reservations = dhcpSections
    .filter((section) => section.type === "host")
    .map((section) => ({
      path: section.path,
      name: section.values.name || section.values.hostname || "",
      mac: (section.values.mac || "").split(/\s+/)[0]?.toLowerCase() || "",
      ip: section.values.ip || "",
      leasetime: section.values.leasetime || "",
      duid: section.values.duid || "",
    }));
  const interfaces = parseIpBrief(state.sections.ip_brief || "");
  const lanCidr = ipv4Addresses(interfaces.find((item) => item.name === "br-lan"))[0] || "";
  const pool = dhcpPoolRange(lanCidr, dhcpLan);

  function ensureDevice(mac, ip) {
    const key = makeDeviceKey(mac, ip);
    if (!devices.has(key)) {
      devices.set(key, {
        key,
        mac: mac || "",
        hostname: "",
        label: "",
        model: "",
        serial: "",
        role: "",
        expected: "auto",
        ips: new Set(),
        ipv6: new Set(),
        interfaces: new Set(),
        services: new Set(),
        issues: [],
        neighborStates: new Set(),
        lease: null,
        reservation: null,
        arp: false,
        fdb: false,
        localMac: false,
      });
    }
    const device = devices.get(key);
    if (ip) {
      if (ip.includes(":")) device.ipv6.add(ip);
      else device.ips.add(ip);
    }
    return device;
  }

  leases.forEach((lease) => {
    const device = ensureDevice(lease.mac, lease.ip);
    device.lease = lease;
    device.hostname ||= hostValue(lease.host);
    device.services.add("DHCP lease");
    if (hostValue(lease.host)) device.services.add("Hostname");
  });

  neighbors.forEach((neighbor) => {
    const device = ensureDevice(neighbor.mac, neighbor.ip);
    device.interfaces.add(neighbor.dev);
    device.neighborStates.add(neighbor.state);
    device.services.add(neighbor.ip.includes(":") ? "IPv6" : "Neighbor");
  });

  arps.forEach((arp) => {
    const device = ensureDevice(arp.mac, arp.ip);
    device.arp = true;
    device.interfaces.add(arp.dev);
    device.services.add("ARP");
  });

  fdb.forEach((entry) => {
    if (!entry.mac) return;
    const device = ensureDevice(entry.mac, "");
    device.fdb = true;
    device.localMac = entry.local;
    device.interfaces.add(stpPorts[entry.portNo] || entry.dev);
    device.services.add(entry.local ? "Router MAC" : "Switch learned");
  });

  reservations.forEach((reservation) => {
    if (!reservation.mac && !reservation.ip) return;
    const device = ensureDevice(reservation.mac, reservation.ip);
    device.reservation = reservation;
    device.hostname ||= hostValue(reservation.name);
    device.services.add("Reserved");
    if (reservation.ip) device.ips.add(reservation.ip);
  });

  devices.forEach((device) => {
    const note = notes[device.mac] || {};
    device.label = note.label || "";
    device.model = note.model || "";
    device.serial = note.serial || "";
    device.role = note.role || "";
    device.expected = note.expected || "auto";
  });

  const ipCounts = {};
  const macCounts = {};
  devices.forEach((device) => {
    [...device.ips].forEach((ip) => {
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    });
    if (device.mac) macCounts[device.mac] = (macCounts[device.mac] || 0) + 1;
  });

  devices.forEach((device) => {
    const ipv4 = [...device.ips];
    const onLan = [...device.interfaces].some((iface) => iface.includes("br-lan") || iface.startsWith("lan")) || ipv4.some((ip) => inCidr(ip, lanCidr));
    const onWan = [...device.interfaces].some((iface) => iface.includes("br-wan") || iface.startsWith("wan"));
    device.zone = onWan && !onLan ? "WAN/upstream" : onLan ? "LAN" : "Observed";
    if (device.reservation && device.lease) device.addressMode = "Reserved";
    else if (device.lease) device.addressMode = "DHCP";
    else if (device.reservation) device.addressMode = "Reserved offline";
    else if (ipv4.length) device.addressMode = "Manual/static";
    else device.addressMode = "Layer 2 only";

    if (device.localMac) device.issues.push("Router MAC");
    if (device.zone === "WAN/upstream") device.issues.push("WAN-side");
    if (!device.hostname && device.zone === "LAN" && !device.localMac) device.issues.push("No hostname advertised");
    ipv4.forEach((ip) => {
      if (ipCounts[ip] > 1) device.issues.push(`Duplicate IP ${ip}`);
      if (device.zone === "LAN" && lanCidr && !inCidr(ip, lanCidr)) device.issues.push(`IP outside LAN ${lanCidr}`);
      if (!device.lease && !device.reservation && ipInPool(ip, pool)) device.issues.push("Manual IP inside DHCP pool");
      if (device.lease && pool && !ipInPool(ip, pool) && !device.reservation) device.issues.push("DHCP outside pool");
    });
    if (device.mac && macCounts[device.mac] > 1) device.issues.push(`Duplicate MAC ${device.mac}`);
    const neighborStates = [...device.neighborStates];
    const hasFreshNeighbor = neighborStates.some((state) => /REACHABLE|DELAY|PROBE|PERMANENT/i.test(state));
    if (neighborStates.some((state) => /FAILED|INCOMPLETE/i.test(state))) device.issues.push("Neighbor resolution failing");
    else if (neighborStates.some((state) => /STALE/i.test(state)) && !hasFreshNeighbor) device.issues.push("Neighbor stale");
    if (device.expected === "reserved" && !device.reservation) device.issues.push("Expected reservation missing");
    if (device.expected === "dhcp" && !device.lease) device.issues.push("Expected DHCP missing");
    if (device.expected === "manual" && device.lease) device.issues.push("Expected manual but using DHCP");
    device.issues = [...new Set(device.issues)];
  });

  return {
    devices: [...devices.values()].sort((a, b) => (a.zone + (a.hostname || a.label || a.mac)).localeCompare(b.zone + (b.hostname || b.label || b.mac))),
    leases,
    reservations,
    pool,
    lanCidr,
  };
}

function accessRow(label, ok, detail) {
  return `<div class="trust-row ${ok ? "ok" : "warn"}"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(detail)}</span>${tag(ok ? "pass" : "check", ok ? "ok" : "warn")}</div>`;
}

function policyLabel(value) {
  if (value === "REJECT" || value === "DROP") return "blocked";
  if (value === "ACCEPT") return "allowed";
  return value || "missing";
}

function toggleLabel(value) {
  if (value === "1") return "on";
  if (value === "0") return "off";
  if (value === "missing") return "not configured";
  return value || "missing";
}

function serviceStatusLabel(status) {
  const value = String(status || "").toLowerCase();
  if (!value || value === "unknown") return "unknown";
  if (value.includes("running")) return "running";
  if (value.includes("active")) return "active";
  if (value.includes("stopped")) return "stopped";
  if (value.includes("not installed")) return "not installed";
  return status;
}

function serviceEnabledLabel(value) {
  if (value === "enabled") return "enabled";
  if (value === "disabled") return "disabled";
  return value || "";
}

function linkStatusLabel(value) {
  if (value === "UP") return "connected";
  if (value === "DOWN") return "down";
  if (value === "UNKNOWN") return "ready";
  return value || "unknown";
}

function optionalDisabled(value) {
  return value === "0" || value === "missing";
}

function cleanFw4Output(text) {
  return String(text || "")
    .split(/\r?\n/)
    .filter((line) => !/^\[!\] Section .* is disabled, ignoring section$/.test(line.trim()))
    .join("\n")
    .trim();
}

function friendlyDnsInterfaces(value) {
  const raw = String(value || "").trim();
  if (!raw) return "all";
  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((iface) => {
      if (iface === "lo") return "Router local";
      if (iface === "br-lan") return "LAN";
      return networkLabel(iface);
    })
    .join(", ");
}

function securityRows(security) {
  return [
    ["Default inbound", security.defaults_input === "REJECT", policyLabel(security.defaults_input)],
    ["Default routing", security.defaults_forward === "REJECT", policyLabel(security.defaults_forward)],
    ["Drop invalid packets", security.drop_invalid === "1", toggleLabel(security.drop_invalid || "0")],
    ["SYN flood guard", security.syn_flood === "1", toggleLabel(security.syn_flood || "0")],
    ["Internet inbound", security.wan_input === "REJECT", policyLabel(security.wan_input)],
    ["Internet routing", security.wan_forward === "DROP", policyLabel(security.wan_forward)],
    ["Internet NAT", security.wan_masq === "1", toggleLabel(security.wan_masq)],
    ["Internet manager access", security.manager_wan_block === "REJECT", policyLabel(security.manager_wan_block)],
    ["Manager WAN services", String(security.manager_wan_ports || "").includes("22") && String(security.manager_wan_ports || "").includes("80") && String(security.manager_wan_ports || "").includes("443"), security.manager_wan_ports || "missing"],
    ["WAN ping", optionalDisabled(security.allow_ping_enabled), optionalDisabled(security.allow_ping_enabled) ? "disabled" : security.allow_ping_enabled || "missing"],
    ["IPsec traffic", optionalDisabled(security.allow_ipsec_esp_enabled), optionalDisabled(security.allow_ipsec_esp_enabled) ? "disabled" : toggleLabel(security.allow_ipsec_esp_enabled)],
    ["IPsec key exchange", optionalDisabled(security.allow_isakmp_enabled), optionalDisabled(security.allow_isakmp_enabled) ? "disabled" : toggleLabel(security.allow_isakmp_enabled)],
    ["Port forwards", Number(security.redirect_count || 0) === 0, `${security.redirect_count || 0}`],
    ["Force LAN DNS through MX", security.force_dns === "present", security.force_dns || "missing"],
    ["Block direct DNS-over-TLS", security.block_dot === "REJECT", policyLabel(security.block_dot)],
    ["SSH keys installed", Number(security.ssh_authorized_keys || 0) > 0, `${security.ssh_authorized_keys || 0}`],
    ["SSH password login", security.ssh_password_auth === "off", security.ssh_password_auth === "off" ? "off" : security.ssh_password_auth || "unknown"],
    ["SSH root password login", security.ssh_root_password_auth === "off", security.ssh_root_password_auth === "off" ? "off" : security.ssh_root_password_auth || "unknown"],
    ["Root password", security.root_password === "set", security.root_password === "set" ? "set" : "blank or locked"],
    ["SSH scope", security.ssh_interface === "lan", security.ssh_interface || "any"],
    ["HTTPS manager", /:443/.test(security.uhttpd_https || ""), security.uhttpd_https || "missing"],
    ["HTTP to HTTPS", security.uhttpd_redirect_https === "1", toggleLabel(security.uhttpd_redirect_https || "0")],
    ["Private-address web filter", security.uhttpd_rfc1918_filter === "1", toggleLabel(security.uhttpd_rfc1918_filter || "0")],
    ["DNS local service", security.dns_localservice === "1", toggleLabel(security.dns_localservice || "0")],
    ["DNS bind scope", String(security.dns_interfaces || "").includes("br-lan") && String(security.dns_interfaces || "").includes("lo"), friendlyDnsInterfaces(security.dns_interfaces)],
    ["DNS rebind protection", security.dns_rebind_protection === "1", toggleLabel(security.dns_rebind_protection || "0")],
    ["WAN DHCP server", security.dhcp_wan_ignore === "1", security.dhcp_wan_ignore === "1" ? "disabled" : "check"],
    ["UPnP", security.upnp_service === "absent_or_disabled", security.upnp_service || "unknown"],
    ["IPv6 WAN", security.wan6_disabled === "1", security.wan6_disabled === "1" ? "disabled" : "enabled"],
    ["IPv6 router advertisements", security.odhcpd_enabled === "0", security.odhcpd_enabled === "0" ? "disabled" : "enabled"],
  ];
}

function renderSecurity(text = "") {
  const sections = text ? splitSections(text) : state.sections;
  const security = parseKeyValue(sections.security || "");
  if (!sections.security) {
    els.securityCards.innerHTML = [
      statusCard("Baseline", "not checked", "check status first", "warn"),
      statusCard("WAN", "waiting", "", ""),
      statusCard("Exposure", "waiting", "", ""),
    ].join("");
    els.securityList.innerHTML = accessRow("Firewall baseline", false, "waiting for status");
    els.firewallOutbound.innerHTML = accessRow("Outbound rules", false, "waiting for status");
    els.firewallWanServices.innerHTML = accessRow("WAN appliance services", false, "waiting for status");
    els.firewallLayer7.innerHTML = accessRow("Layer 7 firewall rules", false, "waiting for status");
    return;
  }
  const rows = securityRows(security);
  const passed = rows.filter(([, ok]) => ok).length;
  const failed = rows.length - passed;
  const fw4 = sections.security_fw4 || state.sections.fw_check || "";
  const fw4Summary = cleanFw4Output(fw4) || fw4;
  const fw4Ok = /passes|ok/i.test(fw4Summary) && !/fail|error/i.test(fw4Summary);
  const hardened = failed === 0 && fw4Ok;
  els.securityCards.innerHTML = [
    statusCard("Baseline", hardened ? "hardened" : "attention", `${passed}/${rows.length} checks`, hardened ? "ok" : "warn"),
    statusCard("WAN", security.wan_input === "REJECT" && security.wan_forward === "DROP" ? "blocked" : "check", "inbound / routing", security.wan_input === "REJECT" && security.wan_forward === "DROP" ? "ok" : "warn"),
    statusCard("Exposure", Number(security.redirect_count || 0) === 0 ? "no forwards" : `${security.redirect_count} forwards`, "WAN", Number(security.redirect_count || 0) === 0 ? "ok" : "warn"),
    statusCard("Rules", fw4Ok ? "valid" : "check", fw4Ok ? "checked" : "needs review", fw4Ok ? "ok" : "warn"),
  ].join("");
  els.firewallOutbound.innerHTML = [
    accessRow("Default outbound", security.defaults_forward === "REJECT", `forwarding ${policyLabel(security.defaults_forward)}`),
    accessRow("Invalid packet handling", security.drop_invalid === "1", `drop invalid packets ${toggleLabel(security.drop_invalid || "0")}`),
    accessRow("DNS enforcement", security.force_dns === "present", security.force_dns === "present" ? "LAN DNS is forced through the MX." : "LAN DNS can bypass the MX."),
  ].join("");
  els.firewallWanServices.innerHTML = [
    accessRow("WAN manager access", security.manager_wan_block === "REJECT", `ports ${security.manager_wan_ports || "missing"} blocked from WAN`),
    accessRow("WAN ping", optionalDisabled(security.allow_ping_enabled), optionalDisabled(security.allow_ping_enabled) ? "disabled" : "enabled"),
    accessRow("SNMP", true, "not installed or not exposed by this manager build"),
  ].join("");
  els.firewallLayer7.innerHTML = [
    accessRow("Application/category filtering", false, "DPI/category packages are not installed on this My-Rack-E build powered by OpenWrt."),
    accessRow("DNS-over-TLS block", security.block_dot === "REJECT", policyLabel(security.block_dot)),
  ].join("");
  const outboundRules = buildOutboundRules();
  els.outboundRuleTable.innerHTML = outboundRules.length
    ? outboundRules
        .map((rule) => `<tr>
          <td>${tag(rule.policy, rule.policy === "Allow" ? "ok" : "warn")}</td>
          <td>${escapeHtml(rule.protocol)}</td>
          <td>${escapeHtml(rule.source)}</td>
          <td>${escapeHtml(rule.destination)}</td>
          <td>${escapeHtml(rule.destPort)}</td>
          <td><strong>${escapeHtml(rule.comment)}</strong></td>
          <td>${tag(rule.enabled, rule.enabled === "Enabled" ? "ok" : "warn")}</td>
          <td><div class="table-actions"><button data-outbound-edit="${escapeHtml(rule.id)}">Edit</button><button data-outbound-delete="${escapeHtml(rule.id)}">Delete</button></div></td>
        </tr>`)
        .join("")
    : tableEmpty(8, "No custom outbound rules configured.");
  els.securityList.innerHTML = rows.map(([label, ok, detail]) => accessRow(label, ok, detail)).join("");
  if (text) els.securityOutput.textContent = text;
}

function renderAccess() {
  if (!state.sections.access && !state.sections.services) {
    els.accessScore.textContent = "Waiting";
    els.accessGrid.innerHTML = accessRow("Manager token", false, "waiting for status");
    return;
  }
  const access = parseKeyValue(state.sections.access || "");
  const dropbear = serviceNamed("dropbear");
  const rows = [
    ["Manager token", access.manager_token === "present", access.manager_token || "unknown"],
    ["Internet manager access", access.wan_block === "REJECT", access.wan_block === "REJECT" ? "blocked" : policyLabel(access.wan_block)],
    ["Web manager", /running|active/i.test(access.uhttpd || ""), serviceStatusLabel(access.uhttpd)],
    ["SSH management", serviceUp(dropbear), serviceStatusLabel(dropbear?.status)],
  ];
  const passed = rows.filter(([, ok]) => ok).length;
  els.accessScore.textContent = `${passed}/${rows.length}`;
  els.accessGrid.innerHTML = rows.map(([label, ok, detail]) => accessRow(label, ok, detail)).join("");
}

function renderHealth() {
  if (!state.sections.release && !state.sections.ip_brief) {
    els.healthGrid.innerHTML = [
      statusCard("Status", "not loaded", "paste token, then check", "warn"),
      statusCard("LAN", "waiting", "", ""),
      statusCard("WAN", "waiting", "", ""),
      statusCard("DHCP", "waiting", "", ""),
      statusCard("Cloudflare", "waiting", "", ""),
    ].join("");
    els.releaseLine.textContent = "Paste the manager token, save it, then check status.";
    els.readinessScore.textContent = "0 checks";
    els.readinessList.innerHTML = "";
    els.nextActionScore.textContent = "Token needed";
    els.nextActionList.innerHTML = actionRow("Paste token", "Use the token from the Mac installer, then click Check.", "warn");
    renderAccess();
    return;
  }
  const release = parseRelease(state.sections.release || "");
  const interfaces = parseIpBrief(state.sections.ip_brief || "");
  const routes = state.sections.routes || "";
  const services = parseServices(state.sections.services || "");
  const leases = parseLeases(state.sections.leases || "");
  const defaultRoute = routes.split("\n").find((line) => line.startsWith("default")) || "";
  const defaultGateway = defaultRoute.match(/\bvia\s+(\S+)/)?.[1] || "";
  const defaultNetwork = networkLabel(defaultRoute.match(/\bdev\s+(\S+)/)?.[1] || "");
  const lan = interfaces.find((item) => item.name === "br-lan");
  const wan = interfaces.find((item) => item.name === "br-wan" || item.name === "wan1");
  const lanV4 = ipv4Addresses(lan);
  const wanV4 = ipv4Addresses(wan);
  const dnsmasq = services.find((item) => item.name === "dnsmasq");
  const firewall = services.find((item) => item.name === "firewall");
  const cloudflared = services.find((item) => item.name === "cloudflared");
  const cards = [
    ["My-Rack-E", "online", "powered by OpenWrt", "ok"],
    ["LAN", lanV4.join(" ") || "no IPv4", linkStatusLabel(lan?.state), lanV4.length ? "ok" : "bad"],
    ["WAN", wanV4.length ? "connected" : linkStatusLabel(wan?.state), wanV4.join(" ") || "no IPv4 address", wanV4.length ? "ok" : "warn"],
    ["DHCP", serviceStatusLabel(dnsmasq?.status), serviceEnabledLabel(dnsmasq?.enabled), serviceUp(dnsmasq) ? "ok" : "bad"],
    ["Cloudflare", serviceStatusLabel(cloudflared?.status || "not installed"), serviceEnabledLabel(cloudflared?.enabled), serviceUp(cloudflared) ? "ok" : "warn"],
  ];
  els.healthGrid.innerHTML = cards.map(([label, value, sub, kind]) => statusCard(label, value, sub, kind)).join("");
  els.releaseLine.textContent = `My-Rack-E online / powered by OpenWrt${release.DISTRIB_RELEASE ? ` / ${release.DISTRIB_RELEASE}` : ""}`;
  const checks = [
    ["LAN IPv4", Boolean(lanV4.length), lanV4.join(" ") || "none"],
    ["DHCP", serviceUp(dnsmasq), serviceStatusLabel(dnsmasq?.status)],
    ["Firewall", serviceUp(firewall), serviceStatusLabel(firewall?.status)],
    ["Internet path", Boolean(defaultRoute), defaultGateway ? `Gateway ${defaultGateway}${defaultNetwork ? ` / ${defaultNetwork}` : ""}` : "none"],
    ["Cloudflare", serviceUp(cloudflared), serviceStatusLabel(cloudflared?.status || "not installed")],
  ];
  const passed = checks.filter(([, ok]) => ok).length;
  els.readinessScore.textContent = `${passed}/${checks.length}`;
  els.readinessList.innerHTML = checks
    .map(([label, ok, detail]) => `<div class="check-row"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(detail)}</span>${tag(ok ? "pass" : "check", ok ? "ok" : "warn")}</div>`)
    .join("");
  renderNextActions({ lan, wan, dnsmasq, firewall, cloudflared, routes, leases });
}

function renderApplianceStatus() {
  if (!els.deviceSummary) return;
  const release = parseRelease(state.sections.release || "");
  const interfaces = parseIpBrief(state.sections.ip_brief || "");
  const routes = state.sections.routes || "";
  const services = parseServices(state.sections.services || "");
  const lan = interfaces.find((item) => item.name === "br-lan");
  const wan = interfaces.find((item) => item.name === "br-wan" || item.name === "wan1");
  const lanV4 = ipv4Addresses(lan);
  const wanV4 = ipv4Addresses(wan);
  const defaultRoute = routes.split("\n").find((line) => line.startsWith("default")) || "";
  const gateway = defaultRoute.match(/\bvia\s+(\S+)/)?.[1] || "";
  const inventory = buildDeviceInventory();
  const ports = buildPortInventory();
  const dnsmasq = services.find((item) => item.name === "dnsmasq");
  const firewall = services.find((item) => item.name === "firewall");
  const cloudflared = services.find((item) => item.name === "cloudflared");
  const poolTotal = inventory.pool ? inventory.pool.endNum - inventory.pool.startNum + 1 : 0;
  const used = inventory.leases.length;
  const poolPercent = poolTotal ? Math.min(100, Math.round((used / poolTotal) * 100)) : 0;

  els.deviceSummary.innerHTML = [
    detailRow("Model", applianceModel()),
    detailRow("Network", "Home lab"),
    detailRow("Platform", "Powered by OpenWrt"),
    detailRow("Firmware", release.DISTRIB_RELEASE || "unknown"),
    detailRow("LAN address", lanV4[0] || "not assigned"),
    detailRow("Client tracking", "MAC address"),
  ].join("");

  els.uplinkSummary.innerHTML = [
    detailRow("Internet status", wanV4.length ? "connected" : "needs attention"),
    detailRow("Internet IP", wanV4[0] || "not assigned"),
    detailRow("Gateway", gateway || "not detected"),
    detailRow("LAN gateway", lanV4[0] || "not assigned"),
    detailRow("Firewall", serviceStatusLabel(firewall?.status)),
    detailRow("Cloudflare", serviceStatusLabel(cloudflared?.status || "not installed")),
  ].join("");

  els.dhcpUtilization.innerHTML = [
    `<div class="summary-row"><strong>Client addressing</strong><span>${escapeHtml(serviceStatusLabel(dnsmasq?.status))}</span>${tag(serviceEnabledLabel(dnsmasq?.enabled), serviceUp(dnsmasq) ? "ok" : "warn")}</div>`,
    `<div class="util-meter" aria-label="DHCP utilization"><span style="width:${poolPercent}%"></span></div>`,
    detailRow("Active leases", `${used}${poolTotal ? ` of ${poolTotal}` : ""}`),
    detailRow("Available range", inventory.pool ? `${inventory.pool.start} - ${inventory.pool.end}` : "not detected"),
    detailRow("Reservations", `${inventory.reservations.length}`),
  ].join("");

  els.dashboardPortStrip.innerHTML = ports.ports
    .map((port) => {
      const kind = portStatusKind(port);
      return `<button class="mini-jack ${kind}" data-port-select="${escapeHtml(port.id)}" title="${escapeHtml(`${port.label}: ${port.status}`)}">
        <span></span><strong>${escapeHtml(port.label.replace("Internet ", "WAN "))}</strong>
      </button>`;
    })
    .join("");

  els.liveToolsStatus.innerHTML = [
    accessRow("Ping", true, "Test reachability from the MX."),
    accessRow("DNS lookup", true, "Resolve a hostname from the MX."),
    accessRow("Internet path", true, "Show the active gateway and outbound path."),
  ].join("");
}

function renderNextActions({ lan, wan, dnsmasq, firewall, cloudflared, routes, leases }) {
  const actions = [];
  if (!ipv4Addresses(lan).length) actions.push(["LAN needs attention", "LAN has no IPv4 address.", "bad", "network"]);
  if (!serviceUp(dnsmasq)) actions.push(["Start DHCP", "Clients may not get addresses until client addressing is running.", "bad", "dhcp"]);
  if (!serviceUp(firewall)) actions.push(["Check firewall", "Firewall service is not reporting active.", "warn", "security"]);
  if (!routes.includes("default")) actions.push(["No default route", "The MX may not reach the internet from WAN.", "warn", "network"]);
  if (!cloudflared) actions.push(["Cloudflare not installed", "Run the Mac quickstart script to install the tunnel.", "warn", "tunnel"]);
  else if (!serviceUp(cloudflared)) actions.push(["Cloudflare stopped", "Start or restart cloudflared.", "warn", "tunnel"]);
  if (!actions.length) actions.push(["Ready", `Routing, firewall, DHCP, and Cloudflare look usable. ${leases.length} DHCP lease(s).`, "ok", "diagnostics"]);
  els.nextActionScore.textContent = actions[0][0];
  els.nextActionList.innerHTML = actions.map(([label, detail, kind, panel]) => actionRow(label, detail, kind, panel)).join("");
}

function renderServices() {
  const services = parseServices(state.sections.services || "");
  els.servicesList.innerHTML = services.length
    ? services
        .map((item) => {
          const kind = item.status.includes("running") || item.enabled === "enabled" ? "ok" : "warn";
          return `<div class="summary-row"><strong>${escapeHtml(serviceLabel(item.name))}</strong><span>${escapeHtml(serviceStatusLabel(item.status))}</span>${tag(serviceEnabledLabel(item.enabled), kind)}</div>`;
        })
        .join("")
    : "<div class=\"empty-row\">No service output.</div>";
}

function serviceLabel(name) {
  const labels = {
    cloudflared: "Cloudflare connector",
    dnsmasq: "Client addressing",
    dropbear: "SSH management",
    firewall: "Firewall",
    network: "Network",
    odhcpd: "IPv6 addressing",
    uhttpd: "Web manager",
  };
  return labels[name] || name;
}

function portLabel(port) {
  const custom = port.note?.label;
  return custom ? `${port.label}: ${custom}` : port.label;
}

function portRoleLabel(port) {
  return port.role === "WAN" ? "Internet uplink" : "LAN access";
}

function networkLabel(value) {
  if (value === "br-lan" || value === "lan") return "LAN";
  if (value === "br-wan" || value === "wan" || value === "wan6") return "Internet";
  return interfaceLabel(value);
}

function interfaceLabel(value) {
  const port = portDefinition(value);
  if (port) return port.label;
  if (value === "br-lan") return "LAN bridge";
  if (value === "br-wan") return "Internet bridge";
  if (value === "sw0" || value === "sw1" || value === "eth0") return "Switch fabric";
  return value;
}

function portAddressFor(port, interfaces) {
  const bridge = interfaces.find((item) => (item.id || item.name) === port.bridge);
  return ipv4Addresses(bridge)[0] || bridge?.addresses?.[0] || "";
}

function portStatusKind(port) {
  if (port.status === "Connected") return "ok";
  if (port.status === "Disabled" || port.status === "Missing") return "bad";
  return "warn";
}

function formatBytes(value) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = Number(value || 0);
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${units[unit]}`;
}

function activityLevel(delta) {
  const bytes = delta?.totalBytes || 0;
  if (bytes > 1024 * 1024) return "high";
  if (bytes > 128 * 1024) return "medium";
  if (bytes > 0) return "low";
  return "idle";
}

function activityWidth(delta) {
  const bytes = delta?.totalBytes || 0;
  if (!bytes) return 6;
  return Math.max(12, Math.min(100, Math.round(Math.log10(bytes + 1) * 18)));
}

function activityText(port) {
  const stats = port.stats || {};
  const delta = port.delta || {};
  const current = delta.totalBytes ? `${formatBytes(delta.totalBytes)} since refresh` : "idle since refresh";
  return `${current} / total ${formatBytes((stats.rxBytes || 0) + (stats.txBytes || 0))}`;
}

function buildPortInventory() {
  const interfaces = parseIpBrief(state.sections.ip_brief || "");
  const byId = Object.fromEntries(interfaces.map((item) => [item.id || item.name, item]));
  const notes = parsePortNotes(state.sections.port_notes || "");
  const stpPorts = parseStpPorts(state.sections.stp || "");
  const bridgeByPort = {};
  parseUciSections(state.sections.uci_network || "", "network")
    .filter((section) => section.type === "device" && section.values.type === "bridge")
    .forEach((section) => {
      parseUciList(section.values.ports).forEach((port) => {
        bridgeByPort[port] = section.values.name || "";
      });
    });

  const clientCounts = {};
  parseFdb(state.sections.fdb || "").forEach((entry) => {
    if (entry.local) return;
    const dev = stpPorts[entry.portNo] || entry.dev;
    if (!dev) return;
    clientCounts[dev] = (clientCounts[dev] || 0) + 1;
  });

  const ports = discoveredPortDefinitions(Object.keys(bridgeByPort)).map((base) => {
    const row = byId[base.id];
    const flags = new Set(row?.flags || []);
    const hasFlags = Boolean(row?.flags?.length);
    const adminUp = row ? (hasFlags ? flags.has("UP") : row.state !== "DOWN") : false;
    const connected = row ? (hasFlags ? flags.has("LOWER_UP") && !flags.has("NO-CARRIER") : row.state === "UP") : false;
    const status = !row ? "Missing" : !adminUp ? "Disabled" : connected ? "Connected" : "Ready";
    return {
      ...base,
      note: notes[base.id] || {},
      technical: row?.name || base.id,
      state: row?.state || "missing",
      flags: row?.flags || [],
      adminUp,
      connected,
      status,
      bridge: row?.master || bridgeByPort[base.id] || base.bridge,
      address: portAddressFor(base, interfaces),
      mac: row?.mac || "",
      clients: clientCounts[base.id] || 0,
      clientsKnown: Boolean(state.sections.stp || state.sections.fdb),
      stats: state.portStats[base.id] || {},
      delta: state.portStatsDelta[base.id] || {},
    };
  });

  return {
    ports,
    connected: ports.filter((port) => port.connected).length,
    connectedWan: ports.filter((port) => port.role === "WAN" && port.connected).length,
    connectedLan: ports.filter((port) => port.role === "LAN" && port.connected).length,
    disabled: ports.filter((port) => port.status === "Disabled").length,
    activityBytes: ports.reduce((sum, port) => sum + (port.delta?.totalBytes || 0), 0),
  };
}

function renderPortTile(port) {
  const selected = state.selectedPort === port.id ? " selected" : "";
  const kind = portStatusKind(port);
  const activity = activityLevel(port.delta);
  const meter = activityWidth(port.delta);
  const clients = port.role === "LAN" && port.clientsKnown ? `${port.clients} client${port.clients === 1 ? "" : "s"}` : "client map unavailable";
  const bridgeLine = [networkLabel(port.bridge), port.address].filter(Boolean).join(" / ") || networkLabel(port.bridge) || "not assigned";
  return `<button class="port-tile ${kind} activity-${activity}${selected}" data-port-select="${escapeHtml(port.id)}" title="${escapeHtml(`${portLabel(port)}: ${port.status}; ${activityText(port)}`)}">
    <span class="port-led"></span>
    <strong>${escapeHtml(portLabel(port))}</strong>
    <span>${escapeHtml(port.status)}</span>
    <small>${escapeHtml(portRoleLabel(port))}</small>
    <small>${escapeHtml(port.role === "LAN" ? clients : bridgeLine)}</small>
    <i class="activity-meter"><b style="width:${meter}%"></b></i>
  </button>`;
}

function renderFaceplatePort(port) {
  const selected = state.selectedPort === port.id ? " selected" : "";
  const kind = portStatusKind(port);
  const activity = activityLevel(port.delta);
  const meter = activityWidth(port.delta);
  return `<button class="jack ${kind} activity-${activity}${selected}" data-port-select="${escapeHtml(port.id)}" title="${escapeHtml(`${portLabel(port)}: ${port.status}; ${activityText(port)}`)}">
    <span class="jack-led"></span>
    <span class="jack-hole"></span>
    <strong>${escapeHtml(port.label)}</strong>
    <small>${escapeHtml(port.status)}</small>
    <i><b style="width:${meter}%"></b></i>
  </button>`;
}

function detailRow(label, value) {
  return `<div class="port-detail-row"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value || "none")}</span></div>`;
}

function netmaskToPrefix(mask) {
  const value = ipv4ToNumber(mask);
  if (value == null) return 24;
  let seenZero = false;
  let prefix = 0;
  for (let bit = 31; bit >= 0; bit -= 1) {
    const isOne = Boolean(value & (1 << bit));
    if (isOne && seenZero) return 24;
    if (isOne) prefix += 1;
    else seenZero = true;
  }
  return prefix;
}

function cidrFromIpMask(ipaddr, netmask) {
  return ipaddr && netmask ? `${ipaddr}/${netmaskToPrefix(netmask)}` : "";
}

function normalizeGatewayInput(rawValue, selectedNetmask = "255.255.255.0") {
  const raw = String(rawValue || "").trim();
  if (!raw) return null;
  let info = null;
  let netmask = selectedNetmask || "255.255.255.0";
  let cidrWasTyped = false;
  if (raw.includes("/")) {
    info = cidrInfo(raw);
    if (!info || info.prefix < 1 || info.prefix > 30) return null;
    netmask = numberToIpv4(info.mask);
    cidrWasTyped = true;
  } else {
    const prefix = netmaskToPrefix(netmask);
    info = cidrInfo(`${raw}/${prefix}`);
    if (!info || info.prefix < 1 || info.prefix > 30) return null;
  }
  const blockSize = 2 ** (32 - info.prefix);
  const hostOffset = info.ip - info.network;
  const broadcast = info.network + blockSize - 1;
  if (info.ip === broadcast) return null;
  const gatewayNumber = hostOffset === 0 ? info.network + 1 : info.ip;
  return {
    ipaddr: numberToIpv4(gatewayNumber),
    netmask,
    cidr: `${numberToIpv4(info.network)}/${info.prefix}`,
    derivedFromNetwork: cidrWasTyped || hostOffset === 0,
  };
}

function setGatewayFields(input, maskSelect) {
  const normalized = normalizeGatewayInput(input.value, maskSelect.value);
  if (!normalized) return null;
  input.value = normalized.ipaddr;
  if ([...maskSelect.options].some((option) => option.value === normalized.netmask)) {
    maskSelect.value = normalized.netmask;
  }
  return normalized;
}

function dhcpSectionByInterface(interfaceName) {
  return parseUciSections(state.sections.uci_dhcp || "", "dhcp").find((section) => section.values.interface === interfaceName || section.path === `dhcp.${interfaceName}`)?.values || {};
}

function dhcpPoolText(ipaddr, netmask, dhcp) {
  if (dhcp.ignore === "1") return "disabled";
  const pool = dhcpPoolRange(cidrFromIpMask(ipaddr, netmask), dhcp);
  return pool ? `${pool.start} - ${pool.end}` : "not configured";
}

function bridgeVlanSections() {
  return parseUciSections(state.sections.uci_network || "", "network")
    .filter((section) => section.type === "bridge-vlan" && section.values.device === "br-lan")
    .map((section) => ({
      id: section.values.vlan || "",
      path: section.path,
      ports: parseUciList(section.values.ports),
    }));
}

function friendlyPortList(ports) {
  const labels = ports
    .map((port) => port.split(":")[0])
    .filter(Boolean)
    .map((portId) => portDefinition(portId)?.label || interfaceLabel(portId));
  return labels.length ? labels.join(", ") : "none assigned";
}

function accessPortsForVlan(vlanId) {
  const vlan = bridgeVlanSections().find((item) => String(item.id) === String(vlanId));
  return vlan ? vlan.ports.filter((port) => /:u/.test(port)).map((port) => port.split(":")[0]) : [];
}

function nativeLanPorts(customVlans) {
  const assigned = new Set(customVlans.flatMap((vlan) => vlan.accessPorts));
  return lanPortDefinitions().filter((port) => !assigned.has(port.id)).map((port) => port.id);
}

function buildLocalNetworkModel() {
  const networkSections = parseUciSections(state.sections.uci_network || "", "network");
  const lan = networkSections.find((section) => section.path === "network.lan")?.values || {};
  const lanDhcp = dhcpSectionByInterface("lan");
  const vlanNetworks = networkSections
    .filter((section) => section.type === "interface")
    .map((section) => ({ path: section.path, name: section.path.replace(/^network\./, ""), values: section.values }))
    .filter((item) => /^br-lan\.[0-9]+$/.test(item.values.device || "") && item.name !== "lan")
    .map((item) => {
      const vlanId = item.values.device.split(".")[1];
      const dhcp = dhcpSectionByInterface(item.name);
      const accessPorts = accessPortsForVlan(vlanId);
      return {
        kind: "vlan",
        name: item.name,
        label: item.values.label || `VLAN ${vlanId}`,
        vlanId,
        ipaddr: item.values.ipaddr || "",
        netmask: item.values.netmask || "255.255.255.0",
        gateway: cidrFromIpMask(item.values.ipaddr, item.values.netmask || "255.255.255.0"),
        dhcp,
        dhcpPool: dhcpPoolText(item.values.ipaddr, item.values.netmask || "255.255.255.0", dhcp),
        accessPorts,
      };
    })
    .sort((a, b) => Number(a.vlanId) - Number(b.vlanId));
  const lanPorts = nativeLanPorts(vlanNetworks);
  return {
    primary: {
      kind: "primary",
      name: "lan",
      label: "Primary LAN",
      vlanId: lan.device === "br-lan.1" ? "1" : "",
      ipaddr: lan.ipaddr || "",
      netmask: lan.netmask || "255.255.255.0",
      gateway: cidrFromIpMask(lan.ipaddr, lan.netmask || "255.255.255.0"),
      dhcp: lanDhcp,
      dhcpPool: dhcpPoolText(lan.ipaddr, lan.netmask || "255.255.255.0", lanDhcp),
      accessPorts: lanPorts,
    },
    vlans: vlanNetworks,
    vlanMode: lan.device === "br-lan.1" || bridgeVlanSections().length > 0,
  };
}

function fillNetworkForms(model) {
  if (!els.lanIp || document.activeElement === els.lanIp || document.activeElement === els.lanDhcpStart || document.activeElement === els.lanDhcpLimit || document.activeElement === els.lanLease) return;
  const primary = model.primary;
  els.lanIp.value = primary.ipaddr || "";
  els.lanMask.value = primary.netmask || "255.255.255.0";
  const primaryPool = dhcpPoolFromInputs(primary.ipaddr, primary.netmask || "255.255.255.0", primary.dhcp.start || "", primary.dhcp.limit || "");
  const primaryAuto = autoDhcpPlan(primary.ipaddr, primary.netmask || "255.255.255.0");
  els.lanDhcpStart.value = primaryPool?.startIp || primary.dhcp.start || "";
  els.lanDhcpLimit.value = primaryPool?.limit || primary.dhcp.limit || "";
  els.lanLease.value = primary.dhcp.leasetime || "12h";
  renderDhcpPreview(els.lanDhcpPreview, primaryPool, primaryPool?.startOffset === primaryAuto?.startOffset && primaryPool?.endOffset === primaryAuto?.endOffset ? primaryAuto : null);
  els.vlanDhcpStart.value ||= "";
  els.vlanDhcpLimit.value ||= "";
  els.vlanLease.value ||= "12h";
  els.vlanMask.value ||= "255.255.255.0";
  updateDhcpPreview(els.vlanIp, els.vlanMask, els.vlanDhcpStart, els.vlanDhcpLimit, els.vlanDhcpPreview);
}

function updateRouteInterfaceOptions(model) {
  const current = els.routeInterface.value || "lan";
  const options = [
    ["lan", "Primary LAN"],
    ...model.vlans.map((vlan) => [vlan.name, `VLAN ${vlan.vlanId}${vlan.label ? ` - ${vlan.label}` : ""}`]),
  ];
  els.routeInterface.innerHTML = options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
  els.routeInterface.value = options.some(([value]) => value === current) ? current : "lan";
}

function renderVlanPortPicker() {
  if (!els.vlanPortPicker) return;
  els.vlanPortPicker.innerHTML = lanPortDefinitions()
    .map((port) => `<label class="port-choice"><input type="checkbox" value="${escapeHtml(port.id)}" /><span>${escapeHtml(port.label)}</span></label>`)
    .join("");
}

function selectedVlanPorts() {
  return [...els.vlanPortPicker.querySelectorAll("input:checked")].map((input) => input.value);
}

function fillVlanEditor(vlanId) {
  const model = buildLocalNetworkModel();
  const vlan = model.vlans.find((item) => String(item.vlanId) === String(vlanId));
  if (!vlan) return;
  els.vlanId.value = vlan.vlanId;
  els.vlanName.value = vlan.label.replace(/^VLAN\s+\d+\s*/, "");
  els.vlanIp.value = vlan.ipaddr;
  els.vlanMask.value = vlan.netmask;
  const vlanPool = dhcpPoolFromInputs(vlan.ipaddr, vlan.netmask, vlan.dhcp.start || "", vlan.dhcp.limit || "");
  const vlanAuto = autoDhcpPlan(vlan.ipaddr, vlan.netmask);
  els.vlanDhcpStart.value = vlanPool?.startIp || vlan.dhcp.start || "";
  els.vlanDhcpLimit.value = vlanPool?.limit || vlan.dhcp.limit || "";
  els.vlanLease.value = vlan.dhcp.leasetime || "12h";
  renderDhcpPreview(els.vlanDhcpPreview, vlanPool, vlanPool?.startOffset === vlanAuto?.startOffset && vlanPool?.endOffset === vlanAuto?.endOffset ? vlanAuto : null);
  [...els.vlanPortPicker.querySelectorAll("input")].forEach((input) => {
    input.checked = vlan.accessPorts.includes(input.value);
  });
  showToast(`Loaded VLAN ${vlan.vlanId} for editing.`, "ok");
}

function parseRoutes(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      const destination = parts[0] === "default" ? "default" : parts[0];
      const viaIndex = parts.indexOf("via");
      const devIndex = parts.indexOf("dev");
      const srcIndex = parts.indexOf("src");
      const metricIndex = parts.indexOf("metric");
      return {
        raw: line,
        destination,
        gateway: viaIndex >= 0 ? parts[viaIndex + 1] : "direct",
        interfaceName: devIndex >= 0 ? parts[devIndex + 1] : "",
        source: srcIndex >= 0 ? parts[srcIndex + 1] : "",
        metric: metricIndex >= 0 ? parts[metricIndex + 1] : "",
      };
    });
}

function buildStaticRoutes() {
  return parseUciSections(state.sections.uci_network || "", "network")
    .filter((section) => section.type === "route" || /^network\.@route/.test(section.path))
    .map((section) => ({
      id: section.path.replace(/^network\./, ""),
      name: section.values.name || section.path.replace(/^network\./, ""),
      subnet: section.values.target && section.values.netmask ? `${section.values.target}/${netmaskToPrefix(section.values.netmask)}` : section.values.target || section.values.interface || "route",
      gateway: section.values.gateway || "direct",
      interfaceName: section.values.interface || "lan",
      enabled: section.values.disabled === "1" ? "Disabled" : "Enabled",
    }));
}

function buildOutboundRules() {
  return parseUciSections(state.sections.uci_firewall || "", "firewall")
    .filter((section) => section.type === "rule" && section.path.includes("mx65_l3_"))
    .map((section) => ({
      id: section.path.replace(/^firewall\./, ""),
      policy: section.values.target === "ACCEPT" ? "Allow" : "Deny",
      protocol: section.values.proto === "all" ? "Any" : protocolLabel(section.values.proto || "all"),
      source: section.values.src_ip || "Any",
      destination: section.values.dest_ip || "Any",
      destPort: section.values.dest_port || "Any",
      comment: section.values.name || "Outbound firewall rule",
      enabled: section.values.enabled === "0" ? "Disabled" : "Enabled",
    }));
}

function buildPortVlanProfiles() {
  const byPort = {};
  lanPortDefinitions().forEach((port) => {
    byPort[port.id] = { mode: "access", accessVlan: "1", nativeVlan: "1", allowedVlans: ["1"], taggedVlans: [] };
  });
  bridgeVlanSections().forEach((vlan) => {
    vlan.ports.forEach((entry) => {
      const [portId, flags = ""] = entry.split(":");
      if (!byPort[portId]) return;
      if (flags.includes("u")) {
        byPort[portId].nativeVlan = String(vlan.id);
        byPort[portId].accessVlan = String(vlan.id);
        if (!byPort[portId].allowedVlans.includes(String(vlan.id))) byPort[portId].allowedVlans.push(String(vlan.id));
      } else if (flags.includes("t")) {
        byPort[portId].mode = "trunk";
        byPort[portId].taggedVlans.push(String(vlan.id));
        if (!byPort[portId].allowedVlans.includes(String(vlan.id))) byPort[portId].allowedVlans.push(String(vlan.id));
      }
    });
  });
  Object.values(byPort).forEach((profile) => {
    profile.allowedVlans = [...new Set(profile.allowedVlans)].sort((a, b) => Number(a) - Number(b));
    profile.taggedVlans = [...new Set(profile.taggedVlans)].sort((a, b) => Number(a) - Number(b));
  });
  return byPort;
}

function selectedPortVlanProfile() {
  const profiles = buildPortVlanProfiles();
  return profiles[state.selectedPort] || { mode: "access", accessVlan: "1", nativeVlan: "1", allowedVlans: ["1"], taggedVlans: [] };
}

function protocolLabel(value) {
  const proto = String(value || "tcp").replace(/\s+/g, " ");
  if (proto === "tcp udp" || proto === "udp tcp") return "TCP and UDP";
  return proto.toUpperCase();
}

function buildForwardingRules() {
  return parseUciSections(state.sections.uci_firewall || "", "firewall")
    .filter((section) => section.type === "redirect" && section.values.src === "wan")
    .map((section) => ({
      id: section.path.replace(/^firewall\./, ""),
      description: section.values.name || "Port forwarding rule",
      protocol: section.values.proto || "tcp",
      publicPort: section.values.src_dport || "",
      lanIp: section.values.dest_ip || "",
      localPort: section.values.dest_port || "",
      allowedIps: section.values.src_ip || "Any",
      enabled: section.values.enabled === "0" ? "Disabled" : "Enabled",
    }));
}

function fillForwardEditor(id) {
  const rule = buildForwardingRules().find((item) => item.id === id);
  if (!rule) return;
  els.forwardId.value = rule.id;
  els.forwardDescription.value = rule.description;
  els.forwardProtocol.value = /tcp udp|udp tcp/.test(rule.protocol) ? "tcpudp" : rule.protocol.includes("udp") ? "udp" : "tcp";
  els.forwardPublicPort.value = rule.publicPort;
  els.forwardLanIp.value = rule.lanIp;
  els.forwardLocalPort.value = rule.localPort;
  els.forwardAllowedIps.value = rule.allowedIps === "Any" ? "" : rule.allowedIps;
  els.forwardEnabled.value = rule.enabled === "Disabled" ? "0" : "1";
  showToast("Forwarding rule loaded for editing.", "ok");
}

function fillOutboundEditor(id) {
  const rule = buildOutboundRules().find((item) => item.id === id);
  if (!rule) return;
  els.outboundRuleId.value = rule.id;
  els.outboundPolicy.value = rule.policy === "Allow" ? "allow" : "deny";
  els.outboundProtocol.value = rule.protocol === "Any" ? "any" : rule.protocol === "TCP and UDP" ? "any" : rule.protocol.toLowerCase();
  els.outboundSource.value = rule.source === "Any" ? "" : rule.source;
  els.outboundDestination.value = rule.destination === "Any" ? "" : rule.destination;
  els.outboundDestPort.value = rule.destPort === "Any" ? "" : rule.destPort;
  els.outboundComment.value = rule.comment;
  els.outboundEnabled.value = rule.enabled === "Disabled" ? "0" : "1";
  showToast("Outbound firewall rule loaded for editing.", "ok");
}

function fillRouteEditor(id) {
  const route = buildStaticRoutes().find((item) => item.id === id);
  if (!route) return;
  els.routeId.value = route.id;
  els.routeName.value = route.name;
  els.routeSubnet.value = route.subnet;
  els.routeGateway.value = route.gateway === "direct" ? "" : route.gateway;
  els.routeInterface.value = route.interfaceName || "lan";
  els.routeEnabled.value = route.enabled === "Disabled" ? "0" : "1";
  showToast("Static route loaded for editing.", "ok");
}

function fillReservationEditor(mac) {
  const inventory = buildDeviceInventory();
  const reservation = inventory.reservations.find((item) => item.mac === mac);
  if (!reservation) return;
  els.reservationName.value = reservation.name || "";
  els.reservationMac.value = reservation.mac || "";
  els.reservationIp.value = reservation.ip || "";
  els.reservationLease.value = reservation.leasetime || "";
  showToast("DHCP reservation loaded for editing.", "ok");
}

function renderPorts() {
  const inventory = buildPortInventory();
  if (!inventory.ports.some((port) => port.id === state.selectedPort)) state.selectedPort = "lan3";
  const selected = inventory.ports.find((port) => port.id === state.selectedPort) || inventory.ports[0];
  els.portCards.innerHTML = [
    statusCard("Connected", inventory.connected, "ports with link", inventory.connected ? "ok" : "warn"),
    statusCard("Internet", inventory.connectedWan, "active uplinks", inventory.connectedWan ? "ok" : "warn"),
    statusCard("LAN", inventory.connectedLan, "active LAN ports", inventory.connectedLan ? "ok" : "warn"),
    statusCard("Activity", inventory.activityBytes ? formatBytes(inventory.activityBytes) : "idle", "since refresh", inventory.activityBytes ? "ok" : "warn"),
    statusCard("Disabled", inventory.disabled, "admin down", inventory.disabled ? "bad" : "ok"),
  ].join("");
  const internet = inventory.ports.filter((port) => port.group === "Internet").map(renderPortTile).join("");
  const lan = inventory.ports.filter((port) => port.group === "LAN").map(renderPortTile).join("");
  const frontInternet = inventory.ports.filter((port) => port.group === "Internet").map(renderFaceplatePort).join("");
  const frontLan = inventory.ports.filter((port) => port.group === "LAN").map(renderFaceplatePort).join("");
  els.mxFaceplate.innerHTML = `<div class="mx-device">
    <div class="mx-device-head">
      <div><strong>${escapeHtml(applianceModel())}</strong><span>Powered by OpenWrt</span></div>
      <div class="mx-status"><span class="status-dot ${inventory.connected ? "ok" : "warn"}"></span>${escapeHtml(inventory.connected ? "Online" : "No active links")}</div>
    </div>
    <div class="jack-bank wan-bank">${frontInternet}</div>
    <div class="jack-bank lan-bank">${frontLan}</div>
  </div>`;
  els.portMap.innerHTML = `<section class="port-group"><h3>Internet</h3><div class="port-grid internet">${internet}</div></section>
    <section class="port-group"><h3>LAN Ports</h3><div class="port-grid lan">${lan}</div></section>`;

  els.selectedPortName.textContent = selected ? portLabel(selected) : "None";
  if (selected) {
    const vlanProfile = selected.role === "LAN" ? selectedPortVlanProfile() : null;
    const clientText = selected.role === "LAN" && selected.clientsKnown ? `${selected.clients}` : selected.role === "LAN" ? "unavailable" : "WAN uplink";
    els.portDetail.innerHTML = [
      detailRow("Port", portLabel(selected)),
      detailRow("Link", selected.status),
      detailRow("Role", portRoleLabel(selected)),
      detailRow("Port type", vlanProfile ? (vlanProfile.mode === "trunk" ? "Trunk" : "Access") : "WAN"),
      detailRow("VLAN", vlanProfile ? (vlanProfile.mode === "trunk" ? `Native ${vlanProfile.nativeVlan}; allowed ${vlanProfile.allowedVlans.join(", ")}` : vlanProfile.accessVlan) : ""),
      detailRow("Network", networkLabel(selected.bridge)),
      detailRow("Address", selected.address),
      detailRow("Clients", clientText),
      detailRow("Activity", activityText(selected)),
      detailRow("RX total", formatBytes(selected.stats?.rxBytes || 0)),
      detailRow("TX total", formatBytes(selected.stats?.txBytes || 0)),
      detailRow("Errors", `${selected.stats?.rxErrors || 0} RX / ${selected.stats?.txErrors || 0} TX`),
      detailRow("MAC", selected.mac),
      detailRow("Note", selected.note?.purpose || ""),
    ].join("");
    els.portEnable.disabled = selected.adminUp;
    els.portDisable.disabled = !selected.adminUp;
    els.portNotePort.value = selected.id;
    els.portNoteLabel.value = selected.note?.label || "";
    els.portNotePurpose.value = selected.note?.purpose || "";
    if (vlanProfile) {
      els.portVlanMode.value = vlanProfile.mode;
      els.portAccessVlan.value = vlanProfile.accessVlan || "1";
      els.portNativeVlan.value = vlanProfile.nativeVlan || "1";
      els.portAllowedVlans.value = vlanProfile.allowedVlans.join(",");
      els.portVlanSummary.innerHTML = accessRow("Selected port VLAN", true, vlanProfile.mode === "trunk" ? `Trunk, native VLAN ${vlanProfile.nativeVlan}, allowed ${vlanProfile.allowedVlans.join(", ")}` : `Access VLAN ${vlanProfile.accessVlan}`);
      els.savePortVlan.disabled = false;
    } else {
      els.portVlanSummary.innerHTML = accessRow("Port VLAN", false, "WAN ports do not use LAN VLAN settings.");
      els.savePortVlan.disabled = true;
    }
  } else {
    els.portDetail.textContent = "Choose a port.";
    els.portEnable.disabled = true;
    els.portDisable.disabled = true;
    els.portVlanSummary.innerHTML = accessRow("Port VLAN", false, "Choose a LAN port.");
    els.savePortVlan.disabled = true;
  }
  const vlanProfiles = buildPortVlanProfiles();
  els.portTable.innerHTML = inventory.ports.length
    ? inventory.ports
        .map((port) => {
          const clients = port.role === "LAN" && port.clientsKnown ? `${port.clients}` : port.role === "LAN" ? "unavailable" : "WAN";
          const bridge = [port.bridge, port.address].filter(Boolean).join(" / ") || port.bridge;
          const profile = vlanProfiles[port.id];
          const vlanText = profile ? (profile.mode === "trunk" ? `Trunk, native ${profile.nativeVlan}; allowed ${profile.allowedVlans.join(", ")}` : `Access VLAN ${profile.accessVlan}`) : "WAN";
          const activity = `<div class="table-meter"><span style="width:${activityWidth(port.delta)}%"></span></div><span class="muted-text">${escapeHtml(activityText(port))}</span>`;
          return `<tr>
            <td><strong>${escapeHtml(portLabel(port))}</strong></td>
            <td>${tag(port.status, portStatusKind(port))}</td>
            <td>${activity}</td>
            <td>${escapeHtml(portRoleLabel(port))}</td>
            <td>${escapeHtml(clients)}</td>
            <td>${escapeHtml(vlanText)}</td>
            <td>${escapeHtml(networkLabel(port.bridge))}${port.address ? ` / ${escapeHtml(port.address)}` : ""}</td>
          </tr>`;
        })
        .join("")
    : tableEmpty(7, "No ports returned.");
}

function renderNetwork() {
  const rows = parseIpBrief(state.sections.ip_brief || "");
  const lan = rows.find((row) => row.id === "br-lan" || row.name === "br-lan");
  const wan = rows.find((row) => row.id === "br-wan" || row.name === "br-wan");
  const lanV4 = ipv4Addresses(lan);
  const wanV4 = ipv4Addresses(wan);
  const model = buildLocalNetworkModel();
  const routes = state.sections.routes || "";
  const defaultRoute = routes.split("\n").find((line) => line.startsWith("default")) || "";
  const networks = [
    {
      label: "Internet",
      status: wanV4.length ? "Connected" : "Needs attention",
      ok: Boolean(wanV4.length),
      gateway: wanV4[0] || "No internet address",
      pool: "upstream",
      ports: "Internet 1, Internet 2",
    },
    {
      label: model.primary.label,
      status: model.primary.ipaddr ? "Enabled" : "Needs attention",
      ok: Boolean(model.primary.ipaddr),
      gateway: model.primary.gateway || lanV4[0] || "No LAN address",
      pool: model.primary.dhcpPool,
      ports: friendlyPortList(model.primary.accessPorts),
    },
    ...model.vlans.map((vlan) => ({
      label: `VLAN ${vlan.vlanId}${vlan.label && vlan.label !== `VLAN ${vlan.vlanId}` ? ` - ${vlan.label}` : ""}`,
      status: "Enabled",
      ok: true,
      gateway: vlan.gateway,
      pool: vlan.dhcpPool,
      ports: friendlyPortList(vlan.accessPorts),
    })),
  ];
  els.interfaceCount.textContent = `${1 + model.vlans.length} local network${model.vlans.length === 0 ? "" : "s"}`;
  els.addressingCards.innerHTML = [
    statusCard("Deployment", "routed", "gateway mode", "ok"),
    statusCard("Client tracking", "MAC address", "local LAN", "ok"),
    statusCard("Primary LAN", model.primary.gateway || "missing", model.primary.dhcpPool, model.primary.gateway ? "ok" : "warn"),
    statusCard("VLANs", model.vlans.length ? `${model.vlans.length} configured` : "none", model.vlanMode ? "VLAN mode ready" : "single LAN", "ok"),
    statusCard("Default route", defaultRoute ? "present" : "missing", defaultRoute ? "internet path" : "check WAN", defaultRoute ? "ok" : "warn"),
  ].join("");
  if (!els.vlanPortPicker.innerHTML) renderVlanPortPicker();
  fillNetworkForms(model);
  updateRouteInterfaceOptions(model);
  els.interfacesTable.innerHTML = networks
    .map((item) => `<tr><td><strong>${escapeHtml(item.label)}</strong></td><td>${tag(item.status, item.ok ? "ok" : "warn")}</td><td>${escapeHtml(item.gateway)}</td><td>${escapeHtml(item.pool)}</td><td>${escapeHtml(item.ports)}</td></tr>`)
    .join("");
  els.vlanCards.innerHTML = [
    statusCard("VLAN mode", model.vlanMode ? "enabled" : "off", model.vlanMode ? "802.1Q bridge" : "single LAN", "ok"),
    statusCard("Local VLANs", model.vlans.length, "additional networks", model.vlans.length ? "ok" : "warn"),
    statusCard("Primary ports", model.primary.accessPorts.length, friendlyPortList(model.primary.accessPorts), model.primary.accessPorts.length ? "ok" : "warn"),
  ].join("");
  els.vlanTable.innerHTML = model.vlans.length
    ? model.vlans
        .map((vlan) => `<tr>
          <td><strong>${escapeHtml(vlan.vlanId)}</strong></td>
          <td>${escapeHtml(vlan.label)}</td>
          <td>${escapeHtml(vlan.gateway)}</td>
          <td>${escapeHtml(vlan.dhcpPool)}</td>
          <td>${escapeHtml(friendlyPortList(vlan.accessPorts))}</td>
          <td><div class="table-actions"><button data-vlan-edit="${escapeHtml(vlan.vlanId)}">Edit</button><button data-vlan-delete="${escapeHtml(vlan.vlanId)}">Delete</button></div></td>
        </tr>`)
        .join("")
    : tableEmpty(6, "No VLANs configured yet.");
  const gateway = defaultRoute.match(/\bvia\s+(\S+)/)?.[1] || "";
  const outbound = defaultRoute.match(/\bdev\s+(\S+)/)?.[1] || "";
  const source = defaultRoute.match(/\bsrc\s+(\S+)/)?.[1] || "";
  els.deploymentTable.innerHTML = [
    ["Deployment mode", "Routed", "Protects LAN traffic from internet-side traffic."],
    ["Client tracking", "MAC address", "Best fit when clients are directly behind this MX."],
    ["LAN mode", model.vlanMode ? "VLANs enabled" : "Single LAN", model.vlanMode ? "Primary LAN uses VLAN 1; extra VLANs use their ID." : "Add a VLAN below when you want segmented networks."],
    ["DHCP settings", "Local server", "Open DHCP page to review leases, pool, and reservations."],
    ["Static routes", defaultRoute ? "Default route present" : "No default route", defaultRoute ? `Gateway ${gateway || "detected"}` : "Check internet uplink."],
  ]
    .map(([setting, value, note]) => `<tr><td><strong>${escapeHtml(setting)}</strong></td><td>${escapeHtml(value)}</td><td>${escapeHtml(note)}</td></tr>`)
    .join("");
  els.routesOutput.innerHTML = defaultRoute
    ? [
        detailRow("Gateway", gateway || "detected"),
        detailRow("Outbound", networkLabel(outbound)),
        detailRow("Router address", source),
      ].join("")
    : accessRow("Internet route", false, "No default route detected.");
  const staticRoutes = buildStaticRoutes();
  els.staticRouteTable.innerHTML = staticRoutes.length
    ? staticRoutes
        .map((route) => `<tr>
          <td><strong>${escapeHtml(route.name)}</strong><br><span class="muted-text">${escapeHtml(networkLabel(route.interfaceName))}</span></td>
          <td>${escapeHtml(route.subnet)}</td>
          <td>${escapeHtml(route.gateway)}</td>
          <td>${tag(route.enabled, route.enabled === "Enabled" ? "ok" : "warn")}</td>
          <td><div class="table-actions"><button data-route-edit="${escapeHtml(route.id)}">Edit</button><button data-route-delete="${escapeHtml(route.id)}">Delete</button></div></td>
        </tr>`)
        .join("")
    : tableEmpty(5, "No static routes configured.");
  els.dynamicDnsStatus.innerHTML = [
    `<div class="summary-row"><strong>Local manager URL</strong><span>${escapeHtml(window.location.origin + "/mx65/")}</span></div>`,
    `<div class="summary-row"><strong>Cloud DNS</strong><span>Use Cloudflare tunnel/public hostname settings for internet-facing names.</span></div>`,
  ].join("");
  els.ifstatusOutput.textContent = [`LAN`, state.sections.lan || "No LAN detail.", "", "Internet", state.sections.wan || "No WAN detail."].join("\n");
}

function renderUciTable(target, rows, filter) {
  const filtered = rows.filter((row) => !filter || row.path.toLowerCase().includes(filter) || row.value.toLowerCase().includes(filter));
  target.innerHTML = filtered.length
    ? filtered.map((row) => `<tr><td><code>${escapeHtml(row.path)}</code></td><td>${escapeHtml(row.value)}</td></tr>`).join("")
    : tableEmpty(2, "No matching values.");
}

function renderConfig() {
  const networkRows = parseUci(state.sections.uci_network || "");
  const dhcpRows = parseUci(state.sections.uci_dhcp || "");
  const firewallRows = parseUci(state.sections.uci_firewall || "");
  state.uciRows = [...networkRows, ...dhcpRows, ...firewallRows].sort((a, b) => a.path.localeCompare(b.path));
  renderUciTable(els.firewallTable, firewallRows, els.firewallFilter.value.trim().toLowerCase());
  renderUciTable(els.dhcpTable, dhcpRows, els.dhcpFilter.value.trim().toLowerCase());
  renderUciTable(els.uciTable, state.uciRows, els.uciFilter.value.trim().toLowerCase());
}

function renderDeviceTags(items) {
  return [...items].filter(Boolean).map((item) => tag(interfaceLabel(item), "ok")).join(" ");
}

function fillDeviceNote(mac) {
  const inventory = buildDeviceInventory();
  const device = inventory.devices.find((item) => item.mac === mac);
  if (!device) return;
  els.noteMac.value = device.mac;
  els.noteLabel.value = device.label || device.hostname || "";
  els.noteModel.value = device.model || "";
  els.noteSerial.value = device.serial || "";
  els.noteRole.value = device.role || "";
  els.noteExpected.value = device.expected || "auto";
  showToast("Device note loaded.", "ok");
}

function renderDevices() {
  const inventory = buildDeviceInventory();
  const filter = els.deviceFilter.value.trim().toLowerCase();
  const lanDevices = inventory.devices.filter((device) => device.zone === "LAN" && !device.localMac);
  const issueCount = inventory.devices.filter((device) => device.issues.some((issue) => !/WAN-side|Router MAC/.test(issue))).length;
  els.deviceCards.innerHTML = [
    statusCard("Observed", inventory.devices.length, "LAN, WAN, L2", inventory.devices.length ? "ok" : "warn"),
    statusCard("LAN Devices", lanDevices.length, inventory.pool ? `${inventory.pool.start} - ${inventory.pool.end}` : inventory.lanCidr || "LAN", "ok"),
    statusCard("DHCP", inventory.leases.length, "leases", inventory.leases.length ? "ok" : "warn"),
    statusCard("Reserved", inventory.reservations.length, "static entries", inventory.reservations.length ? "ok" : "warn"),
    statusCard("Issues", issueCount, "review", issueCount ? "warn" : "ok"),
  ].join("");
  const rows = inventory.devices.filter((device) => {
    if (!filter) return true;
    const haystack = [
      device.hostname,
      device.label,
      device.mac,
      device.zone,
      device.addressMode,
      device.model,
      device.serial,
      device.role,
      [...device.ips].join(" "),
      [...device.ipv6].join(" "),
      [...device.services].join(" "),
      device.issues.join(" "),
    ].join(" ").toLowerCase();
    return haystack.includes(filter);
  });
  els.deviceTable.innerHTML = rows.length
    ? rows
        .map((device) => {
          const name = device.label || device.hostname || device.mac || "Unknown device";
          const secondary = [device.hostname && device.label ? device.hostname : "", device.zone].filter(Boolean).join(" / ");
          const ips = [...device.ips].map((ip) => `<strong>${escapeHtml(ip)}</strong>`).join("<br>") || "<span class=\"muted-text\">No IPv4 seen</span>";
          const ipv6 = [...device.ipv6].map((ip) => `<span class=\"muted-text\">${escapeHtml(ip)}</span>`).join("<br>");
          const inventoryText = [
            `Model: ${device.model || "unknown"}`,
            `Serial: ${device.serial || "unknown"}`,
            `Role: ${device.role || "unset"}`,
          ];
          const issueTags = device.issues.length
            ? device.issues.map((issue) => tag(issue, /WAN-side|Router MAC/.test(issue) ? "warn" : "bad")).join(" ")
            : tag("no issues", "ok");
          const noteButton = device.mac && !device.localMac ? `<button data-device-note="${escapeHtml(device.mac)}">Note</button>` : "";
          return `<tr class="device-row">
            <td><strong>${escapeHtml(name)}</strong>${secondary ? `<br><span class="muted-text">${escapeHtml(secondary)}</span>` : ""}</td>
            <td>${ips}${ipv6 ? `<br>${ipv6}` : ""}<br>${tag(device.addressMode, device.reservation || device.lease ? "ok" : "warn")}</td>
            <td><code>${escapeHtml(device.mac || "unknown")}</code><br><span class="muted-text">Vendor: unavailable</span></td>
            <td>${renderDeviceTags(device.services) || tag("observed", "warn")}<br><span class="muted-text">${escapeHtml([...device.interfaces].map(networkLabel).join(", ") || "no interface detail")}</span></td>
            <td>${inventoryText.map(escapeHtml).join("<br>")}<br>${noteButton}</td>
            <td>${issueTags}</td>
          </tr>`;
        })
        .join("")
    : tableEmpty(6, "No matching devices.");
}

function renderDhcpConfig() {
  if (!els.dhcpConfigCards) return;
  const inventory = buildDeviceInventory();
  const services = parseServices(state.sections.services || "");
  const dnsmasq = services.find((item) => item.name === "dnsmasq");
  const total = inventory.pool ? inventory.pool.endNum - inventory.pool.startNum + 1 : 0;
  const used = inventory.leases.length;
  const available = total ? Math.max(0, total - used) : 0;
  const percent = total ? Math.round((used / total) * 100) : 0;
  els.dhcpConfigCards.innerHTML = [
    statusCard("Client addressing", serviceStatusLabel(dnsmasq?.status), serviceEnabledLabel(dnsmasq?.enabled), serviceUp(dnsmasq) ? "ok" : "bad"),
    statusCard("Active leases", used, total ? `${percent}% of pool` : "pool not detected", used ? "ok" : "warn"),
    statusCard("Available", total ? available : "unknown", inventory.pool ? `${inventory.pool.start} - ${inventory.pool.end}` : "", total ? "ok" : "warn"),
    statusCard("Reservations", inventory.reservations.length, "fixed assignments", inventory.reservations.length ? "ok" : "warn"),
  ].join("");
  els.dhcpConfigTable.innerHTML = `<tr>
    <td><strong>LAN</strong></td>
    <td>${escapeHtml(serviceUp(dnsmasq) ? "Run a DHCP server" : "DHCP service needs attention")}</td>
    <td>${escapeHtml(inventory.pool ? `${inventory.pool.start} - ${inventory.pool.end}` : inventory.lanCidr || "not detected")}</td>
    <td>${escapeHtml(String(used))}</td>
    <td>${escapeHtml(String(inventory.reservations.length))}</td>
  </tr>`;
  els.reservationTable.innerHTML = inventory.reservations.length
    ? inventory.reservations
        .map((reservation) => `<tr>
          <td><strong>${escapeHtml(reservation.name || "Reserved device")}</strong></td>
          <td><code>${escapeHtml(reservation.mac)}</code></td>
          <td>${escapeHtml(reservation.ip)}</td>
          <td>${escapeHtml(reservation.leasetime || "default")}</td>
          <td><div class="table-actions"><button data-reservation-edit="${escapeHtml(reservation.mac)}">Edit</button><button data-reservation-delete="${escapeHtml(reservation.mac)}">Delete</button></div></td>
        </tr>`)
        .join("")
    : tableEmpty(5, "No fixed IP assignments configured.");
}

function renderRouteTable() {
  const routes = parseRoutes(state.sections.routes || "");
  const defaults = routes.filter((route) => route.destination === "default");
  els.routeCards.innerHTML = [
    statusCard("Routes", routes.length, "active entries", routes.length ? "ok" : "warn"),
    statusCard("Default route", defaults.length ? "present" : "missing", defaults[0]?.gateway || "WAN", defaults.length ? "ok" : "warn"),
    statusCard("Interfaces", new Set(routes.map((route) => route.interfaceName).filter(Boolean)).size, "used by routes", "ok"),
  ].join("");
  els.routeTable.innerHTML = routes.length
    ? routes
        .map((route) => `<tr>
          <td><strong>${escapeHtml(route.destination)}</strong></td>
          <td>${escapeHtml(route.gateway)}</td>
          <td>${escapeHtml(networkLabel(route.interfaceName))}</td>
          <td>${escapeHtml(route.source || "auto")}</td>
          <td>${escapeHtml(route.metric || "default")}</td>
        </tr>`)
        .join("")
    : tableEmpty(5, "No routes returned.");
  els.routeOutput.textContent = state.sections.routes || "No route table loaded.";
}

function renderNat() {
  const forwards = buildForwardingRules();
  const enabled = forwards.filter((rule) => rule.enabled !== "Disabled").length;
  els.natCards.innerHTML = [
    statusCard("Port forwards", forwards.length, "WAN to LAN rules", forwards.length ? "warn" : "ok"),
    statusCard("Enabled", enabled, "active inbound rules", enabled ? "warn" : "ok"),
    statusCard("Default inbound", "blocked", "unless listed below", "ok"),
  ].join("");
  els.forwardTable.innerHTML = forwards.length
    ? forwards
        .map((rule) => `<tr>
          <td><strong>${escapeHtml(rule.description)}</strong></td>
          <td>${escapeHtml(protocolLabel(rule.protocol))}</td>
          <td>${escapeHtml(rule.publicPort)}</td>
          <td>${escapeHtml(rule.lanIp)}</td>
          <td>${escapeHtml(rule.localPort)}</td>
          <td>${escapeHtml(rule.allowedIps || "Any")}</td>
          <td>${tag(rule.enabled, rule.enabled === "Enabled" ? "warn" : "ok")}</td>
          <td><div class="table-actions"><button data-forward-edit="${escapeHtml(rule.id)}">Edit</button><button data-forward-delete="${escapeHtml(rule.id)}">Delete</button></div></td>
        </tr>`)
        .join("")
    : tableEmpty(8, "No port forwarding rules configured.");
  els.oneToOneNatStatus.innerHTML = accessRow("1:1 NAT", false, "Not configured. My-Rack-E support requires extra WAN public IPs and explicit firewall policy.");
  els.oneToManyNatStatus.innerHTML = accessRow("1:Many NAT", forwards.length > 0, forwards.length ? "Represented by port forwarding rules above." : "No listener rules configured.");
}

function renderTraffic() {
  const text = state.sections.traffic_shaping || "";
  const routes = parseRoutes(state.sections.routes || "");
  const defaultRoute = routes.find((route) => route.destination === "default");
  const sqmInstalled = /sqm-scripts|luci-app-sqm/i.test(text);
  const qdiscConfigured = /cake|fq_codel|htb|hfsc/i.test(text);
  els.trafficCards.innerHTML = [
    statusCard("Internet path", defaultRoute ? "present" : "missing", defaultRoute?.gateway || "WAN", defaultRoute ? "ok" : "warn"),
    statusCard("Traffic shaping", qdiscConfigured ? "active" : "not active", sqmInstalled ? "SQM installed" : "SQM not installed", qdiscConfigured ? "ok" : "warn"),
    statusCard("VPN policy", serviceUp(serviceNamed("cloudflared")) ? "connector running" : "not running", "Cloudflare tunnel", serviceUp(serviceNamed("cloudflared")) ? "ok" : "warn"),
  ].join("");
  const rows = [
    ["Uplink selection", defaultRoute ? "Active" : "Needs attention", defaultRoute ? `${networkLabel(defaultRoute.interfaceName)} via ${defaultRoute.gateway}` : "No default route detected."],
    ["Load balancing", "Unavailable", "This My-Rack-E build powered by OpenWrt currently has one active default path; cloud-managed VPN load-balancing is not present locally."],
    ["Traffic shaping rules", qdiscConfigured ? "Active" : "Not configured", sqmInstalled ? "SQM packages are installed." : "SQM/QoS packages are not installed on this My-Rack-E appliance."],
    ["Flow preferences", "Unavailable", "Cloud-managed flow preferences require a cloud SD-WAN policy plane. Use static routes or Cloudflare routing for real paths."],
  ];
  els.trafficTable.innerHTML = rows
    .map(([setting, status, detail]) => `<tr><td><strong>${escapeHtml(setting)}</strong></td><td>${tag(status, status === "Active" ? "ok" : status === "Unavailable" || status === "Not configured" ? "warn" : "ok")}</td><td>${escapeHtml(detail)}</td></tr>`)
    .join("");
  els.trafficOutput.textContent = text || "No traffic shaping status loaded.";
}

function renderEventLog() {
  if (!els.eventLogSummary) return;
  const logs = state.sections.logs || "";
  const lines = logs.split(/\r?\n/).filter(Boolean);
  const recent = lines.slice(0, 5);
  els.eventLogSummary.innerHTML = [
    statusCard("Events", lines.length, "recent lines", lines.length ? "ok" : "warn"),
    statusCard("Source", "MX local", "router log", "ok"),
    statusCard("Detail", "collapsed", "open only when needed", "ok"),
  ].join("");
  els.eventLogOutput.textContent = logs || "No event log loaded.";
  if (recent.length) {
    els.eventLogSummary.innerHTML += `<div class="event-preview">${recent.map((line) => `<div>${escapeHtml(simplifyLogLine(line))}</div>`).join("")}</div>`;
  }
}

function simplifyLogLine(line) {
  return String(line || "")
    .replace(/\bauthpriv\.(info|notice|warn|err)\b/g, "security")
    .replace(/\bdaemon\.(info|notice|warn|err)\b/g, "service")
    .replace(/\bkern\.(info|notice|warn|err)\b/g, "system")
    .replace(/\bdropbear\[\d+\]/g, "SSH management")
    .replace(/\bdnsmasq\[\d+\]/g, "Client addressing")
    .replace(/\bodhcpd\[\d+\]/g, "IPv6 addressing")
    .replace(/\bbr-lan\b/g, "LAN")
    .replace(/\bbr-wan\b/g, "Internet")
    .replace(/\blan(\d+)\b/g, "LAN $1")
    .replace(/\bwan(\d+)\b/g, "Internet $1")
    .replace(/\blan\b/g, "LAN")
    .replace(/\bwan\b/g, "Internet")
    .replace(/for 'root'/g, "for administrator")
    .replace(/security SSH management: Auth succeeded with blank password for administrator from ([^ ]+)/g, "security: Administrator SSH login accepted from $1")
    .replace(/security SSH management: Exit \(root\) from <([^>]+)>: Disconnect received/g, "security: SSH management session closed from $1")
    .replace(/security SSH management: Child connection from ([^ ]+)/g, "security: SSH management connection from $1");
}

async function saveDeviceNote() {
  try {
    await api("device-note-save", {
      mac: els.noteMac.value.trim(),
      label: els.noteLabel.value.trim(),
      model: els.noteModel.value.trim(),
      serial: els.noteSerial.value.trim(),
      role: els.noteRole.value.trim(),
      expected: els.noteExpected.value,
    });
    showToast("Device note saved.", "ok");
    await refresh();
  } catch (error) {
    showToast(error.message, "bad");
  }
}

async function savePortNote() {
  try {
    await api("port-note-save", {
      port: els.portNotePort.value.trim(),
      label: els.portNoteLabel.value.trim(),
      purpose: els.portNotePurpose.value.trim(),
    });
    showToast("Port label saved.", "ok");
    await refresh();
  } catch (error) {
    showToast(error.message, "bad");
  }
}

async function runPortAction(action) {
  const inventory = buildPortInventory();
  const selected = inventory.ports.find((port) => port.id === state.selectedPort);
  if (!selected) return;
  if (action === "disable") {
    const warning = selected.connected
      ? `Disable ${portLabel(selected)}? If this is your current cable, access can drop.`
      : `Disable ${portLabel(selected)}?`;
    if (!window.confirm(warning)) return;
  }
  try {
    showToast(`${action === "enable" ? "Enabling" : "Disabling"} ${portLabel(selected)}...`);
    const output = await api("port-action", { port: selected.id, action });
    showToast(output.trim() || "Port updated.", "ok");
    await refresh();
  } catch (error) {
    showToast(error.message, "bad");
  }
}

async function saveLanNetwork() {
  const normalized = setGatewayFields(els.lanIp, els.lanMask);
  const ipaddr = normalized?.ipaddr || els.lanIp.value.trim();
  const dhcpPool = dhcpPoolFromInputs(ipaddr, els.lanMask.value, els.lanDhcpStart.value, els.lanDhcpLimit.value);
  if (!dhcpPool) {
    showToast("Set a valid DHCP client range inside the selected subnet.", "bad");
    updateDhcpPreview(els.lanIp, els.lanMask, els.lanDhcpStart, els.lanDhcpLimit, els.lanDhcpPreview);
    return;
  }
  const currentIp = buildLocalNetworkModel().primary.ipaddr;
  const message = ipaddr && ipaddr !== currentIp
    ? `Save Primary LAN gateway as ${ipaddr}${normalized?.cidr ? ` for ${normalized.cidr}` : ""}? DHCP clients will use ${dhcpPool.startIp} - ${dhcpPool.endIp}. This page will move to https://${ipaddr}/mx65/ after the MX reloads.`
    : `Save Primary LAN with DHCP clients ${dhcpPool.startIp} - ${dhcpPool.endIp}?`;
  if (!window.confirm(message)) return;
  try {
    showToast("Saving Primary LAN...");
    const output = await api("network-lan-save", {
      ipaddr,
      netmask: els.lanMask.value,
      dhcp_start: String(dhcpPool.startOffset),
      dhcp_limit: String(dhcpPool.limit),
      leasetime: els.lanLease.value.trim(),
    });
    els.networkOutput.textContent = output;
    const nextUrl = output.match(/^next_url=(\S+)/m)?.[1] || "";
    showToast(nextUrl ? `Saved. Reconnect at ${nextUrl}` : "Primary LAN saved.", "ok");
    if (!nextUrl || nextUrl.includes(window.location.hostname)) window.setTimeout(refresh, 4500);
  } catch (error) {
    els.networkOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function saveVlanNetwork() {
  const normalized = setGatewayFields(els.vlanIp, els.vlanMask);
  const ipaddr = normalized?.ipaddr || els.vlanIp.value.trim();
  const dhcpPool = dhcpPoolFromInputs(ipaddr, els.vlanMask.value, els.vlanDhcpStart.value, els.vlanDhcpLimit.value);
  if (!dhcpPool) {
    showToast("Set a valid DHCP client range inside the selected VLAN subnet.", "bad");
    updateDhcpPreview(els.vlanIp, els.vlanMask, els.vlanDhcpStart, els.vlanDhcpLimit, els.vlanDhcpPreview);
    return;
  }
  const vlanId = els.vlanId.value.trim();
  const ports = selectedVlanPorts();
  const activePorts = buildPortInventory().ports.filter((port) => port.role === "LAN" && port.connected).map((port) => port.id);
  const movingActivePorts = ports.filter((port) => activePorts.includes(port));
  const warning = movingActivePorts.length
    ? `Save VLAN ${vlanId} with DHCP clients ${dhcpPool.startIp} - ${dhcpPool.endIp} and move ${movingActivePorts.map(interfaceLabel).join(", ")} into it? If your Mac is on one of those ports, reconnect on that VLAN or another Primary LAN port.`
    : `Save VLAN ${vlanId} with DHCP clients ${dhcpPool.startIp} - ${dhcpPool.endIp}?`;
  if (!window.confirm(warning)) return;
  try {
    showToast(`Saving VLAN ${vlanId}...`);
    const output = await api("network-vlan-save", {
      vlan_id: vlanId,
      label: els.vlanName.value.trim(),
      ipaddr,
      netmask: els.vlanMask.value,
      dhcp_start: String(dhcpPool.startOffset),
      dhcp_limit: String(dhcpPool.limit),
      leasetime: els.vlanLease.value.trim(),
      ports: ports.join(","),
    });
    els.networkOutput.textContent = output;
    showToast(`VLAN ${vlanId} saved. Reloading network services.`, "ok");
    window.setTimeout(refresh, 6500);
  } catch (error) {
    els.networkOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function deleteVlanNetwork(vlanId) {
  if (!window.confirm(`Delete VLAN ${vlanId}? Its ports return to Primary LAN after network reload.`)) return;
  try {
    showToast(`Deleting VLAN ${vlanId}...`);
    const output = await api("network-vlan-delete", { vlan_id: vlanId });
    els.networkOutput.textContent = output;
    showToast(`VLAN ${vlanId} deleted.`, "ok");
    window.setTimeout(refresh, 6500);
  } catch (error) {
    els.networkOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function savePortVlanSettings() {
  const selected = buildPortInventory().ports.find((port) => port.id === state.selectedPort);
  if (!selected || selected.role !== "LAN") {
    showToast("Choose a LAN port first.", "bad");
    return;
  }
  const mode = els.portVlanMode.value;
  const configuredVlans = vlanIdsConfigured();
  if (mode === "access") {
    const accessVlan = els.portAccessVlan.value.trim();
    if (!configuredVlans.has(accessVlan)) {
      showToast("Access VLAN must already exist in Addressing & VLANs.", "bad");
      return;
    }
  } else {
    const nativeVlan = els.portNativeVlan.value.trim();
    if (!configuredVlans.has(nativeVlan)) {
      showToast("Native VLAN must already exist in Addressing & VLANs.", "bad");
      return;
    }
    const allowed = (els.portAllowedVlans.value.trim() || nativeVlan).split(",").map((item) => item.trim()).filter(Boolean);
    if (!allowed.includes(nativeVlan)) allowed.unshift(nativeVlan);
    const missing = allowed.filter((vlan) => !configuredVlans.has(vlan));
    if (missing.length) {
      showToast(`Allowed VLAN ${missing[0]} is not configured in Addressing & VLANs.`, "bad");
      return;
    }
    els.portAllowedVlans.value = [...new Set(allowed)].join(",");
  }
  const summary = mode === "trunk"
    ? `set ${portLabel(selected)} as trunk, native VLAN ${els.portNativeVlan.value.trim()}, allowed VLANs ${els.portAllowedVlans.value.trim() || "none"}`
    : `set ${portLabel(selected)} as access VLAN ${els.portAccessVlan.value.trim()}`;
  const activeWarning = selected.connected ? " If this is your current cable, access can move immediately after reload." : "";
  if (!window.confirm(`Save port VLAN settings and ${summary}?${activeWarning}`)) return;
  try {
    showToast("Saving port VLAN settings...");
    const output = await api("port-vlan-save", {
      port: selected.id,
      mode,
      access_vlan: els.portAccessVlan.value.trim(),
      native_vlan: els.portNativeVlan.value.trim(),
      allowed_vlans: els.portAllowedVlans.value.trim(),
    });
    els.networkOutput.textContent = output;
    showToast("Port VLAN settings saved. Reloading network services.", "ok");
    window.setTimeout(refresh, 6500);
  } catch (error) {
    els.networkOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function saveStaticRoute() {
  const name = els.routeName.value.trim();
  const subnet = els.routeSubnet.value.trim();
  const gateway = els.routeGateway.value.trim();
  if (!name || !subnet || !gateway) {
    showToast("Route name, subnet, and gateway are required.", "bad");
    return;
  }
  const baseCheck = networkCidrIsBase(subnet);
  if (!baseCheck) {
    showToast("Route subnet must be CIDR, for example 10.99.0.0/24.", "bad");
    return;
  }
  if (baseCheck !== true) {
    showToast(`Route subnet must use the network address. Use ${baseCheck}.`, "bad");
    return;
  }
  if (localNetworks().some((network) => cidrOverlaps(subnet, cidrFromIpMask(network.ipaddr, network.netmask)))) {
    showToast("Route subnet overlaps a directly connected LAN or VLAN.", "bad");
    return;
  }
  const routeNetwork = localNetworks().find((network) => network.name === els.routeInterface.value);
  const nextHopStatus = routeNetwork ? hostStatusInNetwork(gateway, routeNetwork) : "outside";
  if (nextHopStatus !== "host") {
    showToast("Next hop IP must be a usable host on the selected LAN/VLAN.", "bad");
    return;
  }
  if (!window.confirm(`Save static route ${subnet} via ${gateway}?`)) return;
  try {
    showToast("Saving static route...");
    const output = await api("route-save", {
      id: els.routeId.value.trim(),
      name,
      subnet,
      gateway,
      interface: els.routeInterface.value,
      enabled: els.routeEnabled.value,
    });
    els.networkOutput.textContent = output;
    showToast("Static route saved. Reloading network services.", "ok");
    els.routeId.value = "";
    window.setTimeout(refresh, 6500);
  } catch (error) {
    els.networkOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function deleteStaticRoute(id) {
  const route = buildStaticRoutes().find((item) => item.id === id);
  if (!window.confirm(`Delete static route "${route?.name || id}"?`)) return;
  try {
    showToast("Deleting static route...");
    const output = await api("route-delete", { id });
    els.networkOutput.textContent = output;
    showToast("Static route deleted.", "ok");
    window.setTimeout(refresh, 6500);
  } catch (error) {
    els.networkOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function saveReservation() {
  const mac = els.reservationMac.value.trim();
  const ipaddr = els.reservationIp.value.trim();
  if (!mac || !ipaddr) {
    showToast("MAC address and IP address are required.", "bad");
    return;
  }
  const hostCheck = localHostCheck(ipaddr);
  if (!hostCheck.ok) {
    showToast("Fixed IP must be a usable address inside a configured LAN or VLAN, not the gateway.", "bad");
    return;
  }
  const pool = dhcpPoolForNetwork(hostCheck.network);
  if (ipInPool(ipaddr, pool)) {
    showToast("Fixed IP is inside the dynamic DHCP pool. Use the reserved space outside the client pool.", "bad");
    return;
  }
  if (!window.confirm(`Reserve ${ipaddr} for ${mac}?`)) return;
  try {
    showToast("Saving fixed IP assignment...");
    await api("reservation-save", {
      hostname: els.reservationName.value.trim(),
      mac,
      ipaddr,
      leasetime: els.reservationLease.value.trim(),
    });
    showToast("Fixed IP assignment saved.", "ok");
    await refresh();
  } catch (error) {
    showToast(error.message, "bad");
  }
}

async function deleteReservation(mac) {
  if (!window.confirm(`Delete fixed IP assignment for ${mac}?`)) return;
  try {
    showToast("Deleting fixed IP assignment...");
    await api("reservation-delete", { mac });
    showToast("Fixed IP assignment deleted.", "ok");
    await refresh();
  } catch (error) {
    showToast(error.message, "bad");
  }
}

async function saveOutboundRule() {
  const comment = els.outboundComment.value.trim();
  if (!comment) {
    showToast("Outbound rule comment is required.", "bad");
    return;
  }
  if (!window.confirm(`Save outbound firewall rule "${comment}"?`)) return;
  try {
    showToast("Saving outbound firewall rule...");
    const output = await api("outbound-rule-save", {
      id: els.outboundRuleId.value.trim(),
      comment,
      policy: els.outboundPolicy.value,
      protocol: els.outboundProtocol.value,
      src_cidr: els.outboundSource.value.trim(),
      dest_cidr: els.outboundDestination.value.trim(),
      dest_port: els.outboundDestPort.value.trim(),
      enabled: els.outboundEnabled.value,
    });
    els.securityOutput.textContent = output;
    showToast("Outbound firewall rule saved.", "ok");
    els.outboundRuleId.value = "";
    await refresh();
  } catch (error) {
    els.securityOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function deleteOutboundRule(id) {
  const rule = buildOutboundRules().find((item) => item.id === id);
  if (!window.confirm(`Delete outbound firewall rule "${rule?.comment || id}"?`)) return;
  try {
    showToast("Deleting outbound firewall rule...");
    await api("outbound-rule-delete", { id });
    showToast("Outbound firewall rule deleted.", "ok");
    await refresh();
  } catch (error) {
    showToast(error.message, "bad");
  }
}

async function saveForwardingRule() {
  const description = els.forwardDescription.value.trim();
  const publicPort = els.forwardPublicPort.value.trim();
  const lanIp = els.forwardLanIp.value.trim();
  if (!description || !publicPort || !lanIp) {
    showToast("Description, public port, and LAN host IP are required.", "bad");
    return;
  }
  const publicSpan = portRangeSpan(publicPort);
  const localSpan = portRangeSpan(els.forwardLocalPort.value.trim() || publicPort);
  if (!publicSpan || !localSpan || publicSpan !== localSpan) {
    showToast("Public and local port ranges must be valid and the same size.", "bad");
    return;
  }
  const hostCheck = localHostCheck(lanIp);
  if (!hostCheck.ok) {
    showToast("Forwarding LAN host IP must be a usable host inside a configured LAN or VLAN.", "bad");
    return;
  }
  const pool = dhcpPoolForNetwork(hostCheck.network);
  if (ipInPool(lanIp, pool) && !reservationForIp(lanIp)) {
    showToast("Forwarding target is inside the dynamic DHCP pool. Add a fixed IP assignment first or use reserved space.", "bad");
    return;
  }
  if (!window.confirm(`Save forwarding rule "${description}"? This exposes ${publicPort} on the WAN to ${lanIp}.`)) return;
  try {
    showToast("Saving forwarding rule...");
    const output = await api("port-forward-save", {
      id: els.forwardId.value.trim(),
      description,
      protocol: els.forwardProtocol.value,
      public_port: publicPort,
      lan_ip: lanIp,
      local_port: els.forwardLocalPort.value.trim() || publicPort,
      allowed_ips: els.forwardAllowedIps.value.trim(),
      enabled: els.forwardEnabled.value,
    });
    showToast("Forwarding rule saved.", "ok");
    els.securityOutput.textContent = output;
    els.forwardId.value = "";
    await refresh();
  } catch (error) {
    showToast(error.message, "bad");
  }
}

async function deleteForwardingRule(id) {
  const rule = buildForwardingRules().find((item) => item.id === id);
  if (!window.confirm(`Delete forwarding rule "${rule?.description || id}"?`)) return;
  try {
    showToast("Deleting forwarding rule...");
    await api("port-forward-delete", { id });
    showToast("Forwarding rule deleted.", "ok");
    await refresh();
  } catch (error) {
    showToast(error.message, "bad");
  }
}

function renderAll() {
  renderHealth();
  renderApplianceStatus();
  renderAccess();
  renderSecurity();
  renderServices();
  renderPorts();
  renderNetwork();
  renderRouteTable();
  renderNat();
  renderTraffic();
  renderDevices();
  renderDhcpConfig();
  renderEventLog();
  renderConfig();
  els.logOutput.textContent = state.sections.logs || "No logs loaded.";
  els.firewallOutput.textContent = state.sections.fw_check || "No firewall check output.";
}

function renderManagerStatus(text) {
  const sections = splitSections(text);
  let manifest = {};
  try {
    manifest = JSON.parse(sections.manager || "{}");
  } catch {
    manifest = {};
  }
  const verify = sections.manager_verify || "";
  const failed = /FAILED|MISSING|missing/i.test(verify);
  const files = Array.isArray(manifest.files) ? manifest.files.length : 0;
  els.managerCards.innerHTML = [
    statusCard("Version", manifest.version || "unknown", "", manifest.version ? "ok" : "warn"),
    statusCard("Files", files, "", files ? "ok" : "warn"),
    statusCard("Verify", failed ? "check output" : "passed", "", failed ? "bad" : "ok"),
  ].join("");
  els.managerOutput.textContent = text;
}

function renderTunnelStatus(text) {
  const lower = text.toLowerCase();
  const binaryOk = lower.includes("cloudflared version");
  const serviceOk = lower.includes("running");
  const enabled = lower.includes("enabled");
  const connected = lower.includes("registered tunnel connection") || lower.includes("connection") || lower.includes("starting tunnel");
  els.tunnelCards.innerHTML = [
    statusCard("Binary", binaryOk ? "installed" : "missing", binaryOk ? text.match(/cloudflared version[^\n]*/i)?.[0] || "" : "", binaryOk ? "ok" : "bad"),
    statusCard("Service", serviceOk ? "running" : "stopped", enabled ? "enabled" : "check startup", serviceOk ? "ok" : "warn"),
    statusCard("Cloudflare", connected ? "connected" : "check logs", connected ? "activity seen" : "no connection evidence", connected ? "ok" : "warn"),
  ].join("");
}

async function refresh() {
  try {
    showToast("Loading router status...");
    const previousStats = state.portStats || {};
    const text = await api("snapshot");
    state.sections = splitSections(text);
    state.portStats = parsePortStats(state.sections.port_stats || "");
    state.portStatsDelta = portStatsDelta(previousStats, state.portStats);
    renderAll();
    els.statusMeta.textContent = `Checked ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    showToast("Router status loaded.", "ok");
  } catch (error) {
    showToast(error.message, "bad");
  }
}

function togglePortLive() {
  if (state.portLiveTimer) {
    window.clearInterval(state.portLiveTimer);
    state.portLiveTimer = 0;
    els.portLive.classList.remove("primary");
    els.portLive.textContent = "Live";
    showToast("Live port refresh off.", "ok");
    return;
  }
  state.portLiveTimer = window.setInterval(refresh, 10000);
  els.portLive.classList.add("primary");
  els.portLive.textContent = "Live On";
  refresh();
  showToast("Live port refresh every 10 seconds.", "ok");
}

async function runDiagnostic(kind) {
  try {
    const output = await api("diag", { kind, target: els.diagTarget.value.trim() });
    els.diagOutput.textContent = output;
    els.diagSummary.innerHTML = diagnosticSummary(kind, output);
    if (kind === "logs") {
      els.logOutput.textContent = output;
      els.eventLogOutput.textContent = output;
      els.eventLogSummary.innerHTML = diagnosticSummary(kind, output);
    }
    if (kind === "firewall-check") els.firewallOutput.textContent = output;
    if (els.liveToolsStatus) els.liveToolsStatus.innerHTML = diagnosticSummary(kind, output);
    const labels = { ping: "Ping", nslookup: "DNS", routes: "Routes", logs: "Logs", "firewall-check": "Rules check" };
    showToast(`${labels[kind] || kind} completed.`, "ok");
  } catch (error) {
    els.diagOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

function diagnosticSummary(kind, output) {
  const text = String(output || "");
  if (kind === "ping") {
    const ok = /bytes from|0\.0% packet loss/i.test(text) && !/100% packet loss|bad address|unknown host/i.test(text);
    return accessRow("Ping", ok, ok ? "Target is reachable from the MX." : "Target did not respond from the MX.");
  }
  if (kind === "nslookup") {
    const ok = /Address|Name|answer/i.test(text) && !/can't resolve|server failure|not found/i.test(text);
    return accessRow("DNS", ok, ok ? "Name lookup returned a result." : "Name lookup needs review.");
  }
  if (kind === "routes") {
    const ok = /^default\b/m.test(text);
    return accessRow("Internet path", ok, ok ? "A default internet path is present." : "No default internet path was reported.");
  }
  if (kind === "logs") {
    return accessRow("Recent events", Boolean(text.trim()), text.trim() ? "Events loaded. Open Advanced details only if you need the raw lines." : "No recent events returned.");
  }
  if (kind === "firewall-check") {
    const ok = /passes|ok/i.test(cleanFw4Output(text)) && !/fail|error/i.test(text);
    return accessRow("Firewall rules", ok, ok ? "Rules validated successfully." : "Rules need review.");
  }
  return accessRow("Check complete", true, "Advanced details are available below.");
}

async function runService(service, action) {
  try {
    const output = await api("service", { service, action });
    if (service === "cloudflared") {
      els.tunnelOutput.textContent = output;
      await tunnelStatus();
    }
    showToast(`${serviceLabel(service)} ${action} completed.`, "ok");
    await refresh();
  } catch (error) {
    showToast(error.message, "bad");
  }
}

async function securityStatus() {
  try {
    const output = await api("security-status");
    renderSecurity(output);
    showToast("Security status loaded.", "ok");
  } catch (error) {
    els.securityOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function securityApply() {
  if (!window.confirm("Apply the hardened firewall baseline? A firewall backup is saved first, LAN access stays enabled, and the rules are checked before reload.")) return;
  try {
    showToast("Applying firewall baseline...");
    const output = await api("security-apply");
    renderSecurity(output);
    showToast(/result=failed/i.test(output) ? "Firewall baseline failed; check output." : "Firewall baseline applied.", /result=failed/i.test(output) ? "bad" : "ok");
    await refresh();
  } catch (error) {
    els.securityOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function securityRollback() {
  if (!window.confirm("Restore the latest firewall security backup? This may undo hardening changes.")) return;
  try {
    showToast("Restoring firewall backup...");
    const output = await api("security-rollback");
    renderSecurity(output);
    showToast(/result=failed/i.test(output) ? "Firewall restore failed; check output." : "Firewall backup restored.", /result=failed/i.test(output) ? "bad" : "ok");
    await refresh();
  } catch (error) {
    els.securityOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function tunnelStatus() {
  try {
    const output = await api("cloudflared");
    els.tunnelOutput.textContent = output;
    renderTunnelStatus(output);
    showToast("Cloudflare status loaded.", "ok");
  } catch (error) {
    els.tunnelOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function managerStatus() {
  try {
    const output = await api("manager");
    renderManagerStatus(output);
    showToast("Manager verified.", "ok");
  } catch (error) {
    els.managerOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

async function managerRollback() {
  if (!window.confirm("Restore the latest saved manager backup?")) return;
  try {
    els.managerOutput.textContent = await api("manager-rollback");
    showToast("Manager rollback completed.", "ok");
    await managerStatus();
  } catch (error) {
    els.managerOutput.textContent = error.message;
    showToast(error.message, "bad");
  }
}

function bindNav() {
  document.querySelectorAll(".nav").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`[data-panel-id="${button.dataset.panel}"]`)?.classList.add("active");
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });
}

function goToPanel(panelId) {
  const button = document.querySelector(`.nav[data-panel="${panelId}"]`);
  if (button) button.click();
}

function applyInitialPanel() {
  const panelId = new URLSearchParams(window.location.search).get("panel");
  if (panelId && /^[A-Za-z0-9_-]+$/.test(panelId) && document.querySelector(`[data-panel-id="${panelId}"]`)) {
    goToPanel(panelId);
  }
}

function bindActions() {
  els.saveToken.addEventListener("click", saveToken);
  els.refresh.addEventListener("click", refresh);
  els.securityStatus.addEventListener("click", securityStatus);
  els.securityApply.addEventListener("click", securityApply);
  els.securityRollback.addEventListener("click", securityRollback);
  els.portLive.addEventListener("click", togglePortLive);
  els.refreshPorts.addEventListener("click", refresh);
  els.refreshNetwork.addEventListener("click", refresh);
  const normalizeLanAddressing = () => {
    setGatewayFields(els.lanIp, els.lanMask);
    applyAutoDhcpPlan(els.lanIp, els.lanMask, els.lanDhcpStart, els.lanDhcpLimit, els.lanDhcpPreview);
  };
  const normalizeVlanAddressing = () => {
    setGatewayFields(els.vlanIp, els.vlanMask);
    applyAutoDhcpPlan(els.vlanIp, els.vlanMask, els.vlanDhcpStart, els.vlanDhcpLimit, els.vlanDhcpPreview);
  };
  ["blur", "change", "focusout"].forEach((eventName) => els.lanIp.addEventListener(eventName, normalizeLanAddressing));
  ["blur", "change", "focusout"].forEach((eventName) => els.vlanIp.addEventListener(eventName, normalizeVlanAddressing));
  els.lanIp.addEventListener("input", () => scheduleCidrNormalization("lanAddressTimer", els.lanIp, els.lanMask, els.lanDhcpStart, els.lanDhcpLimit, els.lanDhcpPreview));
  els.vlanIp.addEventListener("input", () => scheduleCidrNormalization("vlanAddressTimer", els.vlanIp, els.vlanMask, els.vlanDhcpStart, els.vlanDhcpLimit, els.vlanDhcpPreview));
  els.lanMask.addEventListener("change", normalizeLanAddressing);
  els.vlanMask.addEventListener("change", normalizeVlanAddressing);
  els.lanDhcpStart.addEventListener("input", () => updateDhcpPreview(els.lanIp, els.lanMask, els.lanDhcpStart, els.lanDhcpLimit, els.lanDhcpPreview));
  els.lanDhcpLimit.addEventListener("input", () => updateDhcpPreview(els.lanIp, els.lanMask, els.lanDhcpStart, els.lanDhcpLimit, els.lanDhcpPreview));
  els.vlanDhcpStart.addEventListener("input", () => updateDhcpPreview(els.vlanIp, els.vlanMask, els.vlanDhcpStart, els.vlanDhcpLimit, els.vlanDhcpPreview));
  els.vlanDhcpLimit.addEventListener("input", () => updateDhcpPreview(els.vlanIp, els.vlanMask, els.vlanDhcpStart, els.vlanDhcpLimit, els.vlanDhcpPreview));
  els.lanAutoDhcp.addEventListener("click", () => applyAutoDhcpPlan(els.lanIp, els.lanMask, els.lanDhcpStart, els.lanDhcpLimit, els.lanDhcpPreview));
  els.vlanAutoDhcp.addEventListener("click", () => applyAutoDhcpPlan(els.vlanIp, els.vlanMask, els.vlanDhcpStart, els.vlanDhcpLimit, els.vlanDhcpPreview));
  els.saveLan.addEventListener("click", saveLanNetwork);
  els.saveVlan.addEventListener("click", saveVlanNetwork);
  els.saveForward.addEventListener("click", saveForwardingRule);
  els.savePortVlan.addEventListener("click", savePortVlanSettings);
  els.saveRoute.addEventListener("click", saveStaticRoute);
  els.saveReservation.addEventListener("click", saveReservation);
  els.saveOutboundRule.addEventListener("click", saveOutboundRule);
  els.portEnable.addEventListener("click", () => runPortAction("enable"));
  els.portDisable.addEventListener("click", () => runPortAction("disable"));
  els.savePortNote.addEventListener("click", savePortNote);
  els.refreshDevices.addEventListener("click", refresh);
  els.refreshDhcpConfig.addEventListener("click", refresh);
  els.deviceFilter.addEventListener("input", renderDevices);
  els.saveDeviceNote.addEventListener("click", saveDeviceNote);
  els.tunnelStatus.addEventListener("click", tunnelStatus);
  els.managerStatus.addEventListener("click", managerStatus);
  els.managerRollback.addEventListener("click", managerRollback);
  els.firewallFilter.addEventListener("input", renderConfig);
  els.dhcpFilter.addEventListener("input", renderConfig);
  els.uciFilter.addEventListener("input", renderConfig);
  document.querySelectorAll("[data-diag]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.diagSource === "quick" && els.quickDiagTarget) els.diagTarget.value = els.quickDiagTarget.value.trim();
    runDiagnostic(button.dataset.diag);
  }));
  document.querySelectorAll("[data-service]").forEach((button) => button.addEventListener("click", () => runService(button.dataset.service, button.dataset.action)));
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-goto-panel]");
    if (button) goToPanel(button.dataset.gotoPanel);
    const portButton = event.target.closest("[data-port-select]");
    if (portButton) {
      state.selectedPort = portButton.dataset.portSelect;
      renderPorts();
    }
    const vlanEdit = event.target.closest("[data-vlan-edit]");
    if (vlanEdit) {
      fillVlanEditor(vlanEdit.dataset.vlanEdit);
      goToPanel("network");
    }
    const vlanDelete = event.target.closest("[data-vlan-delete]");
    if (vlanDelete) deleteVlanNetwork(vlanDelete.dataset.vlanDelete);
    const routeEdit = event.target.closest("[data-route-edit]");
    if (routeEdit) {
      fillRouteEditor(routeEdit.dataset.routeEdit);
      goToPanel("network");
    }
    const routeDelete = event.target.closest("[data-route-delete]");
    if (routeDelete) deleteStaticRoute(routeDelete.dataset.routeDelete);
    const reservationEdit = event.target.closest("[data-reservation-edit]");
    if (reservationEdit) {
      fillReservationEditor(reservationEdit.dataset.reservationEdit);
      goToPanel("dhcpConfig");
    }
    const reservationDelete = event.target.closest("[data-reservation-delete]");
    if (reservationDelete) deleteReservation(reservationDelete.dataset.reservationDelete);
    const outboundEdit = event.target.closest("[data-outbound-edit]");
    if (outboundEdit) {
      fillOutboundEditor(outboundEdit.dataset.outboundEdit);
      goToPanel("security");
    }
    const outboundDelete = event.target.closest("[data-outbound-delete]");
    if (outboundDelete) deleteOutboundRule(outboundDelete.dataset.outboundDelete);
    const forwardEdit = event.target.closest("[data-forward-edit]");
    if (forwardEdit) {
      fillForwardEditor(forwardEdit.dataset.forwardEdit);
      goToPanel("nat");
    }
    const forwardDelete = event.target.closest("[data-forward-delete]");
    if (forwardDelete) deleteForwardingRule(forwardDelete.dataset.forwardDelete);
    const noteButton = event.target.closest("[data-device-note]");
    if (noteButton) fillDeviceNote(noteButton.dataset.deviceNote);
  });
}

function init() {
  els.token.value = token();
  bindNav();
  bindActions();
  renderVlanPortPicker();
  renderAll();
  applyInitialPanel();
  if (token()) {
    api("session", {}, { tokenOverride: token(), skipCsrf: true })
      .then(() => {
        clearLegacyBrowserToken();
        els.token.value = "";
        return refresh();
      })
      .catch(() => refresh());
  } else {
    refresh();
  }
}

init();

"use strict";

const token = document.querySelector('meta[name="mx65-token"]').content;

const els = {
  status: document.getElementById("status"),
  profileSelect: document.getElementById("profileSelect"),
  profileState: document.getElementById("profileState"),
  liveProfiles: document.getElementById("liveProfiles"),
  bundleState: document.getElementById("bundleState"),
  diskList: document.getElementById("diskList"),
  formatDisk: document.getElementById("formatDisk"),
  formatPhrase: document.getElementById("formatPhrase"),
  formatState: document.getElementById("formatState"),
  volumeList: document.getElementById("volumeList"),
  usbPath: document.getElementById("usbPath"),
  usbState: document.getElementById("usbState"),
  overwrite: document.getElementById("overwrite"),
  downloadBundle: document.getElementById("downloadBundle"),
  refreshDisks: document.getElementById("refreshDisks"),
  formatUsb: document.getElementById("formatUsb"),
  inspectUsb: document.getElementById("inspectUsb"),
  copyUsb: document.getElementById("copyUsb"),
  verifyUsb: document.getElementById("verifyUsb"),
  resultLog: document.getElementById("resultLog"),
  guideStepDownload: document.getElementById("guideStepDownload"),
  guideStepFormat: document.getElementById("guideStepFormat"),
  guideStepCopy: document.getElementById("guideStepCopy"),
  guideStepVerify: document.getElementById("guideStepVerify"),
};

const state = {
  deviceProfiles: [],
  selectedProfileId: "meraki_mx65",
  liveProfileCheck: null,
  bundle: null,
  formatDisks: [],
  formatResult: null,
  volumeInfo: null,
  stageResult: null,
  usbCheck: null,
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "X-MX65-Token": token,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json();
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return payload;
}

function setStatus(text, kind = "") {
  els.status.textContent = text;
  els.status.className = `status ${kind}`;
}

function setResult(el, text, kind = "") {
  el.textContent = text;
  el.className = `result ${kind}`;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return "unknown size";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} GB`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} MB`;
  return `${value} bytes`;
}

function bundleFiles() {
  return state.bundle?.files || [];
}

function bundlePaths() {
  return bundleFiles().map((item) => item.path).filter(Boolean);
}

function bundleNames() {
  return bundleFiles().map((item) => item.name).filter(Boolean);
}

function selectedProfile() {
  return state.deviceProfiles.find((profile) => profile.id === state.selectedProfileId) || state.deviceProfiles[0] || null;
}

function profileSupportsStockUsb(profile = selectedProfile()) {
  return Boolean(profile?.conversion?.stock_usb?.supported);
}

function renderProfileOptions() {
  if (!els.profileSelect) return;
  if (!state.deviceProfiles.length) {
    els.profileSelect.innerHTML = '<option value="meraki_mx65">Cisco Meraki MX65</option>';
    return;
  }
  els.profileSelect.innerHTML = state.deviceProfiles
    .map((profile) => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.display_name || profile.id)}</option>`)
    .join("");
  els.profileSelect.value = state.selectedProfileId;
}

function renderProfileState() {
  if (!els.profileState) return;
  const profile = selectedProfile();
  if (!profile) {
    els.profileState.textContent = "No device profile loaded.";
    els.profileState.className = "profile-state bad";
    els.downloadBundle.disabled = true;
    return;
  }
  const conversion = profile.conversion?.stock_usb || {};
  const official = state.liveProfileCheck?.profiles?.find((item) => item.id === profile.id);
  const pieces = [
    profile.status === "certified" ? "Certified" : "Recognized",
    profile.openwrt_profile || profile.id,
    official ? (official.official_sysupgrade ? "official sysupgrade found" : "no official sysupgrade") : "local profile",
  ];
  if (profileSupportsStockUsb(profile)) {
    els.profileState.textContent = `${pieces.join(" / ")}. USB conversion is enabled.`;
    els.profileState.className = "profile-state";
    els.downloadBundle.disabled = false;
  } else {
    els.profileState.textContent = `${pieces.join(" / ")}. USB conversion is blocked until this model is verified.`;
    els.profileState.className = "profile-state warn";
    els.downloadBundle.disabled = true;
  }
  if (conversion.blocked_reason) {
    els.profileState.textContent = conversion.blocked_reason;
  }
}

function renderVolumes(volumes) {
  if (!volumes.length) {
    els.volumeList.innerHTML = "";
    return;
  }
  els.volumeList.innerHTML = volumes
    .map((volume) => `<button class="volume-chip" type="button" data-volume="${escapeHtml(volume.path)}">${escapeHtml(volume.name)}</button>`)
    .join("");
}

function renderFormatDisks(disks, error = "") {
  state.formatDisks = disks;
  if (!disks.length) {
    els.diskList.innerHTML = "";
    const message = error ? `macOS blocked disk discovery:\n${error}` : "No removable external USB disks found.";
    setResult(els.formatState, message, "warn");
    return;
  }
  els.diskList.innerHTML = disks
    .map((disk) => {
      const names = (disk.partitions || [])
        .map((part) => part.volume_name || part.mount_point)
        .filter(Boolean)
        .join(", ");
      const media = disk.media_name ? `${disk.media_name} ` : "";
      const label = `${disk.disk_id} ${media}${formatBytes(disk.size)}${names ? ` - ${names}` : ""}`;
      return `<button class="disk-chip" type="button" data-disk="${escapeHtml(disk.disk_id)}">${escapeHtml(label)}</button>`;
    })
    .join("");
  if (!state.formatResult) {
    setResult(els.formatState, "Pick the USB disk, then type ERASE MX65FLASH.", "warn");
  }
}

function renderFormatResult() {
  if (!state.formatResult) return;
  const out = state.formatResult.stdout ? `\n\n${state.formatResult.stdout.trim()}` : "";
  setResult(els.formatState, `Formatted ${state.formatResult.disk_id} as MX65FLASH.${out}`, "ok");
}

function renderBundle() {
  if (!state.bundle) {
    setResult(els.bundleState, "No conversion bundle checked yet.");
    return;
  }
  const lines = bundleFiles().map((item) => `${item.role}: ${item.name}`);
  setResult(
    els.bundleState,
    `${state.bundle.all_ok ? "OK" : "CHECK"} ${state.bundle.snapshot_version || "SNAPSHOT"} ${state.bundle.snapshot_code || ""}\n\n${lines.join("\n")}`,
    state.bundle.all_ok ? "ok" : "warn",
  );
}

function renderUsb() {
  if (!state.volumeInfo) {
    setResult(els.usbState, "No USB checked yet.");
    return;
  }
  const disk = state.volumeInfo.diskutil || {};
  const fs = disk.FilesystemUserVisibleName || disk.FilesystemName || "unknown filesystem";
  const writable = disk.Writable === false ? "not writable" : "writable";
  setResult(els.usbState, `${state.volumeInfo.path}\n${fs}, ${writable}`, disk.Writable === false ? "bad" : "ok");
}

function renderResult() {
  if (state.stageResult) {
    const lines = state.stageResult.staged.map((item) => `${item.verified ? "OK" : "BAD"} ${item.name}\n${item.sha256}`);
    els.resultLog.textContent = `Copied to ${state.stageResult.path}\n\n${lines.join("\n\n")}\n\nNext: open READ_ME_FIRST_MX65.txt on the USB.`;
    return;
  }
  if (state.usbCheck) {
    els.resultLog.textContent = JSON.stringify(state.usbCheck, null, 2);
    return;
  }
  els.resultLog.textContent = "Nothing copied yet.";
}

function allChecksPassed(checks) {
  return Array.isArray(checks) && checks.length > 0 && checks.every((item) => item && item.present === true);
}

function renderGuidedChecklist() {
  if (!els.guideStepDownload || !els.guideStepFormat || !els.guideStepCopy || !els.guideStepVerify) {
    return;
  }

  const formatOk = Boolean(state.formatResult);
  const copyDone = Boolean(state.stageResult?.all_verified);
  const verifyDone = allChecksPassed(state.usbCheck?.checks);

  const bundleReady = Boolean(state.bundle);
  const bundleVerified = Boolean(state.bundle?.all_ok);

  els.guideStepDownload.classList.toggle("done", bundleReady);
  els.guideStepFormat.classList.toggle("done", formatOk);
  els.guideStepCopy.classList.toggle("done", copyDone);
  els.guideStepVerify.classList.toggle("done", verifyDone);

  const bundleLabel = bundleReady
    ? `Bundle downloaded ${bundleVerified ? "and verified" : "but still processing verification"}.`
    : "Download conversion bundle for the selected profile.";
  const formatLabel = formatOk
    ? `USB formatted at ${state.formatResult.mount_path || "/Volumes/MX65FLASH"} and ready for staging.`
    : "Format a removable USB as FAT32 + MBR and name it MX65FLASH.";
  const copyLabel = copyDone
    ? "Bundle copied to USB and SHA checks passed."
    : "Copy bundle files and verify them against SHA-256.";
  const verifyLabel = verifyDone
    ? `USB contents verified for all expected files at ${state.usbCheck.path || "selected volume"}.`
    : "Read READ_ME_FIRST_MX65.txt before using the USB on the router.";

  const update = (item, label) => {
    const labelEl = item.querySelector(".guide-label");
    if (labelEl) {
      labelEl.textContent = label;
    }
  };
  update(els.guideStepDownload, bundleLabel);
  update(els.guideStepFormat, formatLabel);
  update(els.guideStepCopy, copyLabel);
  update(els.guideStepVerify, verifyLabel);
}

function renderAll() {
  renderProfileState();
  renderFormatResult();
  renderBundle();
  renderUsb();
  renderResult();
  renderGuidedChecklist();
}

async function runAction(button, label, fn) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = label;
  try {
    await fn();
    renderAll();
  } catch (error) {
    setStatus(error.message, "bad");
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

els.downloadBundle.addEventListener("click", () => runAction(els.downloadBundle, "Downloading", async () => {
  const profile = selectedProfile();
  if (!profileSupportsStockUsb(profile)) throw new Error("This device profile is not certified for stock-conversion USB creation yet.");
  setStatus(`Downloading ${profile.display_name || profile.id} conversion bundle...`);
  const result = await api("/api/conversion/download", { method: "POST", body: { profile_id: profile.id } });
  state.bundle = result.bundle;
  setStatus("Conversion bundle downloaded and verified.", "ok");
}));

els.profileSelect.addEventListener("change", () => {
  state.selectedProfileId = els.profileSelect.value;
  renderProfileState();
});

els.liveProfiles.addEventListener("click", () => runAction(els.liveProfiles, "Checking", async () => {
  setStatus("Checking official OpenWrt release metadata...");
  const result = await api("/api/device-profiles/live", { method: "POST", body: {} });
  state.liveProfileCheck = result.live;
  renderProfileState();
  setStatus("OpenWrt device support metadata checked.", "ok");
}));

els.refreshDisks.addEventListener("click", () => runAction(els.refreshDisks, "Finding", async () => {
  const result = await api("/api/format/disks");
  renderFormatDisks(result.disks, result.error || "");
  setStatus(result.error ? "Disk discovery was blocked by macOS." : "External USB disk list refreshed.", result.error ? "bad" : "ok");
}));

els.formatUsb.addEventListener("click", () => runAction(els.formatUsb, "Formatting", async () => {
  const diskId = els.formatDisk.value.trim();
  const phrase = els.formatPhrase.value;
  if (!diskId) throw new Error("Pick the external USB disk first.");
  const result = await api("/api/format/usb", {
    method: "POST",
    body: { disk_id: diskId, phrase },
  });
  state.formatResult = result.format;
  els.usbPath.value = result.format.mount_path || "/Volumes/MX65FLASH";
  const [volumes, volume] = await Promise.all([
    api("/api/volumes"),
    api("/api/volume/info", { method: "POST", body: { path: els.usbPath.value } }),
  ]);
  renderVolumes(volumes.volumes);
  state.volumeInfo = volume.volume;
  setStatus("USB formatted. Now copy the bundle to it.", "ok");
}));

els.inspectUsb.addEventListener("click", () => runAction(els.inspectUsb, "Checking", async () => {
  const path = els.usbPath.value.trim();
  if (!path) throw new Error("Enter a USB mount path.");
  const result = await api("/api/volume/info", { method: "POST", body: { path } });
  state.volumeInfo = result.volume;
  setStatus("USB checked.", "ok");
}));

els.copyUsb.addEventListener("click", () => runAction(els.copyUsb, "Copying", async () => {
  if (!state.bundle?.all_ok) throw new Error("Download the conversion bundle first.");
  const path = els.usbPath.value.trim();
  if (!path) throw new Error("Enter a USB mount path.");
  const result = await api("/api/usb/stage", {
    method: "POST",
    body: { path, files: bundlePaths(), overwrite: els.overwrite.checked },
  });
  state.stageResult = result.stage;
  setStatus(result.stage.all_verified ? "USB copied and verified." : "Copy completed but verification failed.", result.stage.all_verified ? "ok" : "bad");
}));

els.verifyUsb.addEventListener("click", () => runAction(els.verifyUsb, "Verifying", async () => {
  const path = els.usbPath.value.trim();
  if (!path) throw new Error("Enter a USB mount path.");
  if (!state.bundle) throw new Error("Download the conversion bundle first.");
  state.usbCheck = await api("/api/usb/verify", { method: "POST", body: { path, expected_names: bundleNames() } });
  setStatus("USB file list checked.", "ok");
}));

els.volumeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-volume]");
  if (!button) return;
  els.usbPath.value = button.dataset.volume;
});

els.diskList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-disk]");
  if (!button) return;
  els.formatDisk.value = button.dataset.disk;
});

async function init() {
  try {
    const profiles = await api("/api/device-profiles");
    state.deviceProfiles = profiles.profiles || [];
    state.selectedProfileId = profiles.default_profile_id || state.deviceProfiles[0]?.id || "meraki_mx65";
    renderProfileOptions();
    renderProfileState();

    const [bundle, disks, volumes] = await Promise.all([
      api("/api/conversion/status"),
      api("/api/format/disks"),
      api("/api/volumes"),
    ]);
    state.bundle = bundle.bundle;
    renderFormatDisks(disks.disks, disks.error || "");
    renderVolumes(volumes.volumes);
    renderAll();
    setStatus("Ready.");
  } catch (error) {
    setStatus(error.message, "bad");
  }
}

init();

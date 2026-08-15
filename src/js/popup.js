// #################################################### \\
//                   Helpers                            \\
// #################################################### \\
function escapeHtml(v) {
  return v.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

// #################################################### \\
//                   Initialization                     \\
// #################################################### \\
async function load() {
  const s = await chrome.storage.local.get({
    channels: [], states: {}, lastCheck: 0, lastError: ""
  });

  const channels = s.channels || [];
  const box = document.getElementById("channels");
  const empty = document.getElementById("empty");
  box.innerHTML = "";
  empty.hidden = channels.length > 0;

  for (const channel of channels) {
    const row = document.createElement("div");
    row.className = "channel" + (s.states?.[channel] ? " live" : "");
    row.innerHTML = `<span class="name">${escapeHtml(channel)}</span>
      <span class="liveText">${s.states?.[channel] ? "LIVE" : "offline"}</span>`;
    box.appendChild(row);
  }

  const status = document.getElementById("status");
  const dot = document.getElementById("dot");
  if (s.lastError) {
    status.textContent = s.lastError;
    dot.className = "dot";
  } else {
    status.textContent = s.lastCheck ? "Monitoring active" : "Not checked yet.";
    dot.className = "dot on";
  }

  document.getElementById("lastCheck").textContent =
    s.lastCheck ? `Last Check: ${new Date(s.lastCheck).toLocaleTimeString("de-DE")}` : "Not checked yet.";
}

document.getElementById("options").onclick = () => chrome.runtime.openOptionsPage();
document.getElementById("check").onclick = async () => {
  const b = document.getElementById("check");
  b.disabled = true; b.textContent = "Prüfe …";
  await chrome.runtime.sendMessage({type:"check"});
  await load();
  b.disabled = false; b.textContent = "Check now";
};

load();
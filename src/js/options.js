// #################################################### \\
//                        PRE                           \\
// #################################################### \\
const defaults = {
  clientId: "",
  token: "",
  channels: [],
  notifications: true,
  openOnClick: true,
  autoOpen: false,
  autoClose: false,
  interval: 2
};

// #################################################### \\
//                   Helpers                            \\
// #################################################### \\
function normalize(input) {
  return [...new Set(input.split(/\r?\n/)
    .map(x => x.trim().toLowerCase())
    .filter(x => /^[a-z0-9_]{1,25}$/.test(x))
  )];
}

async function save() {
  const data = {
    clientId: clientId.value.trim(),
    token: token.value.trim().replace(/^Bearer\s+/i, ""),
    channels: normalize(channels.value),
    notifications: notifications.checked,
    openOnClick: openOnClick.checked,
    autoOpen: autoOpen.checked,
    autoClose: autoClose.checked,
    interval: Number(interval.value)
  };
  await chrome.storage.local.set(data);
  await chrome.runtime.sendMessage({type:"ensureAlarm"});
  saved.textContent = "Saved.";
  setTimeout(() => saved.textContent = "", 1800);
}

// #################################################### \\
//                   Initialization                     \\
// #################################################### \\
async function load() {
  const s = await chrome.storage.local.get(defaults);
  clientId.value = s.clientId || "";
  token.value = s.token || "";
  channels.value = (s.channels || []).join("\n");
  notifications.checked = s.notifications !== false;
  openOnClick.checked = s.openOnClick !== false;
  autoOpen.checked = Boolean(s.autoOpen);
  autoClose.checked = Boolean(s.autoClose);
  interval.value = String(s.interval || 2);
}

saveBtn = document.getElementById("save");
saveBtn.onclick = save;
document.getElementById("test").onclick = () => chrome.runtime.sendMessage({type:"testNotification"});
document.getElementById("addExample").onclick = () => {
  channels.value += "Emiru\nShroud\nxQc";
};

load();
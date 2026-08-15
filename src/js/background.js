// #################################################### \\
//                        PRE                           \\
// #################################################### \\
const ALARM = "twitch-live-check";
const DEFAULTS = {
  clientId: "",
  token: "",
  channels: [],
  notifications: true,
  openOnClick: true,
  autoOpen: false,
  autoClose: false,
  interval: 2,
  states: {},
  managedTabs: {}
};

// #################################################### \\
//                   Helpers                            \\
// #################################################### \\
async function getSettings() {
  const data = await chrome.storage.local.get(DEFAULTS);
  return { ...DEFAULTS, ...data };
}

async function saveSettings(patch) {
  await chrome.storage.local.set(patch);
}

function normalizeChannels(input) {
  const arr = Array.isArray(input) ? input : String(input || "").split(/\r?\n/);

  return [...new Set(arr
    .map(x => String(x).trim().toLowerCase().replace(/^https?:\/\/(www\.)?twitch\.tv\//, "").split(/[/?#\s]/)[0])
    .filter(x => /^[a-z0-9_]{1,25}$/.test(x))
  )];
}

async function ensureAlarm() {
  const settings = await getSettings();
  const period = Math.max(1, Number(settings.interval) || 2);
  
  await chrome.alarms.clear(ALARM);
  await chrome.alarms.create(ALARM, { periodInMinutes: period });
}

async function twitchRequest(settings) {
  if (!settings.clientId || !settings.token) {
    throw new Error("Twitch Client-ID und App Access Token fehlen.");
  }

  const channels = normalizeChannels(settings.channels);
  if (!channels.length) return [];

  const params = new URLSearchParams();
  channels.forEach(c => params.append("user_login", c));
  const response = await fetch(`https://api.twitch.tv/helix/streams?${params}`, {
    headers: {
      "Client-Id": settings.clientId,
      "Authorization": `Bearer ${settings.token.replace(/^Bearer\s+/i, "")}`
    }
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twitch API ${response.status}: ${text.slice(0, 180)}`);
  }

  const json = await response.json();
  return json.data || [];
}

async function openStream(login) {
  const url = `https://www.twitch.tv/${encodeURIComponent(login)}`;
  const tab = await chrome.tabs.create({ url, active: true });
  const settings = await getSettings();
  const managedTabs = settings.managedTabs || {};

  managedTabs[String(tab.id)] = login;
  await saveSettings({ managedTabs });
}

async function closeManagedTab(login) {
  const settings = await getSettings();
  const managedTabs = settings.managedTabs || {};

  for (const [tabId, channel] of Object.entries(managedTabs)) {
    if (channel === login) {
      try { await chrome.tabs.remove(Number(tabId)); } catch {}
      delete managedTabs[tabId];
    }
  }

  await saveSettings({ managedTabs });
}

async function notifyLive(stream) {
  const settings = await getSettings();
  if (!settings.notifications) return;

  const id = `live-${stream.user_login}`;
  const message = `${stream.user_name} is now live on Twitch.`;

  await chrome.notifications.create(id, {
    type: "basic",
    iconUrl: "../img/icon128.png",
    title: "TTVNotifyMe",
    message,
    contextMessage: stream.game_name ? `${stream.game_name} · ${stream.title}` : stream.title,
    priority: 2,
    requireInteraction: false
  });
}

async function checkNow() {
  const settings = await getSettings();
  const channels = normalizeChannels(settings.channels);

  if (!channels.length || !settings.clientId || !settings.token) {
    await saveSettings({ lastCheck: Date.now(), lastError: (!channels.length ? "Keine Streamer eingetragen." : "API-Daten fehlen.") });
    return { streams: [], changed: [], error: !channels.length ? "Keine Streamer eingetragen." : "API-Daten fehlen." };
  }

  let streams;
  try {
    streams = await twitchRequest(settings);
  } catch (error) {
    await saveSettings({ lastCheck: Date.now(), lastError: error.message });
    return { streams: [], changed: [], error: error.message };
  }

  const liveMap = Object.fromEntries(streams.map(s => [s.user_login.toLowerCase(), s]));
  const oldStates = settings.states || {};
  const newStates = {};
  const changed = [];

  for (const login of channels) {
    const nowLive = Boolean(liveMap[login]);
    const wasLive = Boolean(oldStates[login]);
    newStates[login] = nowLive;

    if (nowLive && !wasLive) {
      const stream = liveMap[login];
      changed.push({ type: "live", stream });
      await notifyLive(stream);
      if (settings.autoOpen) await openStream(login);
    }

    if (!nowLive && wasLive && settings.autoClose) {
      changed.push({ type: "offline", login });
      await closeManagedTab(login);
    }
  }

  await saveSettings({ states: newStates, lastCheck: Date.now(), lastError: "" });
  return { streams, changed, error: "" };
}

// #################################################### \\
//                       Listeners                      \\
// #################################################### \\
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set(DEFAULTS);
  await ensureAlarm();
});

chrome.runtime.onStartup.addListener(ensureAlarm);

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM) checkNow();
});

chrome.notifications.onClicked.addListener(async id => {
  if (!id.startsWith("live-")) return;

  const login = id.slice(5);
  const settings = await getSettings();

  if (settings.openOnClick !== false) await openStream(login);
  chrome.notifications.clear(id);
});

chrome.tabs.onRemoved.addListener(async tabId => {
  const settings = await getSettings();
  const managedTabs = settings.managedTabs || {};

  if (String(tabId) in managedTabs) {
    delete managedTabs[String(tabId)];
    await saveSettings({ managedTabs });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message?.type === "check") {
      sendResponse(await checkNow());
    } else if (message?.type === "ensureAlarm") {
      await ensureAlarm();
      sendResponse({ ok: true });
    } else if (message?.type === "testNotification") {
      await chrome.notifications.create("test-notification", {
        type: "basic",
        iconUrl: "../img/icon128.png",
        title: "TTVNotifyMe",
        message: "Test-Notification works!"
      });
      sendResponse({ ok: true });
    } else {
      sendResponse({ ok: false });
    }
  })();

  return true;
});

ensureAlarm();
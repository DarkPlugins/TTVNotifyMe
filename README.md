# TTVNotifyMe
TTVNotifyMe is a browser extension that monitors selected Twitch channels and notifies you when they go live.

Notice: Developed for Windows. It's not tested on Linux.

## Features

- Live/Offline monitoring for selected Twitch channels
- Desktop notifications when a streamer goes live
- Click a notification to open the Twitch stream
- Optional automatic stream opening
- Optional automatic closing of tabs opened by the extension when the streamer goes offline
- Configurable monitoring interval
- Manual status check
- Popup showing the current status of configured channels
- Settings page for Twitch API configuration and notification behavior

## Installation

### Manual Installation

1. Download the latest release ZIP from the project's Releases page.
2. Extract the `.zip` file to a folder.
3. Open your browser's extension page:
   - Google Chrome: `chrome://extensions`
   - Microsoft Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Other Chromium-based browsers provide a similar extensions page.
4. Install the extension using your preferred browser extension platform. Drag & Drop the .crx file into the extension page or extract the .zip file, enable developer-mode and "load unpacked files".
7. Pin the extension to your browser toolbar if desired.

### Customization

After installation, click the extension icon and open **Settings**.

#### 1. Add Streamers

In the **Streamers** section, enter the Twitch login names of the channels you want to monitor, one per line.

Example:

```text
Emiru
Shroud
xQc
```
Use the channel's Twitch login name rather than its display name.

#### 2. Configure Twitch API Access

The current version uses the official Twitch API to check whether configured channels are live.

You need:
- A Twitch Client ID
- A Twitch App Access Token

The extension stores these values locally in your browser.

#### Getting a Twitch Client ID
1. Open the Twitch Developer Console: https://dev.twitch.tv/console
2. Log in with your Twitch account.
3. Select Register Your Application.
4. Enter an application name like **TTVNotifyMe** for example
5. Enter a valid OAuth Redirect URL as required by Twitch. The URL **https://localhost** will do for this extension
6. Choose **Private** Mode
7. Create the application.
8. Open the application page and copy its Client ID.
9. Enter it into the extension's Client-ID field.

#### Getting an App Access Token
For the Client Credentials Grant, use your Client ID and Client Secret to request an App Access Token.

1. On the same page where you got your client-id earlier (application apge), click on "New secret" and copy the client-secret.
2. Open PowerShell and run the following code. Make sure to replace the **client_id** and **client_secret** with your credentials.
```code
curl -X POST "https://id.twitch.tv/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=client_credentials"
````
The response contains an access_token. Copy only that value into the extension's App Access Token field.
**Do not enter the word Bearer.**

The Client Secret is only used to obtain the App Access Token. It is not required in the extension and should never be entered into it.
Security note: The current extension stores the App Access Token locally in chrome.storage.local.

#### 3. Notification Settings

Available options:
- Notification when LIVE — displays a desktop notification when a monitored streamer goes live.
- Click on notification opens stream — opens the corresponding Twitch channel when the notification is clicked.
- Automatically open stream — opens the Twitch stream automatically when the streamer goes live.
- Automatically close opened tabs — closes Twitch tabs that were opened by the extension when the streamer goes offline.

The extension only attempts to close tabs that it opened itself.

#### 4. Monitoring Interval

Choose how often the extension checks Twitch:
- 1 minute
- 2 minutes
- 5 minutes (recommended)
- 10 minutes

Shorter intervals detect status changes faster but result in more frequent API requests.

#### 5. Saving Settings

Click **Save** after changing settings.

Use Test Notification to verify that browser notifications work correctly.
If you do not respond to the Windows notification (e.g., by dismissing or clicking it), Windows will ignore further messages from this extension.
Also, ensure that your Windows notification settings are configured correctly.

## Usage
After installation and configuration, the extension runs in the background.

When a monitored channel changes from offline to live, the extension can:
- Show a desktop notification.
- Open the stream when the notification is clicked.
- Open the stream automatically if automatic opening is enabled.

When a monitored channel changes from live to offline, the extension can close a tab if that tab was opened by the extension and automatic closing is enabled.

Click the extension icon to open the popup. It displays the current status of your configured streamers and provides a manual status check.

## Compatibility

The extension is designed for Chromium-based browsers supporting Manifest V3, including:
- Google Chrome
- Microsoft Edge
- Brave
- Opera
- Other Chromium-based browsers with Manifest V3 support

Firefox compatibility may require manifest adjustments because extension APIs and Manifest V3 support differ between browsers.

## Permissions

The extension uses:
- storage — stores settings locally
- alarms — performs periodic background checks
- notifications — displays desktop notifications
- tabs — opens Twitch streams and manages tabs opened by the extension
- Twitch API host access — communicates with the official Twitch API

No Twitch account password is stored or requested by the extension.

## Troubleshooting
### API data is missing
Open Settings and make sure both the Client ID and App Access Token are entered.

### Twitch API error
Check that:
- the Client ID is correct
- the App Access Token is valid
- the token belongs to the same Twitch application as the Client ID
- the token has not been revoked
- your internet connection is working

You can generate a new App Access Token if necessary.

### Notifications do not appear

Make sure browser notifications are allowed for your browser and operating system. Also verify that Notification when LIVE is enabled.

### A streamer is shown as offline although they are live

Click **Check** Now in the popup. If the problem persists, verify that the channel's Twitch login name is correct.

### Automatic closing does not close my Twitch tab

The extension only tracks tabs that it opened itself. Existing Twitch tabs are not closed automatically.

## Disclaimer

TTVNotifyMe is an independent project and is not affiliated with, endorsed by, sponsored by, or associated with Twitch Interactive, Inc.

Twitch® is a trademark of Twitch Interactive, Inc. All trademarks, service marks, logos, and copyrights are the property of their respective owners.

This extension uses the official Twitch API. Use of the Twitch API is subject to Twitch's applicable terms, policies, and developer documentation.

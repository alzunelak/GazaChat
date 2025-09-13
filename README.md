# GazaChat 

##  Overview
**GazaChat** is a privacy-focused chat application with a warm:

> _“Take privacy with you, be yourself in every message.”_

Visit the app: [GazaChat](https://alzunelak.github.io/GazaChat/index.html)

---

##  Features
- Friendly, culturally mindful UI
- Simple and intuitive navigation
- Clear Terms & Privacy for transparency

---

##  Team Members
| Name                | Role                     | GitHub Profile                                              |
|---------------------|--------------------------|-------------------------------------------------------------|
| Rukhsar             | Back End                 | [@rukhsar](https://github.com/yourusername)                 |
| Sophia              | Back End                 | [@sophia](https://github.com/yourusername)                  |
| Maya                | Front End                | [@maya](https://github.com/yourusername)                    |
| Amat                | Front End                | [@Amat](https://github.com/yourusername)                    |
| Zainab              | Front End                | [@zainab](https://github.com/yourusername)                  |
| Nuzlah              | Front End                | [@nuzlah](https://github.com/yourusername)                  |

---


| File / Folder                                                 | Original Role                | Offline Bluetooth Action                                            | Notes / Replacement                           |
| ------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------- | --------------------------------------------- |
| `index.html`, `welcome.html`                                  | Entry screens                | Keep                                                                | No changes, just load offline                 |
| `permission.html`                                             | Permission requests          | Add Bluetooth permission prompts                                    | For Web: Web Bluetooth API; Android: manifest |
| `phone-number.html`                                           | Phone onboarding             | Keep                                                                | Works offline                                 |
| `profile.html`                                                | Profile setup                | Keep                                                                | Stored locally                                |
| `home.html`                                                   | Dashboard hub                | Add “Scan Devices” + connection status                              | Shows Connected / Searching / Disconnected    |
| `chat.html`, `group-chat.html`                                | Chat UIs                     | Replace send/receive with Bluetooth functions                       | Messages sent directly over Bluetooth         |
| `settings.html`, `privacy-settings.html`, `chatsettings.html` | User settings & privacy      | Add Bluetooth indicators & reconnect options                        | Add toggle for Bluetooth sync                 |
| `calls.html`, `video-call.html`, `audio-call.html`            | Call screens                 | Optional: replace with Bluetooth audio streaming                    | For offline audio/video calls (advanced)      |
| `qrcode.html`, `scan.html`                                    | Device linking via QR        | Optional remove                                                     | Bluetooth replaces QR session linking         |
| `search.html`, `blockuser.html`                               | Search + block users         | Keep, but only search/block local data                              | Runs on localStorage/IndexedDB                |
| `data-storage.html`                                           | Storage overview             | Update with Bluetooth + localStorage                                | Document offline approach                     |
| `correction*.html`                                            | Review/correction flows      | Keep                                                                | Minor/no change                               |
| `help.html`, `delete-account.html`, `change-number.html`      | Help & account management    | Keep                                                                | Local only                                    |
| `App.js`, `main.js`, `main.jsx`                               | Core chat logic + rendering  | Replace network calls with `bluetoothSend()` / `bluetoothReceive()` | Listen for Bluetooth events                   |
| `chatscreen.kt`, `group-chatscreen.kt`                        | Android chat logic (Kotlin)  | Replace send/receive with `bluetoothManager.kt` calls               | Handles one-to-one & group chat               |
| `bluetoothManager.kt` (new)                                   | —                            | Add new file                                                        | Centralized Bluetooth discovery/send/receive  |
| `bluetoothManager.js` (new, web)                              | —                            | Add new file                                                        | Uses Web Bluetooth API                        |
| `server.js`                                                   | WebSocket/API server         | Remove completely                                                   | No server needed offline                      |
| `service-worker.js`                                           | Caching & offline shell      | Keep                                                                | Cache static assets & local data only         |
| `useLocalStorage.js`                                          | Store chats, profiles, prefs | Keep or extend with IndexedDB                                       | Fully offline storage                         |
| `usePeerConnection.js`                                        | WebRTC for calls             | Optional: replace with Bluetooth audio                              | Needed only if offline calls required         |
| `QrHelpers.js`                                                | QR code generation/parsing   | Optional remove                                                     | Bluetooth replaces QR linking                 |
| `style.css`, `index.css`, `tailwind.config.js`                | Styling + themes             | Update icons & status indicators                                    | Add Bluetooth icons                           |
| `translations.json`                                           | Multi-language UI text       | Add strings like “Connected via Bluetooth”                          | Keep offline translations                     |
| `AndroidManifest.xml`                                         | Android permissions          | Add Bluetooth + Bluetooth Admin permissions                         | Required for offline Bluetooth                |





##  Usage
1. Visit the [GazaChat](https://alzunelak.github.io/GazaChat/index.html).
2. Click **Get Started** to begin chatting.
3. Read our **Terms & Privacy** for details on how your data is handled.

--

##  License
Specify the license here (e.g., MIT, Apache 2.0), or link to your `LICENSE` file.

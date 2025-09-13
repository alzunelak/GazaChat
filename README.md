
# GazaChat

## 🌐 Overview

**GazaChat** is a privacy-focused chat application designed to keep conversations simple, secure, and culturally mindful:

> *“A fully offline chat app using Bluetooth for messaging and calls, designed to work without servers or internet.”*
> *“Take privacy with you, be yourself in every message.”*

🔗 **Live Demo:** [GazaChat](https://alzunelak.github.io/GazaChat/index.html)

---

## 📂 Project Structure

```
GazaChat/
├── index.html, welcome.html                – Entry and greeting screens
├── permission.html                         – Permission requests (microphone, notifications)
├── phone-number.html                       – Onboarding via phone input
├── profile.html                            – User profile setup (name, picture)
├── home.html                               – Main dashboard (chat & nav hub)
├── chat.html, group-chat.html              – One-on-one and group chats
├── settings/
│   ├── settings.html                       – General preferences
│   ├── privacy-settings.html               – Privacy controls
│   └── chatsettings.html                   – Chat-specific options
├── call & invites/
│   ├── calls.html, video-call.html, audio-call.html – Call interfaces
├── qrcode.html, scan.html                  – Device linking via QR codes
├── search.html                             – Message/contact search
├── blockuser.html                          – Block/unblock users
├── data-storage.html                       – Storage mechanisms overview
├── correction*.html                        – Correction/review flows
└── Help & account/
    ├── help.html                           – App help/instructions
    ├── delete-account.html                 – Account removal
    └── change-number.html                  – Update phone number
```
## 🛠 Tech Stack
- **Frontend:** HTML, CSS, JavaScript, Tailwind  
- **Backend (Optional):** Node.js (for non-offline builds)  
- **Mobile:** Android (Kotlin)  
- **Bluetooth:** Web Bluetooth API & Android Bluetooth APIs  
- **Storage:** IndexedDB & localStorage  

---

## 🚀 Features

* Bluetooth Messaging – Send and receive messages offline
* Profile Setup – Store data locally
* Offline Calls (Optional) – Audio/video over Bluetooth
* Local Search & Block – Runs on local data storage
* Fully Offline – Caches all assets and chat history
* Multi-language Support – Uses translations.json

---

## 👩‍💻 Team Members

| Name    | Role      | GitHub Profile                              |
| ------- | --------- | ------------------------------------------- |
| Rukhsar | Back End  | [@rukhsar](https://github.com/yourusername) |
| Sophia  | Back End  | [@sophia](https://github.com/yourusername)  |
| Maya    | Front End | [@maya](https://github.com/yourusername)    |
| Amat    | Front End | [@Amat](https://github.com/yourusername)    |
| Zainab  | Front End | [@zainab](https://github.com/yourusername)  |
| Nuzlah  | Front End | [@nuzlah](https://github.com/yourusername)  |

---
## 🔒File Structure & Bluetooth offline Migration Guide
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


## 🛠 Installation (Offline)

### Web

```bash
git clone https://github.com/alzunelak/GazaChat.git
cd GazaChat
# Open index.html in your browser
```

### Android

1. Open the project in **Android Studio**.
2. Connect a physical device or emulator.
3. Add Bluetooth permissions to `AndroidManifest.xml`.
4. Build and run the app.

---

## 📸 Screenshots

*(Add your images in `/docs/screenshots/` and link them here)*

| Home Screen                        | Chat Screen                        | Settings                                   |
| ---------------------------------- | ---------------------------------- | ------------------------------------------ |
| ![Home](docs/screenshots/home.png) | ![Chat](docs/screenshots/chat.png) | ![Settings](docs/screenshots/settings.png) |

---

## 📜 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

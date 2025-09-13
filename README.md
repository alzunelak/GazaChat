# GazaChat

## 🌐 Overview

**GazaChat** is a **fully offline, peer-to-peer encrypted messaging app** that prioritizes privacy and accessibility. It uses **Bluetooth connections** and **QR-code-based device pairing** to set up direct chats with no servers or internet required.

> *“A PWA that works on mobile and desktop, even completely offline.”*
> *“Take privacy with you, be yourself in every message.”*

🔗 **Live Demo:** [GazaChat](https://alzunelak.github.io/GazaChat/index.html)

---

## 🔑 Core Features

**Peer-to-Peer Encrypted Messaging** – All messages and calls are sent directly between devices with end-to-end encryption.
**QR Code Connection Setup** – Devices can scan a QR code to establish a secure connection.
**Offline Support with Local Storage** – Chats, profiles, and preferences are stored locally using IndexedDB and work without internet.
**Progressive Web App (PWA)** – Installable on mobile or desktop, works completely offline.
**Bluetooth Messaging** – Full chat functionality over Web Bluetooth or Android Bluetooth APIs.

---

## 📂 Project Structure

```
GazaChat/
├── index.html, welcome.html                – Entry and greeting screens
├── permission.html                         – Permission requests (microphone, Bluetooth)
├── phone-number.html                       – Phone input onboarding
├── profile.html                            – User profile setup
├── home.html                               – Main dashboard (chat hub)
├── chat.html, group-chat.html              – Chat interfaces
├── settings/
│   ├── settings.html                       – General settings
│   ├── privacy-settings.html               – Privacy controls
│   └── chatsettings.html                   – Chat preferences
├── call & invites/
│   ├── calls.html, video-call.html, audio-call.html – Calling screens
├── qrcode.html, scan.html                  – QR code pairing
├── search.html                             – Search messages & contacts
├── blockuser.html                          – Block/unblock users
├── data-storage.html                       – Offline storage overview
├── correction*.html                        – Corrections & flows
└── Help & account/
    ├── help.html                           – App help
    ├── delete-account.html                 – Account removal
    └── change-number.html                  – Update phone number
```

---

## 🛠 Tech Stack

* **Frontend:** HTML, CSS, JavaScript, Tailwind
* **Backend (Optional):** Node.js (only if running non-offline mode)
* **Mobile:** Android (Kotlin)
* **Bluetooth:** Web Bluetooth API (Web), Android Bluetooth APIs (Native)
* **Storage:** IndexedDB & localStorage for offline-first data
* **PWA:** Service Workers for caching and offline functionality

---

## 🔒 File Structure & Bluetooth Migration Guide

| File / Folder                                                 | Role / Function           | Offline Bluetooth Action                     | Notes                                     |
| ------------------------------------------------------------- | ------------------------- | -------------------------------------------- | ----------------------------------------- |
| `index.html`, `welcome.html`                                  | Entry screens             | Keep                                         | Just cache offline                        |
| `permission.html`                                             | Permission prompts        | Add Bluetooth prompts                        | Web: Web Bluetooth API; Android: Manifest |
| `phone-number.html`                                           | Phone onboarding          | Keep                                         | Works offline                             |
| `profile.html`                                                | Profile setup             | Keep                                         | Stored locally                            |
| `home.html`                                                   | Dashboard                 | Add Bluetooth scan status                    | Shows Connected/Searching/Disconnected    |
| `chat.html`, `group-chat.html`                                | Chat UIs                  | Replace network calls with `bluetoothSend()` | Direct P2P over Bluetooth                 |
| `settings.html`, `privacy-settings.html`, `chatsettings.html` | Settings & privacy        | Add toggle for Bluetooth sync                | Add reconnect options                     |
| `calls.html`, `video-call.html`, `audio-call.html`            | Call screens              | Optional: Bluetooth audio/video              | Advanced                                  |
| `qrcode.html`, `scan.html`                                    | QR code pairing           | Keep                                         | For secure device handshake               |
| `search.html`, `blockuser.html`                               | Search & block            | Keep                                         | Local data only                           |
| `data-storage.html`                                           | Storage overview          | Update                                       | IndexedDB + Bluetooth                     |
| `main.js`, `bluetoothManager.js`                              | Core chat logic           | Add Bluetooth discovery, send, receive       | New central Bluetooth handler             |
| `bluetoothManager.kt`                                         | Android Bluetooth manager | Add Kotlin logic for offline comms           | For Android app                           |
| `service-worker.js`                                           | PWA caching               | Keep                                         | Offline-first                             |
| `QrHelpers.js`                                                | QR utilities              | Keep                                         | For pairing                               |
| `translations.json`                                           | Multi-language UI text    | Add “Connected via Bluetooth” text           | Offline translations                      |
| `AndroidManifest.xml`                                         | Android permissions       | Add Bluetooth permissions                    | Required                                  |
| `server.js`                                                   | WebSocket server          | Remove                                       | No server needed                          |


bluetooth-chat  
peer-to-peer  
offline-messaging  
p2p-chat  
progressive-web-app  
pwa  
encrypted-chat  
webrtc  
indexeddb  
offline-first  
qr-code  
bluetooth  
mobile-app  
privacy  
secure-messaging

---

## 📦 Installation (Offline)

### Web

```bash
git clone https://github.com/alzunelak/GazaChat.git
cd GazaChat
# Open index.html directly in your browser
```

### Android

1. Open in **Android Studio**
2. Add Bluetooth permissions to `AndroidManifest.xml`
3. Build and run on a physical device

---

## 📸 Screenshots

| Home Screen                        | Chat Screen                        | Settings                                   |
| ---------------------------------- | ---------------------------------- | ------------------------------------------ |
| ![Home](docs/screenshots/home.png) | ![Chat](docs/screenshots/chat.png) | ![Settings](docs/screenshots/settings.png) |

---


## 👩‍💻 Contributors    

| Contributor | Role        |
| ----------- | ----------- |
| [@rukhsar](https://github.com/rukhsar) | Back End    |
| [@sophia](https://github.com/sophia)   | Back End    |
| [@maya](https://github.com/maya)       | Front End   |
| [@amat](https://github.com/amat)       | Front End   |
| [@zainab](https://github.com/zainab)   | Front End   |
| [@nuzlah](https://github.com/nuzlah)   | Front End   |



## 📜 License

Licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---



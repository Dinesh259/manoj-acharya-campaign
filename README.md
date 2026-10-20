# ग्राम पंचायत अनूपशहर — चुनाव एवं मतदाता जानकारी वेबसाइट
# Gram Panchayat Anoopshahar — Voter Information & Campaign Website

Bilingual (**हिन्दी + English**) static website for **Manoj Kumar Acharya (मनोज कुमार आचार्य)**, candidate for Sarpanch of **Gram Panchayat Anoopshahar (ग्राम पंचायत अनूपशहर)**, Bhadra Tehsil, Rajasthan.

- **Election date:** Wednesday, 4 November 2026 (`2026-11-04T00:00:00+05:30`)
- **Contact / WhatsApp:** `9529205599` (`+91 9529205599`)
- **Works without any build tools:** Plain HTML, CSS, and vanilla JavaScript. Runs by double-clicking `index.html` or with a simple local server (`python -m http.server 8000`).

---

## 1. Quick Start (How to open on your computer)

1. **Directly in a browser:** Double-click `index.html`.
2. **With a local server (recommended when testing edits to JSON files):**
   Open a terminal / Command Prompt in this folder and run:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

---

## 2. Complete List of Images & Where to Put Each Image

All images go inside the **`assets/`** folder (`C:\Users\dinesh\.gemini\antigravity\scratch\manoj-acharya-campaign\assets\`).
Right now, lightweight placeholder images are already in `assets/` so the website works immediately. Replace them with your real files using the exact filenames below:

| # | Exact File Path to Save | What Image to Put Here | Where It Appears on the Website | Size & Format |
|---|---|---|---|---|
| **1** | **`assets/poster.jpg`** | **Portrait of Manoj Kumar Acharya** *(cropped from main poster)* | • **`index.html`** — Hero photo frame at the top of the Home page<br>• **`about.html`** — Candidate profile photo at the top of the About page<br>• **`flyer.html`** — Candidate photo on the printable A4 flyer | **480 × 600 px** (`38 KB`, JPEG) |
| **2** | **`assets/manifesto.jpg`** | **Printed 12-Point Manifesto Poster ("मेरे वादे — मेरा काम")** | • **`manifesto.html`** — Shown under the 12 promise cards in the *"छपा हुआ घोषणा पत्र / The printed manifesto"* section | **800 × 1131 px** (`96 KB`, JPEG) |
| **3** | **`assets/cand-1.jpg` to `assets/cand-5.jpg`** | **Square Face Crops of All 5 Sarpanch Candidates**:<br>1. `cand-1.jpg` — मनोज कुमार आचार्य (Manoj Kumar Acharya)<br>2. `cand-2.jpg` — दानाराम वर्मा (Danaram Verma)<br>3. `cand-3.jpg` — देवीलाल शर्मा (Devilal Sharma)<br>4. `cand-4.jpg` — श्रवण सिंह राठौड़ (Shravan Singh Rathore)<br>5. `cand-5.jpg` — रणसिंह फोजी (Ransingh Fauji) | • **`how-to-vote.html`** — Interactive **EVM & Ballot Paper Practice Simulator** (`#vote-demo`) showing each candidate's serial number, face photo, name, sample symbol, and vote button/stamp box | **160 × 160 px** (`6–9 KB` each, JPEG) |
| **4** | **`assets/icon-192.png` & `assets/icon-512.png`** | **App Icons / Favicon** | • **All 12 `.html` pages** & **`manifest.json`** — Browser tab icon and Android home-screen shortcut icon | **192×192** (`19 KB`) & **512×512** (`73 KB`) PNG |

### Optional: If you want a separate cropped face photo AND a full poster
- By default, `index.html`, `about.html`, and `flyer.html` use **`assets/poster.jpg`** and automatically crop/focus on the upper-middle portrait area (`object-position: 50% 18%`).
- **Adjusting the crop position:** If the candidate's face in `assets/poster.jpg` is higher or lower, open `css/style.css` and change `--photo-pos` on `.hero-photo img` (for example, `50% 10%` to move up, or `50% 30%` to move down).
- **Using a separate portrait file (optional):** If you prefer to put a close-up passport/portrait photo on `index.html` / `about.html` / `flyer.html` and keep `poster.jpg` uncropped, save the close-up as `assets/poster.jpg` (since the full manifesto poster is already shown as `assets/manifesto.jpg` on `manifesto.html`).

### Optional: Audio & Video Explainers on `how-to-vote.html`
- On `how-to-vote.html` (bottom section *"सुनकर और देखकर समझें / Listen and watch"*), there are two placeholder boxes for a Hindi audio clip and a Hindi video clip.
- When ready, put your files in `assets/` (for example `assets/how-to-vote.mp3` and `assets/how-to-vote.mp4`) and add `<audio controls src="assets/how-to-vote.mp3"></audio>` and `<video controls width="100%" src="assets/how-to-vote.mp4"></video>` inside `.media-slot` in `how-to-vote.html`.

### How to Compress Images Under 150 KB
1. Open [squoosh.app](https://squoosh.app) in your browser (works offline once loaded).
2. Drag your photo in, enable **Resize** (`600 px` to `800 px` width), choose **MozJPEG** (quality `75–80`), and download into `assets/`.

---

## 3. Complete List of `[EDIT]` Placeholders to Fill In

Every unknown fact is marked with **`[EDIT]`** (and highlighted in yellow on the page) so nothing is invented. Search for `[EDIT` to find them all. Here is the complete checklist:

### A. `js/i18n.js` — Website settings & Hindi/English text

1. **`window.SITE_CONFIG.secWebsite`** *(line 19)* — Confirm the official Rajasthan State Election Commission homepage (`https://sec.rajasthan.gov.in/`).
2. **`window.SITE_CONFIG.voterSearchUrl`** *(line 22)* — `[EDIT]` Replace with the exact official Rajasthan SEC panchayat voter-list search URL once announced.
3. **`window.SITE_CONFIG.siteUrl`** *(line 26)* — `[EDIT]` After publishing the website (see Section 5 below), paste your live website address here (for example, `"https://yourname.github.io/anoopshahar/"`) so the printable flyer QR code and WhatsApp share links point to your live site.
4. **`footer.published`** *(Hindi & English)* — `प्रकाशक: मनोज कुमार आचार्य [EDIT: या प्रचार टीम का नाम]` / `Published by Manoj Kumar Acharya [EDIT: or campaign team].`
5. **`footer.place`** *(Hindi & English)* — `ग्राम पंचायत अनूपशहर, तहसील भादरा, ज़िला हनुमानगढ़ [EDIT: ज़िले की पुष्टि करें], राजस्थान` / `Gram Panchayat Anoopshahar, Bhadra Tehsil, Hanumangarh District [EDIT: confirm district], Rajasthan`
6. **`about.intro`** *(Hindi & English)* — `[EDIT: यहाँ 3–4 सरल वाक्यों में परिचय लिखें — जैसे परिवार, गाँव से जुड़ाव और अब तक के सेवा कार्य।]` (Candidate's short biography).
7. **`about.fFatherVal`** *(Hindi & English)* — `[EDIT]` Father's name.
8. **`about.fAgeVal`** *(Hindi & English)* — `[EDIT]` Candidate's age.
9. **`about.fEduVal`** *(Hindi & English)* — `[EDIT]` Candidate's education.
10. **`about.fWorkVal`** *(Hindi & English)* — `[EDIT]` Candidate's occupation.
11. **`about.fVillageVal`** *(Hindi & English)* — `अनूपशहर [EDIT: वार्ड/मोहल्ला]` / `Anoopshahar [EDIT: ward/locality]`.
12. **`about.fSymbolVal`** *(Hindi & English)* — `[EDIT: चिह्न मिलने के बाद लिखें]` / `[EDIT: add after the symbol is allotted]` (Election symbol once allotted by the Returning Officer).
13. **`about.work1` & `about.work2`** *(Hindi & English)* — `[EDIT]` Examples of social, sports, or education service work in the village.
14. **`about.messageExtra`** *(Hindi & English)* — `[EDIT: प्रत्याशी अपना संदेश यहाँ जोड़ें]` / `[EDIT: candidate's own message]`.
15. **`how.machineNote`** *(Hindi & English)* — `[EDIT: आयोग से पुष्टि करके यहाँ लिखें]` / `[EDIT: confirm with the Commission and write it here]` (Confirm with the State Election Commission whether Sarpanch election in your panchayat will use EVMs or ballot papers).
16. **`how.carry2`** *(Hindi & English)* — `[EDIT: आयोग की मान्य सूची से पुष्टि करें]` / `[EDIT: confirm the accepted list with the Commission]` (Confirm the official list of alternate photo IDs accepted at polling booths).
17. **`how.time`** *(Hindi & English)* — `बुधवार, 4 नवंबर 2026 — सुबह [EDIT] बजे से शाम [EDIT] बजे तक` / `Wednesday, 4 November 2026 — from [EDIT] am to [EDIT] pm` (Official polling start and end hours).
18. **`how.demoCandidate`** *(Hindi & English)* — `प्रत्याशी {n} [EDIT]` / `Candidate {n} [EDIT]` (Dummy ballot candidate labels in the practice demo).
19. **`how.mediaSoon`** *(Hindi & English)* — `[EDIT: ऑडियो/वीडियो जल्द जोड़ा जाएगा]` / `[EDIT: audio/video will be added soon]` (Placeholder on `how-to-vote.html` for Hindi audio/video explainers).
20. **`check.urlNote`** *(Hindi & English)* — `[EDIT: इस बटन का लिंक आयोग के मतदाता सूची खोज वाले सही पेज से बदलें]` (Remove this note after updating `voterSearchUrl`).
21. **`check.notFound`** *(Hindi & English)* — `[EDIT: स्थानीय संपर्क जोड़ें]` / `[EDIT: add local contacts]` (Local BLO / Panchayat / Tehsil helpdesk details).
22. **`booth.warn`** *(Hindi & English)* — `[EDIT]` Warning banner on `find-booth.html` that the booth list is being updated.
23. **`faq.a2`** *(Hindi & English)* — `[EDIT: मान्य पहचान पत्रों की सूची आयोग से पुष्टि करें]` (Accepted alternate photo IDs).
24. **`faq.a5`** *(Hindi & English)* — `[EDIT: आयोग से पुष्टि करके लिखें]` (Whether voting uses EVM or ballot paper).
25. **`faq.a6`** *(Hindi & English)* — `बुधवार, 4 नवंबर 2026 को सुबह [EDIT] बजे से शाम [EDIT] बजे तक।` (Official polling hours).
26. **`faq.a7`** *(Hindi & English)* — `[EDIT: स्थानीय व्यवस्था, जैसे व्हीलचेयर, की जानकारी जोड़ें]` (Local arrangements for elderly/disabled voters).
27. **`faq.a10`** *(Hindi & English)* — `[EDIT: या प्रचार टीम]` / `[EDIT: or campaign team]` (Publisher attribution).
28. **`contact.office`** *(Hindi & English)* — `[EDIT: कार्यालय का पता और मिलने का समय लिखें]` / `[EDIT: office address and visiting hours]`.
29. **`flyer.qrNote`** *(Hindi & English)* — `[EDIT: वेबसाइट प्रकाशित करने के बाद js/i18n.js में siteUrl भरें...]` (Automatically hides once `SITE_CONFIG.siteUrl` is filled in).
30. **`flyer.imprint`** *(Hindi & English)* — `मुद्रक: [EDIT] · प्रकाशक: [EDIT] · प्रतियाँ: [EDIT]` / `Printer: [EDIT] · Publisher: [EDIT] · Copies: [EDIT]` (Required print-line details when printing physical flyers).

### B. `data/booths.json` — Polling booths & wards (`find-booth.html`)

Open `data/booths.json` in any text editor (such as Notepad) and replace the `[EDIT]` placeholders for each ward:
- `"ward"`: Ward number (`"1"`, `"2"`, `"3"`, etc.)
- `"area"`: `{"hi": "[EDIT: मोहल्ले/क्षेत्र का नाम]", "en": "[EDIT: area / locality name]"}`
- `"number"`: `"[EDIT]"` (Booth number)
- `"name"`: `{"hi": "[EDIT: बूथ का नाम, जैसे स्कूल का नाम और कमरा नंबर]", "en": "[EDIT: booth name, e.g. school name and room number]"}`
- `"reach"`: `{"hi": "[EDIT: कैसे पहुँचें — कोई पहचान वाली जगह लिखें]", "en": "[EDIT: how to reach — mention a landmark]"}`
- `"map"`: Search query for Google Maps (or fill in `"lat"` and `"lng"` numbers such as `29.105` and `75.170`).

### C. `data/issues.json` — Ward-wise village needs (`village-issues.html`)

Open `data/issues.json` and replace `"[EDIT: इस वार्ड की कोई ज़रूरत लिखें]"` / `"[EDIT: write a need of this ward]"` with the actual local needs shared by villagers in each ward.
*(Note: Keep needs factual and constructive; do not blame individuals or other candidates.)*

> **Note for offline `file://` mode:** If you also open the site directly from `file://` without a web server, `js/app.js` contains a matching `FALLBACK_DATA` copy of `booths` and `issues`. On GitHub Pages, Netlify, or any local server, `data/booths.json`, `data/issues.json`, and `data/manifesto.json` are loaded directly.

---

## 4. How to Edit Text, Election Date, or Phone Number

- **To edit any Hindi or English text:**
  Open `js/i18n.js` in Notepad or VS Code. Find the line you want under `hi: { ... }` and `en: { ... }`, and change only the words inside the `"double quotes"`. Save the file with **UTF-8** encoding.
- **To change the election date or phone number:**
  At the very top of `js/i18n.js`, edit `window.SITE_CONFIG`:
  ```js
  window.SITE_CONFIG = {
    phone: "9529205599",
    phoneIntl: "919529205599",
    electionDate: "2026-11-04T00:00:00+05:30",
    ...
  };
  ```
- **Silence Period Reminder (प्रचार समाप्ति अवधि):**
  Before polling day, State Election Commission rules require campaigning to pause during the pre-poll silence period (typically 48 hours before close of poll). See the comment at the top of `manifesto.html` and `about.html`.

---

## 5. How to Publish for Free (Step-by-Step)

### Option A: Publish for Free on Netlify (Easiest — Drag & Drop, 2 minutes)

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) and sign up for a free account.
2. Drag and drop this entire project folder (`manoj-acharya-campaign`) onto the page.
3. Netlify will immediately give you a free HTTPS website address (for example, `https://anoopshahar-manoj.netlify.app`).
4. Copy that address, paste it into `siteUrl` in `js/i18n.js`, and drag the folder onto Netlify again so your printable flyer QR code points to your live site.

### Option B: Publish for Free on GitHub Pages

1. Create a free account at [https://github.com](https://github.com).
2. Click the **+** icon in the top-right corner and choose **New repository**.
3. Name the repository `anoopshahar` (or `manoj-acharya`), choose **Public**, and click **Create repository**.
4. Click **uploading an existing file**, select all files and folders inside `manoj-acharya-campaign` (`index.html`, `css/`, `js/`, `data/`, `assets/`, etc.), and click **Commit changes**.
5. In your repository, go to **Settings → Pages**.
6. Under **Build and deployment → Source**, select **Deploy from a branch**, choose **`main`** and **`/ (root)`**, and click **Save**.
7. After 1–2 minutes, your site will be live at `https://<your-username>.github.io/anoopshahar/`.
8. Put that URL into `siteUrl` inside `js/i18n.js` and re-upload `js/i18n.js`.

---

## 6. How to Store EVM Candidate Clicks in a Database (1 Click Per Device, No Proxy)

The EVM simulator on `how-to-vote.html` already includes:
1. **Permanent 1-Click-Per-Device UI Lock** (`localStorage` + `cookie` + `sessionStorage`) — once a person clicks a candidate button on their phone, the machine locks to that choice and hides the reset button.
2. **Hardware Device Fingerprinting (`deviceFingerprint`)** — generated from the phone's GPU, screen, CPU cores, and Canvas rendering signature, so even Incognito mode or a Proxy on the same phone produces the exact same `deviceFingerprint`.
3. **Anti-Proxy / Anti-VPN Check** — verifies the connection via `ipwho.is` and blocks proxy/VPN/Tor clicks before sending.

### Step-by-Step Google Sheets Database Setup (Free)
1. Open [https://sheets.new](https://sheets.new) to create a new Google Sheet.
2. Click **Extensions → Apps Script**, replace the code with the script below, and click **Save**:

```javascript
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName("Votes_Log") || ss.insertSheet("Votes_Log");
    var sumSheet = ss.getSheetByName("Candidate_Summary") || ss.insertSheet("Candidate_Summary");

    if (logSheet.getLastRow() === 0) {
      logSheet.appendRow(["Timestamp", "Candidate #", "Candidate Name", "Mode", "Device Fingerprint", "IP Address", "ISP"]);
    }

    var data = JSON.parse(e.postData.contents);
    if (data.isProxy) {
      return ContentService.createTextOutput("BLOCKED_PROXY");
    }

    var fp = String(data.deviceFingerprint || "");
    var ip = String(data.ip || "");

    // Check if this Device Fingerprint (or same IP+Device) has already voted
    var lastRow = logSheet.getLastRow();
    if (lastRow > 1) {
      var existing = logSheet.getRange(2, 5, lastRow - 1, 2).getValues();
      for (var i = 0; i < existing.length; i++) {
        if ((fp && existing[i][0] === fp) || (ip && ip !== "unknown" && existing[i][1] === ip)) {
          return ContentService.createTextOutput("DUPLICATE_DEVICE_IGNORED");
        }
      }
    }

    // Record the unique vote
    logSheet.appendRow([
      new Date(),
      Number(data.candidateNumber),
      String(data.candidateName || ""),
      String(data.mode || "evm"),
      fp,
      ip,
      String(data.isp || "")
    ]);

    // Update Live Candidate Count Table in Candidate_Summary
    sumSheet.clearContents();
    sumSheet.getRange(1, 1, 6, 3).setValues([
      ["क्रमांक (No.)", "प्रत्याशी का नाम (Candidate)", "कुल वोट (Unique Persons)"],
      [1, "मनोज कुमार आचार्य (Manoj Kumar Acharya)", '=COUNTIF(Votes_Log!B:B, 1)'],
      [2, "दानाराम वर्मा (Danaram Verma)", '=COUNTIF(Votes_Log!B:B, 2)'],
      [3, "देवीलाल शर्मा (Devilal Sharma)", '=COUNTIF(Votes_Log!B:B, 3)'],
      [4, "श्रवण सिंह राठौड़ (Shravan Singh Rathore)", '=COUNTIF(Votes_Log!B:B, 4)'],
      [5, "रणसिंह फोजी (Ransingh Fauji)", '=COUNTIF(Votes_Log!B:B, 5)']
    ]);

    return ContentService.createTextOutput("RECORDED");
  } finally {
    lock.releaseLock();
  }
}
```

3. Click **Deploy → New deployment → Select type: Web app**.
4. Set **Execute as:** `Me` and **Who has access:** `Anyone`, then click **Deploy**.
5. Copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`) and paste it into `voteWebhookUrl` at the top of `js/i18n.js`.

---

## 6. Google Analytics 4 (GA4) Integration & Civic Event Tracking

The web app includes full, native Google Analytics 4 support with zero external libraries and zero reload flashes. It tracks initial visits, 0ms client-side SPA routing across all 12 pages, and civic engagement actions.

### How to Turn On Google Analytics:
1. **Find your Measurement ID (`G-XXXXXXXXXX`):**
   - **From Firebase Console:** Open [Firebase Console](https://console.firebase.google.com/) → Select your project (`manoj-acharya-anoopshahar`) → **Project settings** (gear icon) → **Integrations** → **Google Analytics** (click Enable/Manage) → Click your Web App stream and copy the **Measurement ID** (starts with `G-`).
   - **Or from Google Analytics:** Open [Google Analytics](https://analytics.google.com/) → **Admin** → **Data Streams** → Web stream → Copy **Measurement ID** (`G-XXXXXXXXXX`).
2. **Add it to `js/i18n.js`:**
   Open `js/i18n.js` and paste your Measurement ID into `analyticsId`:
   ```javascript
   window.SITE_CONFIG = {
     ...
     analyticsId: "G-XXXXXXXXXX"
   };
   ```
3. **Deploy or Test:**
   - Once saved, Google Analytics loads asynchronously without blocking any initial paint.
   - For temporary testing without editing code, you can also append `?ga=G-XXXXXXXXXX` to your browser URL.

### Events Automatically Tracked:
- **`page_view`**: Triggered on initial page visit AND on every internal SPA navigation transition across all 12 pages (`index.html`, `how-to-vote.html`, `check-name.html`, `find-booth.html`, `manifesto.html`, `about.html`, `contact.html`, `sarpanch-role.html`, `faq.html`, `village-issues.html`, `ask.html`, `flyer.html`).
- **`practice_vote`**: Triggered when a voter tests the EVM demo or ballot paper on `how-to-vote.html` (includes candidate number and candidate name).
- **`language_change`**: Triggered when a voter toggles between Hindi and English (`{ language: 'hi' | 'en' }`).
- **`helpline_click`**: Triggered when a voter clicks WhatsApp (`{ channel: 'whatsapp' }`) or Call helpline (`{ channel: 'phone' }`).
- **`outbound_click`**: Triggered when clicking to the Rajasthan State Election Commission website or official voter search portal.
- **`booth_directions_click`**: Triggered when clicking Google Maps directions to the Anoopshahar polling booth.
- **`share`**: Triggered when a voter shares the website via Web Share or WhatsApp.
- **`accessibility_toggle`**: Triggered when large text or high contrast is enabled or disabled.
- **`audio_listen`**: Triggered when web speech text-to-speech audio begins or stops.
- **`ask_submit`**: Triggered when a citizen submits an inquiry form to the campaign WhatsApp.
- **`print_flyer`**: Triggered when printing the campaign flyer.



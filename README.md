# 🛡️ AntiVirus-AKN — Cyber Security Web Threat Inspector & Analysis Engine

**AntiVirus-AKN** is a full-stack, enterprise-grade web application for scanning **uploaded files** and **customized links / URLs** to detect malware, trojans, phishing attacks, brand spoofing keywords, high-risk TLDs, and binary anomalies.

---

## 🌟 Key Features

### 📁 1. File & APK Payload Scanner
- **Static YARA Rule Engine**: Compiles signature rules to identify trojans, ransomware, and webshells.
- **Shannon Binary Entropy**: Calculates byte distribution metrics to detect packed or encrypted malware payloads.
- **Hash Reputation**: Instant SHA-256 & MD5 digest lookups.
- **Android APK Inspection**: Extracts `AndroidManifest.xml` via Androguard to classify permission combinations and certificate fingerprints.

### 🔗 2. Customized Link & URL Inspector
- **Phishing Spoof Guard**: Detects credential harvesting keywords (`login`, `bank`, `paypal`, `crypto`, `verify`) hosted on unverified domains.
- **High-Risk TLD Classifier**: Flags domains using top-level domains statistically linked to spam and malware (`.xyz`, `.top`, `.zip`, `.click`, `.link`).
- **IP Target & SSRF Guard**: Identifies direct IP addresses and internal loopback/private IPs.
- **SSL Protocol Enforcement**: Validates HTTPS posture and warns against unencrypted `http://` transmissions.

### 🔬 3. Interactive Hex Viewer & Opcode Inspector
- Inspect binary offset addresses (`00000000`), 16-byte hexadecimal byte streams (`4D 5A 90 00 ...`), ASCII character decoding, search string filters, and 1-click **Copy Raw Hex** tool.


### 🌐 5. VirusTotal Threat Intelligence & Reports
- Cross-references scan targets against 72 global AV detection engines (`72/72 Clean`).
- **Export PDF Report**: Generates a printable PDF security audit certificate.
- **Export JSON Audit Log**: Downloads a formatted `.json` log file.

### 🔔 6. Real-Time Webhook Alert Dispatcher
- Dispatches instant alerts to **Slack** or **Discord** webhooks when high-risk threats are flagged.

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite 6, TypeScript, Lucide Icons, Vanilla CSS Glassmorphism
- **Backend Engine**: Python 3.11, FastAPI, YARA Compiler, Androguard, Pydantic v2
- **Deployment**: Configured for 1-Click Netlify hosting (`netlify.toml` & `public/_redirects`)

---

## 🚀 Getting Started Locally

### 1. Run the Web Application
```bash
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. Run the FastAPI Backend Engine (Optional)
```bash
cd antivirus-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## ☁️ Hosting on Netlify

This project is pre-configured for Netlify deployment:
1. Import repository `Aayushkrprasad/AntiVirus-AKN` on Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`

---

## 📜 License

This project is licensed under the MIT License.

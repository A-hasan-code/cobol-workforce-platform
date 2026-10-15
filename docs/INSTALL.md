# Install — local playground

You need **Node.js 20+** and **GnuCOBOL (`cobc`)** so the playground can compile and run COBOL on your machine.

## 1) Node.js
```bash
node --version   # v20+
npm --version
```
Install from https://nodejs.org if needed.

## 2) GnuCOBOL

### Windows
**Preferred (no Admin) — portable bundle into the repo:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-gnucobol-windows.ps1
npm run doctor
```
This downloads Arnold Trembley’s MinGW GnuCOBOL 3.2 into `tools/gnucobol/dist`.  
Runtime Kit / Studio auto-detect that `cobc.exe` (PATH not required).

**Other options:**
1. Chocolatey (Admin): `choco install gnucobol -y`  
2. SuperBOL user MSI  
3. MSYS2 MinGW64: `pacman -S mingw-w64-x86_64-gnucobol`

Verify:
```powershell
npm run doctor
npm run compile
npm run test:sample
```
Restart Studio after installing so it picks up the bundled compiler.

Helpful links:
- https://gnucobol.sourceforge.io/faq/gcfaq.html
- https://gnucobol.sourceforge.io/guides.html
- [cobol/13-GNUCOBOL.md](./cobol/13-GNUCOBOL.md)

### macOS
```bash
brew install gnucobol
cobc --version
```

### Linux (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install -y gnucobol
cobc --version
```

## 3) Project setup
From the repo root:
```bash
npm install
npm run estate:validate
npm run doctor
npm run phase1:check -- --allow-demo
```

`doctor` should say **GnuCOBOL OK** for real compile/test. If not, fix PATH / install and retry (or keep using DEMO Run in Studio).

## 4) Run sample without UI
```bash
npm run compile
npm run run:sample
npm run test:sample
```

## 5) Open Studio playground
```bash
npm run studio
```
Open the URL printed (default `http://localhost:8787`).

## 6) Deploy Studio (Render)

Docker image = Node 20 + GnuCOBOL so Doctor / Compile / Run / Test work in the cloud.  
Steps: [RENDER.md](./RENDER.md). Ask before any real deploy ([SAFETY.md](./SAFETY.md)).

## Safety
This playground uses **fake data** under `samples/bank-playground/`.  
It does **not** connect to a real bank. Breaking tests here cannot take down production.

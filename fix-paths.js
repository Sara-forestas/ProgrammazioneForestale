// 🛠 Script di correzione percorsi per OneDrive / SharePoint
// Compatibile con Windows e macOS
// Autore: ChatGPT Assistant 2025

const fs = require("fs");
const path = require("path");

try {
  const buildDir = path.join(__dirname, "build");
  const indexPath = path.join(buildDir, "index.html");

  if (!fs.existsSync(indexPath)) {
    console.error("❌ File index.html non trovato. Esegui prima: npm run build");
    process.exit(1);
  }

  let html = fs.readFileSync(indexPath, "utf8");

  // Rimuove gli slash iniziali nei percorsi delle risorse statiche
  html = html.replace(/="\//g, '="');

  // Rimuove eventuali percorsi assoluti nel manifest e icone
  html = html.replace(/href="\/manifest\.json"/g, 'href="manifest.json"');
  html = html.replace(/href="\/favicon\.ico"/g, 'href="favicon.ico"');

  fs.writeFileSync(indexPath, html, "utf8");

  console.log("✅ Percorsi corretti per OneDrive / SharePoint!");
} catch (err) {
  console.error("⚠️ Errore durante la correzione dei percorsi:", err);
}

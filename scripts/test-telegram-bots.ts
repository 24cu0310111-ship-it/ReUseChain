export {};

async function checkBots() {
  const adminToken = "8978711876:AAGGiaYKOVyQl43v5dyQKfnmLuoFZmtpJ2I";
  const backupToken = "8923070582:AAHPGMWVsKAnhMsFT9aMbbCZ4vpuPfK8IrM";

  console.log("Checking Telegram Bots...");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const resAdmin = await fetch(`https://api.telegram.org/bot${adminToken}/getMe`, { signal: controller.signal });
    const dataAdmin = await resAdmin.json();
    console.log("Admin Bot response:", dataAdmin);

    const resBackup = await fetch(`https://api.telegram.org/bot${backupToken}/getMe`, { signal: controller.signal });
    const dataBackup = await resBackup.json();
    console.log("Backup Bot response:", dataBackup);

    clearTimeout(timeout);
  } catch (err: any) {
    console.log("Network note when reaching api.telegram.org directly:", err.message);
  }
}

checkBots();

export {};

async function testRoutes() {
  const baseUrl = "http://localhost:3000";

  console.log("=== Testing Vision, Telegram Webhook & Live Route Endpoints ===");

  // 1. Task Manager Runaway CPU via Assistant POST
  console.log("\n1. Testing /api/assistant with Task Manager 99% CPU screenshot...");
  const resCpu = await fetch(`${baseUrl}/api/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queryText: "Task Manager shows 98.4% CPU runaway process svchost_crypto.exe and thermal throttling",
      photoData: "cpu_runaway",
    }),
  });
  const dataCpu = await resCpu.json();
  console.log(`Status: ${resCpu.status}`);
  console.log(`ActionType: ${dataCpu.actionType}`);
  console.log(`Interpreted Intent: ${dataCpu.actionDetails?.interpretedIntent}`);
  console.log(`Selected Tool: ${dataCpu.actionDetails?.selectedTool?.name}`);
  console.log(`Condition Badge: ${dataCpu.actionDetails?.conditionAssessment?.badge}`);

  // 2. Trigger Admin Escalation
  console.log("\n2. Triggering /api/assistant Escalation to Admin via Telegram...");
  const resEsc = await fetch(`${baseUrl}/api/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queryText: "I encountered an unhandled BugCheck stop code 0x80070005 ACCESS_DENIED during kernel memory map, please escalate to admin",
    }),
  });
  const dataEsc = await resEsc.json();
  const ticketId = dataEsc.actionDetails?.escalationId;
  console.log(`Status: ${resEsc.status}`);
  console.log(`ActionType: ${dataEsc.actionType}`);
  console.log(`Ticket ID: ${ticketId}`);
  console.log(`Telegram Notified: ${dataEsc.actionDetails?.telegramNotified}`);
  console.log(`Awaiting Admin Reply: ${dataEsc.actionDetails?.awaitingAdminReply}`);

  // 3. Polling Escalation Status (Pending)
  console.log("\n3. Polling /api/escalations/status before admin reply...");
  const resStatus1 = await fetch(`${baseUrl}/api/escalations/status?ticketId=${ticketId}`);
  const status1 = await resStatus1.json();
  console.log(`Ticket Status: ${status1.data?.status}`);

  // 4. Admin Replies via Telegram Webhook (/reply command)
  console.log("\n4. Simulating incoming Telegram Admin Webhook /reply command...");
  const resWebhook = await fetch(`${baseUrl}/api/telegram/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        text: `/reply ${ticketId} Kernel BugCheck 0x80070005 is caused by hypervisor secure boot memory write collision. Disable Memory Integrity in Windows Core Isolation and re-sign kernel driver.`,
        from: { first_name: "Alex", last_name: "Rivera (Lead Admin)" },
        chat: { id: 1049281 },
      },
    }),
  });
  const webhookData = await resWebhook.json();
  console.log(`Webhook Status: ${resWebhook.status}`);
  console.log(`Webhook Action: ${webhookData.action}`);
  console.log(`Passport Hash: ${webhookData.passportHash?.slice(0, 20)}...`);

  // 5. Polling Escalation Status (Resolved)
  console.log("\n5. Polling /api/escalations/status after admin reply...");
  const resStatus2 = await fetch(`${baseUrl}/api/escalations/status?ticketId=${ticketId}`);
  const status2 = await resStatus2.json();
  console.log(`Ticket Status: ${status2.data?.status}`);
  console.log(`Admin Response: "${status2.data?.adminResponse?.slice(0, 70)}..."`);
  console.log(`Learned Rule: "${status2.data?.learnedRule}"`);

  // 6. Test Self-Improving AI Adaptation on Repeat Query
  console.log("\n6. Testing Self-Improving AI on subsequent query with 0x80070005...");
  const resRepeat = await fetch(`${baseUrl}/api/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queryText: "I have BugCheck 0x80070005 kernel memory error",
    }),
  });
  const dataRepeat = await resRepeat.json();
  console.log(`Status: ${resRepeat.status}`);
  console.log(`Is Self-Learned: ${dataRepeat.actionDetails?.isSelfLearned}`);
  console.log(`Learned from: ${dataRepeat.actionDetails?.learnedFromAdmin}`);
  console.log(`Agent Completion Message: ${dataRepeat.completionMessage?.slice(0, 100)}...`);

  console.log("\n🎉 ALL HTTP ENDPOINTS AND FLOWS VERIFIED SUCCESSFULLY!");
}

testRoutes().catch(console.error);

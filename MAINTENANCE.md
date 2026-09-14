# ReUseChain AI Reasoning Engine - Maintenance & Architecture Guide

This document explains the multi-provider reasoning architecture in ReUseChain and provides instructions on how to maintain, test, and use **Google Gemini**, **OpenRouter**, and **Groq** models without breaking changes.

---

## 1. Provider & Model Architecture

ReUseChain features an auto-detecting multi-provider dispatcher located in [`src/lib/hardware-ai-agent.ts`](./src/lib/hardware-ai-agent.ts):

| Provider | Supported Models | Primary Use Case | API Key Format |
| :--- | :--- | :--- | :--- |
| **OpenRouter** | `deepseek/deepseek-r1`<br>`meta-llama/llama-3.3-70b-instruct`<br>`meta-llama/llama-3.1-8b-instruct` | Deep reasoning, high chain-of-thought extraction, fast tool calling | `sk-or-v1-...` |
| **Groq** | `qwen/qwen3.8-27b` | Ultra-low latency tool triage (~300ms direct, ~2s end-to-end) | `gsk_...` |
| **Google Gemini** | `gemini-2.0-flash-thinking-exp-01-21`<br>`gemini-2.0-flash`<br>`gemini-1.5-pro`<br>`gemini-1.5-flash` | Native experimental thinking, multimodal vision, high token limits | `AIzaSy...` |
| **Local Offline** | `local-autonomous` | Rule-based heuristics, 14 host hardware probes, zero internet/API needed | *None* |

---

## 2. Using & Maintaining Google Gemini Models

When you want to switch or add **Google Gemini** models in the future:

### Step 1: Obtain a Gemini API Key
Generate an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Step 2: Configure the Key (Two Methods)
1. **Server Environment (`.env`)**:
   Add or update your key in `.env`:
   ```env
   GEMINI_API_KEY="AIzaSyYourGoogleStudioKeyHere"
   ```
2. **In the Web UI (No Restart Required)**:
   - Click the **Reasoning AI** badge in the header of `/assistant`.
   - Click the **✨ Preset Gemini** button or paste your `AIzaSy...` key.
   - Click **Save & Activate**. The key is stored safely in your browser's `localStorage` (`reusechain_reasoning_api_key`).

### Step 3: Automatic Provider Auto-Detection & Fallback
The backend automatically routes based on key and model:
- If your key starts with `AIzaSy` or `targetModel` contains `gemini`, it calls `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`.
- If you had previously selected a DeepSeek model but enter a Gemini key, the router **automatically maps** to `gemini-2.0-flash-thinking-exp-01-21` so your app never crashes.
- Gemini 2.0 Flash Thinking thoughts (`part.thought`) are automatically extracted and rendered with a `🧠 Gemini Thought (X)` badge in the chat interface.

---

## 3. Where Core Files Live

- **Reasoning Dispatcher**: [`src/lib/hardware-ai-agent.ts`](./src/lib/hardware-ai-agent.ts)
  - Manages tool selection, OpenRouter/Groq/Gemini dispatch, thought extraction, and the interactive keyboard scancode tester guardrail.
- **Vision Engine**: [`src/lib/vision-diagnostic-engine.ts`](./src/lib/vision-diagnostic-engine.ts)
  - Analyzes BSOD crash screens and Task Manager screenshots using Gemini 1.5 Flash Vision or optical heuristics.
- **Chat Endpoint**: [`src/app/api/assistant/route.ts`](./src/app/api/assistant/route.ts)
  - Receives `queryText`, `apiKey`, and `reasoningModel`, executes live host PowerShell diagnostic commands, and returns structured actions.
- **Frontend UI**: [`src/app/assistant/page.tsx`](./src/app/assistant/page.tsx)
  - Real-time chat stream, model configuration modal, 1-click preset buttons, expandable Chain-of-Thought widget, and interactive scancode tester.

---

## 4. How to Verify All Providers

To verify that all keys and providers are functioning correctly at any time, run:

```bash
node -e "
async function check() {
  const env = process.env;
  console.log('OpenRouter:', env.OPENROUTER_API_KEY ? 'Configured' : 'Missing');
  console.log('Groq:', env.GROQ_API_KEY ? 'Configured' : 'Missing');
  console.log('Gemini:', env.GEMINI_API_KEY ? 'Configured' : 'Missing');
}
check();
"
```

And run the TypeScript compiler check:
```bash
npx tsc --noEmit
```

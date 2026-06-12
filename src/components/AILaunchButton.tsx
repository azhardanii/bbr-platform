"use client";

import { useState } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";

interface AILaunchButtonProps {
  promptText: string;
  preferredAI?: string; // claude | chatgpt | perplexity
  label?: string;
}

export default function AILaunchButton({ promptText, preferredAI = "claude", label = "Buka di AI" }: AILaunchButtonProps) {
  const [copied, setCopied] = useState(false);

  const aiUrls: Record<string, string> = {
    claude: "https://claude.ai/new",
    chatgpt: "https://chat.openai.com/",
    perplexity: "https://www.perplexity.ai/",
  };

  const getAILogoUrl = () => {
    // For MVP we just use text or simple colors, but we could return icon paths
    switch (preferredAI) {
      case "claude": return "🟣 Claude";
      case "chatgpt": return "🟢 ChatGPT";
      case "perplexity": return "🔵 Perplexity";
      default: return "🤖 AI";
    }
  };

  const handleLaunch = async () => {
    try {
      // Try to copy to clipboard first
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      
      // Open AI URL in new tab
      const url = aiUrls[preferredAI] || aiUrls.claude;
      window.open(url, "_blank");

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback: Just open the URL even if copy fails
      window.open(aiUrls[preferredAI] || aiUrls.claude, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Visual prompt preview (optional) */}
      <div className="bg-[var(--color-bg-base)] border border-[var(--color-bg-muted)] p-4 rounded-xl text-xs font-mono text-[var(--color-text-secondary)] max-h-32 overflow-y-auto whitespace-pre-wrap select-all">
        {promptText}
      </div>
      
      <button 
        onClick={handleLaunch}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-brand-600)] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[var(--color-brand-500)] transition-all shadow-sm group"
      >
        {copied ? (
          <>
            <Check size={18} />
            Prompt Tersalin! Buka {getAILogoUrl().split(' ')[1]}...
          </>
        ) : (
          <>
            <Copy size={18} className="group-hover:scale-110 transition-transform" />
            Salin Prompt & Buka di {getAILogoUrl().split(' ')[1]}
            <ExternalLink size={16} className="ml-1 opacity-70" />
          </>
        )}
      </button>
      <p className="text-[11px] text-center text-[var(--color-text-disabled)]">
        Prompt akan disalin otomatis. Setelah {getAILogoUrl().split(' ')[1]} terbuka, tekan <kbd className="bg-[var(--color-bg-muted)] px-1 py-0.5 rounded text-[10px]">Ctrl+V</kbd> (atau <kbd className="bg-[var(--color-bg-muted)] px-1 py-0.5 rounded text-[10px]">Cmd+V</kbd>) untuk mem-paste.
      </p>
    </div>
  );
}

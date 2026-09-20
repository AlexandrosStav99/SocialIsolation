"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  ShieldCheck,
  User,
  ArrowDown,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export default function CheckInChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Demonstration only. Replies are prewritten and do not interpret your text, assess safety or find services. Use fictional text only. This is not a support or emergency service.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [responseIndex, setResponseIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const demoResponses = [
    "Demo: the future check-in will ask you to choose a broad support topic.",
    "Demo: structured choices will clarify your service area and preferences.",
    "Demo: checked service information and deterministic routing are not available yet.",
    "Demo: no contact request has been created or sent. This is the end of the preview.",
  ];


  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distanceFromBottom < 80);
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
  }

  function handleSend() {
    if (!input.trim() || responseIndex >= demoResponses.length) return;

    const userMessage = input.trim().slice(0, 500);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setInput("");

    setMessages((prev) => [...prev, { role: "bot", text: demoResponses[responseIndex] }]);
    setResponseIndex((prev) => prev + 1);
  }


  return (
    <main className="fixed inset-x-0 bottom-0 top-24 flex flex-col overflow-hidden bg-[#F6F3EE]">
      <style>{`
  @keyframes blobFloat {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(30px, -25px) scale(1.4);
    }
  }

  .chat-blob {
    animation: blobFloat 9s ease-in-out infinite;
  }
`}</style>
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="chat-blob absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-[#DCA77A]/20 blur-[40px]" />
        <div className="chat-blob absolute right-10 top-1/3 h-[350px] w-[350px] rounded-full bg-[#2F6F68]/15 blur-[40px]" />
        <div className="chat-blob absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-[#8FAF9A]/20 blur-[40px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 shrink-0 border-b border-[#E6DED3] bg-[#FFFCF7]/85 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#315C4B] text-white">
            <Bot size={22} />
          </div>

          <div>
            <h1 className="font-bold text-[#24352F]">Check-in Demonstration</h1>

            <div className="flex items-center gap-1 text-sm text-[#6B7B73]">
              <ShieldCheck size={15} className="text-[#6FAF8F]" />
              Prewritten replies · fictional text only
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <section
        aria-label="Demo conversation"
        role="log"
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative z-10 flex-1 overflow-y-auto px-5 py-8 pb-36"
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"
                  }`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFE8DE] text-[#315C4B]">
                    <Bot size={18} />
                  </div>
                )}

                <div
                  style={{ whiteSpace: "pre-wrap" }}
                  className={`max-w-[75%] rounded-3xl px-5 py-3 text-sm leading-relaxed shadow-sm ${isUser
                    ? "rounded-br-md bg-[#315C4B] text-white"
                    : "rounded-bl-md border border-[#E6DED3] bg-white text-[#31413B]"
                    }`}
                >
                  {message.text}
                </div>

                {isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DDEADD] text-[#315C4B]">
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </section>

      {/* Scroll down button */}
      {!isAtBottom && (
        <button
          aria-label="Scroll to latest message"
          onClick={scrollToBottom}
          className="fixed bottom-6 left-1/2 z-40 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-[#D8CEC1] bg-white text-[#315C4B] shadow-lg transition hover:bg-[#F6F3EE]"
        >
          <ArrowDown size={20} />
        </button>
      )}

      {/* Floating input */}
      <div
        className={`fixed left-0 right-0 z-30 px-5 transition-all duration-300 ${isAtBottom ? "bottom-5 opacity-100" : "-bottom-32 opacity-0"
          }`}
      >
        <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-full border border-[#D8CEC1] bg-white p-3 shadow-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Fictional demo message"
            maxLength={500}
            disabled={responseIndex >= demoResponses.length}
            placeholder="Enter fictional text to preview the interface"
            rows={1}
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-4 py-3 text-sm text-[#24352F] outline-none placeholder:text-[#8B968F]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            aria-label="Send demo message"
            disabled={!input.trim() || responseIndex >= demoResponses.length}
            onClick={handleSend}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#315C4B] text-white transition hover:bg-[#274A3D]"
          >
            <Send size={19} />
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-[#7A867F]">
          Demo only · Maximum 500 characters · No real names, contact details or personal experiences.
        </p>
      </div>
    </main>
  );
}
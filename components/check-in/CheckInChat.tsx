"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  ShieldCheck,
  User,
  ArrowDown,
  Mic,
  MicOff,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export default function CheckInChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "This prototype check-in is being rebuilt around the TalkPoint MVP specification. For now, share only what you are comfortable entering.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [responseIndex, setResponseIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const demoResponses = [
    "How long have you been feeling this way?",

    "I understand. Feeling disconnected for a while can be difficult. Do you feel you currently have people you can talk to or rely on?",

    "Thank you. From what you shared, it sounds like having more social connection and support could help.",

    "I can look for organizations, communities, or support services that match your needs while keeping your information private.",

    `I found a few support options that may be helpful. Would you like to see them anonymously first, or request someone to contact you?

Remember, sharing contact details is completely optional. You stay in control of what information you provide.`,

    `Based on what you shared, these organizations may be helpful:

💙 Cyprus Samaritans

Emotional support, active listening and support for people experiencing loneliness and emotional distress.

Website:
https://cyprussamaritans.org/


🧠 Mental Health Services Cyprus

Professional psychological and mental health support services.

Website:
https://www.moh.gov.cy/


🌱 Cyprus Mental Health Association

Mental wellbeing awareness, support, and resources for people experiencing mental health difficulties.

Website:
https://www.cymentalhealth.org.cy/


🤝 Hope For Children CRC Policy Center

Psychological and social support services for young people and families.

Website:
https://www.uncrcpc.org.cy/


Your personal information is never shared unless you choose to contact an organization.`,
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
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            demoResponses[responseIndex] ??
            "Thank you. I have enough information to suggest some support options.",
        },
      ]);

      setResponseIndex((prev) => prev + 1);
      setTimeout(scrollToBottom, 50);
    }, 700);
  }

  function handleSpeechToText() {
    type SpeechRecognitionEventLike = {
      results: ArrayLike<{ 0: { transcript: string } }>;
    };
    type SpeechRecognitionLike = {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onstart: (() => void) | null;
      onresult: ((event: SpeechRecognitionEventLike) => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognitionConstructor =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionConstructor();

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-[#F6F3EE]">
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
            <h1 className="font-bold text-[#24352F]">Support Check-in</h1>

            <div className="flex items-center gap-1 text-sm text-[#6B7B73]">
              <ShieldCheck size={15} className="text-[#6FAF8F]" />
              Prototype check-in
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <section
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
            placeholder="Tell me what is going on..."
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
            type="button"
            onClick={handleSpeechToText}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition ${isListening
              ? "bg-red-100 text-red-600"
              : "bg-[#F6F3EE] text-[#315C4B] hover:bg-[#EFE8DE]"
              }`}
          >
            {isListening ? <MicOff size={19} /> : <Mic size={19} />}
          </button>

          <button
            onClick={handleSend}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#315C4B] text-white transition hover:bg-[#274A3D]"
          >
            <Send size={19} />
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-[#7A867F]">
          Prototype flow · Do not enter identifying information.
        </p>
      </div>
    </main>
  );
}
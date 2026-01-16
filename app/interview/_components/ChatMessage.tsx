"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../types";
import { Bot } from "lucide-react";

export const ChatMessage = ({ message }: { message: Message }) => {
  const isAi = message.sender === "ai";

  return (
    <div
      className={`flex w-full mb-6 ${isAi ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`flex gap-4 max-w-[85%] ${
          isAi ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar (頭像) */}
        <div
          className={`
            w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white font-bold shadow-sm
            ${
              isAi
                ? "bg-gradient-to-tr from-indigo-500 to-purple-500"
                : "bg-gray-600"
            }
        `}
        >
          {isAi ? <Bot size={18} /> : "YOU"}
        </div>

        {/* Bubble (對話框) */}
        <div
          className={`
            p-5 shadow-sm text-gray-200 leading-relaxed
            ${
              isAi
                ? "bg-[#252526] rounded-2xl rounded-tl-none border border-gray-700/50"
                : "bg-indigo-600 rounded-2xl rounded-tr-none text-white"
            }
        `}
        >
          {/* 這裡神奇的地方來了：
            我們自定義 Markdown 的渲染規則，讓普通的文字變成你設計的樣式 
          */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // 1. 一般段落 (p tag) -> 對應你的 <p class="mb-3">
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              // 2. 粗體 (**text**) -> 對應你的 <strong>O(n²)</strong>
              strong: ({ children }) => (
                <span className="font-bold text-indigo-400 bg-indigo-500/10 px-1 rounded">
                  {children}
                </span>
              ),
              // 3. 程式碼區塊 (```code```)
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <div className="my-3 rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e1e]">
                    <div className="bg-[#2d2d2d] px-3 py-1 text-xs text-gray-400 border-b border-gray-700">
                      {match[1]}
                    </div>
                    <code
                      className="block p-3 text-sm font-mono text-gray-300 overflow-x-auto"
                      {...props}
                    >
                      {children}
                    </code>
                  </div>
                ) : (
                  <code
                    className="bg-gray-700/50 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-200"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // 4. 引用區塊 (> text) -> 對應你的 "Can you optimize..." 灰色小字
              blockquote: ({ children }) => (
                <div className="mt-4 pt-3 border-t border-gray-700/50 text-sm text-gray-400 italic">
                  {children}
                </div>
              ),
              // 5. 列表
              ul: ({ children }) => (
                <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>

          {/* Timestamp */}
          <div
            className={`text-[10px] mt-2 opacity-50 ${
              isAi ? "text-right" : "text-left"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

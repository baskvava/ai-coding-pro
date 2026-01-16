import { useRef } from "react";
import { FONTS, LANGUAGES, THEMES } from "../constants";

export const CodeEditor = ({
  code,
  setCode,
  language,
  themeKey,
  fontKey,
}: {
  code: string;
  setCode: (s: string) => void;
  language: string;
  themeKey: string;
  fontKey: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const theme = THEMES[themeKey];
  const font = FONTS[fontKey];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      setCode(value.substring(0, start) + "    " + value.substring(end));

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const lines = code.split("\n").length;

  return (
    <div
      className="relative h-full w-full font-mono text-sm overflow-hidden flex flex-col transition-colors duration-300"
      style={{ backgroundColor: theme.bg, fontFamily: font.value }}
    >
      <div className="flex-1 flex relative">
        <div
          className="w-12 text-right pr-3 pt-4 select-none leading-6 transition-colors duration-300"
          style={{
            backgroundColor: theme.gutterBg,
            color: theme.gutterText,
            borderRight: `1px solid ${theme.border}`,
            fontFamily: font.value,
          }}
        >
          {Array.from({ length: Math.max(lines, 20) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setCode(e.target.value)
          }
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent p-4 outline-none resize-none leading-6 whitespace-pre transition-colors duration-300"
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="off"
          style={{
            tabSize: 4,
            color: theme.text,
            fontFamily: font.value,
          }}
        />
      </div>
      <div className="h-6 bg-[#007acc] text-white text-xs flex items-center px-4 justify-between select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="font-bold">Language:</span>
            <span>{LANGUAGES[language].name}</span>
          </span>
        </div>
        <span>Ln {lines}, Col 1</span>
      </div>
    </div>
  );
};

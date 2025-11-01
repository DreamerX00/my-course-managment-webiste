"use client";
import { useEffect, useState } from "react";

interface TypewriterProps {
  readonly texts: string[];
  readonly speed?: number;
  readonly pause?: number;
  readonly className?: string;
}

export function Typewriter({
  texts,
  speed = 50,
  pause = 1800,
  className = "",
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!texts || texts.length === 0) return;
    let timeout: NodeJS.Timeout;
    if (!deleting && charIdx < texts[textIdx]?.length) {
      timeout = setTimeout(() => {
        setDisplayed((prev) => prev + texts[textIdx][charIdx]);
        setCharIdx((i) => i + 1);
      }, speed);
    } else if (!deleting && charIdx === texts[textIdx]?.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setDisplayed((prev) => prev.slice(0, -1));
        setCharIdx((i) => i - 1);
      }, speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx((i) => (i + 1) % texts.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  // Responsive font size: shrink for long text, but keep it visually balanced
  let fontSize = "2.5rem";
  if (displayed.length > 60) fontSize = "1.3rem";
  else if (displayed.length > 40) fontSize = "1.7rem";
  else if (displayed.length > 25) fontSize = "2.1rem";

  return (
    <span
      className={`inline-block text-balance text-center w-full max-w-3xl mx-auto font-extrabold ${className}`}
      style={{
        fontSize,
        lineHeight: 1.15,
        wordBreak: "break-word",
        whiteSpace: "pre-line",
        transition: "font-size 0.2s",
      }}
    >
      {displayed && (
        <>
          {displayed}
          <span className="animate-pulse align-baseline text-blue-900">|</span>
        </>
      )}
    </span>
  );
}

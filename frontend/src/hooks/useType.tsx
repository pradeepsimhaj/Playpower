import { useEffect, useState } from "react";

export const useType = (text: string, speed: number = 10): string => {
  const [displayedText, setDisplayedText] = useState<string>("");

  useEffect(() => {
    if (!text) return;

    let i = 0;
    let currentText = "";
    setDisplayedText(""); // Reset before new typing starts

    const interval = setInterval(() => {
      currentText += text[i];
      setDisplayedText(currentText);
      i++;

      if (i >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayedText;
};

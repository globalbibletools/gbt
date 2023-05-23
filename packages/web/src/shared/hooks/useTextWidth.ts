import { useEffect, useRef, useState } from 'react';

/**
 * Calculate the width of some text.
 * @param text The text to measure.
 * @returns The width of the text, in pixels.
 */
export function useTextWidth(text: string): number {
  // TODO: allow the font information to be passed in, so that we can take
  //       into account things like font family, font size, and font weight.
  let textElement: HTMLElement;
  useEffect(() => {
    textElement = document.createElement('span');
    textElement.style.width = 'auto';
    textElement.style.height = '0';
    textElement.style.position = 'absolute';
    textElement.style.visibility = 'hidden';
    document.body.appendChild(textElement);
    return () => textElement.remove();
  }, []);

  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (textElement) {
      textElement.innerText = text;
      setWidth(textElement.clientWidth);
    }
  }, [text]);
  return width;
}

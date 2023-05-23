import { useEffect, useRef, useState } from 'react';

/**
 * Calculate the width of some text.
 * @param text The text to measure.
 * @returns The width of the text, in pixels.
 */
// TODO: allow the font information to be passed in, so that we can take
//       into account things like font family, font size, and font weight.
export function useTextWidth(text: string): number {
  let textElement: HTMLElement;

  useEffect(() => {
    textElement = document.createElement('span');
    textElement.style.width = 'auto';
    textElement.style.height = '0';
    textElement.style.maxHeight = '0';
    textElement.style.visibility = 'hidden';
    textElement.style.position = 'absolute';
    // This seems hacky, but it gets the elements completely off the screen, so
    // that they don't affect the scroll bar.
    textElement.style.top = '-9999px';
    textElement.style.left = '-9999px';
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

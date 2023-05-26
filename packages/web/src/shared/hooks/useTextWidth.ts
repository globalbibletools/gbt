import { useEffect, useRef, useState } from 'react';

/**
 * Calculate the width of some text.
 * @param text The text to measure.
 * @returns The width of the text, in pixels.
 */
// TODO: allow the font information to be passed in, so that we can take
//       into account things like font family, font size, and font weight.
export function useTextWidth(text: string): number {
  const el = useRef<HTMLDivElement>();

  useEffect(() => {
    const div = document.createElement('div');
    div.style.width = 'auto';
    div.style.height = '0';
    div.style.maxHeight = '0';
    div.style.visibility = 'hidden';
    div.style.position = 'absolute';
    // This seems hacky, but it gets the elements completely off the screen, so
    // that they don't affect the scroll bar.
    div.style.top = '-9999px';
    div.style.left = '-9999px';
    document.body.appendChild(div);
    el.current = div;
    return () => div.remove();
  }, []);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (el.current) {
      el.current.innerText = text;
      setWidth(el.current.clientWidth);
    }
  }, [text]);

  return width;
}

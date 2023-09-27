import { useEffect } from 'react';
import fontClient from '../fontClient';

/**
 * Ensure that each of the given fonts has been added to the page.
 */
export const useLoadFonts = (fonts: string[], preview = false) => {
  useEffect(() => {
    for (const font of fonts) {
      loadFontUrl(
        preview ? fontClient.getPreviewCssUrl(font) : fontClient.getCssUrl(font)
      );
    }
  }, [fonts, preview]);
};

const loadedUrls: string[] = [];
/**
 * Add a CSS font to the page, if it hasn't been added already.
 */
const loadFontUrl = (url: string) => {
  if (loadedUrls.includes(url)) {
    return;
  }
  document.head.insertAdjacentHTML(
    'beforeend',
    `<link rel=stylesheet href="${url}">`
  );
  loadedUrls.push(url);
};

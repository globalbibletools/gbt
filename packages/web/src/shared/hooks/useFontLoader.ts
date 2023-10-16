import { useEffect } from 'react';
import fontClient from '../fontClient';

export const secondaryFonts = ['Noto Sans', 'Noto Serif'];

/**
 * Add a secondary font to the given font, if needed.
 */
export const expandFontFamily = (font: string) => {
  for (const secondary of secondaryFonts) {
    if (font.startsWith(secondary) && font !== secondary) {
      return `"${font}", "${secondary}"`;
    }
  }
  return `"${font}"`;
};

/**
 * Ensure that each of the given fonts has been added to the page.
 */
export const useFontLoader = (fonts: string[], preview = false) => {
  useEffect(() => {
    for (const font of fonts) {
      loadFontUrl(
        preview ? fontClient.getPreviewCssUrl(font) : fontClient.getCssUrl(font)
      );
      // Load a secondary font, if necessary
      for (const secondary of secondaryFonts) {
        if (font.startsWith(secondary) && font !== secondary) {
          loadFontUrl(
            secondary
              ? fontClient.getPreviewCssUrl(secondary)
              : fontClient.getCssUrl(secondary)
          );
        }
      }
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

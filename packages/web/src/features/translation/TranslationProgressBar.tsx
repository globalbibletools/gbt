import { useEffect, useRef, useState } from 'react';
import { useTextWidth } from '../../shared/hooks/useTextWidth';
import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import { useQuery } from '@tanstack/react-query';

interface TranslationProgressBarProps {
  language: string;
  bookId: number;
}

export default function TranslationProgressBar({
  language,
  bookId,
}: TranslationProgressBarProps) {
  const bookProgressQuery = useQuery(
    ['book-progress', language, bookId],
    ({
      queryKey: [, language, bookId],
    }: {
      queryKey: [string, string, number];
    }) => apiClient.books.findProgress(bookId, language)
  );
  const approvedCount = bookProgressQuery.data?.data.approvedCount ?? 0;
  const wordCount = bookProgressQuery.data?.data.wordCount ?? Infinity;

  const { t } = useTranslation();
  const progressElementRef = useRef<HTMLDivElement>(null);

  const percentageFull = (approvedCount / wordCount) * 100;

  const progressText = `${approvedCount}/${wordCount} ${t(
    'translate:words'
  )} (${percentageFull.toFixed(1)}%)`;

  const textElementWidth =
    32 + // 32px for the left/start margin
    useTextWidth({
      text: progressText,
      fontSize: '12px',
      fontFamily: 'inherit',
    }) +
    12; // 12px for the right/end margin;

  const [textFitsInside, setTextFitsInside] = useState(true);

  useEffect(() => {
    const { current: progressElement } = progressElementRef;
    if (!progressElement) return;
    const resizeObserver = new ResizeObserver(() => {
      setTextFitsInside(textElementWidth <= progressElement.offsetWidth);
    });
    resizeObserver.observe(progressElement);
    return () => resizeObserver.disconnect();
  }, [textElementWidth]);

  return (
    <div className="relative h-2 group z-[1]">
      <div className="absolute min-h-2 w-full flex">
        <div
          ref={progressElementRef}
          style={{ width: `${percentageFull}%` }}
          className="bg-blue-700"
        >
          {textFitsInside && (
            <div className="ms-8 me-3 hidden group-hover:inline-block text-xs text-white select-none">
              {progressText}
            </div>
          )}
        </div>
        <div
          style={{ width: `${100 - percentageFull}%` }}
          className="bg-brown-100"
        >
          {!textFitsInside && (
            <div className="ms-3 hidden group-hover:inline-block text-xs text-black select-none">
              {progressText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

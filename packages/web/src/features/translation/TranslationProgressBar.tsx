import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTextWidth } from '../../shared/hooks/useTextWidth';
import { useTranslation, getI18n } from 'react-i18next';

interface TranslationProgressBarProps {
  wordsApproved: number;
  wordsTotal: number;
}

export default function TranslationProgressBar(
  props: TranslationProgressBarProps
) {
  const { t } = useTranslation();
  const theRef = useRef<HTMLDivElement>(null);

  const fractionFull = props.wordsApproved / props.wordsTotal;

  const text = `${props.wordsApproved}/${props.wordsTotal} ${t(
    'translate:words'
  )} (${(fractionFull * 100).toFixed(1)}%)`;
  const textElementWidth =
    32 +
    useTextWidth({ text: text, fontSize: '12px', fontFamily: 'inherit' }) +
    12;

  const [fitsInside, setFitsInside] = useState(true);

  useEffect(() => {
    const { current } = theRef;
    if (!current) return;
    const resizeObserver = new ResizeObserver(() => {
      console.log(
        JSON.stringify({
          textElementWidth,
          offsetWidth: current.offsetWidth,
        })
      );
      if (textElementWidth > current.offsetWidth) {
        setFitsInside(false);
      } else {
        setFitsInside(true);
      }
    });
    resizeObserver.observe(current);
    return () => resizeObserver.disconnect();
  }, [textElementWidth]);

  return (
    <div className="relative h-2 group">
      <div className="absolute w-full min-h-2 overflow-auto flex">
        <div
          ref={theRef}
          style={{ width: `${fractionFull * 100}%` }}
          className="min-h-2 bg-blue-700"
        >
          {fitsInside && (
            <div className="ms-8 me-3 hidden group-hover:inline-block text-xs text-white select-none">
              {text}
            </div>
          )}
        </div>
        <div
          style={{ width: `${(1 - fractionFull) * 100}%` }}
          className="min-h-2 bg-brown-100"
        >
          {!fitsInside && (
            <div className="ms-3 hidden group-hover:inline-block text-xs text-black select-none">
              {text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

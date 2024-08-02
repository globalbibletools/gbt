import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTextWidth } from '../../shared/hooks/useTextWidth';

export default function TranslationProgressBar() {
  const theRef = useRef<HTMLDivElement>(null);
  const text = '1232/4500 words (27.3%)';
  const textElementWidth =
    32 +
    useTextWidth({ text: text, fontSize: '12px', fontFamily: 'inherit' }) +
    12;

  const [fitsInside, setFitsInside] = useState(true);

  const fractionFull = 0.3;
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
    return () => resizeObserver.disconnect(); // clean up
  }, [textElementWidth]);
  //   useEffect(() => {
  //     if (theRef.current) {
  //       console.log(
  //         JSON.stringify({
  //           textElementWidth,
  //           offsetWidth: theRef.current.offsetWidth,
  //         })
  //       );
  //       if (textElementWidth > theRef.current.offsetWidth) {
  //         fitsInside.current = false;
  //       } else {
  //         fitsInside.current = true;
  //       }
  //     }
  //   });
  return (
    <div className="relative h-2 group">
      <div className="absolute w-full min-h-2 overflow-auto flex">
        <div
          ref={theRef}
          style={{ width: `${fractionFull * 100}%` }}
          className="min-h-2 bg-blue-700"
        >
          {fitsInside && (
            <div className="ml-8 mr-3 hidden group-hover:inline-block text-xs text-white select-none">
              {text}
            </div>
          )}
        </div>
        <div
          style={{ width: `${(1 - fractionFull) * 100}%` }}
          className="min-h-2 bg-brown-100"
        >
          {!fitsInside && (
            <div className="ml-3 hidden group-hover:inline-block text-xs text-black select-none">
              {text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

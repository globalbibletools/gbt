import { useRef } from 'react';

export default function TranslationProgressBar() {
  const theRef = useRef<HTMLDivElement>(null);
  return (
    <div className="relative h-2 group">
      <div
        ref={theRef}
        className="absolute w-full bg-gradient-to-r from-blue-700 from-[10%] to-[10%] to-brown-100 min-h-2 overflow-auto"
      >
        <div className="ml-8 hidden group-hover:inline-block text-xs text-white select-none">
          1232/4500 words (27.3%)
        </div>
      </div>
    </div>
  );
}

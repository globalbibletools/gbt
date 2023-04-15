import { useLayoutContext } from '../../app/Layout';

export default function TranslationView() {
  const { language } = useLayoutContext();

  return (
    <div className="absolute w-full h-full flex items-center justify-center">
      selected language: {language?.name ?? 'None'}
    </div>
  );
}

import { useRef } from 'react';
import { DialogRef } from '../shared/Dialog';
import DropdownMenu, {
  DropdownMenuButton,
  DropdownMenuLink,
} from '../shared/DropdownMenu';
import { Icon } from '../shared/Icon';
import LanguageDialog from './LanguageDialog';

export default function Header() {
  const userName = 'Joe Translator';
  const languageDialog = useRef<DialogRef>(null);

  return (
    <header className="p-2 flex items-baseline z-10">
      <h1 className="font-bold text-lg">Gloss Translation</h1>
      <div className="flex-grow" />
      <nav className="flex items-baseline" aria-label="primary">
        <DropdownMenu text={userName}>
          <DropdownMenuLink to={'#'}>
            <Icon icon="user" className="mr-2" />
            Profile
          </DropdownMenuLink>
          <DropdownMenuButton
            onClick={() => {
              languageDialog.current?.open();
            }}
          >
            <Icon icon="earth" className="mr-2" />
            Language
          </DropdownMenuButton>
        </DropdownMenu>
      </nav>
      <LanguageDialog ref={languageDialog} />
    </header>
  );
}

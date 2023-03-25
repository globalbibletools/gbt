import DropdownMenu, { DropdownMenuButton, DropdownMenuLink } from '../shared/DropdownMenu';
import { Icon } from '../shared/Icon';

export default function Header() {
  const userName = "Joe Translator"

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
          <DropdownMenuButton onClick={() => { console.log('language') }}>
            <Icon icon="earth" className="mr-2" />
            Language
          </DropdownMenuButton>
        </DropdownMenu>
      </nav>
    </header>
  );
}

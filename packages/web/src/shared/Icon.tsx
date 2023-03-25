import { library } from '@fortawesome/fontawesome-svg-core';
import * as FaSolid from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Icon = FontAwesomeIcon;

library.add(
  FaSolid.faCaretDown,
  FaSolid.faCaretUp,
  FaSolid.faEarth,
  FaSolid.faUser,
  FaSolid.faClose
);

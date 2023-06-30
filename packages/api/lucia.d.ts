/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import('./shared/auth').Auth;
  type UserAttributes = {
    email?: string;
    name?: string;
  };
}

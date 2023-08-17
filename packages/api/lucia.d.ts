/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import('./shared/auth').Auth;
  type UserAttributes = {
    name?: string;
    emailStatus?: import('@translation/db').EmailStatus;
  };
}

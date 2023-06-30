import { Language, AuthUser, SystemRole } from '../../prisma/client';
import { PureAbility, AbilityBuilder } from '@casl/ability';
import { Subjects } from '@casl/prisma';
import { createPrismaAbility, PrismaQuery } from '../../prisma/casl';

export type Subject = Subjects<{
  Language: Language;
  AuthUser: AuthUser;
}>;
export type RawSubject = Extract<Subject, string>;
export type Action = 'create' | 'read' | 'translate' | 'administer';

export type Policy = PureAbility<[Action, Subject], PrismaQuery>;

export interface Actor {
  id: string;
  systemRoles: SystemRole[];
}

export function createPolicyFor(user?: Actor) {
  const { can, build } = new AbilityBuilder<Policy>(createPrismaAbility);

  can('read', 'Language');

  if (user) {
    can('translate', 'Language');

    can('read', 'AuthUser', { id: user.id });

    can('read', 'AuthUser', { id: user.id });

    if (user.systemRoles.includes(SystemRole.ADMIN)) {
      can('create', 'Language');
      can('create', 'AuthUser');
      can('read', 'AuthUser');
      can('administer', 'AuthUser');
    }
  }

  return build();
}

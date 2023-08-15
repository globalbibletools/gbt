import { PrismaTypes } from '../db';
import { PureAbility, AbilityBuilder } from '@casl/ability';
import { Subjects } from '@casl/prisma';
import { PrismaCasl } from '../db';

export type Subject = Subjects<{
  Language: PrismaTypes.Language;
  AuthUser: PrismaTypes.AuthUser;
}>;
export type RawSubject = Extract<Subject, string>;
export type Action = 'create' | 'read' | 'translate' | 'administer';

export type Policy = PureAbility<[Action, Subject], PrismaCasl.PrismaQuery>;

export interface Actor {
  id: string;
  systemRoles: PrismaTypes.SystemRole[];
}

export function createPolicyFor(user?: Actor) {
  const { can, build } = new AbilityBuilder<Policy>(
    PrismaCasl.createPrismaAbility
  );

  if (user) {
    can('read', 'Language', {
      roles: {
        some: {
          userId: user.id,
          role: PrismaTypes.LanguageRole.VIEWER,
        },
      },
    });
    can('translate', 'Language', {
      roles: {
        some: {
          userId: user.id,
          role: PrismaTypes.LanguageRole.TRANSLATOR,
        },
      },
    });
    can('administer', 'Language', {
      roles: {
        some: {
          userId: user.id,
          role: PrismaTypes.LanguageRole.ADMIN,
        },
      },
    });

    can('read', 'AuthUser', { id: user.id });

    if (user.systemRoles.includes(PrismaTypes.SystemRole.ADMIN)) {
      can('create', 'Language');
      can('read', 'Language');
      can('administer', 'Language');

      can('create', 'AuthUser');
      can('read', 'AuthUser');
      can('administer', 'AuthUser');
    }
  }

  return build();
}

import { Language, User, SystemRole, LanguageRole } from '@translation/db';
import { PureAbility, AbilityBuilder } from '@casl/ability';
import { Subjects } from '@casl/prisma';
import { createPrismaAbility, PrismaQuery } from './casl';

export type Subject = Subjects<{
  Language: Language;
  User: User;
}>;
export type RawSubject = Extract<Subject, string>;
export type Action = 'create' | 'read' | 'translate' | 'administer' | 'update';

export type Policy = PureAbility<[Action, Subject], PrismaQuery>;

export interface Actor {
  id: string;
  systemRoles: SystemRole[];
}

export function createPolicyFor(user?: Actor) {
  const { can, build } = new AbilityBuilder<Policy>(createPrismaAbility);

  if (user) {
    can('read', 'Language', {
      roles: {
        some: {
          userId: user.id,
          role: LanguageRole.VIEWER,
        },
      },
    });
    can('translate', 'Language', {
      roles: {
        some: {
          userId: user.id,
          role: LanguageRole.TRANSLATOR,
        },
      },
    });
    can('administer', 'Language', {
      roles: {
        some: {
          userId: user.id,
          role: LanguageRole.ADMIN,
        },
      },
    });

    can('read', 'User', { id: user.id });
    can('update', 'User', { id: user.id });

    if (user.systemRoles.includes(SystemRole.ADMIN)) {
      can('create', 'Language');
      can('read', 'Language');
      can('administer', 'Language');

      can('create', 'User');
      can('read', 'User');
      can('administer', 'User');
      can('update', 'User');
    }
  }

  return build();
}

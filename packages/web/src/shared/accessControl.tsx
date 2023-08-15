import { subject as subjectHelper } from '@casl/ability';
import { AbilityBuilder, createMongoAbility, PureAbility } from '@casl/ability';
import { useCallback, useMemo } from 'react';
import { SystemRole, LanguageRole } from '@translation/api-types';
import queryClient from './queryClient';
import useAuth, { sessionQuery } from './hooks/useAuth';

interface Actor {
  id: string;
  systemRoles: SystemRole[];
  languages: {
    code: string;
    roles: LanguageRole[];
  }[];
}

export type Action = 'create' | 'read' | 'translate' | 'administer';
export type SubjectType = 'User' | 'Language';
export type Subject = SubjectType | { id: string };
export type Policy = PureAbility<[Action, Subject]>;

export function createPolicyFor(user?: Actor) {
  const { can, build } = new AbilityBuilder<Policy>(createMongoAbility);

  if (user) {
    const languages = user.languages.map((language) => language.code);
    if (languages.length > 0) {
      can('read', 'Language', {
        id: { $in: languages },
      });
    }

    const translatorLanguages = user.languages
      .filter((language) => language.roles.includes(LanguageRole.Translator))
      .map((language) => language.code);
    if (translatorLanguages.length > 0) {
      can('translate', 'Language', {
        id: {
          $in: translatorLanguages,
        },
      });
    }

    const adminLanguages = user.languages
      .filter((language) => language.roles.includes(LanguageRole.Admin))
      .map((language) => language.code);
    if (adminLanguages.length > 0) {
      can('administer', 'Language', {
        id: {
          $in: adminLanguages,
        },
      });
    }

    can('read', 'User', { id: user.id });

    if (user.systemRoles.includes(SystemRole.Admin)) {
      can('create', 'Language');
      can('read', 'Language');
      can('administer', 'Language');

      can('create', 'User');
      can('read', 'User');
      can('administer', 'User');
    }
  }

  return build();
}

export class NotFoundError extends Error {}

/**
 * Prevents route from loading if the user does not have the proper permissions.
 * Use in a route data loader before attempting to load any data.
 */
export async function authorize<Data = never>(
  /** The action being performed on the subject. */
  action: Action,
  /** The subject of the permissions.
   * This should either the resources type,
   * or a specific resource identified by an ID.
   *
   * Note that if you don't specify an ID,
   * the user will have permissions if they have access _at least one_ resource of that type, not _every_.
   */
  subject: SubjectType | { type: SubjectType; id: string },
  /**
   * The function to run if the user has permissions.
   * The actual data loading should go here.
   */
  fn?: () => Data | Promise<Data>
) {
  const session = await queryClient.fetchQuery(sessionQuery);
  const policy = createPolicyFor(session.user);

  if (
    !policy.can(
      action,
      typeof subject === 'string'
        ? subject
        : subjectHelper(subject.type, { id: subject.id })
    )
  ) {
    throw new NotFoundError();
  }
  return fn?.() ?? null;
}

export interface UserCanOptions {
  /** The action being performed on the subject. */
  action: Action;
  /** The subject of the permissions.
   * This should either the resources type,
   * or a specific resource identified by an ID.
   *
   * Note that if you don't specify an ID,
   * the user will have permissions if they have access _at least one_ resource of that type, not _every_.
   */
  subject: SubjectType | { type: SubjectType; id: string };
}

/**
 * Creates a function to check whether the user has correct permissions.
 * This is useful for views where users of multiple permission levels can access,
 * but some actions need to be conditionally restricted.
 */
export function useAccessControl() {
  const { status, user } = useAuth();

  const policy = useMemo(() => {
    if (status !== 'loading') {
      return createPolicyFor(user);
    }
  }, [status, user]);

  return useCallback(
    /**
     * Determines whether the user has the correct permissions.
     *
     * Note that if you don't specify a subject ID,
     * the user will have permissions if they have access _at least one_ resource of that type, not _every_.
     *
     * @param action The action being performed on the subject.
     * @param subject The subject of the permissions. This should either be the resource type, or a specific resource identified by an ID.
     */
    (
      action: Action,
      subject: SubjectType | { type: SubjectType; id: string }
    ) =>
      policy?.can(
        action,
        typeof subject === 'string'
          ? subject
          : subjectHelper(subject.type, { id: subject.id })
      ),
    [policy]
  );
}

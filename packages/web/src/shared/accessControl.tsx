import { subject as subjectHelper } from '@casl/ability';
import { AbilityBuilder, createMongoAbility, PureAbility } from '@casl/ability';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import apiClient from '../shared/apiClient';
import { SystemRole, LanguageRole } from '@translation/api-types';
import queryClient from './queryClient';
import { redirect } from 'react-router-dom';

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
    console.log(user);
    can('read', 'Language', {
      id: { $in: user.languages.map((language) => language.code) },
    });
    can('translate', 'Language', {
      id: {
        $in: user.languages
          .filter((language) =>
            language.roles.includes(LanguageRole.Translator)
          )
          .map((language) => language.code),
      },
    });
    can('administer', 'Language', {
      id: {
        $in: user.languages
          .filter((language) => language.roles.includes(LanguageRole.Admin))
          .map((language) => language.code),
      },
    });

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

export async function authorize(
  action: Action,
  subject: SubjectType | { type: SubjectType; id: string }
) {
  const session = await queryClient.fetchQuery(['session'], async () =>
    apiClient.auth.session()
  );
  const policy = createPolicyFor(session.user);

  console.log(
    action,
    subject,
    typeof subject === 'string'
      ? subject
      : subjectHelper(subject.type, { id: subject.id })
  );
  if (
    !policy.can(
      action,
      typeof subject === 'string'
        ? subject
        : subjectHelper(subject.type, { id: subject.id })
    )
  ) {
    throw new Error('not authorized');
  }
  return null;
}

export interface UserCanProps {
  subject: SubjectType | { type: SubjectType; id: string };
  action: Action;
}

export function UserCan({
  children,
  action,
  subject,
}: UserCanProps & { children: ReactNode }) {
  const { data, status } = useQuery(['session'], async () =>
    apiClient.auth.session()
  );

  const policy = useMemo(() => {
    if (status === 'success') {
      if (data.user) {
        return createPolicyFor(data.user);
      } else {
        return createPolicyFor();
      }
    }
  }, [status, data?.user]);

  const canAccess = policy?.can(
    action,
    typeof subject === 'string'
      ? subject
      : subjectHelper(subject.type, { id: subject.id })
  );

  if (canAccess) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  } else {
    return null;
  }
}

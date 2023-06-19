import { subject as buildSubject } from '@casl/ability';
import type { RouteRequest } from '../Route';
import { client } from '../db';
import { ForbiddenError, NotFoundError } from '../errors';
import { Action, RawSubject, Subject } from './policy';

interface AuthorizeOptions {
  action: Action;
  subject: RawSubject;
  subjectId?: string;
}

/**
 * Determine whether a user is authorized to perform the requested action on the given subject.
 *
 * If no subject ID is given, the user will be authorized if they have access to _any_ (not all) of that subject type.
 * @param options
 */
export function authorize<Params, Body>(
  options:
    | AuthorizeOptions
    | ((req: RouteRequest<Params, Body>) => AuthorizeOptions)
): (req: RouteRequest<Params, Body>) => Promise<void> {
  return async (req: RouteRequest<Params, Body>) => {
    const config = typeof options === 'object' ? options : options(req);

    let subject: Subject | undefined = undefined;
    if ('subjectId' in config && config.subjectId) {
      switch (config.subject) {
        case 'Language': {
          const language = await client.language.findUnique({
            where: { code: config.subjectId },
          });
          if (language) {
            subject = buildSubject(config.subject, language);
          }
          break;
        }
        case 'User': {
          const user = await client.authUser.findUnique({
            where: { id: config.subjectId },
          });
          if (user) {
            subject = buildSubject(config.subject, user);
          }
          break;
        }
        default:
          throw new Error(`${config.subject} is not a valid subject type.`);
      }

      // If no subject is found in the database using the subject ID,
      // then we check the policy to see if this user can access all of a subject type to determine the error type.
      // Users like admins, for example should be able to see that a resource doesn't exist,
      // but normal users shouldn't be able to differentiate between resources that don't exist and ones that they don't have access to.
      if (!subject) {
        if (
          req.policy
            .rulesFor(config.action, config.subject)
            .some((rule) => !!rule.conditions)
        ) {
          throw new NotFoundError();
        } else {
          throw new ForbiddenError();
        }
      }
    } else {
      subject = config.subject;
    }

    if (!req.policy.can(config.action, subject)) {
      throw new ForbiddenError();
    }
  };
}

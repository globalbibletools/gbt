import { GetLanguageImportOptionsResponseBody } from '@translation/api-types';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';

export default createRoute()
  .get<void, GetLanguageImportOptionsResponseBody>({
    authorize: authorize({
      action: 'read',
      subject: 'AuthUser',
    }),
    async handler(req, res) {
      res.ok({
        data: ['test', 'another one'],
      });
    },
  })
  .build();

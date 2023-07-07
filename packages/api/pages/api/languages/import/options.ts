import { GetLanguageImportOptionsResponseBody } from '@translation/api-types';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';

const IMPORT_SERVER = 'https://hebrewgreekbible.online';

export default createRoute()
  .get<void, GetLanguageImportOptionsResponseBody>({
    authorize: authorize({
      action: 'read',
      subject: 'AuthUser',
    }),
    async handler(req, res) {
      try {
        // Request the server root page.
        const response = await fetch(IMPORT_SERVER);
        const html = await response.text();
        // Parse the HTML for the language options.
        const regex = /var glossLanguageNames\s*=\s*\[([\s\S]*?)\];/;
        const matches = html.match(regex);
        if (matches && matches[1]) {
          const languageNames = matches[1]
            .split(',')
            .map((name: string) => name.trim().replace(/['"]+/g, ''))
            .filter((name: string) => name.length > 0);
          // Return the options.
          res.ok({ data: languageNames });
          return;
        }
      } catch (error) {
        console.error('Error retrieving options:', error);
        // TODO: it would probably be better to throw an actual error?
      }
      // There was some problem with retrieving language options.
      res.ok({ data: [] });
    },
  })
  .build();

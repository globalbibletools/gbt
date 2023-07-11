import { GetLanguageImportOptionsResponseBody } from '@translation/api-types';
import createRoute from '../../../../shared/Route';

const IMPORT_SERVER = 'https://hebrewgreekbible.online';

export default createRoute()
  .get<void, GetLanguageImportOptionsResponseBody>({
    async handler(req, res) {
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
      // No language options were parsed.
      res.ok({ data: [] });
    },
  })
  .build();

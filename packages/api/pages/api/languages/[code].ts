import { GetLanguageResponseBody } from '@translation/api-types';
import { ApiRequest, ApiResponse } from '../../../helpers';
import { client } from '../../../db';

export default async function (
  req: ApiRequest<{ code: string }>,
  res: ApiResponse<GetLanguageResponseBody>
) {
  const language = await client.language.findUnique({
    where: {
      code: req.query.code,
    },
  });

  if (language) {
    return res.status(200).json({
      data: {
        type: 'language',
        id: language.code,
        attributes: {
          name: language.name,
        },
        links: {
          self: `${req.url}`,
        },
      },
    });
  } else {
    res.status(404).json({
      errors: [{ code: 'NotFound' }],
    });
  }
}

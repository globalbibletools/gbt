import { TranslationServiceClient } from '@google-cloud/translate';

export class MachineTranslationClient {
  client: TranslationServiceClient;
  constructor() {
    console.log(
      process.env.GOOGLE_TRANSLATE_CREDENTIALS?.replaceAll('\n', '\\n') ?? ''
    );
    this.client = new TranslationServiceClient({
      credentials: JSON.parse(
        process.env.GOOGLE_TRANSLATE_CREDENTIALS?.replaceAll('\n', '\\n') ?? ''
      ),
    });
  }

  async translate(
    strings: string[],
    targetLanguage: string
  ): Promise<string[]> {
    const [response] = await this.client.translateText({
      contents: strings,
      targetLanguageCode: targetLanguage,
      parent: 'projects/global-bible-too-1694742039480',
    });

    return response.translations?.map((t) => t.translatedText ?? '') ?? [];
  }
}

export const machineTranslationClient = new MachineTranslationClient();

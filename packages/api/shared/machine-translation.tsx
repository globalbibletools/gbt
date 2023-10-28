import { TranslationServiceClient } from '@google-cloud/translate';

export class MachineTranslationClient {
  client: TranslationServiceClient;
  constructor() {
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
      parent: process.env.GOOGLE_TRANSLATE_PROJECT,
    });

    return response.translations?.map((t) => t.translatedText ?? '') ?? [];
  }
}

export const machineTranslationClient = new MachineTranslationClient();

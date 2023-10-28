import { TranslationServiceClient } from '@google-cloud/translate';

export class MachineTranslationClient {
  client: TranslationServiceClient;
  constructor() {
    this.client = new TranslationServiceClient({
      credentials: {
        client_email: process.env.GOOGLE_TRANSLATE_EMAIL,
        private_key: process.env.GOOGLE_TRANSLATE_KEY,
      },
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

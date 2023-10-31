import { TranslationServiceClient } from '@google-cloud/translate';

export interface MachineTranslationClientOptions {
  clientEmail: string;
  privateKey: string;
  project: string;
}

export class MachineTranslationClient {
  client: TranslationServiceClient;
  constructor(private readonly options: MachineTranslationClientOptions) {
    this.client = new TranslationServiceClient({
      credentials: {
        client_email: options.clientEmail,
        private_key: options.privateKey,
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
      parent: this.options.project,
    });

    return response.translations?.map((t) => t.translatedText ?? '') ?? [];
  }
}

let machineTranslationClient: MachineTranslationClient | undefined;
if (
  process.env.GOOGLE_TRANSLATE_EMAIL &&
  process.env.GOOGLE_TRANSLATE_KEY &&
  process.env.GOOGLE_TRANSLATE_PROJECT
) {
  machineTranslationClient = new MachineTranslationClient({
    clientEmail: process.env.GOOGLE_TRANSLATE_EMAIL,
    privateKey: process.env.GOOGLE_TRANSLATE_KEY,
    project: process.env.GOOGLE_TRANSLATE_PROJECT,
  });
}
export { machineTranslationClient };

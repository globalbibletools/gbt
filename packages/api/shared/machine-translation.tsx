import { TranslationServiceClient } from '@google-cloud/translate';

export interface MachineTranslationClientOptions {
  key: string;
}

interface Key {
  client_email: string;
  private_key: string;
  project_id: string;
}

export class MachineTranslationClient {
  client: TranslationServiceClient;
  private key: Key;

  constructor(private readonly options: MachineTranslationClientOptions) {
    this.key = JSON.parse(
      Buffer.from(options.key, 'base64').toString('utf8')
    ) as Key;
    this.client = new TranslationServiceClient({
      credentials: {
        client_email: this.key.client_email,
        private_key: this.key.private_key,
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
      parent: `projects/${this.key.project_id}`,
    });

    return response.translations?.map((t) => t.translatedText ?? '') ?? [];
  }
}

export const machineTranslationClient = process.env.GOOGLE_TRANSLATE_CREDENTIALS
  ? new MachineTranslationClient({
      key: process.env.GOOGLE_TRANSLATE_CREDENTIALS,
    })
  : undefined;

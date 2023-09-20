const FONT_API =
  'https://www.googleapis.com/webfonts/v1/webfonts?key=' +
  process.env.NX_GOOGLE_FONT_API_KEY;

// An item in the result returned from the API.
type RawFontOption = {
  family: string;
  variants: string[];
};

class FontClient {
  async getFonts(): Promise<string[]> {
    const request = new Request(FONT_API, { method: 'GET', mode: 'cors' });
    const response = await fetch(request);
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (error) {
      responseBody = {};
    }
    console.log(responseBody);
    if (!responseBody.items) {
      throw new Error('Could not fetch fonts.');
    }
    const options = responseBody.items
      .filter(({ variants }: RawFontOption) => variants.includes('regular'))
      .map(({ family }: RawFontOption) => family);
    return options;
  }

  getCssUrl(family: string) {
    return `https://fonts.googleapis.com/css2?family=${family}`;
  }
}

const fontClient = new FontClient();
export default fontClient;

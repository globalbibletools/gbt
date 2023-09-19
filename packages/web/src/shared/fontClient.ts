const FONT_API =
  'https://www.googleapis.com/webfonts/v1/webfonts?key=' +
  process.env.GOOGLE_FONT_API_KEY;

class FontClient {
  async getFonts() {
    console.log(JSON.stringify(process.env));
    console.log(process.env.API_URL);
    console.log(process.env.GOOGLE_FONT_API_KEY);
    console.log(FONT_API);
    const request = new Request(FONT_API, {
      method: 'GET',
      mode: 'cors',
    });
    const response = await fetch(request);
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (error) {
      responseBody = {};
    }
    console.log(responseBody);
    return responseBody;
    // if (response.ok) {
    //   return { body: responseBody, headers: response.headers };
    // } else {
    //   throw new ApiClientError(request, response, responseBody);
    // }
  }
}

const fontClient = new FontClient();
export default fontClient;

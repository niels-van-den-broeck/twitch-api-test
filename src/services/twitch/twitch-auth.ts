import axios from 'axios';

type TokenResponse = { access_token: string; expires_in: number; token_type: 'bearer' };

export default class TwitchAuth {
  private static BASE_URI = 'https://id.twitch.tv/oauth2';

  static async getToken() {
    try {
      const { data } = await axios.post<TokenResponse>(
        `${TwitchAuth.BASE_URI}/token`,
        {
          client_id: process.env.TWITCH_CLIENT_ID as string,
          client_secret: process.env.TWITCH_CLIENT_SECRET as string,
          grant_type: 'client_credentials',
          redirect_uri: process.env.TWITCH_OAUTH_REDIRECT_URI as string,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return data.access_token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed token request due to: ${error.code} ${error.message}`);
      }

      throw error;
    }
  }
}

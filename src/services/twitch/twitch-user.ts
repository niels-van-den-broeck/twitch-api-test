import { TwitchApi } from './api-client';

type User = {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email: string;
  created_at: string;
};

export default class TwitchUserApi {
  private static BASE_URI = 'https://api.twitch.tv/helix/users'; // TODO: make configurable

  static async getUserByName(name: string) {
    const params = new URLSearchParams({
      login: name,
    });

    const {
      data: {
        data: [user],
      },
    } = await TwitchApi.get<{ data: User[] }>(`${TwitchUserApi.BASE_URI}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Client-Id': process.env.TWITCH_CLIENT_ID as string,
      },
    });

    return user;
  }
}

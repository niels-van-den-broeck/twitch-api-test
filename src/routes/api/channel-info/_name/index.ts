import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import Schema from 'fluent-json-schema';

import TwitchUserApi from '../../../../services/twitch/twitch-user';

const register: FastifyPluginCallback = (server, options, done) => {
  const getChannelInfo = async (
    request: FastifyRequest<{ Params: { name: string } }>,
    reply: FastifyReply,
  ) => {
    const channelInfo = await TwitchUserApi.getUserByName(request.params.name);

    return reply.status(200).send(channelInfo);
  };

  server.get('/', {
    handler: getChannelInfo,
    schema: {
      params: Schema.object().prop('name', Schema.string().required()),
    },
  });

  done();
};

export default register;

import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import Schema from 'fluent-json-schema';
import TwitchAuth from '../../../../services/twitch/twitch-auth';

type SuccessOAuthResponse = {
  code: string;
};

type FailOAuthResponse = {
  error: string;
  error_description: string;
};

type BaseOAuthResponse = {
  scope: string;
  state: string;
};

const register: FastifyPluginCallback = (server, options, done) => {
  const getChannelInfo = async (
    request: FastifyRequest<{
      Querystring: BaseOAuthResponse & (SuccessOAuthResponse | FailOAuthResponse);
    }>,
    reply: FastifyReply,
  ) => {
    if ('error' in request.query) {
      return reply
        .status(400)
        .send({ error: request.query.error, message: request.query.error_description });
    }

    // TODO: proper state mechanism

    const token = await TwitchAuth.getToken(request.query.code);

    return reply.status(200).send(token);
  };

  server.get('/', {
    handler: getChannelInfo,
    schema: {
      querystring: Schema.object().prop('code', Schema.string()).prop('error', Schema.string()),
    },
  });

  done();
};

export default register;

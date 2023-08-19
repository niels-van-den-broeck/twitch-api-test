import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';

const register: FastifyPluginCallback = (server, options, done) => {
  const getAuthorize = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID as string,
      redirect_uri: `http://localhost:${process.env.PORT}/api/oauth/token`, // TODO: properly setup for different environments.
      response_type: 'code',
      force_verify: 'true',
      state: request.id, // TODO: proper state mechanism
      scope: 'chat:read chat:edit',
    });

    return reply.redirect(`https://id.twitch.tv/oauth2/authorize?${params.toString()}`);
  };

  server.get('/', {
    handler: getAuthorize,
  });

  done();
};

export default register;

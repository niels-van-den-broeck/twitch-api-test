import Fastify from 'fastify';
import autoLoad from '@fastify/autoload';
import path from 'path';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

server.register(autoLoad, {
  dir: path.join(__dirname, 'routes'),
  routeParams: true,
});

export default server;

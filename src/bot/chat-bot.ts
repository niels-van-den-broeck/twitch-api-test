import ws from 'ws';
import { parseMessage } from '../services/twitch/irc-parser';

async function handleMessage(message: ReturnType<typeof parseMessage>, client: ws) {
  const reply = `Hoi ${message?.source?.nick}`;
  client.send(`PRIVMSG #drgreenx :${reply}`);
}

async function handleCommand(command: string, params?: string) {
  console.log('Received command', { command, params });
}

async function initialize() {
  const client = new ws.WebSocket(process.env.TWITCH_IRC_URL as string);

  client.on('open', () => {
    client.send(`PASS oauth:${process.env.TWITCH_BOT_TOKEN as string}`);
    client.send(`NICK ${process.env.TWITCH_BOT_NAME as string}`);

    client.send('CAP REQ :twitch.tv/tags twitch.tv/commands');

    client.send('JOIN #drgreenx');
  });

  client.on('unexpected-response', () => {
    console.log('UNEXPECTED RESPONSE');
  });

  client.on('message', m => {
    const messages = m.toString().replace(/\r/g, '').split(/\n/); // Split up multi message into separate string per message.

    const parsedMessages = messages
      .filter(Boolean) // filter empty
      .map(message => {
        console.log(`${message}'\r\n`);
        return parseMessage(message.toString());
      }); // parse messages into known format

    parsedMessages.forEach(message => {
      if (message && message.parameters && 'botCommand' in message.parameters) {
        return handleCommand(message.parameters.botCommand, message.parameters.botCommandParams);
      }

      if (message?.command?.command === 'PRIVMSG') {
        return handleMessage(message, client);
      }

      if (message?.command?.command === 'PING') {
        console.log('I do pong now');
        return client.send('PONG :tmi.twitch.tv');
      }

      if (message?.command?.command === 'NOTICE') {
        if ('message' in message.parameters) console.error(message.parameters.message);
      }

      return null;
    });
  });

  client.on('close', (e, reason) => {
    console.log('CLOSED', e, reason);
  });
}

initialize();

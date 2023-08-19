import ws from 'ws';
import { parseMessage } from '../services/twitch/irc-parser';

async function handleMessage(message: ReturnType<typeof parseMessage>) {
  console.log('Received chat message', message);
}

async function handleCommand(command: string, params?: string) {
  console.log('Received command', { command, params });
}

async function initialize() {
  const client = new ws.WebSocket(process.env.TWITCH_IRC_URL as string);

  client.on('open', () => {
    console.log('CONNECTED');
    client.send('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands');
    client.send(`PASS oauth:${process.env.TWITCH_BOT_TOKEN as string}`);
    client.send(`NICK ${process.env.TWITCH_BOT_NAME as string}`);
    client.send('JOIN #drgreenx');
  });

  client.on('unexpected-response', () => {
    console.log('UNEXPECTED RESPONSE');
  });

  client.on('message', m => {
    const messages = m.toString().replace(/\r/g, '').split(/\n/); // Split up multi message into separate string per message.

    const parsedMessages = messages
      .filter(Boolean) // filter empty
      .map(message => parseMessage(message.toString())); // parse messages into known format

    parsedMessages.forEach(message => {
      if (message && message.parameters && 'botCommand' in message.parameters) {
        handleCommand(message.parameters.botCommand, message.parameters.botCommandParams);
      }

      if (message?.command?.command === 'PRIVMSG') {
        handleMessage(message);
      }
    });
  });

  client.on('close', (e, reason) => {
    console.log('CLOSED', e, reason.toString());
  });
}

initialize();

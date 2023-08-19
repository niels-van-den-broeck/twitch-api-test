function extractPartFromMessage(message: string, part?: string) {
  if (!part || part.length === 0) return message;

  return message.slice(message.lastIndexOf(part) + part.length, message.length);
}

function extractTagString(message: string) {
  if (message.startsWith('@')) {
    return message.slice(1, message.indexOf(':'));
  }

  return undefined;
}

function extractSourceString(message: string) {
  if (message.startsWith(':')) {
    return message.slice(1, message.indexOf(' '));
  }

  return undefined;
}

function extractCommandString(message: string) {
  const paramsIndex = message.indexOf(':');

  return message.slice(0, paramsIndex === -1 ? message.length : paramsIndex);
}

function parseTags(tagString?: string) {
  if (!tagString) return null;

  return tagString
    .trim()
    .split(';')
    .reduce((tags, currentTagString) => {
      // currentTagString constists of "key=value"
      const [key, value] = currentTagString.split('=');

      return {
        ...tags,
        [key]: value,
      };
    }, {});
}

function parseCommand(rawCommandComponent: string) {
  let parsedCommand = null;
  const commandParts = rawCommandComponent.trim().split(' ');

  switch (commandParts[0]) {
    case 'JOIN':
    case 'PART':
    case 'NOTICE':
    case 'CLEARCHAT':
    case 'HOSTTARGET':
    case 'PRIVMSG':
      parsedCommand = {
        command: commandParts[0],
        channel: commandParts[1],
      };
      break;
    case 'PING':
      parsedCommand = {
        command: commandParts[0],
      };
      break;
    case 'CAP':
      parsedCommand = {
        command: commandParts[0],
        isCapRequestEnabled: commandParts[2] === 'ACK',
        // The parameters part of the messages contains the
        // enabled capabilities.
      };
      break;
    case 'GLOBALUSERSTATE': // Included only if you request the /commands capability.
      // But it has no meaning without also including the /tags capability.
      parsedCommand = {
        command: commandParts[0],
      };
      break;
    case 'USERSTATE': // Included only if you request the /commands capability.
    case 'ROOMSTATE': // But it has no meaning without also including the /tags capabilities.
      parsedCommand = {
        command: commandParts[0],
        channel: commandParts[1],
      };
      break;
    case 'RECONNECT':
      console.log('The Twitch IRC server is about to terminate the connection for maintenance.');
      parsedCommand = {
        command: commandParts[0],
      };
      break;
    case '421':
      console.log(`Unsupported IRC command: ${commandParts[2]}`);
      return null;
    case '001': // Logged in (successfully authenticated).
      parsedCommand = {
        command: commandParts[0],
        channel: commandParts[1],
      };
      break;
    case '002': // Ignoring all other numeric messages.
    case '003':
    case '004':
    case '353': // Tells you who else is in the chat room you're joining.
    case '366':
    case '372':
    case '375':
    case '376':
      console.log(`numeric message: ${commandParts[0]}`);
      return null;
    default:
      console.log(`\nUnexpected command: ${rawCommandComponent}\n`);
      return null;
  }

  return parsedCommand;
}

function parseSource(rawSourceComponent?: string) {
  if (!rawSourceComponent) {
    // Not all messages contain a source
    return null;
  }

  const sourceParts = rawSourceComponent.split('!');
  return {
    nick: sourceParts.length === 2 ? sourceParts[0] : null,
    host: sourceParts.length === 2 ? sourceParts[1] : sourceParts[0],
  };
}

function parseParameters(
  rawParametersComponent: string,
): { message: string } | { botCommand: string; botCommandParams?: string } {
  const commandParts = rawParametersComponent.slice(1).trim();

  if (!commandParts.startsWith('!'))
    return {
      message: commandParts,
    };

  const paramsIdx = commandParts.indexOf(' ');

  if (paramsIdx === -1) {
    // no parameters
    return {
      botCommand: commandParts.slice(0),
    };
  }

  return {
    botCommand: commandParts.slice(0, paramsIdx),
    botCommandParams: commandParts.slice(paramsIdx).trim(),
  };
}

export function parseMessage(message: string) {
  if (!message) return null;
  let remainingMessage = message;
  const tagString = extractTagString(remainingMessage);
  remainingMessage = extractPartFromMessage(remainingMessage, tagString);

  const sourceString = extractSourceString(remainingMessage);
  remainingMessage = extractPartFromMessage(remainingMessage, sourceString);

  const commandString = extractCommandString(remainingMessage);

  const parameterString = extractPartFromMessage(remainingMessage, commandString);

  const tags = parseTags(tagString);
  const command = parseCommand(commandString);
  const source = parseSource(sourceString);
  const parameters = parseParameters(parameterString);

  return {
    tags,
    source,
    command,
    parameters,
  };
}

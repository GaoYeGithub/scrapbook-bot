const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const YAML = require('yaml');
const dotenv = require('dotenv-flow/config');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const prefix = '/';

const sessionsDB = './sessions.yaml';
const scrapbookDB = './scrapbook-app/src/api/scrapbook.yaml';

const loadDB = (file) => {
  if (fs.existsSync(file)) {
    return YAML.parse(fs.readFileSync(file, 'utf8'));
  } else {
    fs.writeFileSync(file, YAML.stringify({}));
    return {};
  }
};

const saveDB = (file, data) => {
  fs.writeFileSync(file, YAML.stringify(data));
};

let sessions = loadDB(sessionsDB);
let scrapbook = loadDB(scrapbookDB);

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  console.log(`Received message: ${message.content}`);

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  console.log(`Command received: ${command}`);

  if (command === 'arcade') {
    const title = args.join(' ');
    if (!title) {
      message.channel.send('Please provide a title for the session.');
      return;
    }

    const sessionKey = `${message.author.id}-${Date.now()}`;
    sessions[sessionKey] = { title, messages: [], startTime: Date.now(), user: message.author.id };

    saveDB(sessionsDB, sessions);

    message.channel.send(`Session "${title}" started! You can now chat for one minute.`);

    setTimeout(() => {
      message.channel.send(`Session "${title}" has ended.`);
    }, 60 * 1000);

    return;
  }

  if (command === 'scrapbook') {
    const [githubUrl, imageUrl, ...descArr] = args;
    if (!githubUrl || !imageUrl || descArr.length === 0) {
      message.channel.send('Please provide a GitHub URL, an Image URL, and a description.');
      return;
    }

    const description = descArr.join(' ');
    const scrapbookEntry = {
      githubUrl,
      imageUrl,
      description,
      sessions: []
    };
    const scrapbookKey = `${message.author.id}-${Date.now()}`;
    scrapbook[scrapbookKey] = scrapbookEntry;
    saveDB(scrapbookDB, scrapbook);

    message.channel.send(`Scrapbook entry created with key: ${scrapbookKey}`);
    return;
  }

  Object.keys(sessions).forEach(key => {
    const session = sessions[key];
    if (session.user === message.author.id && Date.now() - session.startTime < 60 * 1000) {
      session.messages.push(message.content);
      saveDB(sessionsDB, sessions);
    }
  });
});

client.login(process.env.DISCORD_TOKEN);

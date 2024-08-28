const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const YAML = require('yaml');
const dotenv = require('dotenv-flow/config');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const prefix = '/';

const sessionsDB = './scrapbook-app/src/api/sessions.yaml';
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
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    message.channel.send(`
      **Scrapbook Bot Commands:**
      1. **/arcade {title}**: Start a session with title.
      2. **/scrapbook {Title} {GitHub URL} {Image URL} {Session Keys (comma separated)}**: Create a scrapbook entry linked to previous sessions.
      3. **/view**: Display link to view scrapbook.
      4. **/help**: Display this help message.
    `);
    return;
  }

  if (command === 'arcade') {
    console.log("Received /arcade command");
    const title = args.join(' ');
    if (!title) {
      await message.channel.send('Please provide a title for the session.');
      return;
    }

    const sessionKey = `${message.author.id}-${Date.now()}`;
    sessions[sessionKey] = { title, messages: [], startTime: Date.now(), user: message.author.id };

    saveDB(sessionsDB, sessions);

    await message.channel.send(`Session "${title}" started! You can now chat for one minute.\nYour session key: ${sessionKey}`);

    setTimeout(async () => {
      await message.channel.send(`Session "${title}" has ended.`);
    }, 60 * 1000);

    return;
  }

  if (command === 'scrapbook') {
    const [scrapbookTitle, githubUrl, imageUrl, ...sessionKeys] = args;

    if (!scrapbookTitle || !githubUrl || !imageUrl || sessionKeys.length === 0) {
      await message.channel.send('Please provide a GitHub URL, an Image URL, a Title, and Session Keys (comma-separated).');
      return;
    }

    const validSessionKeys = sessionKeys.join('').split(',').filter(key => sessions[key]);

    const scrapbookEntry = {
      githubUrl,
      imageUrl,
      title: scrapbookTitle,
      sessions: validSessionKeys
    };

    const scrapbookKey = `${message.author.id}-${Date.now()}`;
    scrapbook[scrapbookKey] = scrapbookEntry;
    saveDB(scrapbookDB, scrapbook);

    await message.channel.send(`Scrapbook entry created with key: ${scrapbookKey}`);
    return;
  }

  if (command === 'view') {
    await message.channel.send('You can view the scrapbook here: [Scrapbook](http://localhost:3000/)');
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
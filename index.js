const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const YAML = require('yaml');
require('dotenv-flow').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

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

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'arcade' || commandName === 'test') {
    const title = interaction.options.getString('title');
    const sessionKey = `${interaction.user.id}-${Date.now()}`;
    sessions[sessionKey] = { title, messages: [], startTime: Date.now(), user: interaction.user.id };

    saveDB(sessionsDB, sessions);

    await interaction.reply(`Session "${title}" started! You can now chat for one minute.\nYour session key: ${sessionKey}`);

    setTimeout(async () => {
      await interaction.followUp(`Session "${title}" has ended.`);
    }, 60 * 1000);
  }

  else if (commandName === 'scrapbook') {
    const scrapbookTitle = interaction.options.getString('title');
    const githubUrl = interaction.options.getString('github_url');
    const imageUrl = interaction.options.getString('image_url');
    const sessionKeys = interaction.options.getString('session_keys').split(',').map(key => key.trim());

    if (!scrapbookTitle || !githubUrl || !imageUrl || sessionKeys.length === 0) {
      await interaction.reply('Please provide a GitHub URL, an Image URL, a Title, and Session Keys (comma-separated).');
      return;
    }

    const validSessionKeys = sessionKeys.filter(key => sessions[key]);

    const scrapbookEntry = {
      githubUrl,
      imageUrl,
      title: scrapbookTitle,
      sessions: validSessionKeys
    };

    const scrapbookKey = `${interaction.user.id}-${Date.now()}`;
    scrapbook[scrapbookKey] = scrapbookEntry;
    saveDB(scrapbookDB, scrapbook);

    await interaction.reply(`Scrapbook entry created with key: ${scrapbookKey}`);
  }

  else if (commandName === 'view') {
    await interaction.reply('You can view the scrapbook here: [Scrapbook](http://localhost:3000/)');
  }

  else if (commandName === 'help') {
    await interaction.reply(`
      **Scrapbook Bot Commands:**
      1. **/arcade {title}**: Start a session with title.
      2. **/scrapbook {Title} {GitHub URL} {Image URL} {Session Keys (comma separated)}**: Create a scrapbook entry linked to previous sessions.
      3. **/view**: Display link to view scrapbook.
      4. **/help**: Display this help message.
      5. **/test {title}**: Start a test session with title.
    `);
  }
});

client.login(process.env.DISCORD_TOKEN);
const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const commands = [
  {
    name: 'arcade',
    description: 'Start a session with a title',
    options: [
      {
        name: 'title',
        type: 3,
        description: 'The title for the session',
        required: true,
      },
    ],
  },
  {
    name: 'scrapbook',
    description: 'Create a scrapbook entry',
    options: [
      {
        name: 'title',
        type: 3,
        description: 'The title for the scrapbook entry',
        required: true,
      },
      {
        name: 'github_url',
        type: 3,
        description: 'GitHub URL for the project',
        required: true,
      },
      {
        name: 'image_url',
        type: 3,
        description: 'Image URL for the project',
        required: true,
      },
      {
        name: 'session_keys',
        type: 3,
        description: 'Comma-separated session keys',
        required: true,
      },
    ],
  },
  {
    name: 'view',
    description: 'View the scrapbook',
  },
  {
    name: 'help',
    description: 'Display help message',
  },
  {
    name: 'test',
    description: 'Start a test session with a title',
    options: [
      {
        name: 'title',
        type: 3,
        description: 'The title for the test session',
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
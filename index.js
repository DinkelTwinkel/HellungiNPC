// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Events, GatewayIntentBits, ActivityType, PermissionsBitField, Partials } = require('discord.js');
const { token, mongourl } = require('./keys.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates], partials: [
  Partials.Channel,
  Partials.Message,
  Partials.Reaction,
  Partials.User,
] });

const mongoose = require('mongoose');
const sushiConveyor = require('./patterns/sushiConveyor');

  mongoose.connect(mongourl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('connected to mayoDB'))
    .catch((err) => console.log(err));

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'

const registerCommands = require ('./registerCommands');
// const campfireVCs = require('./patterns/campfireVCs');
registerCommands;

client.once(Events.ClientReady, async c => {

	console.log(`Ready! Logged in as ${c.user.tag}`);
  client.user.setPresence( { status: "away" });

// Load JSON file for sushi conveyor
const guildsData = JSON.parse(fs.readFileSync("./data/servers.json", "utf-8"));

// Loop through each guild entry for sushi conveyor only
for (const guildEntry of guildsData) {
  const { guildId, sushiChannelId, sacrificeChannelId } = guildEntry;

  try {
    // Fetch the guild
    const guild = await client.guilds.fetch(guildId);

    // Get the channel
    const sushiChannel = guild.channels.cache.get(sushiChannelId);

    if (!sushiChannel) {
      console.error(`Channel ${sushiChannelId} not found in guild ${guildId}`);
      continue;
    }

    // Initial rename
    sushiChannel.setName(await sushiConveyor(sushiChannel.name));

    // Update every 5 minutes
    setInterval(async () => {
      sushiChannel.setName(await sushiConveyor(sushiChannel.name));
    }, 1000 * 60 * 5);

    // Sacrifice system is now handled by sacrificeClock.initializeAllClocks()

  } catch (err) {
    console.error(`Failed to set up guild ${guildId}:`, err);
  }
}
    
});

client.on(Events.MessageCreate, async (message) => {
  // Handle legacy prefix commands if needed
  if (message.content.startsWith('!')) {
      console.log('Legacy command detected');
      // Extract the command and any arguments
      const args = message.content.slice(1).trim().split(/ +/);
      const command = args.shift().toLowerCase();
  
      // Handle legacy commands here if needed
      // Most functionality has been moved to slash commands
      
      // Helper function to delete messages
      function deleteMessage(message) {
        try {
          message.delete();
        }
        catch (err) {
          console.log('Error deleting message:', err);
        }
      }
  }
})

// Define a collection to store your commands
client.commands = new Map();

// Read the command files and register them
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(interaction, client);
  }
  catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
  }
});

// Log in to Discord with your client's token

client.login(token);
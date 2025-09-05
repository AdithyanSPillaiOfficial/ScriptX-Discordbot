require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType, Events, Colors } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { logError } = require('./logger');
const { prohibitedWords } = require('./config');
const { findFirstProhibitedWord } = require('./helper');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildModeration],
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  // Get number of servers
  const serverCount = client.guilds.cache.size;

  client.user.setPresence({
    status: "online", // 'online' | 'idle' | 'dnd' | 'invisible'
    activities: [
      {
        name: `${serverCount} Servers`,
        type: ActivityType.Listening, // Playing | Listening | Watching | Competing
      },
    ],
  });
});

const registerActionLogger = require("./actionlog");
registerActionLogger(client)

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!hello') {
    message.reply('Hello there! 👋');
  }
  else if (message.content === '!me') {
    message.reply('You are ' + message.author.displayName)
  }

  else if (message.content === '!dm') {
    message.author.send("Hai")
  }


  const channel = message.member.guild.channels.cache.find(
    ch => ch.name === 'actions-and-warnings' && ch.type === 0 // 0 = GUILD_TEXT
  );

  if (!channel) return;
  const banStatus = findFirstProhibitedWord(message.content, prohibitedWords)
  // Find the role by name
  const jailedRole = message.guild.roles.cache.find(role => role.name === "Jailed");
  if (!jailedRole) {
    return await interaction.reply({
      content: "❌ Could not find a role named **Jailed**.",
      ephemeral: true
    });
  }
  if (banStatus != null) {
    try {
      await message.member.timeout(10000, 'Vulger Language');
      await channel.send(`Member <@${message.member.id}> Has Been Send to timeout for 5 mins. Reason : Vulger Language. Content : ${message.content} includes ${banStatus}`)
      await message.member.send(`You Have Been Send to timeout for 5 mins. Reason : Vulger Language. Content : ${message.content} includes ${banStatus} \n You are Also Been *Jailed* for the same. To get Unjailed, please create a ticket requesting to unjail`)
      await message.member.roles.set([jailedRole]);
      await message.delete()
    } catch (error) {
      logError(error)
    }
  }

});



client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.channels.cache.find(
    ch => ch.name === 'welcome' && ch.type === 0 // 0 = GUILD_TEXT
  );

  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(`🎉 Welcome, ${member.user.username}!`)
    .setDescription(`We're glad to have you here, <@${member.id}>!\nMake sure to check out the rules and have fun!`)
    .setColor(0x00ff99)
    .setThumbnail(member.user.displayAvatarURL());


  //channel.send(`👋 Welcome to the server, <@${member.id}>! We're glad you're here.`);
  channel.send({ content: `👋 Welcome to the server, <@${member.id}>! We're glad you're here.`, embeds: [embed] });

  // Send a DM to the user
  try {
    await member.send(
      `👋 Hi ${member.user.username}, welcome to **${member.guild.name}**!\nWe're thrilled to have you here. 🎉\nFeel free to ask questions or introduce yourself. 😊`
    );
  } catch (error) {
    console.error(`❌ Could not send welcome DM to ${member.user.tag}:`, error.message);
  }
});



client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.buttons = new Collection();
// Load buttons
const buttonsPath = path.join(__dirname, 'buttons');
for (const file of fs.readdirSync(buttonsPath).filter(f => f.endsWith('.js'))) {
  const button = require(`./buttons/${file}`);
  client.buttons.set(button.customId, button);
}

try {
  client.on('interactionCreate', async interaction => {
    // 🟢 Button
    if (interaction.isButton()) {
      const button = client.buttons.get(interaction.customId);
      if (!button) return;

      try {
        await button.execute(interaction);
      } catch (error) {
        console.error(error);
        interaction && await interaction.reply({ content: '⚠️ Error handling button interaction.', ephemeral: true });
      }
      return;
    }

    // 🟣 Slash Command
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        interaction && await interaction.reply({ content: '⚠️ Error executing command.', ephemeral: true });
      }
    }
  });

} catch (error) {
  console.log(error)
}




client.login(process.env.DISCORD_TOKEN);

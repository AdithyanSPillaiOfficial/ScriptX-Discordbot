require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { logError } = require('./logger');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

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

  const bannedWords = ['fuck', 'fuckme', 'banme']

  const channel = message.member.guild.channels.cache.find(
    ch => ch.name === 'actions-and-warnings' && ch.type === 0 // 0 = GUILD_TEXT
  );

  if (!channel) return;
  if (bannedWords.includes(message.content)) {
    try {
      await message.member.timeout(10000, 'Vulger Language');
      await channel.send(`Member <@${message.member.id}> Has Been Send to timeout for 5 mins. Reason : Vulger Language. Content : ${message.content}`)
      await message.member.send(`You Have Been Send to timeout for 5 mins. Reason : Vulger Language. Content : ${message.content}`)
      await message.member.roles.set([]);
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

client.on('interactionCreate', async interaction => {
  // ✅ Handle button interaction first
  if (interaction.isButton()) {
    if (interaction.customId === 'mark_solved') {
      const oldEmbed = interaction.message.embeds[0];

      const updatedEmbed = EmbedBuilder.from(oldEmbed)
        .setColor('Green')
        .setFooter({ text: 'Ticket marked as solved', iconURL: interaction.user.displayAvatarURL() });

      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('mark_solved')
          .setLabel('✅ Solved')
          .setStyle(ButtonStyle.Success)
          .setDisabled(true)
      );

      await interaction.update({ embeds: [updatedEmbed], components: [disabledRow] });
    }

    return; // exit early if it was a button
  }

  // ✅ Handle slash commands
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    //interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
  }
});


client.login(process.env.DISCORD_TOKEN);

const { EmbedBuilder } = require("discord.js");

function findFirstProhibitedWord(message, wordArray) {
  return wordArray.find(word => message.toLowerCase().includes(word)) || null;
}

async function sendtoLogchannel(embed, guild) {
  let channel = guild.channels.cache.find(
    ch => ch.name === 'scriptx-log' && ch.type === 0 // 0 = GUILD_TEXT
  );
  if (!channel) {
    channel = await guild.channels.create({
      name: "scriptx-log",
      type: ChannelType.GuildText,
      reason: "ScriptX Log channel needed",
    })
  }

  channel.send({ embeds: [embed] })
}

async function sendTexttoLogchannel(text, guild) {
  let channel = message.guild.channels.cache.find(
    ch => ch.name === 'scriptx-log' && ch.type === 0 // 0 = GUILD_TEXT
  );
  if (!channel) {
    channel = await guild.channels.create({
      name: "scriptx-log",
      type: ChannelType.GuildText,
      reason: "ScriptX Log channel needed",
    })
  }

  channel.send({ content: text });
}

async function sendJSONEmbedLogChannel({title, description, color, fields}, guild) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description || "")
    .setColor(color || Colors.Blurple)
    .addFields(fields)
    .setTimestamp();
  sendtoLogchannel(embed, guild);
}


module.exports = { findFirstProhibitedWord, sendtoLogchannel, sendTexttoLogchannel, sendJSONEmbedLogChannel }
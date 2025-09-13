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

  channel.send({embeds : [embed]})
}

module.exports = { findFirstProhibitedWord, sendtoLogchannel }
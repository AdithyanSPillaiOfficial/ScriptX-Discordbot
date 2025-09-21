const { Events, Colors } = require("discord.js");
const { sendJSONEmbedLogChannel } = require("../helper");
var messageArray = [];
const spamBlockCount = 3
module.exports = async function antiSpammingHandler(client) {
    client.on(Events.MessageCreate, async message => {
        try {
            if (message.author.bot) return;
            if (!messageArray[message.guild.id]) messageArray[message.guild.id] = [];
            messageArray[message.guild.id].push(message);

            let guildMessageArray = messageArray[message.guild.id];
            let spamFlag = true;
            if (guildMessageArray.length - spamBlockCount < 0) spamFlag = false;
            for (let i = guildMessageArray.length - 1; i > guildMessageArray.length - spamBlockCount && i > 0; i--) {
                if (guildMessageArray[i].content !== guildMessageArray[i - 1].content || guildMessageArray[i].author.id !== guildMessageArray[i - 1].author.id) {
                    spamFlag = false;
                    break;
                }
            }
            if (spamFlag) {
                //console.log("Spam Falgged");
                // Find the role by name
                const jailedRole = message.guild.roles.cache.find(role => role.name === "Jailed");
                if (!jailedRole) {
                    return await message.reply({
                        content: "❌ Could not find a role named **Jailed**.",
                        ephemeral: true
                    });
                }
                const flaggedUser = await message.guild.members.fetch(message.author.id);
                flaggedUser.roles.set([jailedRole]);
                sendJSONEmbedLogChannel({
                    title: "⚠️ User Jailed",
                    description: `User ${flaggedUser} has been Jailed`,
                    color: Colors.Red,
                    fields: [
                        { name: "Reason", value: "Spamming" },
                        // { name: "Role", value: `${role}` },
                        // entry ? { name: "Executor", value: `${entry.executor}` } : {}
                    ].filter(f => f.name)
                }, message.guild);

                for (let i = guildMessageArray.length - 1; i > guildMessageArray.length - spamBlockCount-1 && i >= 0; i--) {
                    console.log(i);
                    guildMessageArray[i].delete()
                }

                for(let i=0;i<spamBlockCount;i++) {
                    messageArray[message.guild.id].pop();
                    guildMessageArray.pop();
                }

            }
        } catch (e) {
            console.log(e);
        }
    });

}
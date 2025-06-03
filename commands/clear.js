const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Replies with Pong!')
        .addSubcommand(command =>
            command.setName("channel")
                .setDescription("Clear All Messages in a Channel")
                .addChannelOption(option =>
                    option.setName("channel").setDescription("Channel to clear messages").setRequired(true)
                )
        ),
    async execute(interaction) {
        //await interaction.reply('🏓 Pong!');
        if (interaction.options.getSubcommand() === "channel") {
            const channel = interaction.options.getChannel("channel");

            try {
                // Fetch messages (Discord limits bulk delete to 100 at a time)
                let messages;
                let deleted = 0;

                do {
                    messages = await channel.messages.fetch({ limit: 100 });
                    const deletable = messages.filter(msg => (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000);
                    if (deletable.size > 0) {
                        await channel.bulkDelete(deletable, true);
                        deleted += deletable.size;
                    }
                } while (messages.size >= 2); // loop until less than 2 messages fetched (since some might be older)

                await interaction.reply(`✅ Cleared ${deleted} messages from ${channel} channel.`);
            } catch (err) {
                console.error(err);
                await interaction.reply('❌ Failed to clear the channel. I may not have permission or there were too many old messages.');
            }
        }
    },
};

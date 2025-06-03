const { SlashCommandBuilder, ChannelFlags, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('send-message')
    .setDescription('Dm user with a message!')
    .addSubcommand(subcommand => 
        subcommand.setName("user")
        .setDescription("Send a user DM")
        .addUserOption(option => 
            option.setName("user").setDescription("Mention User to Send DM").setRequired(true)
        )
        .addStringOption(option => 
            option.setName("message").setDescription("Message to send to user").setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName("channel")
        .setDescription("Send the message to a channel")
        .addChannelOption(option => 
            option.setName("channel").setDescription("Channel to send message").setRequired(true)
        )
        .addStringOption(option => 
            option.setName("message").setDescription("Message to send in the channel").setRequired(true)
        )
    ),
  async execute(interaction, client) {
    //await interaction.reply('🏓 Pong!');

    if (!interaction.member.permissions.has("Administrator")) {
        return await interaction.reply({
        content: "❌ You need to be an **Administrator** to use this command.",
        flags : MessageFlags.Ephemeral
    });
    }



    if(interaction.options.getSubcommand() === "user") {
        const user = interaction.options.getUser('user')
        const msg = interaction.options.getString('message')

        try {
            await user.send(msg)
            interaction.reply("Message Send To User")
        } catch (error) {
            interaction.reply("Failed to send DM to user")
        }

    }
    else if (interaction.options.getSubcommand() === "channel") {
        const channel = interaction.options.getChannel("channel")
        const msg = interaction.options.getString("message")

        try {
            await channel.send(msg)
            interaction.reply("Message send to Channel")
        } catch (error) {
            interaction.reply("Failed to send message in channel")
        }
    }
    else {
        await interaction.reply("Something is fishy")
    }
  },
};

const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jail")
        .setDescription("Jail a user (Remove all roles)")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to Jail")
                .setRequired(true)
        )
        .addBooleanOption(option => 
            option.setName("notify")
            .setDescription("Do You have to send a dm to user notifying that he has been jailed")
            .setRequired(false)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has("Administrator")) {
            return await interaction.reply({
                content: "❌ You need to be an **Administrator** to use this command.",
                flags: MessageFlags.Ephemeral
            });
        }
        const user = interaction.options.getMember("user");
        const notify = interaction.options.getBoolean("notify");

         // Find the role by name
        const jailedRole = interaction.guild.roles.cache.find(role => role.name === "Jailed");
        if (!jailedRole) {
            return await interaction.reply({
                content: "❌ Could not find a role named **Jailed**.",
                ephemeral: true
            });
        }
        user.roles.set([jailedRole])
        await interaction.reply({content : `User <@${user.id}> has been jailed`, flags : MessageFlags.Ephemeral });
        if(notify) {
            user.send(`You have been jailed in **${interaction.guild.name}**, Please raise a ticket to appeal this`)
        }
    }
}
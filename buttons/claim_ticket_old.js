const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'claim_ticket_old',
    async execute(interaction) {
        console.log("Hai")
        const oldEmbed = interaction.message.embeds[0];
        const oldEmbedFields = EmbedBuilder.from(oldEmbed).data.fields
        //console.log(oldEmbedFields[0].value)
        const submittedUserId = oldEmbedFields[1].value.replace(/[<@!>]/g, '');
        const submittedUser = await interaction.client.users.fetch(submittedUserId);

        const submittedMember = await interaction.guild.members.fetch(submittedUserId);
        await submittedMember.roles.add("1401705224284016640");


        const updatedEmbed = EmbedBuilder.from(oldEmbed)
            .setColor('Green')
            .addFields({ name: 'Status', value: `☑️ Claimed by <@${interaction.user.id}>` })
            .setFooter({ text: `Ticket marked as claimed`, iconURL: interaction.user.displayAvatarURL() });

        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('claim_ticket')
                .setLabel('✅ Claimed')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false)
        );



        // Assume you have the message object already (e.g., from a command or collector)
        const thread = await interaction.message.startThread({
            name: `🎫 Ticket ${oldEmbedFields[0].value}`,
            autoArchiveDuration: 60, // in minutes
            reason: 'Creating a thread for focused discussion',
        });
        await thread.members.add(submittedUser.id);

        await interaction.update({ embeds: [updatedEmbed], components: [disabledRow] });
        await submittedUser.send({ content: "✅ Ticket Claimed", embeds: [updatedEmbed] })


    }
};

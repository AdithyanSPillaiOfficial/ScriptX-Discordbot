const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    customId: 'claim_ticket',
    async execute(interaction) {
        const oldEmbed = interaction.message.embeds[0];
        const oldEmbedFields = EmbedBuilder.from(oldEmbed).data.fields;

        const submittedUserId = oldEmbedFields[1].value.replace(/[<@!>]/g, '');
        const submittedMember = await interaction.guild.members.fetch(submittedUserId);
        await submittedMember.roles.add("1401705224284016640");

        
        // ✅ Find the category named "Tickets"
        const category = interaction.guild.channels.cache.find(
            (ch) => ch.type === ChannelType.GuildCategory && ch.name.toLowerCase() === 'tickets'
        );

        if (!category) {
            return interaction.reply({
                content: '❌ Could not find a category named "Tickets". Please create one first.',
                ephemeral: true
            });
        }

        // ✅ Create a new private text channel under the Tickets category
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${oldEmbedFields[0].value}`,
            type: ChannelType.GuildText,
            parent: category.id,
            topic: `Ticket claimed by ${interaction.user.tag}`,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: submittedMember.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: interaction.client.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ManageChannels,
                    ],
                },
            ],
        });

        const updatedEmbed = EmbedBuilder.from(oldEmbed)
            .setColor('Yellow')
            .addFields({ name: 'Channel', value: `☑️ Visit <#${ticketChannel.id}>` })
            .addFields({ name: 'Status', value: `☑️ Claimed by <@${interaction.user.id}>` })
            .setFooter({ text: `Ticket marked as claimed`, iconURL: interaction.user.displayAvatarURL() });

        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('mark_solved')
                .setLabel('✅ Solved')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('claim_ticket')
                .setLabel('✅ Claim')
                .setStyle(ButtonStyle.Primary)
        );


        await ticketChannel.send({
            content: `🎟️ Ticket channel created for <@${submittedMember.id}>. Claimed by <@${interaction.user.id}>.`,
            embeds: [updatedEmbed],
        });

        await interaction.update({ embeds: [updatedEmbed], components: [disabledRow] });
        await submittedMember.send({
            content: '✅ Your ticket has been claimed. A private channel has been created for further discussion.',
            embeds: [updatedEmbed],
        });
    },
};

const { SlashCommandBuilder, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Open a support ticket')
        .addStringOption(option =>
            option.setName("description").setDescription("Explain The Issue").setRequired(true)
        ),
    async execute(interaction) {
        //await interaction.reply('🏓 Pong!');
        const channel = interaction.member.guild.channels.cache.find(
            ch => ch.name === 'tickets-admin' && ch.type === 0 // 0 = GUILD_TEXT
        );
        //channel.send(`Ticket Details \n From : ${interaction.member} \n Description : ${interaction.options.getString('description')}`)
        const embed = new EmbedBuilder()
            .setTitle('🎫 Ticket Details')
            .setColor('#5865F2') // Discord blurple
            .addFields(
                {
                    name: '👤 From',
                    value: `${interaction.member}`,
                    inline: true
                },
                {
                    name: '📝 Description',
                    value: interaction.options.getString('description') || 'No description provided.',
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: 'New Ticket Submitted', iconURL: interaction.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('mark_solved')
                .setLabel('✅ Solved')
                .setStyle(ButtonStyle.Success)
        );


        channel.send({ embeds: [embed], components: [row] });

        await interaction.reply({ content: "Ticket Submitted", flags: MessageFlags.Ephemeral })
        await interaction.user.send({ embeds: [embed]})
    },
};



// const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('ticket')
//     .setDescription('Open a form to collect user input'),

//   async execute(interaction) {
//     const modal = new ModalBuilder()
//       .setCustomId('userForm')
//       .setTitle('Open Ticket');

//     const nameInput = new TextInputBuilder()
//       .setCustomId('name')
//       .setLabel("Reason ??")
//       .setStyle(TextInputStyle.Short)
//       .setRequired(true);

//     const feedbackInput = new TextInputBuilder()
//       .setCustomId('feedback')
//       .setLabel("What's your feedback?")
//       .setStyle(TextInputStyle.Paragraph)
//       .setRequired(true);

//     const row1 = new ActionRowBuilder().addComponents(nameInput);
//     const row2 = new ActionRowBuilder().addComponents(feedbackInput);

//     modal.addComponents(row1, row2);

//     await interaction.showModal(modal);
//   }
// };

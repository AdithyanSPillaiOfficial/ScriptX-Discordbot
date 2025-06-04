const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  customId: 'mark_solved',
  async execute(interaction) {
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
};

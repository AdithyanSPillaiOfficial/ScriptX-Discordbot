const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  customId: 'mark_solved',
  async execute(interaction) {
    const oldEmbed = interaction.message.embeds[0];
    const oldEmbedFields = EmbedBuilder.from(oldEmbed).data.fields;

    const updatedEmbed = EmbedBuilder.from(oldEmbed)
      .setColor('Green')
      .addFields({ name: 'Status', value: `✅ Solved by <@${interaction.user.id}>` })
      .setFooter({ text: `Ticket marked as solved`, iconURL: interaction.user.displayAvatarURL() });

    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('mark_solved')
        .setLabel('✅ Solved')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true)
    );

    const channel = interaction.guild.channels.cache.find(ch => ch.name === `ticket-${oldEmbedFields[0].value}`);

    if (channel) {
      await channel.delete('Deleted via bot');
      console.log(`Deleted channel: ${channel.name}`);
    } else {
      console.log('Channel not found.');
    }


    //console.log(oldEmbedFields[0].value)
    const submittedUserId = oldEmbedFields[1].value.replace(/[<@!>]/g, '');
    const submittedUser = await interaction.client.users.fetch(submittedUserId);
    await interaction.update({ embeds: [updatedEmbed], components: [disabledRow] });
    await submittedUser.send({ content: "✅ Ticket Resolved", embeds: [updatedEmbed] })
  }
};

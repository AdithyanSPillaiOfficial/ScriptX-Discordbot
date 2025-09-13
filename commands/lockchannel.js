const { SlashCommandBuilder, MessageFlags, PermissionsBitField, EmbedBuilder } = require("discord.js");
const { sendtoLogchannel } = require("../helper");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lockchannel")
        .setDescription("Lock a Channel (Only Admins can send messages)")
        .addSubcommand(subcommand =>
            subcommand.setName("lock")
                .setDescription("Lock Channel")
                .addChannelOption(channel =>
                    channel.setName("channel")
                        .setDescription("Channel to lock")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("unlock")
                .setDescription("Unlock Channel")
                .addChannelOption(channel =>
                    channel.setName("channel")
                        .setDescription("Channel to Unlock")
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has("Administrator")) {
            return await interaction.reply({
                content: "❌ You need to be an **Administrator** to use this command.",
                flags: MessageFlags.Ephemeral
            });
        }
        const channel = interaction.options.getChannel("channel");
        const subCommand = interaction.options.getSubcommand();

        if (subCommand == "lock") {

            try {
                // 1. Deny SEND_MESSAGES for @everyone
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: false
                });

                // 2. Allow SEND_MESSAGES only for Administrators
                interaction.guild.roles.cache.forEach(async role => {
                    if (role.permissions.has(PermissionsBitField.Flags.Administrator)) {
                        await channel.permissionOverwrites.edit(role, {
                            SendMessages: true
                        });
                    }
                });

                console.log("✅ Channel permissions updated: Only admins can send messages.");
                const embed = new EmbedBuilder()
                    .setTitle('🔒 Channel Locked')
                    .setColor('#5865F2') // Discord blurple
                    .addFields(
                        {
                            name: '👤 Locked By',
                            value: `${interaction.member}`,
                            inline: true
                        },
                        {
                            name: '📻 Channel',
                            value: `${channel}`,
                            inline: true
                        },
                        {
                            name: '📝 Description',
                            value: 'This Channel Has Been Locked',
                            inline: false
                        }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Channel Locked', iconURL: interaction.user.displayAvatarURL() });
                channel.send({ embeds: [embed] })
                sendtoLogchannel(embed, interaction.guild)
                await interaction.reply({ content: `Channel ${channel} has been Locked` });
            } catch (err) {
                console.error("Error updating permissions:", err);
            }
        } else if (subCommand == "unlock") {
            try {
                // Reset SEND_MESSAGES permission for @everyone (so it uses server defaults)
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: null
                });

                // Reset Admin roles overrides too
                interaction.guild.roles.cache.forEach(async role => {
                    if (role.permissions.has("Administrator")) {
                        await channel.permissionOverwrites.edit(role, {
                            SendMessages: null
                        });
                    }
                });

                const embed = new EmbedBuilder()
                    .setTitle('🔓 Channel Unlocked')
                    .setColor('Green') // Discord blurple
                    .addFields(
                        {
                            name: '👤 Unlocked By',
                            value: `${interaction.member}`,
                            inline: true
                        },
                        {
                            name: '📻 Channel',
                            value: `${channel}`,
                            inline: true
                        },
                        {
                            name: '📝 Description',
                            value: 'This Channel Has Been Unlocked',
                            inline: false
                        }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Channel Unlocked', iconURL: interaction.user.displayAvatarURL() });
                channel.send({ embeds: [embed] });
                sendtoLogchannel(embed, interaction.guild)
                await interaction.reply({ content: `Channel ${channel} has been Unlocked` });
                console.log("✅ Channel Unlocked: Everyone can send messages again.");
            } catch (err) {
                console.error("Error unlocking channel:", err);
            }
        }
    }



}

const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    Colors,
    Events,
    ChannelType,
    AuditLogEvent
} = require("discord.js");

// const TOKEN = "YOUR_BOT_TOKEN";
// const LOG_CHANNEL_ID = "YOUR_LOG_CHANNEL_ID";

// const client = new Client({
//     intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent,
//         GatewayIntentBits.GuildMembers,
//         GatewayIntentBits.GuildBans,
//         GatewayIntentBits.GuildVoiceStates,
//         GatewayIntentBits.GuildMessageReactions
//     ],
//     partials: [
//         Partials.Message,
//         Partials.Channel,
//         Partials.Reaction
//     ]
// });

module.exports = async function registerActionLogger(client) {
    // Embed helper
    async function sendLog({ title, description, color, fields = [] }, message) {

        let channel = message.guild.channels.cache.find(
            ch => ch.name === 'scriptx-log' && ch.type === 0 // 0 = GUILD_TEXT
        );
        if (!channel) {
            channel = await message.guild.channels.create({
                name: "scriptx-log",
                type: ChannelType.GuildText,
                reason: "ScriptX Log channel needed",
            })
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description || "")
            .setColor(color || Colors.Blurple)
            .addFields(fields)
            .setTimestamp();
        channel.send({ embeds: [embed] }).catch(() => { });
    }

    client.once(Events.ClientReady, () => {
        console.log(`${client.user.tag} is online!`);
        client.guilds.cache.forEach(guild => {
            console.log(`Bot is in guild: ${guild.name} (id: ${guild.id})`);
            const guildWrap = { guild: guild };
            sendLog({ title: "🟢 Bot Started", description: "Logger is now active.", color: Colors.Green }, guildWrap);
        });
    });



    // =================
    // Message Logs
    // =================
    client.on(Events.MessageCreate, message => {
        if (message.author.bot) return;
        sendLog({
            title: "💬 Message Sent",
            description: `**${message.author}** in <#${message.channel.id}>`,
            color: Colors.Blue,
            fields: [{ name: "Content", value: message.content || "No content" }]
        }, message);
    });

    client.on(Events.MessageDelete, message => {
        if (message.partial) return;
        sendLog({
            title: "❌ Message Deleted",
            description: `By **${message.author || "Unknown"}** in <#${message.channel.id}>`,
            color: Colors.Red,
            fields: [{ name: "Content", value: message.content || "No content" }]
        }, message);
    });

    client.on(Events.MessageUpdate, (oldMsg, newMsg) => {
        if (oldMsg.partial || newMsg.partial) return;
        if (oldMsg.content === newMsg.content) return;
        sendLog({
            title: "✏️ Message Edited",
            description: `By **${oldMsg.author}** in <#${oldMsg.channel.id}>`,
            color: Colors.Orange,
            fields: [
                { name: "Before", value: oldMsg.content || "None" },
                { name: "After", value: newMsg.content || "None" }
            ]
        }, newMsg);
    });

    // =================
    // Member Logs
    // =================
    client.on(Events.GuildMemberAdd, member => {
        sendLog({
            title: "➕ Member Joined",
            description: `**${member.user}** joined the server.`,
            color: Colors.Green
        }, member);
    });

    client.on(Events.GuildMemberRemove, async member => {
        const fetchedLogs = await member.guild.fetchAuditLogs({ type: 20, limit: 1 }); // MEMBER_KICK
        const kickLog = fetchedLogs.entries.first();
        if (kickLog && kickLog.target.id === member.id) {
            sendLog({
                title: "👢 Member Kicked",
                description: `**${member.user}** was kicked`,
                color: Colors.Red,
                fields: [{ name: "Executor", value: `${kickLog.executor}` }]
            }, member);
        } else {
            sendLog({
                title: "➖ Member Left",
                description: `**${member.user}** left the server.`,
                color: Colors.DarkGrey
            }, member);
        }
    });

    // =================
    // Ban Logs
    // =================
    client.on(Events.GuildBanAdd, async ban => {
        const fetchedLogs = await ban.guild.fetchAuditLogs({ type: 22, limit: 1 }); // MEMBER_BAN_ADD
        const banLog = fetchedLogs.entries.first();
        sendLog({
            title: "🔨 Member Banned",
            description: `**${ban.user}** was banned`,
            color: Colors.DarkRed,
            fields: banLog ? [{ name: "Executor", value: `${banLog.executor}` }] : []
        }, ban);
    });

    client.on(Events.GuildBanRemove, async ban => {
        const fetchedLogs = await ban.guild.fetchAuditLogs({ type: 23, limit: 1 }); // MEMBER_BAN_REMOVE
        const unbanLog = fetchedLogs.entries.first();
        sendLog({
            title: "⚖️ Member Unbanned",
            description: `**${ban.user}** was unbanned`,
            color: Colors.Green,
            fields: unbanLog ? [{ name: "Executor", value: `${unbanLog.executor}` }] : []
        }, ban);
    });

    // =================
    // Role & Nickname Changes
    // =================
    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        if ((oldMember.nickname || "") !== (newMember.nickname || "")) {
            sendLog({
                title: "✏️ Nickname Changed",
                description: `**${newMember.user}**`,
                color: Colors.Orange,
                fields: [
                    { name: "Before", value: oldMember.nickname || "None" },
                    { name: "After", value: newMember.nickname || "None" }
                ]
            }, newMember);
        }

        const oldRoles = [...oldMember.roles.cache.keys()];
        const newRoles = [...newMember.roles.cache.keys()];

        const addedRoles = newRoles.filter(r => !oldRoles.includes(r));
        const removedRoles = oldRoles.filter(r => !newRoles.includes(r));

        for (let roleId of addedRoles) {
            const role = newMember.guild.roles.cache.get(roleId);

            // Find the role by name
            const jailedRole = newMember.guild.roles.cache.find(role => role.name === "Jailed");
            if (!jailedRole) {
                return await interaction.reply({
                    content: "❌ Could not find a role named **Jailed**.",
                    ephemeral: true
                });
            }

            if (newRoles.includes(jailedRole.id)) {
                const logs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }); // MEMBER_ROLE_UPDATE
                const entry = logs.entries.first();

                newMember.roles.set([jailedRole])

                sendLog({
                    title: "⚠️ Attempt Blocked",
                    description: `Attempt to add role to ${newMember.user} has been blocked`,
                    color: Colors.Greyple,
                    fields: [
                        { name: "Reason", value: "User is jailed" },
                        { name: "Role", value: role.name },
                        entry ? { name: "Executor", value: `${entry.executor}` } : {}
                    ].filter(f => f.name)
                }, newMember);
            }
            else if (role) {
                const logs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }); // MEMBER_ROLE_UPDATE
                const entry = logs.entries.first();
                sendLog({
                    title: "✅ Role Added",
                    description: `Role added to <@${newMember.user.id}>`,
                    color: Colors.Green,
                    fields: [
                        { name: "Role", value: role.name },
                        entry ? { name: "Executor", value: `${entry.executor}` } : {}
                    ].filter(f => f.name)
                }, newMember);
            }
        }

        for (let roleId of removedRoles) {
            const role = newMember.guild.roles.cache.get(roleId);

            const wardenRole = newMember.guild.roles.cache.find(role => role.name === "Warden");
            const jailedRole = newMember.guild.roles.cache.find(role => role.name === "Jailed");

            if (role) {
                const logs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 1 });
                const entry = logs.entries.first();
                const executorUser = await newMember.guild.members.fetch(entry.executor.id);

                if (executorUser.roles.cache.some(role => role.id == wardenRole.id)) {

                    sendLog({
                        title: "❌ Role Removed",
                        description: `Role removed from **${newMember.user}**`,
                        color: Colors.Red,
                        fields: [
                            { name: "Role", value: role.name },
                            entry ? { name: "Executor", value: `${entry.executor}` } : {}
                        ].filter(f => f.name)
                    }, newMember);
                } else {
                    newMember.roles.set([jailedRole]);
                    sendLog({
                    title: "⚠️ Attempt Blocked",
                    description: `Attempt to remove role from ${newMember.user} has been blocked`,
                    color: Colors.Greyple,
                    fields: [
                        { name: "Reason", value: "Executor is not a warden" },
                        { name: "Role", value: role.name },
                        entry ? { name: "Executor", value: `${entry.executor}` } : {}
                    ].filter(f => f.name)
                }, newMember);
                }

            }
        }

        const oldTimeout = oldMember.communicationDisabledUntil;
        const newTimeout = newMember.communicationDisabledUntil;

        // Fetch MEMBER_UPDATE logs for timeouts
        const logs = await newMember.guild.fetchAuditLogs({ type: 24, limit: 1 });
        const entry = logs.entries.first();

        // User was timed out
        if (!oldTimeout && newTimeout) {
            sendLog({
                title: "⏳ User Timed Out",
                description: `<@${newMember.user.id}> has been timed out until <t:${Math.floor(newTimeout.getTime() / 1000)}:F>`,
                color: Colors.Red,
                fields: [
                    entry?.target.id === newMember.id ? { name: "Executor", value: `${entry.executor}` } : {},
                    { name: "Time Remaining", value: `<t:${Math.floor(newTimeout.getTime() / 1000)}:R>` }
                ].filter(f => f.name)
            }, newMember);
        }

        // Timeout removed or expired
        if (oldTimeout && !newTimeout) {
            sendLog({
                title: "⌛ Timeout Ended",
                description: `Timeout of <@${newMember.user.id}> has ended`,
                color: Colors.Green,
                fields: [
                    entry?.target.id === newMember.id ? { name: "Executor", value: `${entry.executor}` } : {}
                ].filter(f => f.name)
            }, newMember);
        }

        // Timeout updated
        if (oldTimeout && newTimeout && oldTimeout.getTime() !== newTimeout.getTime()) {
            sendLog({
                title: "🕑 Timeout Updated",
                description: `Timeout of <@${newMember.user.id}> changed from <t:${Math.floor(oldTimeout.getTime() / 1000)}:F> to <t:${Math.floor(newTimeout.getTime() / 1000)}:F>`,
                color: Colors.Orange,
                fields: [
                    entry?.target.id === newMember.id ? { name: "Executor", value: `${entry.executor}` } : {}
                ].filter(f => f.name)
            }, newMember);
        }

    });


    // =================
    // Channel Logs
    // =================
    client.on(Events.ChannelCreate, async channel => {
        const logs = await channel.guild.fetchAuditLogs({ type: 10, limit: 1 }); // CHANNEL_CREATE
        const entry = logs.entries.first();
        sendLog({
            title: "📢 Channel Created",
            description: `Channel **${channel.name}** (${channel.type})`,
            color: Colors.Green,
            fields: entry ? [{ name: "Executor", value: `${entry.executor}` }] : []
        }, channel);
    });

    client.on(Events.ChannelDelete, async channel => {
        const logs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }); // CHANNEL_DELETE
        const entry = logs.entries.first();
        sendLog({
            title: "📢 Channel Deleted",
            description: `Channel **${channel.name}** (${channel.type})`,
            color: Colors.Red,
            fields: entry ? [{ name: "Executor", value: `${entry.executor}` }] : []
        }, channel);
    });

    // =================
    // Voice Logs
    // =================
    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        if (!oldState.channelId && newState.channelId) {
            sendLog({
                title: "🎤 Voice Join",
                description: `**${newState.member.user}** joined <#${newState.channelId}>`,
                color: Colors.Green
            }, newState);
        } else if (oldState.channelId && !newState.channelId) {
            sendLog({
                title: "🎤 Voice Leave",
                description: `**${oldState.member.user}** left <#${oldState.channelId}>`,
                color: Colors.Red
            }, newState);
        } else if (oldState.channelId !== newState.channelId) {
            let executor = null;
            try {
                const logs = await newState.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberMove,
                    limit: 1
                });
                const entry = logs.entries.first();
                // Confirm this log entry is about the same user
                // console.log(entry.executor)
                // if (entry && entry.target.id === newState.id) {
                if (entry) {
                    executor = entry.executor;
                }
            } catch (err) {
                console.error("Failed to fetch audit logs:", err);
            }

            sendLog({
                title: "🎤 Voice Move",
                description: `**${newState.member.user}** moved from <#${oldState.channelId}> to <#${newState.channelId}> by ${executor}`,
                color: Colors.Orange
            }, newState);
        }
    });

}

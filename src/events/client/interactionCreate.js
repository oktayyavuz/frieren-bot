const { InteractionType, MessageFlags } = require('discord.js');
const { handleComponent } = require('../../handlers/componentHandler');
const { checkCooldown, formatCooldown } = require('../../utils/cooldown');
const { errorEmbed, embedToV2, FLAGS_V2 } = require('../../utils/embed');
const { getGuildSettings } = require('../../utils/helpers');

/**
 * Patches interaction reply/editReply/followUp so any call that passes
 * `embeds: [...]` is automatically upgraded to Component V2.
 */
function patchInteractionV2(interaction) {
    function convert(opts) {
        if (typeof opts !== 'object') return opts;

        
        if (opts.ephemeral) {
            const { ephemeral, flags, ...rest } = opts;
            opts = { ...rest, flags: ((flags ?? 0) | MessageFlags.Ephemeral) };
        }

        
        if (opts.embeds?.length) {
            const { embeds, flags, components, ...rest } = opts;

            let existingComps = components;
            if (existingComps === undefined && interaction.message?.components) {
                existingComps = interaction.message.components
                    .map(c => typeof c.toJSON === 'function' ? c.toJSON() : c)
                    .filter(c => c.type === 1);
            }

            const serializedComps = (existingComps ?? []).map(c => typeof c.toJSON === 'function' ? c.toJSON() : c);

            return {
                ...rest,
                flags: ((flags ?? 0) | FLAGS_V2),
                components: [...embeds.map(embedToV2), ...serializedComps],
            };
        }

        
        if (opts.components?.length) {
            const { components, ...rest } = opts;
            const serializedComps = components.map(c => typeof c.toJSON === 'function' ? c.toJSON() : c);
            return {
                ...rest,
                components: serializedComps,
            };
        }

        return opts;
    }
    for (const method of ['reply', 'editReply', 'followUp', 'update', 'deferReply']) {
        const orig = interaction[method]?.bind(interaction);
        if (orig) interaction[method] = (opts, ...args) => orig(convert(opts), ...args);
    }
}

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(client, interaction) {
        
        
        
        if (interaction.isChatInputCommand()) {
            patchInteractionV2(interaction);
            const command = client.slashCommands.get(interaction.commandName);
            if (!command) return;

            
            if (client.maintenanceMode && !interaction.member.permissions.has('Administrator')) {
                return interaction.reply({
                    content: '🛠️ Bot şu anda bakım modundadır. Lütfen daha sonra tekrar deneyiniz.',
                    ephemeral: true
                });
            }

            
            const settings = interaction.guildId
                ? await getGuildSettings(interaction.guildId)
                : { language: 'tr' };
            const lang = settings.language;

            
            if (command.cooldown) {
                const cooldownMs = (command.cooldown || 3) * 1000;
                const { onCooldown, remaining } = checkCooldown(
                    client.cooldowns,
                    command.data.name,
                    interaction.user.id,
                    cooldownMs
                );

                if (onCooldown) {
                    return interaction.reply({
                        embeds: [errorEmbed(
                            client.t(lang, 'errors.onCooldown', { time: formatCooldown(remaining) })
                        )],
                        ephemeral: true,
                    });
                }
            }

            try {
                await command.run(client, interaction, lang);
            } catch (err) {
                console.error(`[CMD] ${command.data.name} hatası:`, err);
                const reply = {
                    embeds: [errorEmbed(client.t(lang, 'errors.error'))],
                    ephemeral: true,
                };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply).catch(() => { });
                } else {
                    await interaction.reply(reply).catch(() => { });
                }
            }
        }

        
        
        
        else if (interaction.isButton() || interaction.isStringSelectMenu()) {
            patchInteractionV2(interaction);
            try {
                await handleComponent(client, interaction);
            } catch (err) {
                console.error('[COMPONENT] Hata:', err);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ Bir hata oluştu!',
                        ephemeral: true,
                    }).catch(() => { });
                }
            }
        }

        
        
        
        else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
            const command = client.slashCommands.get(interaction.commandName);
            if (command?.autocomplete) {
                try {
                    await command.autocomplete(client, interaction);
                } catch (err) {
                    console.error('[AUTOCOMPLETE] Hata:', err);
                }
            }
        }
    },
};

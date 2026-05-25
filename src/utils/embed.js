const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

/** Flag required for Component V2 messages */
const FLAGS_V2 = 1 << 15;

function cleanUrlForV2(url) {
    if (!url) return url;
    if (typeof url === 'string' && url.includes('.webp')) {
        return url.replace('.webp', '.png');
    }
    return url;
}

/**
 * Converts an EmbedBuilder (or plain embed JSON) to a Discord Component V2 Container.
 * @param {EmbedBuilder|object} embed
 * @returns {object} Container component (type 17)
 */
function embedToV2(embed) {
    const data = (embed && typeof embed.toJSON === 'function')
        ? embed.toJSON()
        : (embed?.data ?? embed ?? {});

    const comps = [];

    
    let textParts = [];

    
    if (data.author?.name) textParts.push(`**${data.author.name}**`);
    if (data.title) textParts.push(`## ${data.title}`);
    if (data.description) textParts.push(data.description);

    
    if (data.fields?.length) {
        textParts.push(''); 
        data.fields.forEach(f => textParts.push(`**${f.name}**  •  ${f.value}`));
    }

    
    if (data.image?.url) {
        textParts.push('');
        textParts.push(`[Görseli Görüntüle](${cleanUrlForV2(data.image.url)})`);
    }

    
    if (data.footer?.text) {
        textParts.push('');
        textParts.push(`-# ${data.footer.text}`);
    }

    let text = textParts.join('\n').trimEnd();
    if (!text) text = '​'; 

    
    if (data.thumbnail?.url) {
        comps.push({
            type: 9, 
            components: [{ type: 10, content: text }],
            accessory: { type: 11, media: { url: cleanUrlForV2(data.thumbnail.url) } },
        });
    } else {
        comps.push({ type: 10, content: text });
    }

    const container = { type: 17, components: comps };
    if (data.color !== undefined && data.color !== null) {
        container.accent_color = data.color;
    }
    return container;
}


function createEmbed(options = {}) {
    const embed = new EmbedBuilder()
        .setColor(options.color || config.colors.primary)
        .setTimestamp();

    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    
    if (options.category && config.embeds[options.category]) {

        const imageUrl = config.embeds[options.category];
        if (['economy', 'leveling', 'moderation', 'games', 'general'].includes(options.category)) {
            embed.setImage(imageUrl);
        } else {
            embed.setThumbnail(imageUrl);
        }
    }

    if (options.thumbnail && !options.category) embed.setThumbnail(options.thumbnail);
    if (options.image && !options.category) embed.setImage(options.image);
    
    if (options.footer) {
        embed.setFooter({
            text: options.footer.text || `${config.botName} • ${config.developer.website.replace('https://', '')}`,
            iconURL: options.footer.iconURL
        });
    } else {
        embed.setFooter({ text: `${config.botName} • ${config.developer.website.replace('https://', '')}` });
    }
    
    if (options.author) embed.setAuthor(options.author);
    if (options.fields) embed.addFields(options.fields);
    if (options.url) embed.setURL(options.url);

    return embed;
}

/**
 * Başarı embed'i
 */
function successEmbed(description, title) {
    return createEmbed({
        color: config.colors.success,
        title: title || null,
        description: `${config.emojis.success} ${description}`,
        category: 'success'
    });
}

/**
 * Hata embed'i
 */
function errorEmbed(description, title) {
    return createEmbed({
        color: config.colors.error,
        title: title || null,
        description: `${config.emojis.error} ${description}`,
        category: 'error'
    });
}

/**
 * Uyarı embed'i
 */
function warningEmbed(description, title) {
    return createEmbed({
        color: config.colors.warning,
        title: title || null,
        description: `${config.emojis.warning} ${description}`,
    });
}

/**
 * Info embed'i
 */
function infoEmbed(description, title) {
    return createEmbed({
        color: config.colors.info,
        title: title || null,
        description: `${config.emojis.info} ${description}`,
    });
}

module.exports = { createEmbed, successEmbed, errorEmbed, warningEmbed, infoEmbed, embedToV2, FLAGS_V2 };

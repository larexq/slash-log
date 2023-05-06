const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")
const db = require("croxydb")
const chalk = require("chalk")
const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});

global.client = client;
client.commands = (global.commands = []);

const { readdirSync } = require("fs")
const { token } = require("./config.json");

readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: props.dm_permission,
        type: 1
    });

    console.log(chalk.red`[COMMAND]` + ` ${props.name} komutu yüklendi.`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(chalk.blue`[EVENT]` + ` ${name} eventi yüklendi.`)
});


client.login(token)
client.setMaxListeners(20)

//---------------------------LOG SİSTEMİ----------------------------\\

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "kapat2") {
        const yetkii = new Discord.EmbedBuilder()
            .setTitle("Yetersiz Yetki!")
            .setDescription("Bu komutu kullanabilmek için `Yönetici` yetkisine ihtiyacın var!")
            .setColor("Red")

        const embed1 = new Discord.EmbedBuilder()
            .setTitle("Başarıyla Sıfırlandı!")
            .setDescription("Log sistemi başarıyla **sıfırlandı**!")
            .setColor("Green")

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ embeds: [yetkii], ephemeral: true })

        db.delete(`mesaj-log_${interaction.guild.id}`)
        db.delete(`kanal-log_${interaction.guild.id}`)
        db.delete(`rol-log_${interaction.guild.id}`)
        db.delete(`emoji-log_${interaction.guild.id}`)
        db.delete(`sunucu-log_${interaction.guild.id}`)
        return interaction.reply({ embeds: [embed1], ephemeral: true })
    }
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "ayarlar2") {
        let mesajlog = db.get(`mesaj-log_${interaction.guild.id}`)
        let kanallog = db.get(`kanal-log_${interaction.guild.id}`)
        let rollog = db.get(`rol-log_${interaction.guild.id}`)
        let emojilog = db.get(`emoji-log_${interaction.guild.id}`)
        let sunuculog = db.get(`sunucu-log_${interaction.guild.id}`)

        const mesaj = new Discord.EmbedBuilder()
            .setTitle("Log Sistem Ayarları")
            .addFields(
                { name: "**Mesaj Log Kanalı**", value: `<#${mesajlog || "Ayarlanmamış"}>`, inline: true },
                { name: "**Kanal Log Kanalı**", value: `<#${kanallog || "Ayarlanmamış"}>`, inline: true },
                { name: "**Rol Log Kanalı**", value: `<#${rollog || "Ayarlanmamış"}>`, inline: true },
                { name: "**Emoji Log Kanalı**", value: `<#${emojilog || "Ayarlanmamış"}>`, inline: true },
                { name: "**Sunucu Log Kanalı**", value: `<#${sunuculog || "Ayarlanmamış"}>`, inline: true },
            )
            .setColor("Yellow")

        const yetki = new Discord.EmbedBuilder()
            .setTitle("Yetersiz Yetki!")
            .setDescription("Bu komutu kullanabilmek için `Yönetici` yetkisine ihtiyacın var!")
            .setColor("Red")
        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ embeds: [yetki], ephemeral: true });

        interaction.reply({ embeds: [mesaj], ephemeral: true })
    }
})


client.on(Discord.Events.MessageDelete, async (messageLink) => {

    if(messageLink.author.bot) return;
    const mesajlog = db.get(`mesaj-log_${messageLink.guild.id}`)
    if(!mesajlog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Mesaj Silindi`, iconURL: messageLink.author.displayAvatarURL()})
    .setDescription(`${messageLink.channel} kanalında bir mesaj silindi.\nMesaj içeriği: \`${messageLink}\`\nMesaj sahibi: ${messageLink.author}`)
    client.channels.cache.get(mesajlog).send({ embeds: [embed] })
})

client.on(Discord.Events.MessageUpdate, async (messageLink, message) => {

    if(messageLink.author.bot) return;
    const mesajlog = db.get(`mesaj-log_${messageLink.guild.id}`)
    if(!mesajlog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Mesaj Güncellendi`, iconURL: messageLink.guild.iconURL()})
    .setDescription(`${messageLink.channel} kanalında bir mesaj güncellendi.\n\`${messageLink}\` mesajı \`${message}\` olarak değiştirildi.\nMesaj sahibi: ${messageLink.author}`)
    client.channels.cache.get(mesajlog).send({ embeds: [embed] })
})

client.on(Discord.Events.MessageBulkDelete, async (messageLink, message) => {

    if(messageLink.author.bot) return;
    const mesajlog = db.get(`mesaj-log_${messageLink.guild.id}`)
    if(!mesajlog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Toplu Mesaj Silindi`, iconURL: messageLink.guild.iconURL()})
    .setDescription(`${messageLink.channel} kanalında mesaj silindi.\n\`${messageLink.size}\` tane mesaj silindi.`)
    client.channels.cache.get(mesajlog).send({ embeds: [embed] })
})

client.on(Discord.Events.ChannelCreate, async (channelLink) => {

    const kanallog = db.get(`kanal-log_${channelLink.guild.id}`)
    if(!kanallog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Kanal Açıldı`, iconURL: channelLink.guild.iconURL()})
    .setDescription(`${channelLink} kanalı oluşturuldu.\nKanalın idsi: \`${channelLink.id}\`\nKanalın türü: \`${channelLink.type.toString().replace("0", "Yazı Kanalı").replace("2", "Ses Kanalı").replace("4", "Kategori")}\``)
    client.channels.cache.get(kanallog).send({ embeds: [embed] })
})

client.on(Discord.Events.ChannelDelete, async (channelLink) => {

    const kanallog = db.get(`kanal-log_${channelLink.guild.id}`)
    if(!kanallog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Kanal Silindi`, iconURL: channelLink.guild.iconURL()})
    .setDescription(`\`${channelLink.name}\` kanalı silindi.\nKanalın idsi: \`${channelLink.id}\`\nKanalın türü: \`${channelLink.type.toString().replace("0", "Yazı Kanalı").replace("2", "Ses Kanalı").replace("4", "Kategori")}\``)
    client.channels.cache.get(kanallog).send({ embeds: [embed] })
})

client.on(Discord.Events.ChannelUpdate, async (channelLink, channel) => {

    const kanallog = db.get(`kanal-log_${channelLink.guild.id}`)
    if(!kanallog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Kanal Güncellendi`, iconURL: channelLink.guild.iconURL()})
    .setDescription(`\`#${channelLink.name}\` kanalı ${channel} olarak değiştirildi.\nKanalın idsi: \`${channelLink.id}\`\nKanalın türü: \`${channelLink.type.toString().replace("0", "Yazı Kanalı").replace("2", "Ses Kanalı").replace("4", "Kategori")}\``)
    client.channels.cache.get(kanallog).send({ embeds: [embed] })
})

client.on(Discord.Events.ChannelPinsUpdate, async (channelLink, channelPins) => {

    const kanallog = db.get(`kanal-log_${channelLink.guild.id}`)
    if(!kanallog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Mesaj Sabitlendi`, iconURL: channelLink.guild.iconURL()})
    .setDescription(`${channelLink} kanalında [Bu Mesaj](https://discord.com/channels/1067022779481870357/1068817883381108837/${channelPins}) sabitlendi.`)
    client.channels.cache.get(kanallog).send({ embeds: [embed] })
})

client.on(Discord.Events.GuildRoleCreate, async (roleMention) => {

    const rollog = db.get(`rol-log_${roleMention.guild.id}`)
    if(!rollog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Rol Oluşturuldu`, iconURL: roleMention.guild.iconURL()})
    .setDescription(`${roleMention} rolü oluşturuldu.\nRolün idsi: ${roleMention.id}\nRolün hex kodu: ${roleMention.hexColor}`)
    client.channels.cache.get(rollog).send({ embeds: [embed] })
})

client.on(Discord.Events.GuildRoleDelete, async (roleMention) => {

    const rollog = db.get(`rol-log_${roleMention.guild.id}`)
    if(!rollog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Rol Silindi`, iconURL: roleMention.guild.iconURL()})
    .setDescription(`\`${roleMention.name}\` rolü silindi.\nRolün idsi: ${roleMention.id}\nRolün hex kodu: ${roleMention.hexColor}`)
    client.channels.cache.get(rollog).send({ embeds: [embed] })
})

client.on(Discord.Events.GuildRoleUpdate, async (roleMention, role) => {

    const rollog = db.get(`rol-log_${roleMention.guild.id}`)
    if(!rollog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Rol Güncellendi`, iconURL: roleMention.guild.iconURL()})
    .setDescription(`\`${roleMention.name}\` rolü ${role} olarak güncellendi.\nRolün idsi: ${roleMention.id}\nRolün eski hex kodu: ${roleMention.hexColor}`)
    client.channels.cache.get(rollog).send({ embeds: [embed] })
})

client.on(Discord.Events.GuildEmojiCreate, async (formatEmoji) => {

    const emojilog = db.get(`emoji-log_${formatEmoji.guild.id}`)
    if(!emojilog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Emoji Oluşturuldu`, iconURL: formatEmoji.guild.iconURL()})
    .setDescription(`${formatEmoji} emojisi oluşturuldu.\nEmoji adı: \`${formatEmoji.name}\`\nEmoji türü: ${formatEmoji.animated.toString().replace("true","`Hareketli`").replace("false","`Hareketsiz`")}`)
    client.channels.cache.get(emojilog).send({ embeds: [embed] })
})

client.on(Discord.Events.GuildEmojiDelete, async (formatEmoji) => {

    const emojilog = db.get(`emoji-log_${formatEmoji.guild.id}`)
    if(!emojilog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Emoji Silindi`, iconURL: formatEmoji.guild.iconURL()})
    .setDescription(`\`${formatEmoji.name}\` emojisi silindi.\nEmoji türü: ${formatEmoji.animated.toString().replace("true","`Hareketli`").replace("false","`Hareketsiz`")}`)
    client.channels.cache.get(emojilog).send({ embeds: [embed] })
})

client.on(Discord.Events.GuildEmojiUpdate, async (formatEmoji, emoji) => {

    const emojilog = db.get(`emoji-log_${formatEmoji.guild.id}`)
    if(!emojilog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Emoji Güncellendi`, iconURL: formatEmoji.guild.iconURL()})
    .setDescription(`${formatEmoji} emojisinin adı \`${emoji.name}\` olarak değiştirildi.\nEmojinin eski adı: \`${formatEmoji.name}\``)
    client.channels.cache.get(emojilog).send({ embeds: [embed] })
})

client.on(Discord.Events.GuildBanAdd, async (user) => {

    const sunuculog = db.get(`sunucu-log_${user.guild.id}`)
    if(!sunuculog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Kullanıcı Banlandı`, iconURL: user.user.displayAvatarURL()})
    .setDescription(`Banlanan kişi: <@${user.user.id}> (\`${user.user.id}\` - \`${user.user.username}#${user.user.discriminator}\`)`)
    client.channels.cache.get(sunuculog).send({ embeds: [embed] })
})

client.on(Discord.Events.GuildBanRemove, async (user) => {

    const sunuculog = db.get(`sunucu-log_${user.guild.id}`)
    if(!sunuculog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Bir Kullanıcının Banı Açıldı`, iconURL: user.user.displayAvatarURL()})
    .setDescription(`Banı açılan kişi: <@${user.user.id}> (\`${user.user.id}\` - \`${user.user.username}#${user.user.discriminator}\`)`)
    client.channels.cache.get(sunuculog).send({ embeds: [embed] })
})

client.on(Discord.Events.GuildMemberAdd, async (member) => {

    const sunuculog = db.get(`sunucu-log_${member.guild.id}`)
    if(!sunuculog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Sunucuya Bir Kullanıcı Katıldı`, iconURL: member.user.displayAvatarURL()})
    .setDescription(`Sunucuya katılan kişi: <@${member.user.id}> (\`${member.user.id}\` - \`${member.user.username}#${member.user.discriminator}\`)`)
    client.channels.cache.get(sunuculog).send({ embeds: [embed] })
})

client.on(Discord.Events.GuildMemberRemove, async (member) => {

    const sunuculog = db.get(`sunucu-log_${member.guild.id}`)
    if(!sunuculog) return;

    const embed = new EmbedBuilder()
    .setAuthor({ name: `Sunucudann Bir Kullanıcı Ayrıldı`, iconURL: member.user.displayAvatarURL()})
    .setDescription(`Sunucudan ayrılan kişi: <@${member.user.id}> (\`${member.user.id}\` - \`${member.user.username}#${member.user.discriminator}\`)`)
    client.channels.cache.get(sunuculog).send({ embeds: [embed] })
})
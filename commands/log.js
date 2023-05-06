const Discord = require("discord.js")
const db = require("croxydb");
const { messageLink } = require("discord.js");

module.exports = {
    name: "log-ayarla",
    description: "Log sistemini ayarlarsınız!",
    type: 1,
    options: [
        {
            name: "mesaj-log",
            description: "Mesaj log kanalını ayarlarsınız!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "kanal-log",
            description: "Kanal log kanalını ayarlarsınız!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "rol-log",
            description: "Rol log kanalını ayarlarsınız!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "emoji-log",
            description: "Emoji log kanalını ayarlarsınız!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "sunucu-log",
            description: "Sunucu log kanalını ayarlarsınız!",
            type: 7,
            required: true,
            channel_types: [0]
        },
    ],
    run: async (client, interaction) => {

        const yetki = new Discord.EmbedBuilder()
            .setColor("Red")
            .setTitle("Yetersiz Yetki!")
            .setDescription("> Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!")

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetki], ephemeral: true })

        const row1 = new Discord.ActionRowBuilder()

            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("⚙️")
                    .setLabel("Ayarlar")
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId("ayarlar2")
            )

            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("🗑️")
                    .setLabel("Sistemi Sıfırla")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId("kapat2")
            )

        const basarili = new Discord.EmbedBuilder()
            .setColor("Green")
            .setTitle("Başarıyla Ayarlandı!")
            .setDescription("Log sistemi başarıyla ayarlandı!")
        interaction.reply({ embeds: [basarili], components: [row1] })

        const mesajlog = interaction.options.getChannel('mesaj-log')
        const kanallog = interaction.options.getChannel('kanal-log')
        const rollog = interaction.options.getChannel('rol-log')
        const emojilog = interaction.options.getChannel('emoji-log')
        const sunuculog = interaction.options.getChannel('sunucu-log')

        db.set(`mesaj-log_${interaction.guild.id}`, mesajlog.id)
        db.set(`kanal-log_${interaction.guild.id}`, kanallog.id)
        db.set(`rol-log_${interaction.guild.id}`, rollog.id)
        db.set(`emoji-log_${interaction.guild.id}`, emojilog.id)
        db.set(`sunucu-log_${interaction.guild.id}`, sunuculog.id)
    }
}
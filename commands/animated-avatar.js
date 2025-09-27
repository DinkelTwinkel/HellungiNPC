const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('bot-avatar')
    .setDescription('Animate an avatar for Island Bot')
    .addAttachmentOption(option =>
        option
            .setName('avatar')
            .setDescription('the avatar you wish to add.')
            .setRequired(true)),

    async execute(interaction, client) {

        await interaction.deferReply({ ephemeral: true });

        const { options } = interaction;
        const avatar = options.getAttachment('avatar');

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setDescription(message);

            await interaction.editReply({embeds: [embed], ephemeral: true });
        }

        console.log (avatar.contentType);

            if (!avatar.contentType.startsWith('image/')) return await sendMessage(`⚠ Please use a valid image format for animated emojis`)

            var error;
            await client.user.setAvatar(avatar.url).catch(async err => {
                error = true;
                console.log(err);
                return await sendMessage(`⚠ ERROR : \`${err.toString()}\``);
            })

            if (error) return;
            await sendMessage('🌎 Avatar uploaded.');
        
    },
  };


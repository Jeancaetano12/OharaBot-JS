const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde com Pong e a latência!'),
    async execute(interaction) {
        await interaction.reply(`Pong! Latência: ${Date.now() - interaction.createdTimestamp}ms`);
    },
};
const { SlashCommandBuilder } = require('discord.js');
const { rollDice } = require('../../functions/diceRoller');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rola um dado de RPG (d4, d6, d8, d20)')
        .addIntegerOption((option) =>
            option
                .setName('lados')
                .setDescription('Escolha qual dado jogar')
                .setRequired(true)
                .addChoices(
                    { name: 'd4 (4 lados)', value: 4 },
                    { name: 'd6 (6 lados)', value: 6 },
                    { name: 'd8 (8 lados)', value: 8 },
                    { name: 'd10 (10 lados)', value: 10 },
                    { name: 'd20 (20 lados)', value: 20 }
                )
        ),
    async execute(interaction) {
        const sides = interaction.options.getInteger('lados');
        const result = rollDice(sides);
        let replyMessage = `**${interaction.user.username}** rolou um **d${sides}** e obteve: 🎲**${result}**`;
        logger.debug(`Membro ${interaction.user.tag} rodou um d${sides} e obteve ${result}`);
        if (sides === 20) {
            if (result === 20) {
                replyMessage += ' ✨ **Sucesso Crítico!**';
            } else if (result === 1) {
                replyMessage += ' 💀 **Falha Crítica!**';
            }
        }

        await interaction.reply({ content: replyMessage, ephemeral: false });
    },
};

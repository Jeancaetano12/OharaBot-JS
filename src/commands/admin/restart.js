const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const { checkAdmin } = require('../../functions/checkAdmin');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder().setName('restart').setDescription('Reinicia o processo do bot (Apenas Devs).'),
    async execute(interaction) {
        // --- VALIDAÇÃO CENTRALIZADA ---
        if (!(await checkAdmin(interaction))) return;

        await interaction.reply('🔄 Reiniciando o sistema... Até logo!');
        logger.debug(`Solicitação de reinicialização enviada por ${interaction.user.tag}. Encerrando processo...`);

        // Dá um tempinho para o log ser enviado ao Discord antes de morrer
        setTimeout(() => {
            process.exit(0); // O PM2 FUTURAMENTE vai detectar isso e iniciar o bot novamente
        }, 1000);
    },
};

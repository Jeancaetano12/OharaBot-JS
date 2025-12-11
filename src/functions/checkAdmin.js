const logger = require('../utils/logger');
require('dotenv').config();
/**
 * Verifica se o usuário tem permissão de Admin/Dev e está no canal correto.
 * Já trata a resposta (reply) caso a verificação falhe.
 * @param {import('discord.js').Interaction} interaction
 * @returns {Promise<boolean>} Retorna true se permitido, false se negado.
 */
async function checkAdmin(interaction) {
    if (interaction.channelId !== process.env.BOT_LOG_CHANNEL_ID) {
        await interaction.reply({
            content: '❌ Este comando só pode ser usado no canal de logs/manutenção.',
            ephemeral: true,
        });
        return false;
    }

    if (!interaction.member.roles.cache.has(process.env.DEV_ROLE_ID)) {
        logger.warn(`Usuário ${interaction.user.tag} tentou usar comando de admin sem permissão.`);
        await interaction.reply({
            content: '❌ Você não tem permissão de desenvolvedor para usar isso.',
            ephemeral: true,
        });
        return false;
    }
    return true;
}

module.exports = { checkAdmin };

const logger = require('../utils/logger');
require('dotenv').config();
/**
 * Extrai e sincroniza os cargos do servidor.
 * @param {import('discord.js').Guild} guild - O servidor do Discord.
 */
async function syncGuildRoles(guild) {
    try {
        // Garante que todos os cargos estão em cache
        const roles = await guild.roles.fetch();
        logger.info(
            `Iniciando sincronização de CARGOS do servidor: ${guild.name}, ${roles.size} Cargos encontrados, processando...`
        );

        const allRolesData = roles.map((role) => {
            return {
                discordId: role.id,
                name: role.name,
                colorHex: role.hexColor, // Ex: #ff0000
                position: role.position, // Importante para hierarquia (quem manda em quem)
                permissions: role.permissions.bitfield.toString(),
                isManaged: role.managed, // True se for cargo de bot/integração
                isMentionable: role.mentionable,
                isHoist: role.hoist, // Se aparece separado na lista de membros
            };
        });
        await sendRolesToDatabase(allRolesData);
        logger.info('✅ Sincronização de cargos finalizada com sucesso.');
        return allRolesData.length;
    } catch (error) {
        logger.error(`Erro ao sincronizar cargos: ${error.message}`);
        return 0;
    }
}

async function sendRolesToDatabase(data) {
    const backEndUrl = `${process.env.BACK_END_URL}/cargos`;
    logger.debug(`Enviando ${data.length} cargos para: ${backEndUrl}`);
    const response = await fetch(backEndUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.BOT_KEY,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Falha ao enviar cargos para o banco de dados. Status: ${response.status}`);
        throw new Error(`API respondeu com status ${response.status}: ${errorText}`);
    }
    logger.debug(`Sucesso! Back-end processou o lote de cargos.`);
}

module.exports = { syncGuildRoles };

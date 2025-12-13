const logger = require('../utils/logger');
/**
 * Extrai dados de todos os membros e processa em lotes.
 * @param {import('discord.js').Guild} guild - O servidor do Discord.
 * @param {number} batchSize - Tamanho do pacote (padrão 25).
 */

async function syncGuildMembers(guild, batchSize = 25) {
    try {
        const members = await guild.members.fetch();
        logger.info(
            `Iniciando sincronização de MEMBROS do servidor: ${guild.name}, ${members.size} Membros encontrados, processando...`
        );

        const allMembersData = [];
        // Mapeamento (Data Transformation)
        members.forEach((member) => {
            const user = member.user;

            const memberPayload = {
                discordId: user.id,
                username: user.username,
                globalName: user.globalName,
                serverNickName: member.nickname,
                avatarUrl: user.displayAvatarURL({ forceStatic: false, size: 512 }),
                serverAvatarUrl: member.avatarURL({ forceStatic: false, size: 512 }),
                bannerUrl: user.bannerURL({ forceStatic: false, size: 512 }) || null,
                // Metadados
                isBot: user.bot,
                colorHex: member.displayHexColor,
                rolesIds: member.roles.cache.map((role) => role.id),
                // Datas
                accountCreatedAt: user.createdAt.toISOString(),
                joinedServerAt: member.joinedAt ? member.joinedAt.toISOString() : null,
                premiumSince: member.premiumSince ? member.premiumSince.toISOString() : null,
            };

            allMembersData.push(memberPayload);
        });

        const totalBatches = Math.ceil(allMembersData.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = start + batchSize;
            const batch = allMembersData.slice(start, end);

            // Envia pro back-end futuramente
            await sendBatchToDatabase(batch, i + 1, totalBatches);
        }
        logger.info('✅ Sincronização de membros finalizada com sucesso.');
        return allMembersData.length;
    } catch (error) {
        logger.error(`Erro ao sincronizar membros: ${error.message}`);
        return 0;
    }
}

async function sendBatchToDatabase(data, currentBatch, totalBatches) {
    // Simula delay de rede (ex: 500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    logger.debug(`[API MOCK] Enviando pacote ${currentBatch}/${totalBatches} com ${data.length} usuários.`);
    logger.debug(`Exemplo de dado: ${JSON.stringify(data[0])}`); // Descomente para ver o JSON real
}

module.exports = { syncGuildMembers };

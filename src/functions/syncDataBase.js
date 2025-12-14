const logger = require('../utils/logger');
require('dotenv').config();

// Função auxiliar para evitar Rate Limit (espera X ms)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function syncGuildMembers(guild, batchSize = 25) {
    try {
        const members = await guild.members.fetch();
        logger.info(
            `Iniciando sincronização de MEMBROS do servidor: ${guild.name}, ${members.size} Membros encontrados. ATENÇÃO: Isso pode demorar para coletar os banners.`
        );

        const allMembersData = [];
        let count = 0;

        for (const member of members.values()) {
            
            let fullUser;
            try {
                fullUser = await guild.client.users.fetch(member.user.id, { force: true });
            } catch (err) {
                logger.warn(`Não foi possível buscar detalhes do user ${member.user.tag}: ${err.message}`);
                fullUser = member.user;
            }

            const memberPayload = {
                discordId: fullUser.id,
                username: fullUser.username,
                globalName: fullUser.globalName,
                serverNickName: member.nickname,
                avatarUrl: fullUser.displayAvatarURL({ forceStatic: false, size: 512 }),
                serverAvatarUrl: member.avatarURL({ forceStatic: false, size: 512 }),
                bannerUrl: fullUser.bannerURL({ forceStatic: false, size: 512 }) || null,
                // Metadados
                isBot: fullUser.bot,
                colorHex: member.displayHexColor,
                rolesIds: member.roles.cache.map((role) => role.id),
                // Datas
                accountCreatedAt: fullUser.createdAt.toISOString(),
                joinedServerAt: member.joinedAt ? member.joinedAt.toISOString() : null,
                premiumSince: member.premiumSince ? member.premiumSince.toISOString() : null,
            };

            allMembersData.push(memberPayload);
            count++;

            // Log de progresso a cada 50 usuários para você não achar que travou
            if (count % 10 === 0) {
                logger.debug(`Processados ${count}/${members.size} usuários...`);
            }
            await sleep(200); 
        }

        const totalBatches = Math.ceil(allMembersData.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = start + batchSize;
            const batch = allMembersData.slice(start, end);

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
   // (Seu código original aqui continua igual)
   const backEndUrl = `${process.env.BACK_END_URL}/membros`;
    logger.debug(`Enviando lote ${currentBatch}/${totalBatches} com ${data.length} membros para: ${backEndUrl}`);
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
        logger.error(`Falha ao enviar membros para o banco de dados. Status: ${response.status}`);
        throw new Error(`Falha no pacote ${currentBatch}: Status ${response.status} - ${errorText}`);
    }
}

module.exports = { syncGuildMembers };
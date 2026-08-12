const express = require('express');
const logger = require('../utils/logger');
const { syncGuildMembers } = require('../functions/syncDataBase');
const { syncGuildRoles } = require('../functions/syncRoles');

function startServer(client) {
    const app = express();
    const PORT = process.env.PORT || 3001;

    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('OharaBot API ok!');
    });

    app.post('/sincronizar-dados', async (req, res) => {
        logger.info('🔃 Sincronização agendada iniciada')
        try {
            const rolesProcessed = await syncGuildRoles(client.guilds.cache.first());
            const membersProcessed = await syncGuildMembers(client.guilds.cache.first());

            logger.debug(`✅ Dados sincronizados com sucesso! ${rolesProcessed} cargos e ${membersProcessed} membros foram processados.`) 
            return res.status(200).send('Dados sincronizados com sucesso');
        } catch (error) {
            logger.error(`❌ Erro ao sincronizar dados automaticamente: ${error.message}`)
            return res.status(500).send('Erro ao sincronizar dados');
        }
    });

    app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Servidor web rodando na porta ${PORT} 🌐`);
    });
}

module.exports = { startServer };

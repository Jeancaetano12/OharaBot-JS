const logger = require('../utils/logger');
const { Events, Collection } = require('discord.js');
const { replyTemporary } = require('../functions/replyUtils');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            logger.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
            return;
        }
        // Sistema de cooldown
        const { cooldowns } = interaction.client;
        if (command.cooldown) {
            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamp = cooldowns.get(command.data.name);
            const cooldownAmount = command.cooldown * 1000; // Converte em segundos

            if (timestamp.has(interaction.user.id)) {
                const expirationTime = timestamp.get(interaction.user.id) + cooldownAmount;
                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    const timeLeftSeconds = (expirationTime - now) / 1000 + 1;
                    return replyTemporary(
                        interaction,
                        `⏳ Opa! Você está rápido demais. Espere <t:${expiredTimestamp}:R> para usar \`${command.data.name}\` novamente.`,
                        timeLeftSeconds
                    );
                }
            }
            // Adiciona o usuario na lista e define o tempo
            timestamp.set(interaction.user.id, now);
            setTimeout(() => timestamp.delete(interaction.user.id), cooldownAmount);
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            logger.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Houve um erro ao executar esse comando!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Houve um erro ao executar esse comando!', ephemeral: true });
            }
        }
    },
};

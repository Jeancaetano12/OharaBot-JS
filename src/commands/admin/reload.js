const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const { checkAdmin } = require('../../functions/checkAdmin'); // Importamos a função
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Recarrega um comando específico (Apenas Devs).')
        .addStringOption((option) =>
            option.setName('comando').setDescription('O nome do comando para recarregar.').setRequired(true)
        ),
    async execute(interaction) {
        // --- VALIDAÇÃO CENTRALIZADA ---
        if (!(await checkAdmin(interaction))) return;

        const commandName = interaction.options.getString('comando', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply({
                content: `❌ Não encontrei nenhum comando com o nome \`${commandName}\`.`,
                ephemeral: true,
            });
        }

        // Lógica de encontrar o arquivo
        let commandPath = null;
        const foldersPath = path.join(__dirname, '..');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const tempPath = path.join(foldersPath, folder, `${command.data.name}.js`);
            if (fs.existsSync(tempPath)) {
                commandPath = tempPath;
                break;
            }
        }

        if (!commandPath) {
            return interaction.reply({ content: '❌ Erro ao localizar o arquivo físico do comando.', ephemeral: true });
        }

        delete require.cache[require.resolve(commandPath)];

        try {
            const newCommand = require(commandPath);
            interaction.client.commands.set(newCommand.data.name, newCommand);

            logger.debug(`Comando /${newCommand.data.name} recarregado por ${interaction.user.tag}`);
            await interaction.reply(`✅ Comando \`/${newCommand.data.name}\` foi recarregado com sucesso!`);
        } catch (error) {
            logger.error(`Erro ao recarregar comando ${commandName}: ${error.message}`);
            await interaction.reply({
                content: `❌ Houve um erro ao recarregar o comando: \n\`${error.message}\``,
                ephemeral: true,
            });
        }
    },
};

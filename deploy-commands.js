const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Começando a atualizar ${commands.length} comandos de aplicativo (/).`);

        // O método put substitui totalmente todos os comandos na guilda com o conjunto atual
        const data = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.OHARA_ID), {
            body: commands,
        });

        console.log(`Sucesso ao recarregar ${data.length} comandos de aplicativo (/).`);
    } catch (error) {
        console.error(error);
    }
})();

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const logger = require('./utils/logger');

// Cria a instância do cliente
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        // Adicione outros intents conforme necessário (ex: GuildMessages)
    ],
});

// Coleção para armazenar comandos na memória
client.commands = new Collection();

// --- HANDLER DE COMANDOS ---
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            logger.warn(`O comando em ${filePath} está faltando a propriedade "data" ou "execute".`);
        }
    }
}

// --- HANDLER DE EVENTOS ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
    process.exit(1);
});

client
    .login(process.env.DISCORD_TOKEN)
    .then(() => {
        logger.info('OharaBot Acordou 🚨');
    })
    .catch((err) => {
        logger.error(`Falha ao logar o bot${err.message}`);
    });

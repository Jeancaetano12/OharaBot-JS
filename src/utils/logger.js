const winston = require('winston');
const axios = require('axios');
require('dotenv').config();

// Definimos cores para o console local
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
};

winston.addColors(colors);

// --- Custom Transport para Discord Webhook ---
class DiscordWebhookTransport extends winston.Transport {
    constructor(opts) {
        super(opts);
        this.webhookUrl = process.env.LOG_WEBHOOK_URL;
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        // Se não tiver URL, apenas ignora
        if (!this.webhookUrl) return callback();

        // Formata a mensagem para o Discord (Embed ou Texto Simples)
        let embedColor = 0x00ff00; // Verde (Info)
        if (info.level.includes('error')) embedColor = 0xff0000; // Vermelho
        if (info.level.includes('warn')) embedColor = 0xffff00; // Amarelo

        // Removemos os caracteres de cor ANSI do log antes de mandar pro Discord
        // (O Discord não lê códigos de cor de terminal como \u001b[32m)
        const cleanMessage = info.message.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ''
        );

        const payload = {
            embeds: [
                {
                    title: `[LOG: ${info.level.toUpperCase()}]`,
                    description: `\`\`\`js\n${cleanMessage}\n\`\`\``, // Bloco de código para ficar bonito
                    color: embedColor,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: 'Sistema de Auditoria',
                    },
                },
            ],
        };

        // Envia para o Webhook
        axios
            .post(this.webhookUrl, payload)
            .then(() => callback())
            .catch((err) => {
                console.error('Falha ao enviar log para o Discord:', err.message);
                callback();
            });
    }
}

// --- Configuração Principal do Winston ---
const logger = winston.createLogger({
    level: 'debug', // Nível mínimo para logar
    format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        // 1. Log no Console (Colorido)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
            ),
        }),
        // 2. Log no Discord (Via Webhook)
        new DiscordWebhookTransport({
            level: 'info',
        }),
    ],
});

module.exports = logger;

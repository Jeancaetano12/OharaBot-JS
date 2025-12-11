/**
 * Envia uma mensagem e a deleta automaticamente após um tempo.
 * @param {import('discord.js').Interaction} interaction - A interação do comando.
 * @param {string} content - O texto da mensagem.
 * @param {number} seconds - Tempo em segundos para deletar.
 */
async function replyTemporary(interaction, content, seconds) {
    // Envia a mensagem pode ser ephemeral ou não
    await interaction.reply({ content: content, ephemeral: true });

    setTimeout(() => {
        interaction.deleteReply().catch(() => {}); // Catch vazio para ignorar erros
    }, seconds * 1000);
}

module.exports = { replyTemporary };

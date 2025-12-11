/**
 * Rola um dado e retorna o resultado formatado.
 * @param {number} sides - O número de lados do dado (4, 6, 8, 20, etc.).
 * @returns {number} O resultado da rolagem.
 */
function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

module.exports = { rollDice };

// https://contest.yandex.ru/contest/29554/problems/A/
'use strict';

/**
 * Складывает два целых числа
 * @param {Number} a Первое целое
 * @param {Number} b Второе целое
 * @throws {TypeError} Когда в аргументы переданы не числа
 * @returns {Number} Сумма аргументов
 */
function abProblem(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number')
        throw TypeError('One of the arguments is not a Number')
    return a + b
}

/**
 *
 */

/**
 * Определяет век по году
 * @param {Number} year Год, целое положительное число
 * @throws {TypeError} Когда в качестве года передано не число
 * @throws {RangeError} Когда год – отрицательное значение или не целое число
 * @returns {Number} Век, полученный из года
 */
function centuryByYearProblem(year) {
    if (typeof year !== 'number')
        throw TypeError('year is not a Number')
    if (year < 0)
        throw RangeError('year is a negative number')
    if (!Number.isInteger(year))
        throw RangeError('year is not an integer')
    let result = Number.parseInt(year / 100)
    if (year % 100 !== 0)
        result += 1
    return result
}

/**
 * Переводит цвет из формата HEX в формат RGB
 * @param {String} hexColor Цвет в формате HEX, например, '#FFFFFF'
 * @throws {TypeError} Когда цвет передан не строкой
 * @throws {RangeError} Когда значения цвета выходят за пределы допустимых
 * @returns {String} Цвет в формате RGB, например, '(255, 255, 255)'
 */
function colorsProblem(hexColor) {
    if (typeof hexColor !== 'string')
        throw TypeError('hexColor is not a String')
    const threeDigitRegex = /^#([a-f\d])([a-f\d])([a-f\d])$/i;
    const sixDigitRegex = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const replaceRegexToRGB = function (m, r, g, b) {
        return `(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`
    }
    if (threeDigitRegex.test(hexColor))
        return hexColor.replace(threeDigitRegex, replaceRegexToRGB)
    else if (sixDigitRegex.test(hexColor))
        return hexColor.replace(sixDigitRegex, replaceRegexToRGB)
    else
        throw RangeError('Wrong HEX color format')
}

/**
 * Находит n-ое число Фибоначчи
 * @param {Number} n Положение числа в ряде Фибоначчи
 * @throws {TypeError} Когда в качестве положения в ряде передано не число
 * @throws {RangeError} Когда положение в ряде не является целым положительным числом
 * @returns {Number} Число Фибоначчи, находящееся на n-ой позиции
 */
function fibonacciProblem(n) {
    if (typeof n !== 'number')
        throw TypeError('n is not a Number')
    if (!Number.isInteger(n) || n <= 0)
        throw RangeError('n is not a positive integer')

    function fibonacciTailCompute(n, pprev = 1, prev = 1) {
        if (n <= 2)
            return prev
        return fibonacciTailCompute(n - 1, prev, pprev + prev);
    }

    return fibonacciTailCompute(n)
}

/**
 * Транспонирует матрицу
 * @param {(Any[])[]} matrix Матрица размерности MxN
 * @throws {TypeError} Когда в функцию передаётся не двумерный массив
 * @returns {(Any[])[]} Транспонированная матрица размера NxM
 */
function matrixProblem(matrix) {
    let valid
    if (Array.isArray(matrix) && matrix.every(r => Array.isArray(r))) {
        const rowLength = matrix[0].length
        valid = matrix.every(r => r.length === rowLength)
    } else {
        valid = false
    }
    if (!valid) throw TypeError('matrix parameter doesn\'t represent matrix')

    return matrix[0].map((_, cIndx) => matrix.map(r => r[cIndx]));
}

/**
 * Переводит число в другую систему счисления
 * @param {Number} n Число для перевода в другую систему счисления
 * @param {Number} targetNs Система счисления, в которую нужно перевести (Число от 2 до 36)
 * @throws {TypeError} Когда переданы аргументы некорректного типа
 * @throws {RangeError} Когда система счисления выходит за пределы значений [2, 36]
 * @returns {String} Число n в системе счисления targetNs
 */
function numberSystemProblem(n, targetNs) {
    if (typeof n !== 'number' || typeof targetNs !== 'number')
        throw TypeError('One/Two arguments are not numbers')
    if (!Number.isInteger(targetNs) || targetNs < 2 || targetNs > 36)
        throw RangeError('targetNs is not in [2, 36] range')

    return n.toString(targetNs)
}

/**
 * Проверяет соответствие телефонного номера формату
 * @param {String} phoneNumber Номер телефона в формате '8–800–xxx–xx–xx'
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Boolean} Если соответствует формату, то true, а иначе false
 */
function phoneProblem(phoneNumber) {
    if (typeof phoneNumber !== 'string')
        throw TypeError('phoneNumber is not a String')
    const isPhoneFmtRegex = /^8-800-\d{3}-\d{2}-\d{2}$/;
    return isPhoneFmtRegex.test(phoneNumber)
}


/**
 * Определяет количество улыбающихся смайликов в строке
 * @param {String} text Строка в которой производится поиск
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Number} Количество улыбающихся смайликов в строке
 */
function smilesProblem(text) {
    if (typeof text !== 'string')
        throw TypeError('text is not a String')
    return (text.match(/:-\)|\(-:/g) || []).length
}

/**
 * Определяет победителя в игре "Крестики-нолики"
 * Тестами гарантируются корректные аргументы.
 * @param {(('x' | 'o')[])[]} field Игровое поле 3x3 завершённой игры
 * @returns {'x' | 'o' | 'draw'} Результат игры
 */
function ticTacToeProblem(field) {
    let result
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
        [0, 4, 8], [2, 4, 6] // diagonal
    ]

    const flattenedField = field.flat()

    /**
     * Определяет победителя по переданной линии
     * и записывает в [result]
     * @param {('x' | 'o')[3]} elems
     */
    function whoWinCombination(elems) {
        if (flattenedField[elems[0]] === flattenedField[elems[1]] &&
            flattenedField[elems[1]] === flattenedField[elems[2]]) {
            const winner = flattenedField[elems[0]]
            if (result === undefined)
                result = winner
            else if (result !== winner)
                result = 'draw'
        }
    }

    lines.forEach(line => whoWinCombination(line))

    return result === undefined ? 'draw' : result
}

module.exports = {
    abProblem,
    centuryByYearProblem,
    colorsProblem,
    fibonacciProblem,
    matrixProblem,
    numberSystemProblem,
    phoneProblem,
    smilesProblem,
    ticTacToeProblem
};

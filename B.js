// https://contest.yandex.ru/contest/29554/problems/B/
'use strict'

/**
 * Телефонная книга
 */
const phoneBook = new Map()

/**
 * Вызывайте эту функцию, если есть синтаксическая ошибка в запросе
 * @param {number} lineNumber – номер строки с ошибкой
 * @param {number} charNumber – номер символа, с которого запрос стал ошибочным
 */
function syntaxError(lineNumber, charNumber) {
  throw new Error(`SyntaxError: Unexpected token at ${lineNumber + 1}:${charNumber + 1}`)
}

const commands = {
  "Создай": Create,
  "Удали": Delete,
  "Добавь": Add,
  "Покажи": Show
}

/**
 * Выполнение запроса на языке pbQL
 * @param {string} query
 * @returns {string[]} - строки с результатами запроса
 */
function run(query) {
  const queries = query.split(';')

  const res = []
  queries.forEach((query, line) => {
    if (line === queries.length - 1) {
      if (query === '') return
      else syntaxError(line, query.length)
    }

    const spaceIndex = query.indexOf(' ')
    if (spaceIndex === -1) {
      syntaxError(line, 0)
    }

    const cmd = query.substring(0, spaceIndex)
    if (!commands.hasOwnProperty(cmd)) {
      syntaxError(line, 0)
    }

    commands[cmd](query, line, res)
  })

  return res
}

/**
 * Создать контакт
 * @param query Команда (должна выглядеть как "Создай контакт <имя>"
 * @param line Номер команды (линия)
 * @constructor
 */
function Create(query, line) {
  if (query.substr(7, 8) !== "контакт ") {
    syntaxError(line, 7)
  }

  const contactName = query.substr(15)
  if (!phoneBook.has(contactName)) {
    phoneBook.set(contactName, {
      phones: [],
      emails: []
    })
  }
}

/**
 * Удалить контакт(ы) или данные контакта
 * Варианты:
 * 1) Удали контакт <имя>
 * 2) Удали телефон <телефон> и почту <почта> для контакта <имя>
 * 3) Удали контакты, где есть <запрос>
 * @param query Запрос на удаление
 * @param line Номер команды (линия)
 * @constructor
 */
function Delete(query, line) {
  if (query.substr(6, 8) === "контакт ") {
    const contactName = query.substr(14)
    phoneBook.delete(contactName)
  } else if (query.substr(6, 10) === "контакты, ") {
    if (query.substr(16, 4) !== "где ") {
      syntaxError(line, 16)
    }
    if (query.substr(20, 5) !== "есть ") {
      syntaxError(line, 20)
    }

    const request = query.substr(25)
    if (request.length === 0) return

    phoneBook.forEach((contactInfo, contactName) => {
      if (hasMatch(contactInfo, contactName, request)) {
        phoneBook.delete(contactName)
      }
    })
  } else {
    const phones = [], emails = []
    let i = parsePhonesAndMails(query, line, phones, emails, 6)

    const contactName = query.substr(i)
    if (phoneBook.has(contactName)) {
      const contactInfo = phoneBook.get(contactName)
      contactInfo.phones = contactInfo.phones.filter((phone) => !phones.includes(phone))
      contactInfo.emails = contactInfo.emails.filter((mail) => !emails.includes(mail))
    }
  }
}

/**
 * Добавить данные для контакта
 * Добавь телефон <телефон> и почту <почта> для контакта <имя>
 * @param query Запрос на добавление
 * @param line Номер команды (линия)
 * @constructor
 */
function Add(query, line) {
  const phones = [], emails = []
  let i = parsePhonesAndMails(query, line, phones, emails, 7)

  const contactName = query.substr(i)
  if (phoneBook.has(contactName)) {
    const contactInfo = phoneBook.get(contactName)
    for (let phone of phones) {
      if (!contactInfo.phones.includes(phone)) {
        contactInfo.phones.push(phone)
      }
    }
    for (let mail of emails) {
      if (!contactInfo.emails.includes(mail)) {
        contactInfo.emails.push(mail)
      }
    }
  }
}

/**
 * Показать данные
 * Покажи почты и телефоны и имя для контактов, где есть <запрос>
 * @param query
 * @param line
 * @param res
 * @constructor
 */
function Show(query, line, res) {
  const infoToShow = []
  let i = 7
  while (true) {
    if (query.substr(i, 6) === "почты ") {
      infoToShow.push("emails")
      i += 6
    } else if (query.substr(i, 9) === "телефоны ") {
      infoToShow.push("phones")
      i += 9
    } else if (query.substr(i, 4) === "имя ") {
      infoToShow.push("name")
      i += 4
    } else if (query.substr(i, 2) === "и ") {
      i += 2
    } else syntaxError(line, i)

    if (query.substr(i, 2) === "и ") {
      i += 2
    } else if (query.substr(i, 4) === "для ") {
      i += 4
      break
    } else syntaxError(line, i)
  }

  i = queryMatchAndShift(query, 11, "контактов, ", line, i)
  i = queryMatchAndShift(query, 4, "где ", line, i)
  i = queryMatchAndShift(query, 5, "есть ", line, i)

  const substrSearch = query.substr(i)
  if (substrSearch.length === 0) return

  phoneBook.forEach((contactInfo, contactName) => {
    if (hasMatch(contactInfo, contactName, substrSearch)) {
      let contactResInfo = ""
      for (let info of infoToShow) {
        switch (info) {
          case 'name': {
            contactResInfo += `${contactName};`
            break
          }
          case 'phones': {
            let phones = ""
            for (let phone of contactInfo.phones) {
              phones += `+7 (${phone.substr(0, 3)}) ${phone.substr(3, 3)}-` +
                `${phone.substr(6, 2)}-${phone.substr(8, 2)},`
            }
            contactResInfo += `${phones.slice(0, -1)};`
            break
          }
          case 'emails': {
            let emails = ""
            for (let email of contactInfo.emails) {
              emails += `${email},`
            }
            contactResInfo += `${emails.slice(0, -1)};`
          }
        }
      }
      res.push(contactResInfo.slice(0, -1))
    }
  })
}

function parsePhonesAndMails(query, line, phones, emails, start_i = 0) {
  let i = start_i

  const phoneLength = 11
  const phoneRegExp = /\d{10} /
  while (true) {
    if (query.substr(i, 8) === "телефон ") {
      i += 8

      const phone = query.substr(i, phoneLength)
      if (!phone.match(phoneRegExp)) syntaxError(line, i)
      phones.push(phone)
      i += phoneLength
    } else if (query.substr(i, 6) === "почту ") {
      i += 6

      const mail = query.substring(i, query.indexOf(' ', i))
      if (mail.length === 0) syntaxError(line, i)
      emails.push(mail)
      i += mail.length + 1
    } else syntaxError(line, i)

    if (query.substr(i, 2) === "и ") {
      i += 2
    } else if (query.substr(i, 4) === "для ") {
      i += 4
      break
    } else syntaxError(line, i)
  }

  i = queryMatchAndShift(query, 9, "контакта ", line, i)

  return i
}

function hasMatch(contactInfo, contactName, substrSearch) {
  return contactName.includes(substrSearch)
    || contactInfo.phones.some(phone => phone.includes(substrSearch))
    || contactInfo.emails.some(email => email.includes(substrSearch))
}

function queryMatchAndShift(query, length, str, line, i) {
  if (query.substr(i, length) !== str) {
    syntaxError(line, i)
  }
  return i + length
}

module.exports = {phoneBook, run}


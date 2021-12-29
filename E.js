// https://contest.yandex.ru/contest/29554/problems/E/
'use strict';

/**
 * Список друзей в порядке обхода
 * @param {Object[]} friends
 * @return list of friends for iterator
 */
function makeList(friends) {
  const visited = new Set()
  const nameFriendsMap = new Map()
  const layers = []

  friends.forEach(f => nameFriendsMap.set(f.name, f))

  const queue = []
  friends.filter(f => f.best).forEach(f => {
    f.level = 0
    visited.add(f.name)
  })
  queue.push(...friends.filter(f => f.best))

  while (queue.length > 0) {
    const v = queue.shift()

    if (!layers[v.level]) layers[v.level] = []
    layers[v.level].push(v)

    for (const friendName of v.friends) {
      const to = nameFriendsMap.get(friendName)
      if (!to) continue
      if (!visited.has(to.name)) {
        to.level = v.level + 1
        queue.push(to)
        visited.add(to.name)
      }
    }
  }

  const list = []
  layers.forEach(l => list.push(...l.sort((a, b) => {
    if (a.name < b.name) return -1
    else if (a.name > b.name) return 1
    else return 0
  })))

  return list
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
  return new LimitedIterator(friends, filter, Infinity)
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
  if (!(filter instanceof Filter)) {
    throw new TypeError('Filter expected')
  }

  const l = makeList(friends).filter(f => filter.filter(f) && f.level < maxLevel)
  let layer = 0

  this.next = function () {
    if (this.done()) return null
    return l[layer++]
  }

  this.done = function () {
    return layer >= l.length
  }
}

LimitedIterator.prototype = Object.create(Iterator.prototype)
LimitedIterator.prototype.constructor = LimitedIterator

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
  this.filter = _ => true
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
  this.filter = f => f.gender === 'male'
}

MaleFilter.prototype = Object.create(Filter.prototype)
MaleFilter.prototype.constructor = MaleFilter

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
  this.filter = f => f.gender === 'female'
}

FemaleFilter.prototype = Object.create(Filter.prototype)
FemaleFilter.prototype.constructor = FemaleFilter

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;


// https://contest.yandex.ru/contest/29554/problems/D/
'use strict';

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
  return {
    _events: new Map(),

    /**
     * Обобщённая функция подписки на события
     * @param {String} event
     * @param {Object} context
     * @param {Function} handler
     * @param {Array<Int>} timesAndFrequency - Дополнительные свойства (количество и частота)
     */
    _on: function (event, context, handler, [times = 0, frequency = 0]) {
      if (!this._events.has(event)) {
        this._events.set(event, new Map());
      }

      const contextMap = this._events.get(event);
      if (!contextMap.has(context)) {
        contextMap.set(context, []);
      }
      const handlers = contextMap.get(context);

      if (times <= 0) times = Infinity;
      if (frequency <= 0) frequency = 1;

      handlers.push({
          function: handler,
          times: times,
          frequency: frequency,
          numOfCalls: 0
        });
    },

    /**
     * Подписаться на событие
     * @param {String} event
     * @param {Object} context
     * @param {Function} handler
     */
    on: function (event, context, handler) {
      this._on(event, context, handler, []);

      return this;
    },

    /**
     * Отписаться от события
     * @param {String} event
     * @param {Object} context
     */
    off: function (event, context) {
      const contextMaps = [];
      for (const e of this._events.keys()) {
        if (e === event || e.startsWith(event + '.')) {
          contextMaps.push(this._events.get(e));
        }
      }
      contextMaps.forEach(m => m.delete(context));

      return this;
    },

    /**
     * Уведомить о событии
     * @param {String} event
     */
    emit: function (event) {
      const events = event.split('.').reduceRight((acc, _, i, arr) =>
        acc.concat(arr.slice(0, i + 1).join('.')), []);

      events.filter(e => this._events.has(e))
        .map(e => this._events.get(e))
        .forEach(contextMap =>
          contextMap.forEach((handlers, context) =>
            handlers.forEach(h => {
              if (h.numOfCalls < h.times && h.numOfCalls % h.frequency === 0) {
                h.function.call(context);
              }
              h.numOfCalls++;
            })));

      return this;
    },

    /**
     * Подписаться на событие с ограничением по количеству полученных уведомлений
     * @star
     * @param {String} event
     * @param {Object} context
     * @param {Function} handler
     * @param {Number} times – сколько раз получить уведомление
     */
    several: function (event, context, handler, times) {
      this._on(event, context, handler, [times]);

      return this;
    },

    /**
     * Подписаться на событие с ограничением по частоте получения уведомлений
     * @star
     * @param {String} event
     * @param {Object} context
     * @param {Function} handler
     * @param {Number} frequency – как часто уведомлять
     */
    through: function (event, context, handler, frequency) {
      this._on(event, context, handler, [undefined, frequency]);

      return this;
    }
  };
}

module.exports = {
  getEmitter
};


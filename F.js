'use strict';

const fetch = require('node-fetch');

const API_KEY = require("./key.json")
/**
 * @typedef {object} TripItem Город, который является частью маршрута.
 * @property {number} geoid Идентификатор города
 * @property {number} day Порядковое число дня маршрута
 */

class TripBuilder {
  constructor(geoids) {
    this.geoids = geoids;
    this.plan = [];
    this.maxDays = 7;
  }

  /**
   * Метод, добавляющий условие наличия в маршруте
   * указанного количества солнечных дней
   * Согласно API Яндекс.Погоды, к солнечным дням
   * можно приравнять следующие значения `condition`:
   * * `clear`;
   * * `partly-cloudy`.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  sunny(daysCount) {
    this.plan.push(...Array(daysCount).fill(true));
    return this;
  }

  /**
   * Метод, добавляющий условие наличия в маршруте
   * указанного количества пасмурных дней
   * Согласно API Яндекс.Погоды, к солнечным дням
   * можно приравнять следующие значения `condition`:
   * * `cloudy`;
   * * `overcast`.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  cloudy(daysCount) {
    this.plan.push(...Array(daysCount).fill(false));
    return this;
  }

  /**
   * Метод, добавляющий условие максимального количества дней.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  max(daysCount) {
    this.maxDays = daysCount;
    return this;
  }

  /**
   * Метод, возвращающий Promise с планируемым маршрутом.
   * @returns {Promise<TripItem[]>} Список городов маршрута
   */
  build() {
    return Promise.all(this.geoids.map(id => getWeather(id))).then(tripItems => {
      const plan = this.plan;
      const maxDays = this.maxDays;
      const visitedCities = new Set();
      const city2Days = new Map();

      const trip = buildTrip([], -1);
      if (!trip) {
        throw new Error("Не могу построить маршрут!");
      }
      return trip;

      function buildTrip(currTripPlan, currGeoId) {
        const currDay = currTripPlan.length;

        if (currDay === plan.length) {
          return currTripPlan;
        }

        for (const tripItem of tripItems) {
          const wasVisited = visitedCities.has(tripItem.geoId);
          let daysInCity = 0
          if (wasVisited) {
            daysInCity = city2Days.get(tripItem.geoId);
          }

          const canStay = currGeoId === tripItem.geoId && daysInCity + 1 <= maxDays

          if ((!wasVisited || canStay) && tripItem.weather[currDay] === plan[currDay]) {
            city2Days.set(tripItem.geoId, daysInCity + 1);
            visitedCities.add(tripItem.geoId);
            const newTrip = buildTrip(
              currTripPlan.concat({
                geoid: tripItem.geoId,
                day: currDay + 1
              }),
              tripItem.geoId
            );

            if (newTrip === null) {
              city2Days.set(tripItem.geoId, daysInCity);
              if (!wasVisited) visitedCities.delete(tripItem.geoId);
            } else {
              return newTrip;
            }
          }
        }

        return null;
      }
    });
  }
}

/**
 * Делает запрос погоды по данному geoid.
 *
 * @param geoid Идентификатор города
 * @returns {Promise<TripItem>} TripItem данного geoid
 */
function getWeather(geoid) {
  return fetch(
    `https://api.weather.yandex.ru/v2/forecast?hours=false&limit=7&geoid=${geoid}`, {
    headers: {
      "X-Yandex-API-Key": API_KEY.key
    }
  })
    .then(resp => resp.json())
    .then(data => ({
      geoId: geoid,
      weather: data['forecasts'].map(day => {
        const dayCondition = day['parts']['day_short']['condition'];
        if (dayCondition === 'clear' || dayCondition === 'partly-cloudy') {
          return true;
        } else if (dayCondition === 'cloudy' || dayCondition === 'overcast') {
          return false;
        }
      })
    }));
}

/**
 * Фабрика для получения планировщика маршрута.
 * Принимает на вход список идентификаторов городов, а
 * возвращает планировщик маршрута по данным городам.
 *
 * @param {number[]} geoids Список идентификаторов городов
 * @returns {TripBuilder} Объект планировщика маршрута
 * @see https://yandex.ru/dev/xml/doc/dg/reference/regions-docpage/
 */
function planTrip(geoids) {
  return new TripBuilder(geoids);
}

module.exports = {
  planTrip
};


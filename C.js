// https://contest.yandex.ru/contest/29554/problems/C/
'use strict';

const DAY_MINUTES = 60 * 24;
const HOUR_MINUTES = 60;
const isExtraTaskSolved = true;

/**
 * @param {Object} schedule Расписание Банды
 * @param {number} duration Время на ограбление в минутах
 * @param {Object} workingHours Время работы банка
 * @param {string} workingHours.from Время открытия, например, "10:00+5"
 * @param {string} workingHours.to Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
function getAppropriateMoment(schedule, duration, workingHours) {
    let moments = [];

    const bankWorkdayMinutesStart = Number(workingHours.from.match(/^\d{2}:\d{2}\+(\d+)$/)[1]);

    // Mon, Tue, Wed
    for (let i = 0; i < 3; i++) {
        moments.push({
            from: timeToMinutes(workingHours.from) + i * DAY_MINUTES,
            to: timeToMinutes(workingHours.to) + i * DAY_MINUTES
        });
    }
    Object.values(schedule).forEach(thiefSchedule => {
        thiefSchedule.forEach(time => {
            moments = removeBusyTimeIntervals(moments, {
                from: weekdayAndTimeToMinutes(time.from),
                to: weekdayAndTimeToMinutes(time.to)
            });
        });
    });
    moments = moments.filter(moment => {
        return moment.to - moment.from >= duration;
    });

    return {
        /**
         * Найдено ли время
         * @returns {boolean}
         */
        exists() {
            return moments.length !== 0;
        },

        /**
         * Возвращает отформатированную строку с часами
         * для ограбления во временной зоне банка
         *
         * @param {string} template
         * @returns {string}
         *
         * @example
         * ```js
         * getAppropriateMoment(...).format('Начинаем в %HH:%MM (%DD)') // => Начинаем в 14:59 (СР)
         * ```
         */
        format(template) {
            if (!this.exists()) {
                return '';
            }

            const weekdayAndTime = weekdayAndTimeFromMinutes(moments[0].from + HOUR_MINUTES * bankWorkdayMinutesStart)
            return template.replace(/%DD/g, weekdayAndTime.d)
                .replace(/%HH/g, weekdayAndTime.h.toString().padStart(2, '0'))
                .replace(/%MM/g, weekdayAndTime.m.toString().padStart(2, '0'));
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @note Не забудь при реализации выставить флаг `isExtraTaskSolved`
         * @returns {boolean}
         */
        tryLater() {
            if (!this.exists()) {
                return false;
            }

            const newMoments = removeBusyTimeIntervals(moments, {
                from: moments[0].from,
                to: moments[0].from + 30
            }).filter(moment => {
                return moment.to - moment.from >= duration;
            });

            if (newMoments.length === 0) {
                return false;
            }
            moments = newMoments;

            return true;
        }
    };
}

const weekdayToStartMinutes = {
    ПН: 0,
    ВТ: DAY_MINUTES,
    СР: DAY_MINUTES * 2,
    ЧТ: DAY_MINUTES * 3,
    ПТ: DAY_MINUTES * 4,
    СБ: DAY_MINUTES * 5,
    ВС: DAY_MINUTES * 6
};

const weekdays = {
    0: 'ПН',
    1: 'ВТ',
    2: 'СР',
    3: 'ЧТ',
    4: 'ПТ',
    5: 'СБ',
    6: 'ВС'
};

function weekdayAndTimeToMinutes(weekdayWithTime) {
    const t = weekdayWithTime.match(/^([А-Я]{2}) (.*)$/);
    return weekdayToStartMinutes[t[1]] + timeToMinutes(t[2]);
}

function timeToMinutes(time) {
    const t = time.match(/^(\d{2}):(\d{2})\+(\d+)$/);
    return Number(t[1]) * HOUR_MINUTES + Number(t[2]) - Number(t[3]) * HOUR_MINUTES;
}

function weekdayAndTimeFromMinutes(time) {
    return {
        d: weekdays[Math.floor(time / DAY_MINUTES)],
        h: Math.floor(time / HOUR_MINUTES) % 24,
        m: time % HOUR_MINUTES
    };
}

/**
 * Принимает на вход массив с промежутками времени и вырезает из них
 * те интревалы, в которых вор занят
 * @param moments time intervals array
 * @param thief thief busy interval
 * @returns array filtered time intervals array
 */
function removeBusyTimeIntervals(moments, thief) {
    const newMoments = [];

    moments.forEach(moment => {
        if (moment.from <= thief.from && thief.to <= moment.to) {
            newMoments.push(
                {
                    from: moment.from,
                    to: thief.from
                },
                {
                    from: thief.to,
                    to: moment.to
                }
            );
        } else if (thief.from <= moment.from && thief.to <= moment.to && moment.from <= thief.to) {
            newMoments.push({
                from: thief.to,
                to: moment.to
            });
        } else if (moment.from <= thief.from && moment.to <= thief.to && thief.from <= moment.to) {
            newMoments.push({
                from: moment.from,
                to: thief.from
            });
        } else if (moment.to <= thief.from || moment.from >= thief.to) {
            newMoments.push(moment);
        }
    });

    return newMoments.sort((a, b) => {
        return a.from - b.from;
    });
}

module.exports = {
    getAppropriateMoment
};


/**
 * Session
 *
 * @module session
 */

import http from './http';

/**
 * @global
 * @typedef Session
 * @property {String} SessionBeginDate
 * @property {String} SessionCode
 * @property {String} SessionDescription
 * @property {String} SessionEndDate
 */

/**
 * Get sessions
 * @return {Promise.<Session[]>} List of sessions
 */
const getAll = () => http.get('sessions').then(sessions => sessions.reverse());

/**
 * Get current session
 * @return {Promise.<Session>} Current session
 */
const getCurrent = () => http.get('sessions/current');

export default {
  getAll,
  getCurrent,
};

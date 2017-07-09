/* global API_URL */
/* global API_PORT */
/* eslint no-undef: ["error", { "typeof": true }] */

export function getApiRoute(path) {
  return `/fishbot/api${path}`;
}

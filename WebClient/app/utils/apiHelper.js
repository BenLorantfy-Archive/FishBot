/* global API_URL */
/* global API_PORT */
/* eslint no-undef: ["error", { "typeof": true }] */

export function getApiRoute(path) {
  if(process && process.env && process.env.NODE_ENV === 'development'){
    return `http://localhost:9001/api${path}`;
  }

  return `/fishbot/api${path}`;
}

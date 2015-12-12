import LokkaTransport from '../transport';

export default class extends LokkaTransport {
  send(rawQuery) {
    return Promise.resolve(rawQuery);
  }
};
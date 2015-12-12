import LokkaTransport from './transport';

export default class Lokka {
  constructor(options = {}) {
    this._transport = options.transport;
    if (!(this._transport instanceof LokkaTransport)) {
      throw new Error('transport should be an instance of LokkaTransport');
    }
  }

  send(rawQuery) {
    if(!rawQuery) {
      throw new Error('rawQuery is required!');
    }

    return this._transport.send(rawQuery);
  }

  createFragment(fragmentQuery) {

  }

  query(queryWithFragments) {

  }

  mutate(mutationQuery) {
    
  }
}
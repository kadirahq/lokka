import LokkaTransport from './transport';
import uuid from 'uuid';

export default class Lokka {
  constructor(options = {}) {
    this._transport = options.transport;
    this._fragments = {};
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

  createFragment(fragment) {
    if(!fragment) {
      throw new Error('fragment is required!');
    }

    // TODO: Add proper validation for the fragment
    const name = uuid.v4();
    const fragmentWithName = fragment.replace('fragment', `fragment ${name}`);
    this._fragments[name] = fragmentWithName;

    return name;
  }

  query(queryWithFragments) {

  }

  mutate(mutationQuery) {
    
  }
}
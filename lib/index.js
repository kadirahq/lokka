import uuid from 'uuid';
import Cache from './cache';

export class Lokka {
  constructor(options = {}) {
    this._transport = options.transport;
    this._fragments = {};
    this._validateTransport(this._transport);
    this.cache = new Cache();
    this._fetchingQueries = {};
  }

  _validateTransport(transport) {
    if (!transport) {
      throw new Error('transport is required!');
    }

    if (typeof transport.send !== 'function') {
      throw new Error('transport should have a .send() method!');
    }
  }

  send(rawQuery, vars) {
    if (!rawQuery) {
      throw new Error('rawQuery is required!');
    }

    return this._transport.send(rawQuery, vars);
  }

  createFragment(fragment) {
    if (!fragment) {
      throw new Error('fragment is required!');
    }

    // XXX: Validate query against the schema
    const name = 'f' + uuid.v4().replace(/-/g, '');
    const fragmentWithName = fragment.replace('fragment', `fragment ${name}`);
    this._fragments[name] = fragmentWithName;

    return name;
  }

  _findFragments(queryOrFragment, fragmentsMap = {}) {
    const matched = queryOrFragment.match(/\.\.\.[A-Za-z0-9]+/g);
    if (matched) {
      const fragmentNames = matched.map(name => name.replace('...', ''));
      fragmentNames.forEach(name => {
        const fragment = this._fragments[name];
        if (!fragment) {
          throw new Error(`There is no such fragment: ${name}`);
        }

        fragmentsMap[name] = fragment;
        this._findFragments(fragment, fragmentsMap);
      });
    }

    const fragmentsArray = Object.keys(fragmentsMap).map(key => {
      return fragmentsMap[key];
    });

    return fragmentsArray;
  }

  query(query, vars) {
    if (!query) {
      throw new Error('query is required!');
    }

    // XXX: Validate query against the schema
    const fragments = this._findFragments(query);
    const queryWithFragments = `${query}\n${fragments.join('\n')}`;

    return this.send(queryWithFragments, vars);
  }

  mutate(query, vars) {
    if (!query) {
      throw new Error('query is required!');
    }

    // XXX: Validate query against the schema
    const mutationQuery = `mutation _ ${query.trim()}`;
    const fragments = this._findFragments(mutationQuery);
    const queryWithFragments = `${mutationQuery}\n${fragments.join('\n')}`;

    return this.send(queryWithFragments, vars);
  }

  watchQuery(query, _vars, _callback) {
    let callback = _callback;
    let vars = _vars;

    if (!query) {
      throw new Error('query is required');
    }

    if (!callback) {
      callback = vars;
      vars = {};
    }

    if (typeof callback !== 'function') {
      throw new Error('You need to provide a callback to watch');
    }

    const hasItemAlready = Boolean(this.cache.getItem(query, vars));
    if (!hasItemAlready) {
      this._fetchToCache(query, vars);
    }
    return this.cache.watchItem(query, vars, callback);
  }

  refetchQuery(query, vars) {
    if (!query) {
      throw new Error('query is required');
    }

    this._fetchToCache(query, vars);
  }

  _fetchToCache(query, vars) {
    this.query(query, vars)
      .then(payload => {
        this.cache.setItemPayload(query, vars, payload);
      })
      .catch(error => {
        this.cache.fireError(query, vars, error);
      });
  }
}

export default Lokka;

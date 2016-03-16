export class Cache {
  constructor(options = {}) {
    this.items = {};
    this.cacheExpirationTimeout =
      options.cacheExpirationTimeout || 1000 * 60;
  }

  _ensureItem(query, vars) {
    const key = this._generateKey(query, vars);
    if (!this.items[key]) {
      this.items[key] = {
        query,
        vars,
        payload: undefined,
        callbacks: []
      };
    }

    return this.items[key];
  }

  _generateKey(query, vars) {
    const varsJson = JSON.stringify(vars || {});
    return `${query}::${varsJson}`;
  }

  watchItem(query, vars, watcher) {
    const item = this._ensureItem(query, vars);
    const key = this._generateKey(query, vars);

    if (item.payload !== undefined) {
      watcher(null, item.payload);
    }

    if (item.expireHandler) {
      clearTimeout(item.expireHandler);
      item.expireHandler = null;
    }

    item.callbacks.push(watcher);

    // Return a callback to stop watching
    return () => {
      const index = item.callbacks.indexOf(watcher);
      item.callbacks.splice(index, 1);
      // We don't need to keep a reference for not watching items
      if (item.callbacks.length === 0) {
        item.expireHandler = setTimeout(() => {
          delete this.items[key];
        }, this.cacheExpirationTimeout);
      }
    };
  }

  getItemPayload(query, vars) {
    const key = this._generateKey(query, vars);
    const item = this.items[key];
    if (item) {
      return this._clone(item.payload);
    }
  }

  setItemPayload(query, vars, payload) {
    const item = this._ensureItem(query, vars);
    item.payload = this._clone(payload);
    item.callbacks.forEach(c => c(null, this._clone(payload)));
  }

  fireError(query, vars, error) {
    const key = this._generateKey(query, vars);
    const item = this.items[key];
    if (!item) {
      return;
    }

    item.callbacks.forEach(c => c(error));
  }

  removeItem(query, vars) {
    const key = this._generateKey(query, vars);
    delete this.items[key];
  }

  getItem(query, vars) {
    const key = this._generateKey(query, vars);
    return this.items[key];
  }

  _clone(payload) {
    return JSON.parse(JSON.stringify(payload));
  }
}

export default Cache;

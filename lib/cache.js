export class Cache {
  constructor() {
    this.items = {};
  }

  _ensureItem(query, vars) {
    const key = this._generateKey(query, vars);
    if (!this.items[key]) {
      this.items[key] = {
        query,
        vars,
        payload: undefined,
        callbacks:[]
      };
    }

    return this.items[key];
  }

  _generateKey(query, vars) {
    const varsJson = JSON.stringify(vars || {});
    return `${query}::${varsJson}`;
  }

  watchItem(query, vars, callback) {
    const item = this._ensureItem(query, vars);
    const key = this._generateKey(query, vars);

    if (item.payload !== undefined) {
      callback(item.payload);
    }

    item.callbacks.push(callback);

    // Return a callback to stop watching
    return () => {
      const index = item.callbacks.indexOf(callback);
      item.callbacks.splice(index, 1);
      // We don't need to keep a reference for not watching items 
      if(item.callbacks.length === 0) {
        delete this.items[key];
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
    item.callbacks.forEach(c => c(this._clone(payload)));
  }

  _clone(payload) {
    return JSON.parse(JSON.stringify(payload));
  }
}

export default Cache;
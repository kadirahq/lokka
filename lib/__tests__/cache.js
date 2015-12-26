import {describe, it} from 'mocha';
import {expect} from 'chai';
import Cache from '../cache';

describe('GraphQL Cache', () => {
  describe('.clone()', () => {
    it('should clone a given payload', () => {
      const c = new Cache();
      const data = {aa: 10, bb: [10]};
      const clonedData = c._clone(data);
      expect(clonedData).not.to.be.equal(data);
      expect(clonedData).to.deep.equal(data);
    });
  });

  describe('._generateKey()', () => {
    it('should generate a unique key for query, vars duos', () => {
      const c = new Cache();
      const q = `{items}`;
      const vars = {aa: 10};

      const key = c._generateKey(q, vars);
      const key2 = c._generateKey(q, vars);
      expect(key).to.be.equal(key2);
    });
  });

  describe('._ensureItem()', () => {
    describe('no existing item', () => {
      it('should create an item and return it', () => {
        const c = new Cache();
        const q = `{item}`;
        const vars = {aa: 10};

        expect(c.items).to.deep.equal({});
        const item = c._ensureItem(q, vars);
        expect(item).to.deep.equal({
          query: q,
          vars,
          payload: undefined,
          callbacks: []
        });

        expect(Object.keys(c.items).length).to.be.equal(1);
      });
    });

    describe('has an existing item', () => {
      it('should just return the existing item', () => {
        const c = new Cache();
        const q = `{item}`;
        const vars = {aa: 10};

        const item = c._ensureItem(q, vars);
        const item2 = c._ensureItem(q, vars);

        expect(item).to.be.equal(item2);
      });
    });
  });

  describe('.watchItem()', () => {
    it('should just fire the callback if the payload is not empty', done => {
      const c = new Cache();
      const q = `{item}`;
      const vars = {aa: 10};
      const payload = {aa: 10};

      const item = c._ensureItem(q, vars);
      item.payload = payload;

      c.watchItem(q, vars, p => {
        expect(p).to.deep.equal(payload);
        done();
      })
    });

    it('should not fire the callback if the payload is empty', done => {
      const c = new Cache();
      const q = `{item}`;
      const vars = {aa: 10};

      c.watchItem(q, vars, p => {
        throw new Error('Should not fire this');
      });

      setTimeout(done, 50);
    });

    it('should register the callback for later triggers', () => {
      const c = new Cache();
      const q = `{item}`;
      const vars = {aa: 10};

      const callback = () => {};

      c.watchItem(q, vars, callback);
      const item = c._ensureItem(q, vars);
      expect(item.callbacks[0]).to.equal(callback);
    });

    describe('stopping it', () => {
      it('should remove the callback from the item', () => {
        const c = new Cache();
        const q = `{item}`;
        const vars = {aa: 10};

        const c1 = () => {};
        const c2 = () => {};

        const stop = c.watchItem(q, vars, c1);
        c.watchItem(q, vars, c2);

        const item = c._ensureItem(q, vars);
        expect(item.callbacks[0]).to.be.equal(c1);
        expect(item.callbacks[1]).to.be.equal(c2);

        stop();
        expect(item.callbacks[0]).to.be.equal(c2);
      });

      it('should remove the whole item if there is no more callbacks', () => {
        const c = new Cache();
        const q = `{item}`;
        const vars = {aa: 10};

        const c1 = () => {};

        const stop = c.watchItem(q, vars, c1);
        const item = c._ensureItem(q, vars);
        expect(item.callbacks[0]).to.be.equal(c1);

        stop();
        expect(item.callbacks).to.deep.equal([]);
        expect(c.items).to.deep.equal({});
      });
    });
  });

  describe('.setItemPayload()', () => {
    it('should store the payload for later use', () => {
      const c = new Cache();
      const q = `{item}`;
      const vars = {aa: 10};
      const payload = {aa: 10};

      const item = c._ensureItem(q, vars);
      c.setItemPayload(q, vars, payload);

      expect(item.payload).to.deep.equal(payload);
    });

    it('should fire callbacks with the payload', () => {
      const c = new Cache();
      const q = `{item}`;
      const vars = {aa: 10};
      const payload = {aa: 10};
      const receivedPayloads = [];

      const item = c._ensureItem(q, vars);
      item.callbacks.push(p => receivedPayloads.push(p));
      item.callbacks.push(p => receivedPayloads.push(p));

      c.setItemPayload(q, vars, payload);
      expect(receivedPayloads).to.deep.equal([
        payload,
        payload
      ]);

      // Ensure, this is a clone but not a direct copy.
      expect(receivedPayloads[0]).not.to.be.equal(payload);
      expect(receivedPayloads[1]).not.to.be.equal(payload);
    });
  });


  describe('.getItemPayload', () => {
    describe('has item', () => {
      it('should just return the correct payload', () => {
        const c = new Cache();
        const q = `{item}`;
        const vars = {aa: 10};
        const payload = {aa: 10};

        const item = c._ensureItem(q, vars);
        item.payload = payload;

        const gotPayload = c.getItemPayload(q, vars);
        expect(gotPayload).to.deep.equal(payload);
        expect(gotPayload).not.to.be.equal(payload);
      });
    });

    describe('has no item', () => {
      it('should return nothing', () => {
        const c = new Cache();
        const q = `{item}`;
        const vars = {aa: 10};

        const gotPayload = c.getItemPayload(q, vars);
        expect(gotPayload).to.be.undefined;
      });
    });
  });

});


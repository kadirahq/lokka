import {describe, it} from 'mocha';
import {expect} from 'chai';
import Lokka from '../';
import LokkaTransport from '../transport';

describe('Lokka', () => {
  describe('constructor()', () => {
    describe('transport is not an instance of LokkaTransport', () => {
      it('should throw an error', () => {
        expect(() => new Lokka()).to.throw(/transport should be an instance of LokkaTransport/);
      });
    });

    describe('transport is an instance of LokkaTransport', () => {
      it('should create a Lokka instance', () => {
        const MyTransport = class extends LokkaTransport {};
        const options = {transport: new MyTransport()};
        expect(() => new Lokka(options)).to.not.throw;
      });
    });
  });

  describe('send()', () => {
    describe('called without a rawQuery', () => {
      it('should throw an error');
    });

    describe('called with a rawQuery', () => {
      it('should call the transport');
    });
  });

  describe('createFragment()', () => {
    describe('called without a fragment', () => {
      it('should throw an error');
    });

    describe('called with a fragment', () => {
      it('should add name to the fragment and save it');
      it('should return the fragment name');
    });
  });

  describe('query()', () => {
    describe('called without a query', () => {
      it('should throw an error');
    });

    describe('called with a query', () => {
      it('should add necessory fragments to the query');
      it('should call .send() and get the result');
    });
  });

  describe('mutate', () => {
    describe('called without a query', () => {
      it('should throw an error');
    });

    describe('called with a query', () => {
      it('should create the proper mutation query');
      it('should add necessory fragments');
      it('should call .send() and get the result');
    });
  });
});

/* eslint max-len:0 no-unused-expressions:0 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import Lokka from '../';
import {trimIt, EchoTransport} from './utils';

describe('Lokka', () => {
  it('should be able to require normally', () => {
    expect(require('../').Lokka).to.be.equal(Lokka);
  });

  describe('constructor()', () => {
    describe('transport is not provided', () => {
      it('should throw an error', () => {
        expect(() => new Lokka({})).to.throw(/transport is required!/);
      });
    });

    describe('transport is not a valid transport', () => {
      it('should throw an error', () => {
        expect(() => new Lokka({transport: {}})).to.throw(/transport should have a \.send\(\) method!/);
      });
    });

    describe('transport is an instance of LokkaTransport', () => {
      it('should create a Lokka instance', () => {
        const options = {transport: new EchoTransport()};
        expect(() => new Lokka(options)).to.not.throw;
      });
    });
  });

  describe('send()', () => {
    describe('called without a rawQuery', () => {
      it('should throw an error', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        expect(() => lokka.send()).to.throw(/rawQuery is required!/);
      });
    });

    describe('called with a rawQuery', () => {
      it('should call the transport', async () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        const rawQuery = '{name}';
        const result = await lokka.send(rawQuery);
        // we'll get the result as the query,
        // just because of the echo transport
        expect(result).to.be.equal(rawQuery);
      });
    });

    describe('called with a rawQuery and vars', () => {
      it('should call the transport', async () => {
        const rawQuery = `
          {
            query sum($a: Int, $b: Int) {
              sum(a: $a, b: $b)
            }
          }
        `;
        const vars = {a: 10, b: 10};
        const transport = {
          send(q, v) {
            expect(q).to.be.equal(rawQuery);
            expect(v).to.deep.equal(vars);
            return Promise.resolve(q);
          }
        };
        const lokka = new Lokka({transport});
        const result = await lokka.send(rawQuery, vars);
        // we'll get the result as the query,
        // just because of the echo transport
        expect(result).to.be.equal(rawQuery);
      });
    });
  });

  describe('createFragment()', () => {
    describe('called without a fragment', () => {
      it('should throw an error', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        expect(() => lokka.createFragment()).to.throw(/fragment is required!/);
      });
    });

    describe('called with a fragment', () => {
      it('should add name to the fragment and save it', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        const name = lokka.createFragment(`
          fragment on Post {
            title
          }
        `);
        const savedFragment = lokka._fragments[name];
        const expectedFragment = `
          fragment ${name} on Post {
            title
          }
        `;
        expect(trimIt(savedFragment)).to.be.equal(trimIt(expectedFragment));
      });

      it('should return the fragment name', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        const name = lokka.createFragment(`
          fragment on Post {
            title
          }
        `);
        expect(name).to.be.ok;
      });

      describe('fragment name', () => {
        it('should contains only letters and numbers only', () => {
          for (var lc = 0; lc < 100; lc++) {
            const lokka = new Lokka({transport: new EchoTransport()});
            const name = lokka.createFragment(`
              fragment on Post {
                title
              }
            `);

            for (const c of name) {
              expect(c).to.match(/[A-Za-z0-9]+/);
            }
          }
        });

        it('should start with the letter', () => {
          for (var lc = 0; lc < 100; lc++) {
            const lokka = new Lokka({transport: new EchoTransport()});
            const name = lokka.createFragment(`
              fragment on Post {
                title
              }
            `);
            expect(name.charAt(0)).to.match(/[A-Za-z]+/);
          }
        });
      });
    });
  });

  describe('_findFragments()', () => {
    it('should get fragments listed in a query', () => {
      const lokka = new Lokka({transport: new EchoTransport()});
      const f1 = lokka.createFragment(`fragment on Post {title}`);
      const f2 = lokka.createFragment(`fragment on Post {_id}`);

      const fragments = lokka._findFragments(`
        {
          recentPosts {
            ...${f1},
            ...${f2}
          }
        }
      `);

      expect(fragments).to.be.deep.equal([
        `fragment ${f1} on Post {title}`,
        `fragment ${f2} on Post {_id}`,
      ]);
    });

    it('should get fragments listed in a fragment', () => {
      const lokka = new Lokka({transport: new EchoTransport()});
      const f1 = lokka.createFragment(`fragment on Post {title}`);
      const f2 = lokka.createFragment(`fragment on Post {_id}`);

      const fragments = lokka._findFragments(`
        fragment kk on Post {
          ...${f1},
          ...${f2}
        }
      `);

      expect(fragments).to.be.deep.equal([
        `fragment ${f1} on Post {title}`,
        `fragment ${f2} on Post {_id}`,
      ]);
    });

    it('should get nested fragments', () => {
      const lokka = new Lokka({transport: new EchoTransport()});
      const f1 = lokka.createFragment(`fragment on Post {title}`);
      const f2 = lokka.createFragment(`fragment on Post {...${f1}}`);
      lokka.createFragment(`fragment on Post {author}`);

      const fragments = lokka._findFragments(`
        {
          recentPosts {
            ...${f2}
          }
        }
      `);

      expect(fragments).to.be.deep.equal([
        `fragment ${f2} on Post {...${f1}}`,
        `fragment ${f1} on Post {title}`,
      ]);
    });

    it('should merge duplicate fragments', () => {
      const lokka = new Lokka({transport: new EchoTransport()});
      const f1 = lokka.createFragment(`fragment on Post {title}`);
      const f2 = lokka.createFragment(`fragment on Post {_id}`);

      const fragments = lokka._findFragments(`
        {
          recentPosts {
            ...${f1},
            ...${f2},
            ...${f1},
          }
        }
      `);

      expect(fragments).to.be.deep.equal([
        `fragment ${f1} on Post {title}`,
        `fragment ${f2} on Post {_id}`,
      ]);
    });

    it('should throw an error if fragment is not there', () => {
      const lokka = new Lokka({transport: new EchoTransport()});
      const run = () => {
        lokka._findFragments(`
          {
            recentPosts {
              ...someOtherFragment
            }
          }
        `);
      };

      expect(run).to.throw(/There is no such fragment: someOtherFragment/);
    });
  });

  describe('query()', () => {
    describe('called without a query', () => {
      it('should throw an error', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        expect(() => lokka.query()).to.throw(/query is required!/);
      });
    });

    describe('called with a query', () => {
      it('should add necessory fragments to the query', async () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        const queryDef = `
          {
            recentPosts {
            ...a,
            ...b
            }
          }
        `;

        lokka._findFragments = q => {
          expect(q).to.be.equal(queryDef);
          return [
            'fragment a on Post {title}',
            'fragment b on Post {_id}'
          ];
        };

        const finalQuery = await lokka.query(queryDef);
        const expectedQuery = `
          ${queryDef}
          fragment a on Post {title}
          fragment b on Post {_id}
        `;

        expect(trimIt(finalQuery)).to.be.equal(trimIt(expectedQuery));
      });

      it('should add vars to the query', async () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        const queryDef = `
          {
            query echo($message: String) {
              echo(message: $message)
            }
          }
        `;

        const vars = {message: 'hello'};

        lokka.send = (q, v) => {
          expect(trimIt(q)).to.be.equal(trimIt(queryDef));
          expect(v).to.deep.equal(vars);
          return Promise.resolve(q);
        };

        const finalQuery = await lokka.query(queryDef, vars);
        expect(trimIt(finalQuery)).to.be.equal(trimIt(queryDef));
      });
    });
  });

  describe('mutate()', () => {
    describe('called without a query', () => {
      it('should throw an error', () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        expect(() => lokka.mutate()).to.throw(/query is required!/);
      });
    });

    describe('called with a query', () => {
      it('should create the proper mutation query', async () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        const finalQuery = await lokka.mutate(`
          {
            createPost(name: "The Name") {
              title
            }
          }
        `);

        const expectedQuery = `
          mutation _ {
            createPost(name: "The Name") {
              title
            }
          }
        `;

        expect(trimIt(finalQuery)).to.be.equal(trimIt(expectedQuery));
      });

      it('should add necessory fragments', async () => {
        const lokka = new Lokka({transport: new EchoTransport()});
        const queryDef = `
          {
            createPost(name: "The name") {
              ...a,
              ...b
            }
          }
        `;

        lokka._findFragments = q => {
          expect(q).to.be.equal(`mutation _ ${queryDef.trim()}`);
          return [
            'fragment a on Post {title}',
            'fragment b on Post {_id}'
          ];
        };

        const finalQuery = await lokka.mutate(queryDef);
        const expectedQuery = `
          mutation _ ${queryDef.trim()}
          fragment a on Post {title}
          fragment b on Post {_id}
        `;

        expect(trimIt(finalQuery)).to.be.equal(trimIt(expectedQuery));
      });
    });
  });
});

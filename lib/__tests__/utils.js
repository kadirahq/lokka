import LokkaTransport from '../transport';

export class EchoTransport extends LokkaTransport {
  send(rawQuery) {
    return Promise.resolve(rawQuery);
  }
}

export const trimIt = query => {
  return query
    .split('\n')
    .map(l => l.trim())
    .filter(l => l !== '')
    .join('\n');
};

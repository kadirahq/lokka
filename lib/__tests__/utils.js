export const trimIt = (query) => {
  return query.split('\n').map(l => l.trim()).join('\n');
};
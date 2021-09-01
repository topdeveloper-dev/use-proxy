import _ from 'lodash';

describe('simplify gets', () => {
  test('default', () => {
    const gets = [
      'todoLists',
      'todoLists+0',
      'todoLists+0+todoItems',
      'todoLists+0+todoItems+0',
      'todoLists',
      'todoLists+0',
      'todoLists+0+todoItems',
      'todoLists+0+todoItems+1',
      'todoLists',
      'todoLists+1',
      'todoLists+1+todoItems',
      'todoLists+1+todoItems+0',
      'todoLists',
      'todoLists+1',
      'todoLists+1+todoItems',
      'todoLists+1+todoItems+1',
    ];
    const f = (a: string[]): string[] => {
      const b = _.sortBy([...new Set(a)], s => -s.length);
      const result: string[] = [];
      while (b.length > 0) {
        const s: string = b.pop()!;
        if (!_.some(b, item => item.startsWith(s))) {
          result.push(s);
        }
      }
      return result;
    };
    const result = f(gets);
    expect(result.sort()).toEqual(
      [
        'todoLists+0+todoItems+0',
        'todoLists+0+todoItems+1',
        'todoLists+1+todoItems+0',
        'todoLists+1+todoItems+1',
      ].sort()
    );
  });
});

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
    const simplifyGets = (gets: string[]): string[] => {
      gets = [...new Set(gets)].sort((s1, s2) => s2.length - s1.length);
      const result: string[] = [];
      while (gets.length > 0) {
        const str: string = gets.pop()!;
        if (!gets.some(item => item.startsWith(str))) {
          result.push(str);
        }
      }
      return result;
    };
    const result = simplifyGets(gets);
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

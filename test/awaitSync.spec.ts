describe('await sync', () => {
  test('default', async () => {
    const func = () => 1;
    // it is fine to await for a sync method
    const result = await func();
    expect(result).toBe(1);
  });
});

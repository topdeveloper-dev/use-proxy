describe('await sync', () => {
  test('default', async () => {
    const f = () => 1;
    // it is fine to await for a sync method
    const result = await f();
    expect(result).toBe(1);
  });
});

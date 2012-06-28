describe("device object", function() {
  it("should expose information about the device", function() {
    expect(mulberry.Device.type).toBeDefined();
    expect(mulberry.Device.os).toBeDefined();
  });
});

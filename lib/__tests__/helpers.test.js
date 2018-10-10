const helpers = require("../helpers");

describe("helpers", () => {
  describe("defer", () => {
    test("should use `setImmediate`", done => {
      helpers.defer(done);
    });

    test("should use `process.nextTick`", done => {
      global.setImmediate = null;

      helpers.defer(() => {
        done();
      });
    });

    test("should use `setTimeout`", done => {
      global.setImmediate = null;
      process.nextTick = null;

      helpers.defer(() => {
        done();
      });
    });
  });
});

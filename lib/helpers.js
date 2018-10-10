/**
 * Defers the callback execution until next execution loop.
 * @param {Function} callback the function called next execution loop
 */
function defer(callback) {
  if (typeof setImmediate === "function") {
    setImmediate(callback);
  } else if (typeof process === "object" && typeof process.nextTick === "function") {
    process.nextTick(callback);
  } else {
    setTimeout(callback, 0);
  }
}

exports.defer = defer;

const EventEmitter = require("events");

/**
 * A task.
 * @extends EventEmitter
 * @param {Function} handler the task handler
 * @param {Number} score the task score
 * @param {Number} priority the task priority
 */
class Task extends EventEmitter {
  constructor(handler, score, priority) {
    super();

    /**
     * The handler.
     * @private
     * @type {Function}
     */
    this.handler = handler;

    /**
     * The score.
     * @private
     * @type {Number}
     */
    this.score = score;

    /**
     * The priority.
     * @private
     * @type {Number}
     */
    this.priority = priority;

    /**
     * The runner.
     * @private
     * @type {?Promise}
     */
    this.runner = null;
  }

  /**
   * Runs the task.
   * @private
   * @return {Promise}
   */
  run() {
    if (!this.runner) {
      this.runner = new Promise(async (resolve, reject) => {
        this.emit("started");

        try {
          const result = await this.handler();

          this.emit("completed", result);
          resolve(result);
        } catch (error) {
          this.emit("failed", error);
          reject(error);
        }
      });
    }

    return this.runner;
  }

  /**
   * Returns the task promise.
   * @return {Promise}
   */
  promise() {
    if (this.runner) {
      return this.runner;
    }

    return new Promise((resolve, reject) => {
      this.once("completed", resolve);
      this.once("failed", reject);
    });
  }
}

module.exports = Task;

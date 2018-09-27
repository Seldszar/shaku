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
  }

  /**
   * Starts the task.
   * @private
   * @return {Promise}
   */
  async start() {
    this.emit("started");

    return Promise.resolve()
      .then(this.handler.bind(this))
      .then(this.emit.bind(this, "completed"))
      .catch(this.emit.bind(this, "failed"));
  }

  /**
   * Returns the task promise.
   * @return {Promise}
   */
  promise() {
    return new Promise((resolve, reject) => {
      this.once("completed", resolve);
      this.once("failed", reject);
    });
  }
}

module.exports = Task;

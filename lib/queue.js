const EventEmitter = require("events");
const { defer } = require("./helpers");
const Task = require("./task");

/**
 * Queue options.
 * @typedef {Object} QueueOptions
 * @property {Number} decayInterval the decay interval
 * @property {Number} decayDuration the decay duration
 * @property {Number} totalScore the total score
 */

/**
 * A queue.
 * @extends EventEmitter
 * @param {QueueOptions} options the queue options
 */
class Queue extends EventEmitter {
  constructor(options) {
    super();

    /**
     * The decay interval.
     * @private
     * @type {Number}
     */
    this.decayInterval = options.decayInterval;

    /**
     * The decay duration.
     * @private
     * @type {Number}
     */
    this.decayDuration = options.decayDuration;

    /**
     * The total score.
     * @private
     * @type {Number}
     */
    this.totalScore = options.totalScore;

    /**
     * The score.
     * @private
     * @type {Number}
     */
    this.score = 0;

    /**
     * The tasks.
     * @private
     * @type {Array}
     */
    this.tasks = [];

    /**
     * The runner.
     * @private
     * @type {?Promise}
     */
    this.runner = null;

    /**
     * The process interval.
     * @private
     * @type {Interval}
     */
    this.interval = setInterval(() => {
      this.score = Math.max(
        this.score - this.totalScore / (this.decayDuration / this.decayInterval),
        0,
      );

      this.process();
    }, this.decayInterval);
  }

  /**
   * Resets the queue.
   */
  reset() {
    this.score = 0;
    this.runner = null;
    this.tasks.length = 0;
  }

  /**
   * Destroys the queue.
   */
  destroy() {
    this.reset();

    /* istanbul ignore next */
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Adds a new task.
   * @throws {Error} if the queue has been destroyed.
   * @param {Function} handler the task handler
   * @param {Number} score the task score
   * @param {Number} [priority=0] the task priority
   * @return {Task} the task.
   */
  push(handler, score, priority = 0) {
    if (!this.interval) {
      throw new Error("Queue is destroyed");
    }

    const task = new Task(handler, score, priority);

    task.on("started", this.emit.bind(this, "started", task));
    task.on("completed", this.emit.bind(this, "completed", task));
    task.on("failed", this.emit.bind(this, "failed", task));

    this.tasks.push(task);

    task.once("started", () => {
      this.score += task.score;
    });

    defer(() => {
      this.process();
    });

    return task;
  }

  /**
   * Process the queue.
   * @private
   */
  process() {
    if (this.runner || this.tasks.length === 0) {
      return;
    }

    this.runner = new Promise(resolve => {
      this.emit("processing");

      this.tasks = this.tasks
        .map(({ priority }, index) => ({ index, priority }))
        .sort((a, b) => b.priority - a.priority || a.index - b.index)
        .map(({ index }) => this.tasks[index]);

      const promises = [];
      let task;

      while (this.score < this.totalScore && (task = this.tasks.shift())) {
        promises.push(task.run().catch(() => {}));
      }

      Promise.all(promises).then(() => {
        this.runner = null;
        this.emit("processed");

        resolve();
      });
    });
  }
}
module.exports = Queue;

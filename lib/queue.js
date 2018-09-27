const EventEmitter = require("events");
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
     * Indicates if the queue is processing.
     * @private
     * @type {Boolean}
     */
    this.isProcessing = false;

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
   * Destroys the queue.
   */
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = null;
  }

  /**
   * Add a new task.
   * @param {Function} handler the task handler
   * @param {Number} score the task score
   * @param {Number} [priority=0] the task priority
   * @return {Task} the task.
   */
  push(handler, score, priority = 0) {
    const task = new Task(handler, score, priority);

    task.on("started", this.emit.bind(this, "started", task));
    task.on("completed", this.emit.bind(this, "completed", task));
    task.on("failed", this.emit.bind(this, "failed", task));

    this.tasks.push(task);

    task.once("started", () => {
      this.score += task.score;
    });

    return task;
  }

  /**
   * Process the queue.
   * @private
   * @return {Promise}
   */
  async process() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.tasks = this.tasks
      .map(({ priority }, index) => ({ index, priority }))
      .sort((a, b) => b.priority - a.priority || a.index - b.index)
      .map(({ index }) => this.tasks[index]);

    let task;

    while (this.score < this.totalScore && (task = this.tasks.shift())) {
      await task.start();
    }

    this.isProcessing = false;
  }
}
module.exports = Queue;

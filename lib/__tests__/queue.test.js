const Queue = require("../queue");

jest.useFakeTimers();

describe("queue", () => {
  let queue;

  beforeEach(() => {
    if (queue) {
      queue.destroy();
    }

    queue = new Queue({
      decayInterval: 1000,
      decayDuration: 2000,
      totalScore: 1,
    });
  });

  test("should destroy the queue", async () => {
    await expect(queue.destroy()).toBeUndefined();
  });

  test("should throw if the queue id destroyed the queue", async () => {
    queue.destroy();

    await expect(() => queue.push(() => {}, 1)).toThrowError();
  });

  test("should execute a successful task", async () => {
    const task = queue.push(() => {}, 1);

    await expect(task.promise()).resolves.toBeUndefined();
  });

  test("should execute a failed task", async () => {
    const error = new Error("Lorem Ipsum");
    const callback = jest.fn(() => Promise.reject(error));
    const task = queue.push(callback, 1);

    await expect(task.promise()).rejects.toThrowError(error);
    await expect(callback).toHaveBeenCalled();
  });

  test("should delay pending tasks", async () => {
    const callbackA = jest.fn();
    const callbackB = jest.fn();

    const taskA = queue.push(callbackA, 1);
    const taskB = queue.push(callbackB, 1);

    await expect(taskA.promise()).resolves.toBeUndefined();
    await expect(callbackB).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();

    await expect(taskB.promise()).resolves.toBeUndefined();
    await expect(callbackB).toHaveBeenCalled();
  });

  test("should execute prioritary tasks", async () => {
    const callbackA = jest.fn();
    const callbackB = jest.fn();

    const taskA = queue.push(callbackA, 1);
    const taskB = queue.push(callbackB, 1, 2);

    await expect(taskB.promise()).resolves.toBeUndefined();
    await expect(callbackB).toHaveBeenCalled();

    jest.runOnlyPendingTimers();

    await expect(taskA.promise()).resolves.toBeUndefined();
    await expect(callbackA).toHaveBeenCalled();
  });

  test("should score decay over time", done => {
    const task = queue.push(() => {}, 1);

    task.on("started", () => {
      expect(queue.score).toBe(1);

      jest.runOnlyPendingTimers();

      expect(queue.score).toBe(0.5);

      jest.runOnlyPendingTimers();

      expect(queue.score).toBe(0);

      done();
    });
  });

  test("should return the same runner", async () => {
    const task = queue.push(() => {}, 1);

    await expect(task.run()).toBe(task.run());
  });
});

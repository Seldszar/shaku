const Queue = require("../queue");

jest.useFakeTimers();

describe("Queue", () => {
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

  test("should execute a successful task", async () => {
    const task = queue.push(() => {}, 1);

    jest.runOnlyPendingTimers();

    await expect(task.promise()).resolves.toBeUndefined();
  });

  test("should execute a failed task", async () => {
    const task = queue.push(() => Promise.reject(), 1);

    jest.runOnlyPendingTimers();

    await expect(task.promise()).rejects.toBeUndefined();
  });

  test("should delay pending tasks", async () => {
    const taskA = queue.push(() => {}, 1);
    const taskB = queue.push(() => {}, 1);

    jest.runOnlyPendingTimers();

    await expect(taskA.promise()).resolves.toBeUndefined();

    jest.runOnlyPendingTimers();

    await expect(taskB.promise()).resolves.toBeUndefined();
  });

  test("should execute prioritary tasks", async () => {
    const taskA = queue.push(() => {}, 1);
    const taskB = queue.push(() => {}, 1, 2);

    jest.runOnlyPendingTimers();

    await expect(taskB.promise()).resolves.toBeUndefined();

    jest.runOnlyPendingTimers();

    await expect(taskA.promise()).resolves.toBeUndefined();
  });

  test("should score decay over time", async () => {
    queue.push(() => {}, 1);

    jest.runOnlyPendingTimers();

    await expect(queue.score).toBe(1);

    jest.runOnlyPendingTimers();

    await expect(queue.score).toBe(0.5);

    jest.runOnlyPendingTimers();

    await expect(queue.score).toBe(0);
  });
});

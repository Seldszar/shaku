# Shaku

> With these blazing fast nunchaku, the enemy will never know what hit them.

Queue with decaying-based rate limiter

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Author](#author)
- [License](#license)

## Installation

```bash
npm install shaku --save
```

## Usage

```javascript
const shaku = require("shaku");

// Creates a new queue.
const queue = new shaku.Queue({
  decayInterval: 1000,
  decayDuration: 60000,
  totalScore: 100,
});

// Called when a task started.
queue.on("started", (task) => console.log("Task started"));

// Called when a task failed.
queue.on("failed", (task, error) => console.log("Task failed"));

// Called when a task completed.
queue.on("completed", (task, result) => console.log("Task completed"));

// Creates a new task with a score of 10.
queue.push(() => {}, 10);
```

# API

See the detailed [API Reference](API.md).

## Author

Alexandre Breteau - [@0xSeldszar](https://twitter.com/0xSeldszar)

## License

MIT © [Alexandre Breteau](https://seldszar.fr)

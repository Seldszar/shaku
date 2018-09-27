# Shaku

[![Greenkeeper badge](https://badges.greenkeeper.io/Seldszar/shaku.svg)](https://greenkeeper.io/)

> Queue with decaying-based rate limiter

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
const Queue = require("shaku");

// Creates a new queue.
const queue = new Queue({
  decayInterval: 1000,
  decayDuration: 60000,
  totalScore: 100,
});

// Creates a new task with a score of 10.
const task = queue.push(() => {}, 10);

task.on("started", () => console.log("Task started"));
task.on("failed", () => console.log("Task failed"));
task.on("completed", () => console.log("Task completed"));
```

# API

See the detailed [API Reference](API.md).

## Author

Alexandre Breteau - [@0xSeldszar](https://twitter.com/0xSeldszar)

## License

MIT © [Alexandre Breteau](https://seldszar.fr)

[![npm](https://img.shields.io/npm/v/vertex-logger.svg)](https://www.npmjs.com/package/vertex-logger)
[![Build Status](https://travis-ci.org/nomilous/vertex-logger.svg?branch=master)](https://travis-ci.org/nomilous/vertex-logger)
[![Coverage Status](https://coveralls.io/repos/nomilous/vertex-logger/badge.svg?branch=master&service=github)](https://coveralls.io/github/nomilous/vertex-logger?branch=master)

# vertex-logger

A logger.

`npm install vertex-logger --save`

```javascript
const VertexLogger = require('vertex-logger');

const logger = new VertexLogger({
  root: 'root',
  name: 'name',
  level: 'info' // off fatal error warn info debug trace
});

logger.level = 'debug'; // reset level

logger.info('interpo%s st%s', 'lated', 'ring');
// if stdout is TTY:
//   [ info] (root/name) interpolated string (201ms)
// if not:
//   2016-10-21 14:11:31.471 [ info] (root/name) interpolated string (201ms)

logger.fatal(); // to stderr
logger.error(); // to stderr
logger.warn();  // to stdout
logger.info();  // to stdout
logger.debug(); // to stdout
logger.trace(); // to stdout

logger.error("couldn't", new Error('Why'));
// [error] (root/name) couldn't (1231ms)
// Error: Why
//     at repl:1:25
//     at sigintHandlersWrap (vm.js:22:35)
//     at sigintHandlersWrap (vm.js:96:12)
//     ...
```

#### A tree of loggers...

...can be built for context.

```javascript
let appLogger = new VertexLogger({
  root: 'app-name',
  name: 'application'
});

let serviceLogger = appLogger.createLogger({
  name: 'service-name'
});

let componentLogger = serviceLogger.createLogger({
  name: 'component-name'
});

//
// Log messages only display 'root/name' and not 'root/parent/parent/name'
//
// eg.

componentLogger.info('message');
// [ info] (app-name/component-name) message (0ms)
```

#### A repl

…can be registered via any logger in the tree

```javascript
let logger = new VertexLogger();
let repl = require('repl').start();

logger.repl = repl; // to register the repl

// now the repl prompt will remain continuously below the latest logged message

logger.repl = undefined // to unregister the repl

// supports only one repl
// repl can be registered at any logger in the tree and will be applied to all
```

#### Loglevel functors...

...can be passed as loglevel to target specific components.

```javascript
let logger = new VertexLogger({
  root: 'app-name',
  name: 'application',
  
  level: (info) => {
    if (info.name == 'specific-component') return 'trace';
    // defaults to 'info'
  }
});

// The level functor is inherited into the tree of loggers
// - it overrides log levels passed as string on createLogger() child
// - it does not override loglevels passed as functions on createLogger() child


// Level by functor can also be directly assigned

logger.level = (info) => {
  if (info.ancestors.indexOf('service-name') >= 0) return 'off';
  if (info.ancestors.pop() == 'specific-parent') return 'off';
  return 'trace';
}
```

#### Todo

```javascript
parentLogger.levelAll == 'off' || fn; // applied to all children
```


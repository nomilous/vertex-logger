**using node ^6.0.0**

[![npm](https://img.shields.io/npm/v/vertex-logger.svg)](https://www.npmjs.com/package/vertex-logger)
[![Build Status](https://travis-ci.org/nomilous/vertex-logger.svg?branch=master)](https://travis-ci.org/nomilous/vertex-logger)
[![Coverage Status](https://coveralls.io/repos/nomilous/vertex-logger/badge.svg?branch=master&service=github)](https://coveralls.io/github/nomilous/vertex-logger?branch=master)

# vertex-logger

A logger.

`nam install vertex-logger —save`

```javascript
const VertexLogger = require('vertex-logger');

const logger = new VertexLogger({
  parent: 'rootName',
  name: 'name1',
  level: 'info' // off fatal error warn info debug
});

logger.level = 'debug'; // reset level

logger.info('interpo%s st%s', 'lated', 'ring');
// if stdout is TTY:
//   [ info] (rootName/name1) interpolated string (201ms)
// if not:
//   2016-10-21 14:11:31.471 [ info] (rootName/name) interpolated string (201ms)

logger.fatal(); // to stderr
logger.error(); // to stderr
logger.warn();  // to stdout
logger.info();  // to stdout
logger.debug(); // to stdout

logger.error("couldn't", new Error('Why'));
// [error] (rootName/name1) couldn't (1231ms)
// Error: Why
//     at repl:1:25
//     at sigintHandlersWrap (vm.js:22:35)
//     at sigintHandlersWrap (vm.js:96:12)
//     ...


// create new logger from existing logger
logger2 = logger.createLogger({name: 'name2'});

logger2.info('message');
// [ info] (rootName/name2) message (0ms)
//
// Note:
//   name2 is actually at rootName/name1/name2 but the logger does not currently
//   show the full path.

```




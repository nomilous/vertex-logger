const {format} = require('util');
const dateFormat = require('date-format');
const {xterm} = require('cli-color');

const LEVEL_FATAL = 1;
const LEVEL_ERROR = 2;
const LEVEL_WARN = 3;
const LEVEL_INFO = 4;
const LEVEL_DEBUG = 5;

const validLevels = [
  LEVEL_FATAL,
  LEVEL_ERROR,
  LEVEL_WARN,
  LEVEL_INFO,
  LEVEL_DEBUG
];

const levelColour = {};
levelColour[LEVEL_FATAL] = xterm(13);
levelColour[LEVEL_ERROR] = xterm(9);
levelColour[LEVEL_WARN] = xterm(172);
levelColour[LEVEL_INFO] = xterm(34);
levelColour[LEVEL_DEBUG] = xterm(39);

const levelString = {};
levelString[LEVEL_FATAL] = 'fatal';
levelString[LEVEL_ERROR] = 'error';
levelString[LEVEL_WARN] = ' warn';
levelString[LEVEL_INFO] = ' info';
levelString[LEVEL_DEBUG] = 'debug';

class VertexLogger {

  constructor(config = {}) {
    this._parent = config.parent || 'parent';
    this._name = config.name || 'name';
    this._level = config.level || LEVEL_INFO;

    if (validLevels.indexOf(this._level) < 0) {
      this._level = LEVEL_INFO;
    }
  }

  createLogger(config = {}) {
    if (validLevels.indexOf(config.level) < 0) {
      config.level = this._level;
    }
    config.parent = this._name;
    return new VertexLogger(config);
  }

  fatal(string, ...args) {
    if (this._level < LEVEL_FATAL) return;
    this._write(LEVEL_FATAL, string, args);
  }

  error(string, ...args) {
    if (this._level < LEVEL_ERROR) return;
    this._write(LEVEL_ERROR, string, args);
  }

  warn(string, ...args) {
    if (this._level < LEVEL_WARN) return;
    this._write(LEVEL_WARN, string, args);
  }

  info(string, ...args) {
    if (this._level < LEVEL_INFO) return;
    this._write(LEVEL_INFO, string, args);
  }

  debug(string, ...args) {
    if (this._level < LEVEL_DEBUG) return;
    this._write(LEVEL_DEBUG, string, args);
  }

  _write(level, string, args) {
    args.unshift(this._name);
    args.unshift(this._parent);

    let error;
    if (args[args.length - 1] instanceof Error) {
      error = args.pop();
    }

    let since = 0;
    let now = new Date();
    if (this._last) since = now.getTime() - this._last.getTime();
    this._last = now;

    if (level < LEVEL_WARN) {
      if (process.stderr.isTTY) {
        args.unshift(levelColour[level](levelString[level]));
        args.unshift('[%s] (%s/%s) ' + string);
      } else {
        args.unshift(levelString[level]);
        args.unshift(dateFormat(now));
        args.unshift('%s [%s] (%s/%s) ' + string);
      }

      args.push(format('(%dms)', since));
      console.error.apply(console.log, args);
    }

    else {
      if (process.stdout.isTTY) {
        args.unshift(levelColour[level](levelString[level]));
        args.unshift('[%s] (%s/%s) ' + string);
      } else {
        args.unshift(levelString[level]);
        args.unshift(dateFormat(now));
        args.unshift('%s [%s] (%s/%s) ' + string);
      }

      args.push(format('(%dms)', since));
      console.log.apply(console.log, args);
    }

    if (error) {
      if (level < LEVEL_WARN) {
        console.error(error.stack);
      } else {
        console.log(error.stack);
      }
    }
  }

}

VertexLogger.LEVEL_FATAL = LEVEL_FATAL;
VertexLogger.LEVEL_ERROR = LEVEL_ERROR;
VertexLogger.LEVEL_WARN = LEVEL_WARN;
VertexLogger.LEVEL_INFO = LEVEL_INFO;
VertexLogger.LEVEL_DEBUG = LEVEL_DEBUG;

module.exports = VertexLogger;

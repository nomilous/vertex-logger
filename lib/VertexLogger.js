const readline = require('readline');
const {format, inspect} = require('util');
const dateFormat = require('date-format');
const {xterm} = require('cli-color');

const LEVELS = ['off', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'];
const LEVELS_COPY = ['off', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'];
const LEVEL_OFF = 0;
const LEVEL_FATAL = 1;
const LEVEL_ERROR = 2;
const LEVEL_WARN = 3;
const LEVEL_INFO = 4;
const LEVEL_DEBUG = 5;
const LEVEL_TRACE = 6;

const validLevels = [
  LEVEL_OFF,
  LEVEL_FATAL,
  LEVEL_ERROR,
  LEVEL_WARN,
  LEVEL_INFO,
  LEVEL_DEBUG,
  LEVEL_TRACE
];

const levelColour = {};
levelColour[LEVEL_FATAL] = xterm(13);
levelColour[LEVEL_ERROR] = xterm(9);
levelColour[LEVEL_WARN] = xterm(172);
levelColour[LEVEL_INFO] = xterm(34);
levelColour[LEVEL_DEBUG] = xterm(39);
levelColour[LEVEL_TRACE] = xterm(19);

const levelString = {};
levelString[LEVEL_FATAL] = 'fatal';
levelString[LEVEL_ERROR] = 'error';
levelString[LEVEL_WARN] = ' warn';
levelString[LEVEL_INFO] = ' info';
levelString[LEVEL_DEBUG] = 'debug';
levelString[LEVEL_TRACE] = 'trace';

let last = new Date();

class VertexLogger {

  constructor(config = {}, parent) {
    Object.defineProperty(this, '_parent', {
      value: parent
    });
    Object.defineProperty(this, '_root', {
      value: parent instanceof VertexLogger ? parent._root : config.root || 'root'
    });
    Object.defineProperty(this, '_name', {
      value: config.name || 'name'
    });
    Object.defineProperty(this, '_ancestors', {
      value: parent instanceof VertexLogger
        ? parent._ancestors.map(name => {
        return name
      }).concat(parent._name)
        : [this._root]
    });
    Object.defineProperty(this, '_level', {
      value: parent instanceof VertexLogger ? parent._level : 4,
      writable: true
    });
    Object.defineProperty(this, '_levelFn', {
      value: parent instanceof VertexLogger ? parent._levelFn : null,
      writable: true
    });


    Object.defineProperty(this, 'level', {
      get: () => {
        return LEVELS[this._level];
      },
      set: (level) => {
        let levelNo;
        if (typeof level == 'function') {
          levelNo = LEVELS.indexOf(
            level({
              name: this._name,
              ancestors: this._ancestors.map(name => {
                return name
              })
            }) || 'info'
          );
        } else {
          levelNo = LEVELS.indexOf(level);
        }

        if (levelNo < 0) {
          throw new Error('Not one of levels ' + LEVELS);
        }
        this._level = levelNo;
      },
    });

    Object.defineProperty(this, '_repl', {value: null, writable: true});
    Object.defineProperty(this, 'repl', {
      set: (value) => {
        if (!value) {
          if (this._parent) {
            this._parent.repl = value;
            return;
          }
          this._repl = value;
          return;
        }
        if (value.constructor.name != 'REPLServer') return;
        if (!value.output.isTTY) return;
        if (this._parent) {
          this._parent.repl = value;
          return;
        }
        this._repl = value;
      },
      get: () => {
        if (this._parent) {
          return this._parent.repl;
        }
        return this._repl;
      }
    });

    // assigned level function overrides inherited one
    if (typeof config.level == 'function') {
      this._levelFn = config.level;
      this.level = this._levelFn;
      return;
    }

    // inherited level function overrides level string
    if (this._levelFn) {
      config.level = this._levelFn;
      this.level = this._levelFn;
      return;
    }

    // assign from string
    if (typeof config.level == 'string') {
      this.level = config.level;
    }
  }

  createLogger(config = {}) {
    return new VertexLogger(config, this);
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

  trace(string, ...args) {
    if (this._level < LEVEL_TRACE) return;
    this._write(LEVEL_TRACE, string, args);
  }

  _preWrite(repl) {
    if (repl) {
      readline.cursorTo(repl.output, 0);
      readline.clearLine(repl.output, 0);
    }
  }

  _postWrite(repl) {
    repl.prompt(true);
  }

  _write(level, string, args) {
    args.unshift(this._name);
    args.unshift(this._root);

    let repl = this.repl;

    let error;
    if (args[args.length - 1] instanceof Error) {
      error = args.pop();
    }

    let since = 0;
    let now = new Date();
    if (last) since = now.getTime() - last.getTime();
    last = now;

    if (level < LEVEL_WARN) {
      if (process.stderr.isTTY) {
        this._preWrite(repl);
        args.unshift(levelColour[level](levelString[level]));
        args.unshift('[%s] (%s/%s) ' + string);
      } else {
        args.unshift(levelString[level]);
        args.unshift(dateFormat(now));
        args.unshift('%s [%s] (%s/%s) ' + string);
      }

      args.push(format('(%dms)', since));
      console.error.apply(console.log, args);

      if (error) {
        console.error(inspect(error, {colors: true}));
      }

      if (repl && process.stderr.isTTY) {
        this._postWrite(repl);
      }
    }

    else {
      if (process.stdout.isTTY) {
        this._preWrite(repl);
        args.unshift(levelColour[level](levelString[level]));
        args.unshift('[%s] (%s/%s) ' + string);
      } else {
        args.unshift(levelString[level]);
        args.unshift(dateFormat(now));
        args.unshift('%s [%s] (%s/%s) ' + string);
      }

      args.push(format('(%dms)', since));
      console.log.apply(console.log, args);

      if (error) {
        console.log(inspect(error, {colors: true}));
      }

      if (repl && process.stdout.isTTY) {
        this._postWrite(repl);
      }
    }
  }

}

VertexLogger.LEVELS = LEVELS_COPY;
VertexLogger.LEVEL_OFF = LEVEL_OFF;
VertexLogger.LEVEL_FATAL = LEVEL_FATAL;
VertexLogger.LEVEL_ERROR = LEVEL_ERROR;
VertexLogger.LEVEL_WARN = LEVEL_WARN;
VertexLogger.LEVEL_INFO = LEVEL_INFO;
VertexLogger.LEVEL_DEBUG = LEVEL_DEBUG;
VertexLogger.LEVEL_TRACE = LEVEL_TRACE;

module.exports = VertexLogger;

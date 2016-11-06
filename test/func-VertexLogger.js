const {basename} = require('path');
const filename = basename(__filename);
const expect = require('expect.js');

const VertexLogger = require('../');

describe(filename, () => {

  it('defaults name and level', done => {

    let logger = new VertexLogger();
    expect(logger._root).to.be('root');
    expect(logger._name).to.be('name');
    expect(logger._level).to.be(VertexLogger.LEVEL_INFO);
    expect(logger.level).to.be('info');
    done();

  });

  it('uses configured name and level', done => {

    let logger = new VertexLogger({root: 'a', name: 'x', level: 'debug'});
    expect(logger._root).to.be('a');
    expect(logger._name).to.be('x');
    expect(logger._level).to.be(VertexLogger.LEVEL_DEBUG);
    done();

  });

  it('can get the level', done => {

    let log = new VertexLogger();
    expect(log.level).to.equal('info');
    done();

  });

  it('can set the level', done => {

    let log = new VertexLogger();
    expect(log.level).to.equal('info');
    expect(log._level).to.equal(VertexLogger.LEVEL_INFO);
    log.level = 'fatal';
    expect(log.level).to.equal('fatal');
    expect(log._level).to.equal(VertexLogger.LEVEL_FATAL);
    done();

  });

  it('throws on invalid level set', done => {

    let log = new VertexLogger();
    try {
      log.level = 'xxx';
    } catch (e) {
      expect(e.message).to.equal('Not one of levels off,fatal,error,warn,info,debug,trace');
      done();
    }

  });

  it('reassigns to level info on bad level', done => {

    let log1 = new VertexLogger({level: 0});
    // let log2 = new VertexLogger({level: 6});
    expect(log1._level).to.be(VertexLogger.LEVEL_INFO);
    // expect(log2._level).to.be(VertexLogger.LEVEL_INFO);
    done();

  });

  it('can create a new logger from existing, inherits level and ancestors', done => {

    let log1 = new VertexLogger({root: 'a', name: 'one', level: 'fatal'});
    let log2 = log1.createLogger({name: 'two'});

    expect(log1._root).to.be('a');
    expect(log1._ancestors).to.eql(['a']);
    expect(log1._name).to.be('one');
    expect(log1._level).to.be(VertexLogger.LEVEL_FATAL);

    expect(log2._root).to.be('a');
    expect(log2._ancestors).to.eql(['a', 'one']);
    expect(log2._name).to.be('two');
    expect(log2._level).to.be(VertexLogger.LEVEL_FATAL);
    expect(log2.level).to.be('fatal');
    done();

  });


  it('can set the level by function', done => {

    let log = new VertexLogger({name: 'test', level: (info) => {
      if (info.name == 'test') return 'fatal';
      return 'info';
    }});

    expect(log._level).to.be(VertexLogger.LEVEL_FATAL);
    done();

  });


  it('provices ancestry in level function', done => {

    let log = new VertexLogger({root: 'ROOT', name: 'grandparent'});
    log = log.createLogger({name: 'parent'});
    log.createLogger({name: 'me', level: (info) => {

      expect(info.ancestors).to.eql(['ROOT', 'grandparent', 'parent']);
      done();

    }});

  });


  it('can reassign the level by function', done => {

    let log = new VertexLogger({name: 'test'});
    expect(log._level).to.be(VertexLogger.LEVEL_INFO);

    log.level = () => {return 'fatal'};

    expect(log.level).to.equal('fatal');

    done();

  });


  it('inherits parent level function', done => {

    let log = new VertexLogger({name: 'one', level: () => {return 'fatal'}});

    let log2 = log.createLogger({name: 'two'});
    expect(log2.level).to.equal('fatal');
    done();

  });


  it('inherits parent level function after parent reassignment (?)', done => {

    let log = new VertexLogger({name: 'one', level: () => {return 'fatal'}});
    log.level = 'info';
    expect(log.level).to.equal('info');

    let log2 = log.createLogger({name: 'two'});
    expect(log2.level).to.equal('fatal');
    done();

  });


  it('inherited level function overrides string', done => {

    let log = new VertexLogger({name: 'one', level: () => {return 'fatal'}});
    log.level = 'info';
    expect(log.level).to.equal('info');

    let log2 = log.createLogger({name: 'two', level: 'info'});
    expect(log2.level).to.equal('fatal');
    done();

  });


  it('assigned level function overrides inherited', done => {

    let log = new VertexLogger({name: 'one', level: () => {return 'fatal'}});
    log.level = 'info';
    expect(log.level).to.equal('info');

    let log2 = log.createLogger({name: 'two', level: () => {return 'off'}});
    expect(log2.level).to.equal('off');
    done();


  });


  it('keeps absolute root', done => {

    let log = new VertexLogger({parent: 'ROOT', name: 'name1'});
    log = log.createLogger({name: 'name2'});
    log = log.createLogger({name: 'name3'});
    log.info('message');
    done();

  });

  it('does not log to off', done => {

    let log = new VertexLogger({level: 'off'});
    log.fatal('just %d %s', 1, 'message');
    log.fatal('just %d %s', 2, 'message');
    log.fatal('just %d %s', 3, 'message');
    log.fatal('just %d %s', 4, 'message');
    log.fatal('just %d %s', 5, 'message');
    log.fatal('just %d %s', 6, 'message');
    log.fatal('just %d %s', 7, 'message');
    log.fatal('just %d %s', 8, 'message');
    log.fatal('just %d %s', 9, 'message');
    done();

  });


  it('logs to fatal', done => {

    let log = new VertexLogger({level: 'fatal'});
    log.fatal('just %d %s', 1, 'message');
    done();

  });

  it('logs to error', done => {

    let log = new VertexLogger({level: 'error'});
    log.error('just %d %s', 1, 'message');
    done();

  });

  it('logs to warn', done => {

    let log = new VertexLogger({level: 'warn'});
    log.warn('just %d %s', 1, 'message');
    done();

  });

  it('logs to info', done => {

    let log = new VertexLogger({level: 'info'});
    log.info('just %d %s', 1, 'message');
    done();

  });

  it('logs to debug', done => {

    let log = new VertexLogger({level: 'debug'});
    log.debug('just %d %s', 1, 'message');
    done();

  });

  it('logs to trace', done => {

    let log = new VertexLogger({level: 'trace'});
    log.trace('just %d %s', 1, 'message');
    done();

  });

  it('does not log above specified level', done => {

    let log = new VertexLogger({level: 'info'});
    log._write = () => {
      throw new Error('should not log');
    };
    log.debug();
    done();

  });

  it('includes the error stack if last arg is instanceof error', done => {

    let log = new VertexLogger({level: 'info'});
    let error = new Error('Problem no problem');
    error.additionalInfo = {x: 1};
    log.info('error %s', error);
    done();

  });


});

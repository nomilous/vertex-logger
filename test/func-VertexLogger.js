const {basename} = require('path');
const filename = basename(__filename);
const expect = require('expect.js');

const VertexLogger = require('../');

describe(filename, () => {

  it('defaults name and level', done => {

    let logger = new VertexLogger();
    expect(logger._parent).to.be('parent');
    expect(logger._name).to.be('name');
    expect(logger._level).to.be(VertexLogger.LEVEL_INFO);
    done();

  });

  it('uses configured name and level', done => {

    let logger = new VertexLogger({parent: 'a', name: 'x', level: VertexLogger.LEVEL_DEBUG});
    expect(logger._parent).to.be('a');
    expect(logger._name).to.be('x');
    expect(logger._level).to.be(VertexLogger.LEVEL_DEBUG);
    done();

  });

  it('reassigns to level info on bad level', done => {

    let log1 = new VertexLogger({level: 0});
    let log2 = new VertexLogger({level: 6});
    expect(log1._level).to.be(VertexLogger.LEVEL_INFO);
    expect(log2._level).to.be(VertexLogger.LEVEL_INFO);
    done();

  });

  it('can create a new logger from an existing one which inherits the level and context', done => {

    let log1 = new VertexLogger({parent: 'a', name: 'one', level: VertexLogger.LEVEL_FATAL});
    let log2 = log1.createLogger({name: 'two'});

    expect(log1._parent).to.be('a');
    expect(log1._name).to.be('one');
    expect(log1._level).to.be(VertexLogger.LEVEL_FATAL);
    expect(log2._parent).to.be('one');
    expect(log2._name).to.be('two');
    expect(log2._level).to.be(VertexLogger.LEVEL_FATAL);
    done();

  });

  it('logs to fatal', done => {

    let log = new VertexLogger({level: VertexLogger.LEVEL_FATAL});
    log.fatal('just %d %s', 1, 'message');
    done();

  });

  it('logs to error', done => {

    let log = new VertexLogger({level: VertexLogger.LEVEL_ERROR});
    log.error('just %d %s', 1, 'message');
    done();

  });

  it('logs to warn', done => {

    let log = new VertexLogger({level: VertexLogger.LEVEL_WARN});
    log.warn('just %d %s', 1, 'message');
    done();

  });

  it('logs to info', done => {

    let log = new VertexLogger({level: VertexLogger.LEVEL_INFO});
    log.info('just %d %s', 1, 'message');
    done();

  });

  it('logs to debug', done => {

    let log = new VertexLogger({level: VertexLogger.LEVEL_DEBUG});
    log.debug('just %d %s', 1, 'message');
    done();

  });

  it('does not log above specified level', done => {

    let log = new VertexLogger({level: VertexLogger.LEVEL_INFO});
    log._write = () => {
      throw new Error('should not log');
    };
    log.debug();
    done();

  });

  it('includes the error stack if last arg is instanceof error', done => {

    let log = new VertexLogger({level: VertexLogger.LEVEL_INFO});
    log.info('error %s', new Error('Problem no problem'));
    done();

  });


});

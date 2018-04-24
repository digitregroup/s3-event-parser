const {expect} = require('chai');

const handleJoiError = require('../src/handle-joi-error');

const config = {
  sourceName: 'handle-joi-error test',
  errorMessage: 'this is the error message'
};

const testFn = handleJoiError(config.sourceName);

describe('handleJoiError', () => {
  it('should not do anything if no error occured', () => {
    testFn();
  });
  it('should re-throw error if error occured', () => {
    expect(() => testFn(new Error())).to.throw();
  });
  it('should modify error message if error occured', () => {
    let message;
    try {
      testFn(new Error(config.errorMessage));
    } catch (e) {
      message = e.message;
    }
    expect(message).to.include(config.sourceName);
    expect(message).to.include(config.errorMessage);
  });
});

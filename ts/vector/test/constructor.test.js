'use strict';
exports.__esModule = true;
const src_1 = require('../src/');
const assert_1 = require('assert');
describe('vector constructor', () => {
  it('empty initialization', () => {
    assert_1.equal(true, new src_1['default']().empty());
  });

  it('vector size equal zero', () => {
    assert_1.equal(0, new src_1['default']().size());
  });

  it('vector len equal zero', () => {
    assert_1.equal(0, new src_1['default']().length);
  });
});

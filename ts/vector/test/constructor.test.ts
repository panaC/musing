import Vector from '../src/';
import {strictEqual as equal, deepStrictEqual as deepEqual} from 'assert';

describe('vector constructor', () => {
  it('empty initialization', () => {
    equal(true, new Vector().empty());
  });

  it('vector size equal zero', () => {
    equal(0, new Vector().size());
  });

  it('vector len equal zero', () => {
    equal(0, new Vector().length);
  });

  it('vector init constructor equal one', () => {
    equal(1, new Vector(1, undefined).length);
  });

  it('vector init constructor equal ten', () => {
    equal(10, new Vector<number>(10, 42).length);
  });

  it('vector test non empty', () => {
    equal(false, new Vector<number>(10, 42).empty());
  });

  it('vector test content init', () => {
    deepEqual(
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      Array.from(new Vector<number>(10, 1))
    );
  });
});

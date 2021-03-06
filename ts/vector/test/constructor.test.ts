import Vector from '../src/';
import {
  strictEqual as equal,
  deepStrictEqual as deepEqual,
  throws,
} from 'assert';

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

  it('at zero', () => {
    throws(() => new Vector().at(0));
  });

  it('at wrong index', () => {
    throws(() => new Vector().at(10));
  });

  it('at wrong index', () => {
    throws(() => new Vector(10, 1).at(10));
  });

  it('at index', () => {
    equal(1, new Vector(10, 1).at(9));
  });

  it('push back', () => {
    const v = new Vector<number>(3, 1);
    v.push_back(42);
    deepEqual([1, 1, 1, 42], Array.from(v));
  });

  it('push back empty list', () => {
    const v = new Vector<number>();
    v.push_back(42);
    deepEqual([42], Array.from(v));
  });

  it('push front', () => {
    const v = new Vector<number>(3, 1);
    v.push_front(42);
    deepEqual([42, 1, 1, 1], Array.from(v));
  });

  it('push front empty list', () => {
    const v = new Vector<number>();
    v.push_front(42);
    deepEqual([42], Array.from(v));
  });

  it('pull front empty list', () => {
    throws(() => new Vector().pull_front());
  });

  it('pull front list', () => {
    const v = new Vector<number>(3, 1);
    equal(1, v.pull_front());
  });

  it('pull front list size', () => {
    const v = new Vector<number>(3, 1);
    v.pull_front();
    equal(2, v.size());
  });

  it('pull back empty list', () => {
    throws(() => new Vector().pull_back());
  });

  it('pull back list', () => {
    const v = new Vector<number>(3, 1);
    equal(1, v.pull_back());
  });

  it('pull back list size', () => {
    const v = new Vector<number>(3, 1);
    v.pull_back();
    equal(2, v.size());
  });

  it('insert', () => {
    const v = new Vector<number>(3, 1);
    v.insert(1, 42);

    deepEqual([1, 42, 1, 1], Array.from(v));
  });

  it('insert size', () => {
    const v = new Vector<number>(3, 1);
    v.insert(1, 42);

    equal(4, v.length);
  });

  it('data', () => {
    deepEqual([1, 1, 1, 1], new Vector<number>(4, 1).data());
  });

  it('erase', () => {
    const v = new Vector<number>(3, 1);
    v.erase(1);

    deepEqual([1, 1], Array.from(v));
  });

  it('erase length', () => {
    const v = new Vector<number>(3, 1);
    v.erase(1);

    equal(2, v.length);
  });

  it('erase size', () => {
    const v = new Vector<number>(3, 1);
    v.erase(1);

    equal(2, v.size());
  });

  it('clear', () => {
    const v = new Vector<number>(3, 1);

    deepEqual([1, 1, 1], Array.from(v));
    v.clear();

    deepEqual([], Array.from(v));
  });

  it('copy', () => {
    const v = new Vector<number>(10, 1);
    const copy = v.copy();

    deepEqual(Array.from(copy), Array.from(Vector.copy(v)));

    throws(() => equal(Vector.copy(v), Vector.copy(v)));
  });

  it('import from array', () => {
    deepEqual(Array.from(Vector.importFromArray([1, 2, 3, 4, 5])), [
      1,
      2,
      3,
      4,
      5,
    ]);
  });

  it('static init', () => {
    deepEqual(Array.from(Vector.init(5, i => i + 1)), [1, 2, 3, 4, 5]);
  });

  it('json', () => {
    equal(
      JSON.stringify([1, 2, 3, 4, 5]),
      JSON.stringify(Vector.init(5, i => i + 1))
    );
  });
});

import * as assert from 'assert';

interface INode<T> {
  data: T;
  next: INode<T> | null;
  prev: INode<T> | null;
}

export class Vector<T> {
  private _head: INode<T> | null;
  private _tail: INode<T> | null;
  private _size: number;

  constructor(len?: number, data?: T) {
    this._head = null;
    this._tail = null;
    this._size = 0;

    if (len) {
      while (--len >= 0) {
        this.push_front(data as T);
      }
    }
  }

  public push_front(data: T) {
    const node: INode<T> = {
      data,
      next: this._head,
      prev: null,
    };

    if (this._head) {
      this._head.prev = node;
    }
    this._head = node;

    if (this._tail === null) {
      this._tail = node;
    }

    ++this._size;
  }

  public push_back(data: T) {
    const node: INode<T> = {
      data,
      next: null,
      prev: this._tail,
    };

    if (this._head === null) {
      this._head = node;
    }

    if (this._tail) {
      this._tail.next = node;
    }
    this._tail = node;

    ++this._size;
  }

  public pull_front() {
    assert.ok(this._head, 'vector is empty');

    const data = this._head.data;
    const next = this._head.next;
    if (this._tail === this._head) this._tail = null;
    this._head = next;

    --this._size;

    return data;
  }

  public pull_back() {
    assert.ok(this._tail, 'vector is empty');

    const data = this._tail.data;
    const prev = this._tail.prev;
    if (this._tail === this._head) this._head = null;
    this._tail = prev;

    --this._size;

    return data;
  }

  public at(i: number) {
    assert.ok(i >= 0 && i < this._size, 'index not in vector range');

    const it = this[Symbol.iterator]();

    let result = it.next();
    while (!result.done) {
      if (i === 0) {
        return result.value;
      }
      --i;
      result = it.next();
    }

    throw new Error('unexpected error');
  }

  public insert(i: number, data: T) {
    assert.ok(i >= 0 && i < this._size, 'index not in vector range');

    if (i === 0) this.push_front(data);
    if (i + 1 === this._size) this.push_back(data);

    let prevPtr = null;
    let ptr = this._head;
    while (ptr && i > 0) {
      prevPtr = ptr;
      ptr = ptr.next;
      --i;
    }

    const node: INode<T> = {
      data,
      prev: prevPtr,
      next: ptr,
    };

    if (prevPtr) prevPtr.next = node;
    if (ptr) ptr.prev = node;
  }

  public erase(i: number) {
    assert.ok(i >= 0 && i < this._size, 'index not in vector range');

    if (i === 0) return this.pull_front();
    if (i + 1 === this._size) return this.pull_back();

    let prevPtr = null;
    let ptr = this._head;
    while (ptr && i > 0) {
      prevPtr = ptr;
      ptr = ptr.next;
      --i;
    }
    const nextPtr = ptr?.next;

    if (prevPtr) prevPtr.next = ptr;
    if (nextPtr) nextPtr.prev = prevPtr;

    if (ptr) {
      ptr.next = null;
      ptr.prev = null;
      return ptr;
    }

    throw new Error('unexpected error');
  }

  public clear() {
    let ptr = this._head;
    while (ptr) {
      const n = ptr;
      ptr = ptr.next;
      n.next = null;
      n.prev = null;
    }

    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  *[Symbol.iterator]() {
    assert.ok(
      !((this._head && !this._tail) || (!this._head && this._tail)),
      'tail ^ head === false'
    );
    let ptr = this._head;
    while (ptr) {
      yield ptr.data;
      ptr = ptr.next;
    }
  }

  public empty() {
    return this._size === 0;
  }

  get length() {
    return this._size;
  }

  public size() {
    return this._size;
  }

  public data() {
    return Array.from(this);
  }

  public copy(): Vector<T> {
    return Vector.copy(this);
  }

  static copy<T>(v: Vector<T>): Vector<T> {
    const newV = new Vector<T>();

    for (const data of v) {
      newV.push_front(data);
    }

    return newV;
  }

  static importFromArray<T>(arr: T[]) {
    const v = new Vector<T>();

    for (const el of arr) {
      v.push_back(el);
    }

    return v;
  }

  static init<T>(len: number, fn: (i: number) => T) {
    const data = Array.from({length: len}, (_, i) => fn(i));
    return Vector.importFromArray(data);
  }
}

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
}

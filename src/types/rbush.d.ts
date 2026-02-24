declare module 'rbush' {
  interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }

  export default class RBush<T extends BBox = BBox> {
    constructor(maxEntries?: number);
    insert(item: T): this;
    load(items: T[]): this;
    remove(item: T, equals?: (a: T, b: T) => boolean): this;
    clear(): this;
    search(bbox: BBox): T[];
    all(): T[];
    collides(bbox: BBox): boolean;
    toJSON(): any;
    fromJSON(data: any): this;
  }
}

import { Vector2d } from "./Utils";
import { CellHandle } from "./CellTable";

export class CirclesTable {
    constructor(
        public ctx: CanvasRenderingContext2D,
        public row_names: Array<string>,
        public col_names: Array<string>,
        public cell_entries: PairMap<CellHandle>,
    ) {}
}

class PairMap<T> {
    private map = new Map<string, T>();

    // Helper function to create a unique key from two strings
    private createKey(key1: string, key2: string): string {
        return `${key1}::${key2}`; // Delimit with "::" or any character that won't appear in the keys
    }

    // Set a value with a pair of string keys
    set(key1: string, key2: string, value: T): void {
        const compositeKey = this.createKey(key1, key2);
        this.map.set(compositeKey, value);
    }

    // Get a value by a pair of string keys
    get(key1: string, key2: string): T | undefined {
        const compositeKey = this.createKey(key1, key2);
        return this.map.get(compositeKey);
    }

    // Check if a value exists for a pair of string keys
    has(key1: string, key2: string): boolean {
        const compositeKey = this.createKey(key1, key2);
        return this.map.has(compositeKey);
    }

    // Delete a value by a pair of string keys
    delete(key1: string, key2: string): boolean {
        const compositeKey = this.createKey(key1, key2);
        return this.map.delete(compositeKey);
    }
}
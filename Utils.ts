export class Vector2d {
    constructor(
        public x: number,
        public y: number
    ) {}

    add(other: Vector2d): Vector2d {
        return new Vector2d(
            this.x + other.x,
            this.y + other.y
        );
    }
    sub(other: Vector2d): Vector2d {
        return new Vector2d(
            this.x - other.x,
            this.y - other.y
        );
    }
    mul(val: number): Vector2d {
        return new Vector2d(
            this.x * val,
            this.y * val
        );    
    }
    max(other: Vector2d): Vector2d {
        return new Vector2d(
            Math.max(this.x, other.x),
            Math.max(this.y, other.y)
        );
    }
    min(other: Vector2d): Vector2d {
        return new Vector2d(
            Math.min(this.x, other.x),
            Math.min(this.y, other.y)
        );
    }
    distance(other: Vector2d): number {
        let dist_x = Math.abs(this.x - other.x);
        let dist_y = Math.abs(this.y - other.y);
        return Math.sqrt(dist_x*dist_x + dist_y*dist_y);
    }
}

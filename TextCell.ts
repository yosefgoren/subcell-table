import { Vector2d } from "./Utils";
import { CellHandle } from "./CellTable"

export class TextCell implements CellHandle {
    constructor(
        public ctx: CanvasRenderingContext2D,
        public text: string
    ) {}
    
    render(ctx: CanvasRenderingContext2D): void {
        
    }
    
    rmb_clbk(offset: Vector2d): void {
        
    }
    
    lmb_clbk(offset: Vector2d): void {
        
    }
    hover_clbk(offset: Vector2d): void {
        
    }
    unhover_clbk(): void {
        
    }
    
    get_size(): Vector2d {
        let metrics = this.ctx.measureText(this.text);
        
        return new Vector2d(
            metrics.width,
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
        )
    }
}
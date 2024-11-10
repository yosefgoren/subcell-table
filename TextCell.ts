import { Vector2d } from "./Utils.js";
import { CellHandle } from "./CellTable.js"

export class TextCell implements CellHandle {
    constructor(
        public ctx: CanvasRenderingContext2D,
        public text: string
    ) {}
    
    render(ctx_do_remove_this: CanvasRenderingContext2D): void {
        this.ctx.strokeText(this.text, 0, 0);
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
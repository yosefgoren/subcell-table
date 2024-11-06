import { Vector2d } from "./Utils";
import { CellHandle } from "./CellTable";

export interface Subcell {
    rmb_clbk(): void;
    lmb_clbk(): void;
    hover_clbk(): void;
    unhover_clbk(): void;
}

class SubCirclesRenderPositions {
    bot_right: Vector2d;
    topl_circle_center: Vector2d; // Top Left
    botr_circle_center: Vector2d; // Bottom Right
};

export class SubCirclesCell implements CellHandle {
    constructor(
        public ctx: CanvasRenderingContext2D,
        public circles: Array<{radius: number, subcell: Subcell}>,
        public circle_distance: Vector2d,
        public border_padding: Vector2d
    ) {}
    
    private calculate_render_positions(): SubCirclesRenderPositions {    
        // Find positions assuming border padding and circle radiuses are 0:
        let topl_circle_center = new Vector2d(0, 0);
        let botr_circle_center = topl_circle_center;
        this.circles.forEach((circle) => {
            botr_circle_center = botr_circle_center.add(this.circle_distance);
        });

        // Find the real edges including padding and circle sizes:
        let top_left = topl_circle_center.add(this.border_padding);
        let bot_right = botr_circle_center.add(this.border_padding);
        let circle_center = topl_circle_center;
        this.circles.forEach((circle) => {
            let radius_vector = new Vector2d(circle.radius, circle.radius);
            
            // Compute constraints of this circle:
            let circle_top_left_constraint = circle_center.sub(radius_vector).sub(this.border_padding)
            let circle_bot_tight_constraint = circle_center.add(radius_vector).add(this.border_padding)
            
            // Keep the extreme constraint:
            top_left = top_left.min(circle_top_left_constraint);
            bot_right = bot_right.max(circle_bot_tight_constraint);
            
            circle_center = circle_center.add(this.circle_distance);
        });

        // Zero all vectors with respect to the real top left:
        return {
            bot_right: bot_right.sub(top_left),
            topl_circle_center: topl_circle_center.sub(top_left),
            botr_circle_center: botr_circle_center.sub(top_left),
        };
    }

    private render_pos: SubCirclesRenderPositions | null = null;
    private get_render_positions(): SubCirclesRenderPositions {
        if(this.render_pos == null) {
            this.render_pos = this.calculate_render_positions();
        }
        return this.render_pos;
    }

    render(ctx: CanvasRenderingContext2D): void {
        let center = this.get_render_positions().topl_circle_center;
        this.circles.forEach((circle) => {
            // TODO: render using 'center'

            center = center.add(new Vector2d(circle.radius, circle.radius));
        });
    }

    private detect_subcell_idx(offset: Vector2d): number | null {
        // Iterating in the oppesite order when detecting subcells compared to when rendering:
        let center = this.get_render_positions().botr_circle_center;
        for(let i = this.circles.length-1; i >= 0; --i) {
            if(center.distance(offset) <= this.circles[i].radius) {
                return i;
            }
            center.sub(this.circle_distance);
        }

        return null;
    }

    private detect_subcell(offset: Vector2d): Subcell | null {
        let res = this.detect_subcell_idx(offset);
        if(res != null) {
            return this.circles[res].subcell;
        }
        return null;
    }
    
    rmb_clbk(offset: Vector2d): void {
        this.detect_subcell(offset)?.rmb_clbk;
    }
    
    lmb_clbk(offset: Vector2d): void {
        this.detect_subcell(offset)?.lmb_clbk;
    }

    private last_hovered_subcell_idx: number | null = null;
    hover_clbk(offset: Vector2d): void {
        let new_hovered_idx = this.detect_subcell_idx(offset);
        
        if (new_hovered_idx != this.last_hovered_subcell_idx) {
            // If a subcell was hovered but is no longer hovered:
            if (this.last_hovered_subcell_idx != null) {
                this.circles[this.last_hovered_subcell_idx].subcell.unhover_clbk();
            }

            if (new_hovered_idx != null) {
                // If a subcell is hovered but wasn't so before:
                this.circles[new_hovered_idx].subcell.hover_clbk();
            }
        }

        this.last_hovered_subcell_idx = new_hovered_idx;
        
    }
    unhover_clbk(): void {
        // This function will be invoked if the hover leaves this cell alltogether.
        if(this.last_hovered_subcell_idx != null) {
            this.circles[this.last_hovered_subcell_idx].subcell.unhover_clbk();
        }
        this.last_hovered_subcell_idx = null;
    }
    
    get_size(): Vector2d {
        return this.get_render_positions().bot_right;
    }
}
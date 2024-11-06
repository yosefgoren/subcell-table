import { Vector2d } from "./Utils";

export interface CellHandle {
    // The rendering context is passed with zeroed coordinates, so it can use relative coordinates.
    render(ctx: CanvasRenderingContext2D): void;

    //The 'offset' parameter is the distance to the cell's zeroing position at it's top left.

    rmb_clbk(offset: Vector2d): void;
    lmb_clbk(offset: Vector2d): void;
    hover_clbk(offset: Vector2d): void;
    unhover_clbk(): void;
    get_size(): Vector2d;
}

class CellTableScale {
    constructor(
        public row_sizes: Array<number>,
        public col_sizes: Array<number>
    ) {}
}

export interface RowId extends Number {
    readonly __brand: unique symbol;
}
export function create_row_id(id: number): RowId {
    return (new Number(id)) as unknown as RowId;
}
export interface ColId extends Number {
    readonly __brand: unique symbol;
}
export function create_col_id(id: number): ColId {
    return (new Number(id)) as unknown as ColId;
}
export interface CellId extends Number {
    readonly __brand: unique symbol;
}
export function create_cell_id(id: number): CellId {
    return (new Number(id)) as unknown as CellId;
}

export function get_num(val: RowId | ColId | CellId): number {
    return (val as Number).valueOf();
}

class CellTableDicts {
    constructor(
        public major_row: Map<RowId, Map<ColId, CellId>>,
        public major_col: Map<ColId, Map<RowId, CellId>>,
    ) {}
};


function nested_dict_insert<Major, Minor, Value>(dict: Map<Major, Map<Minor, Value>>, major: Major, minor: Minor, value: Value) {
    if(!dict.has(major)) {
        dict.set(major, new Map<Minor, Value>());
    }

    let inner = dict.get(major);
    if(inner != undefined) {
        if(!inner.has(minor)) {
            inner.set(minor, value);
        }
    }
};

export class CellTable {
    constructor(
        public ctx: CanvasRenderingContext2D,
        public num_rows: number,
        private cell_entries: Array<{row: RowId, col: ColId, handle: CellHandle}>,
        public num_cols: number,
        public empty_row_height: number,
        public empty_col_width: number
    ) {}

    private calculate_dicts(): CellTableDicts {
        let dicts = new CellTableDicts(
            new Map<RowId, Map<ColId, CellId>>(),
            new Map<ColId, Map<RowId, CellId>>(),
        );


        this.cell_entries.forEach(({row, col, handle}, idx) => {
            let cell_idx = create_cell_id(idx);
            nested_dict_insert(dicts.major_row, row, col, cell_idx);
            nested_dict_insert(dicts.major_col, col, row, cell_idx);
        });

        return {
            major_row: dicts.major_row,
            major_col: dicts.major_col
        };
    }

    private calculate_scale(dicts: CellTableDicts): CellTableScale {
        let row_sizes = new Array<number>();
        for(let i = 0; i < this.num_rows; ++i) {
            let row_idx = create_row_id(i);
            let size = this.empty_row_height;
        
            dicts.major_row.get(row_idx)?.forEach((cell_idx: CellId, col_idx: ColId) => {
                size = Math.max(size, this.cell_entries[get_num(cell_idx)].handle.get_size().x);
            });
            row_sizes.push(size);
        }
        
        let col_sizes = new Array<number>();
        for(let i = 0; i < this.num_rows; ++i) {
            let col_idx = create_col_id(i);
            let size = this.empty_col_width;
        
            dicts.major_col.get(col_idx)?.forEach((cell_idx: CellId, row_idx: RowId) => {
                size = Math.max(size, this.cell_entries[get_num(cell_idx)].handle.get_size().y);
            });
            col_sizes.push(size);
        }

        return new CellTableScale(
            row_sizes,
            col_sizes
        );
    }

    private last_scale: CellTableScale | null = null;
    private get_scale(dicts: CellTableDicts): CellTableScale {
        if(this.last_scale == null) {
            this.last_scale = this.calculate_scale(dicts);
        }
        return this.last_scale;
    }

    add_cell_entry(row: RowId, col: ColId, handle: CellHandle): void {
        this.last_scale = null;
        this.cell_entries.push({row, col, handle});
    }

    private calculate_cell_positions(dicts: CellTableDicts, scale: CellTableScale): Array<Vector2d> {
        let cell_positions = new Array<Vector2d>();
        this.cell_entries.forEach((_) => {
            cell_positions.push(new Vector2d(0, 0));
        });

        let width_sum = 0;
        scale.col_sizes.forEach((col_width, col_idx) => {
            dicts.major_col.get(create_col_id(col_idx))?.forEach((cell_idx: CellId, row_idx: RowId) => {
                cell_positions[get_num(cell_idx)].x = width_sum;
            })
            width_sum += col_width;
        });

        let height_sum = 0;
        scale.row_sizes.forEach((row_height, row_idx) => {
            dicts.major_row.get(create_row_id(row_idx))?.forEach((cell_idx: CellId, col_idx: ColId) => {
                cell_positions[get_num(cell_idx)].y = height_sum;
            });
            height_sum += row_height;
        });

        return cell_positions;
    }

    
    full_render(): void {
        // Index the both by row and column to handle it more efficiently:
        const dicts = this.calculate_dicts();
        
        // Calculate the sizes of the cells by finding the length of each row and each column:
        const scale = this.get_scale(dicts);
        
        // Calculate the position of each cell:
        const positions = this.calculate_cell_positions(dicts, scale);

        // Clears the whole table:
        //TODO: ...

        // Centers and renders each cell in the table:
        this.cell_entries.forEach(({row, col, handle}, cell_idx) => {
            const requested_cell_size = handle.get_size();
            const given_cell_size = new Vector2d(scale.row_sizes[get_num(row)], scale.col_sizes[get_num(col)]);
            const centering_offset = given_cell_size.sub(requested_cell_size).mul(0.5);
            
            const entier_cell_pos = positions[cell_idx];
            const centered_cell_pos = entier_cell_pos.add(centering_offset);

            this.ctx.translate(centered_cell_pos.x, centered_cell_pos.y);
            handle.render(this.ctx);
        })
    }

    
    cell_render(): void {
        // Clears the target cell:
        //TODO: ...

        // Centers and renders the target cell:

    }
}
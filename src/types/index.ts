//supported content block types that can be placed on a profile/layout grid.
export type BlockType = 'project' | 'text' | 'image' | 'skills' | 'education'

//describes size and placement of a block within the grid layout.
export interface GridPosition {
  x: number      //the horizontal start position
  y: number      //the vertical start position
  width: number  //th block width in grid units
  height: number //and block height in grid units
}
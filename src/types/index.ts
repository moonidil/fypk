//supported content block types that can be placed on the users canvas.
export type BlockType =
  | "project"
  | "text"
  | "image"
  | "skills"
  | "education"
  | "link"

//stores flexible content depending on the type of block.
export interface BlockContent {
  text?: string
  title?: string
  imageUrl?: string
  linkUrl?: string
  linkLabel?: string
  skills?: string[]
}

//describes the size and placement of a block within the grid layout.
export interface GridPosition {
  x: number
  y: number
  width: number
  height: number
}
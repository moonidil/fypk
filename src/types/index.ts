//supported content block types that can be placed on the users canvas.
export type BlockType =
  | "project"
  | "text"
  | "image"
  | "skills"
  | "education"
  | "link"

//chill block styling controls used by text skills and education blocks
export type BlockStyleSize = "sm" | "md" | "lg"
export type BlockStyleWeight = "normal" | "medium" | "bold"
export interface BlockStyle {
  size?: BlockStyleSize
  weight?: BlockStyleWeight
}


//stores flexible content depending on the type of block.
export interface BlockContent {
  text?: string
  title?: string
  imageUrl?: string
  linkUrl?: string
  linkLabel?: string
  skills?: string[]

  //reference to a structured project when the block type is "project"
  projectId?: string

  //optional per block style overrides
  style?: BlockStyle
  
  //link preview fields
  description?: string
  siteName?: string
  previewImage?: string

  //github specific preview fields
  githubOwner?: string
  githubRepo?: string
  githubStars?: number
  githubLanguage?: string
  githubUpdatedAt?: string
}

//describes the size and placement of a block within the grid layout.
export interface GridPosition {
  x: number
  y: number
  width: number
  height: number
}
import type { BlockStyle, BlockStyleSize, BlockStyleWeight } from "@/types"



//tailwind classes for each of de supported size
const SIZE_CLASSES: Record<BlockStyleSize, string> = {
  sm: "text-sm leading-6",
  md: "text-[15px] leading-7",
  lg: "text-lg leading-8",
}


//tailwind classes for each supported weight
const WEIGHT_CLASSES: Record<BlockStyleWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  bold: "font-semibold",
}
//returns the combined class string for a given block style
export function blockStyleClasses(style: BlockStyle | undefined): string {
  const size = style?.size ?? "md"
  const weight = style?.weight ?? "normal"
  return `${SIZE_CLASSES[size]} ${WEIGHT_CLASSES[weight]}`
}

export const BLOCK_SIZE_OPTIONS: { value: BlockStyleSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
]
export const BLOCK_WEIGHT_OPTIONS: { value: BlockStyleWeight; label: string }[] = [
  { value: "normal", label: "Regular" },
  { value: "medium", label: "Medium" },
  { value: "bold", label: "Bold" },
]
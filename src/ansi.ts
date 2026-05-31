export const CODES = {
  reset: 0, bold: 1, dim: 2,
  red: 31, green: 32, yellow: 33, blue: 34,
  magenta: 35, cyan: 36, gray: 90, white: 37,
} as const

export type ColorName = keyof typeof CODES

export function paint(text: string, color: ColorName, enabled: boolean): string {
  if (!enabled) return text
  return `\x1b[${CODES[color]}m${text}\x1b[0m`
}

export function colorEnabled(
  env: Record<string, string | undefined> = process.env,
  isTTY: boolean | undefined = process.stdout.isTTY,
): boolean {
  if (env.NO_COLOR !== undefined && env.NO_COLOR !== '') return false
  return isTTY === true
}

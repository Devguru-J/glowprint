import type { ColorName } from './ansi.ts'

export type TokenKind =
  | 'string' | 'number' | 'boolean' | 'null' | 'undefined'
  | 'key' | 'punctuation' | 'error' | 'date' | 'special'

export type ThemeColors = Record<TokenKind, ColorName>

export const THEMES = {
  default: {
    string: 'green', number: 'yellow', boolean: 'magenta', null: 'gray',
    undefined: 'gray', key: 'cyan', punctuation: 'gray', error: 'red',
    date: 'blue', special: 'gray',
  },
  dracula: {
    string: 'green', number: 'magenta', boolean: 'cyan', null: 'gray',
    undefined: 'gray', key: 'magenta', punctuation: 'gray', error: 'red',
    date: 'cyan', special: 'gray',
  },
  mono: {
    string: 'white', number: 'white', boolean: 'white', null: 'gray',
    undefined: 'gray', key: 'white', punctuation: 'gray', error: 'white',
    date: 'white', special: 'gray',
  },
} satisfies Record<string, ThemeColors>

export type ThemeName = keyof typeof THEMES

export function resolveTheme(theme: ThemeName | ThemeColors): ThemeColors {
  if (typeof theme === 'string') return THEMES[theme] ?? THEMES.default
  return theme
}

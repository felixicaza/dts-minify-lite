import { TokenKind } from '../token-kind.ts'

export interface Scanner {
  setText(text: string): void
  scan(): TokenKind
  getToken(): TokenKind
  getTokenText(): string
}

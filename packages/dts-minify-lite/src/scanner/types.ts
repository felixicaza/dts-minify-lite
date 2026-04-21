import { TokenKind } from '../token-kind'

export interface Scanner {
  setText(text: string): void
  scan(): TokenKind
  getToken(): TokenKind
  getTokenText(): string
}

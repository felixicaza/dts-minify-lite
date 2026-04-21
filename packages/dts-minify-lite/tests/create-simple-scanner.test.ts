import { describe, expect, test } from 'vitest'
import { createSimpleScanner } from '../src/scanner/create-simple-scanner'
import { TokenKind } from '../src/token-kind'

interface ScannedToken {
  kind: TokenKind
  text: string
}

function scanAll(text: string): ScannedToken[] {
  const scanner = createSimpleScanner()
  const tokens: ScannedToken[] = []
  scanner.setText(text)

  while (true) {
    const kind = scanner.scan()
    if (kind === TokenKind.EndOfFileToken) {
      break
    }
    tokens.push({ kind, text: scanner.getTokenText() })
  }

  return tokens
}

describe('createSimpleScanner', () => {
  test('scans trivia and punctuation tokens correctly', () => {
    const tokens = scanAll(' \t\r\n//a\n/*b*/;}{(,:')

    expect(tokens.map((t) => t.kind)).toEqual([
      TokenKind.WhitespaceTrivia,
      TokenKind.NewLineTrivia,
      TokenKind.SingleLineCommentTrivia,
      TokenKind.NewLineTrivia,
      TokenKind.MultiLineCommentTrivia,
      TokenKind.SemicolonToken,
      TokenKind.CloseBraceToken,
      TokenKind.OpenBraceToken,
      TokenKind.OpenParenToken,
      TokenKind.CommaToken,
      TokenKind.ColonToken
    ])

    expect(tokens.map((t) => t.text)).toEqual([
      ' \t',
      '\r\n',
      '//a',
      '\n',
      '/*b*/',
      ';',
      '}',
      '{',
      '(',
      ',',
      ':'
    ])
  })

  test('classifies keywords and identifiers', () => {
    const tokens = scanAll('declare myType')

    expect(tokens.map((t) => t.kind)).toEqual([
      TokenKind.Keyword,
      TokenKind.WhitespaceTrivia,
      TokenKind.Identifier
    ])

    expect(tokens.map((t) => t.text)).toEqual([
      'declare',
      ' ',
      'myType'
    ])
  })

  test('scans quoted strings with escapes as Other', () => {
    const tokens = scanAll('"a\\"b" \'c\\\'d\'')
    const otherTokens = tokens.filter((t) => t.kind === TokenKind.Other).map((t) => t.text)

    expect(otherTokens).toEqual([
      '"a\\"b"',
      '\'c\\\'d\''
    ])
  })

  test('scans number formats as Other', () => {
    const tokens = scanAll('0x1f 0B1010 0o77 123_456 1.23e-4')
    const numberTokens = tokens.filter((t) => t.kind === TokenKind.Other).map((t) => t.text)

    expect(numberTokens).toEqual([
      '0x1f',
      '0B1010',
      '0o77',
      '123_456',
      '1.23e-4'
    ])
  })

  test('setText resets scanner state', () => {
    const scanner = createSimpleScanner()

    scanner.setText('a')
    expect(scanner.scan()).toBe(TokenKind.Identifier)
    expect(scanner.getTokenText()).toBe('a')
    expect(scanner.scan()).toBe(TokenKind.EndOfFileToken)

    scanner.setText('b')
    expect(scanner.scan()).toBe(TokenKind.Identifier)
    expect(scanner.getTokenText()).toBe('b')
  })
})

import { describe, expect, test } from 'vitest'
import { isDigit, isHexDigit, isIdentifierPart, isIdentifierStart, isNewLine, isWhitespace } from '../src/scanner/char-utils'

describe('char-utils', () => {
  test('isNewLine recognizes LF and CR only', () => {
    expect(isNewLine(10)).toBe(true)
    expect(isNewLine(13)).toBe(true)
    expect(isNewLine(32)).toBe(false)
  })

  test('isWhitespace recognizes supported whitespace chars', () => {
    expect(isWhitespace(9)).toBe(true)
    expect(isWhitespace(11)).toBe(true)
    expect(isWhitespace(12)).toBe(true)
    expect(isWhitespace(32)).toBe(true)
    expect(isWhitespace(160)).toBe(true)
    expect(isWhitespace(65279)).toBe(true)
    expect(isWhitespace(10)).toBe(false)
  })

  test('isIdentifierStart validates allowed initial chars', () => {
    expect(isIdentifierStart(65)).toBe(true)
    expect(isIdentifierStart(122)).toBe(true)
    expect(isIdentifierStart(36)).toBe(true)
    expect(isIdentifierStart(95)).toBe(true)
    expect(isIdentifierStart(48)).toBe(false)
  })

  test('isIdentifierPart allows digits in addition to start chars', () => {
    expect(isIdentifierPart(65)).toBe(true)
    expect(isIdentifierPart(95)).toBe(true)
    expect(isIdentifierPart(57)).toBe(true)
    expect(isIdentifierPart(45)).toBe(false)
  })

  test('isDigit validates decimal digits only', () => {
    expect(isDigit(48)).toBe(true)
    expect(isDigit(57)).toBe(true)
    expect(isDigit(47)).toBe(false)
    expect(isDigit(58)).toBe(false)
  })

  test('isHexDigit validates hex digits only', () => {
    expect(isHexDigit(48)).toBe(true)
    expect(isHexDigit(57)).toBe(true)
    expect(isHexDigit(65)).toBe(true)
    expect(isHexDigit(70)).toBe(true)
    expect(isHexDigit(97)).toBe(true)
    expect(isHexDigit(102)).toBe(true)
    expect(isHexDigit(71)).toBe(false)
    expect(isHexDigit(103)).toBe(false)
  })
})

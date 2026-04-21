import type { Scanner } from './types'

import { TokenKind } from '../token-kind'
import { keywords } from './keywords'
import { isDigit, isHexDigit, isIdentifierPart, isIdentifierStart, isNewLine, isWhitespace } from './char-utils'

export function createSimpleScanner(): Scanner {
  let text = ''
  let position = 0
  let tokenPosition = 0
  let token = TokenKind.EndOfFileToken

  return {
    setText(newText: string) {
      text = newText
      position = 0
      tokenPosition = 0
      token = TokenKind.EndOfFileToken
    },
    scan,
    getToken() {
      return token
    },
    getTokenText() {
      return text.slice(tokenPosition, position)
    }
  }

  function scan(): TokenKind {
    tokenPosition = position

    if (position >= text.length) {
      token = TokenKind.EndOfFileToken
      return token
    }

    const character = text.charCodeAt(position)

    if (isNewLine(character)) {
      readNewLine()
      token = TokenKind.NewLineTrivia
      return token
    }

    if (isWhitespace(character)) {
      position++
      while (position < text.length) {
        const c = text.charCodeAt(position)
        if (!isWhitespace(c)) {
          break
        }
        position++
      }
      token = TokenKind.WhitespaceTrivia
      return token
    }

    if (character === 47 /* / */ && position + 1 < text.length) {
      const next = text.charCodeAt(position + 1)

      if (next === 47 /* / */) {
        position += 2
        while (position < text.length) {
          const c = text.charCodeAt(position)
          if (c === 10 /* \n */ || c === 13 /* \r */) {
            break
          }
          position++
        }
        token = TokenKind.SingleLineCommentTrivia
        return token
      }

      // Multi line comment
      if (next === 42 /* * */) {
        position += 2
        while (position < text.length) {
          if (
            text.charCodeAt(position) === 42
            && /* * */ position + 1 < text.length
            && text.charCodeAt(position + 1) === 47 /* / */
          ) {
            position += 2
            break
          }
          position++
        }
        token = TokenKind.MultiLineCommentTrivia
        return token
      }
    }

    switch (character) {
      case 59: // ;
        position++
        token = TokenKind.SemicolonToken
        return token
      case 125: // }
        position++
        token = TokenKind.CloseBraceToken
        return token
      case 123: // {
        position++
        token = TokenKind.OpenBraceToken
        return token
      case 40: // (
        position++
        token = TokenKind.OpenParenToken
        return token
      case 44: // ,
        position++
        token = TokenKind.CommaToken
        return token
      case 58: // :
        position++
        token = TokenKind.ColonToken
        return token
      case 34: // "
      case 39: // '
      case 96: // `
        readQuoted(character)
        token = TokenKind.Other
        return token
      default:
        break
    }

    if (isIdentifierStart(character)) {
      position++
      while (position < text.length && isIdentifierPart(text.charCodeAt(position))) {
        position++
      }
      const word = text.slice(tokenPosition, position)
      token = keywords.has(word) ? TokenKind.Keyword : TokenKind.Identifier
      return token
    }

    if (isDigit(character)) {
      readNumber()
      token = TokenKind.Other
      return token
    }

    // Fallback: consume one character
    position++
    token = TokenKind.Other
    return token
  }

  function readNewLine() {
    const character = text.charCodeAt(position)
    if (
      character === 13
      && /* \r */ position + 1 < text.length
      && text.charCodeAt(position + 1) === 10 /* \n */
    ) {
      position += 2
      return
    }
    position++
  }

  function readQuoted(quote: number) {
    position++
    while (position < text.length) {
      const character = text.charCodeAt(position)
      position++

      if (character === 92 /* \ */) {
        if (position < text.length) {
          position++
        }
        continue
      }

      if (character === quote) {
        break
      }

      if (quote !== 96 && (character === 10 || character === 13)) {
        break
      }
    }
  }

  function readNumber() {
    if (text.charCodeAt(position) === 48 /* 0 */ && position + 1 < text.length) {
      const x = text.charCodeAt(position + 1)
      if (x === 120 || x === 88) {
        position += 2
        while (position < text.length && isHexDigit(text.charCodeAt(position))) {
          position++
        }
        return
      }
      if (x === 98 || x === 66) {
        position += 2
        while (position < text.length) {
          const character = text.charCodeAt(position)
          if (character !== 48 && character !== 49 && character !== 95) {
            break
          }
          position++
        }
        return
      }
      if (x === 111 || x === 79) {
        position += 2
        while (position < text.length) {
          const character = text.charCodeAt(position)
          if ((character < 48 || character > 55) && character !== 95) {
            break
          }
          position++
        }
        return
      }
    }

    while (position < text.length) {
      const character = text.charCodeAt(position)
      if (!isDigit(character) && character !== 95) {
        break
      }
      position++
    }

    if (position < text.length && text.charCodeAt(position) === 46 /* . */) {
      position++
      while (position < text.length) {
        const character = text.charCodeAt(position)
        if (!isDigit(character) && character !== 95) {
          break
        }
        position++
      }
    }

    if (position < text.length) {
      const character = text.charCodeAt(position)
      if (character === 101 || character === 69) {
        position++
        if (position < text.length) {
          const sign = text.charCodeAt(position)
          if (sign === 43 || sign === 45) {
            position++
          }
        }
        while (position < text.length && isDigit(text.charCodeAt(position))) {
          position++
        }
      }
    }
  }
}

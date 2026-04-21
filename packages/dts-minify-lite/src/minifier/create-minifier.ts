import type { Minifier, MinifyOptions } from '../types'

import { TokenKind } from '../token-kind'
import { createSimpleScanner } from '../scanner/create-simple-scanner'

const newLineCharCode = '\n'.charCodeAt(0)

/**
 * Minifies TypeScript declaration files.
 * @remarks Use createMinifier to create a minifier.
 * @returns A minify function that can be used to compress TypeScript declaration file text.
 */
export function createMinifier(): Minifier {
  const scanner = createSimpleScanner()

  return { minify }

  function minify(fileText: string, options?: MinifyOptions): string {
    let result = ''
    let lastWrittenToken: TokenKind | undefined
    let lastHadSeparatingNewLine = false
    const keepJsDocs = options?.keepJsDocs ?? false

    scanner.setText(fileText)

    while (scanner.scan() !== TokenKind.EndOfFileToken) {
      const currentToken = scanner.getToken()
      switch (currentToken) {
        case TokenKind.NewLineTrivia:
          lastHadSeparatingNewLine = true
          break
        case TokenKind.WhitespaceTrivia:
          break
        case TokenKind.SingleLineCommentTrivia:
          if (isTripleSlashDirective()) {
            writeSingleLineComment()
            lastHadSeparatingNewLine = false
          }
          break
        case TokenKind.MultiLineCommentTrivia:
          if (keepJsDocs && isJsDoc()) {
            writeJsDoc()
            lastHadSeparatingNewLine = false
          }
          break
        default:
          if (
            currentToken === TokenKind.Identifier
            && lastHadSeparatingNewLine
            && lastWrittenToken !== TokenKind.SemicolonToken
            && lastWrittenToken !== TokenKind.CloseBraceToken
            && lastWrittenToken !== TokenKind.OpenBraceToken
            && lastWrittenToken !== TokenKind.OpenParenToken
            && lastWrittenToken !== TokenKind.CommaToken
            && lastWrittenToken !== TokenKind.ColonToken
          ) {
            result += '\n'
          }

          writeText(scanner.getTokenText())
          lastHadSeparatingNewLine = false
      }
    }

    return result

    function isTripleSlashDirective() {
      const tokenText = scanner.getTokenText()
      return tokenText.startsWith('///') && tokenText.includes('<')
    }

    function writeSingleLineComment() {
      writeText(scanner.getTokenText())

      const nextToken = scanner.scan()
      if (nextToken === TokenKind.NewLineTrivia) {
        writeText(scanner.getTokenText())
      } else if (nextToken !== TokenKind.EndOfFileToken) {
        throw new Error(
          'Unexpected scenario where the token after a comment was a '
          + nextToken
          + '.'
        )
      }
    }

    function isJsDoc() {
      const tokenText = scanner.getTokenText()
      return tokenText.startsWith('/**')
    }

    function writeJsDoc() {
      writeText(scanner.getTokenText().replace(/^\s+\*/gm, ' *'))
    }

    function writeText(text: string) {
      const token = scanner.getToken()

      if (lastWrittenToken != null && isAlphaNumericToken(token) && isAlphaNumericToken(lastWrittenToken) && !wasLastWrittenNewLine()) {
        result += ' '
      }

      result += text
      lastWrittenToken = token
    }

    function wasLastWrittenNewLine() {
      return result.charCodeAt(result.length - 1) === newLineCharCode
    }
  }

  function isAlphaNumericToken(token: TokenKind) {
    return token === TokenKind.Keyword || token === TokenKind.Identifier
  }
}

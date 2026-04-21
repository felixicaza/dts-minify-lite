export function isNewLine(character: number) {
  return character === 10 || character === 13
}

export function isWhitespace(character: number) {
  return (
    character === 9 // \t
    || character === 11 // \v
    || character === 12 // \f
    || character === 32 // space
    || character === 160 // nbsp
    || character === 65279 // bom
  )
}

export function isIdentifierStart(character: number) {
  return (
    (character >= 65 && character <= 90) // A-Z
    || (character >= 97 && character <= 122) // a-z
    || character === 36 // $
    || character === 95 // _
  )
}

export function isIdentifierPart(character: number) {
  return (
    isIdentifierStart(character)
    || (character >= 48 && character <= 57) // 0-9
  )
}

export function isDigit(character: number) {
  return character >= 48 && character <= 57
}

export function isHexDigit(character: number) {
  return (
    (character >= 48 && character <= 57) // 0-9
    || (character >= 65 && character <= 70) // A-F
    || (character >= 97 && character <= 102) // a-f
  )
}

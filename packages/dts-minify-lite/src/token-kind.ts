export enum TokenKind {
  EndOfFileToken = 0,
  NewLineTrivia = 1,
  WhitespaceTrivia = 2,
  SingleLineCommentTrivia = 3,
  MultiLineCommentTrivia = 4,
  Identifier = 5,
  Keyword = 6,
  SemicolonToken = 7,
  CloseBraceToken = 8,
  OpenBraceToken = 9,
  OpenParenToken = 10,
  CommaToken = 11,
  ColonToken = 12,
  Other = 13
}

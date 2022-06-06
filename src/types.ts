export type TokenType = (
    | "KEYWORD"
    | "PLUS"
    | "MINUS"
    | "MUL"
    | "DIV"
    | "LPAREN"
    | "RPAREN"
    | "INC"
    | "DEINC"
    | "GT"
    | "LT"
    | "GTE"
    | "LTE"
    | "EE"
    | "NE"
    | "NUMBER"
    | "STRING"
    | "IDENTIFIER"
    | "NEWLINE"
    | "COMMA"
    | "DOT"
    | "LSQUARE"
    | "RSQUARE"
    | "EOF"
);

export type UniErr = {
    log: () => void;
}
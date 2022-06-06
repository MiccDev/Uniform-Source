import { keywords, letters, nums } from "../constants";
import { ExpectedCharError, IllegalCharError, Position } from "../utils";
import { Token } from "./Token";
import { TokenType, UniErr } from '../types';

export class Lexer {

    private fn: string;
    private data: string;
    private currentChar: string;
    private pos: Position;

    constructor(fn: string, data: string) {
        this.fn = fn;
        this.data = data;
        this.currentChar = null!;
        this.pos = new Position(-1, 0, -1, fn, data);
        this.advance();
    }

    advance() {
        this.pos.advance(this.currentChar);
        this.currentChar = this.pos.idx < this.data.length ? this.data[this.pos.idx] : null!;
    }

    tokenize(): { tokens: Token[], error: UniErr } {
        let tokens: Token[] = [];

        while(this.currentChar != null) {
            if(" \t\r".includes(this.currentChar)) {
                this.advance();
            } else if(this.currentChar == "#") {
                this.skipComment();
            } else if(this.currentChar == "\n") {
                tokens.push(new Token("NEWLINE", null!, this.pos));
                this.advance();
            } else if(nums.includes(this.currentChar)) {
                tokens.push(this.makeNumber());
            } else if(letters.includes(this.currentChar)) {
                tokens.push(this.makeIdentifier());
            } else if(this.currentChar == '"') {
                tokens.push(this.makeString());
            } else if(this.currentChar == "+") {
                tokens.push(this.makePlus());
            } else if(this.currentChar == "-") {
                tokens.push(this.makeMinus());
            } else if(this.currentChar == "*") {
                tokens.push(new Token("MUL", null!, this.pos));
                this.advance();
            } else if(this.currentChar == "/") {
                tokens.push(new Token("DIV", null!, this.pos));
                this.advance();
            } else if(this.currentChar == "(") {
                tokens.push(new Token("LPAREN", null!, this.pos));
                this.advance();
            }  else if(this.currentChar == ")") {
                tokens.push(new Token("RPAREN", null!, this.pos));
                this.advance();
            } else if(this.currentChar == '[') {
                tokens.push(new Token("LSQUARE", null!, this.pos));
                this.advance();
            } else if(this.currentChar == ']') {
                tokens.push(new Token("RSQUARE", null!, this.pos));
                this.advance();
            } else if(this.currentChar == '!') {
                let { token, error } = this.makeNotEqual();
                if(error) return { tokens: null!, error: error };
                tokens.push(token!);
            } else if(this.currentChar == '=') {
                let { token, error } = this.makeEqual();
                if(error) return { tokens: null!, error: error };
                tokens.push(token!);
            } else if(this.currentChar == '<') {
                tokens.push(this.makeGreaterThan());
            } else if(this.currentChar == '>') {
                tokens.push(this.makeLesserThan());
            } else if(this.currentChar == ',') {
                tokens.push(new Token("COMMA", null!, this.pos));
                this.advance();
            } else if(this.currentChar == '.') {
                tokens.push(new Token("DOT", null!, this.pos));
                this.advance();
            } else {
                let posStart = this.pos.copy();
                let char = this.currentChar;
                this.advance();
                return { tokens: null!, error: IllegalCharError(`Token '${char}' does not exist in Uniform.`, posStart, this.pos) };
            }
        }

        tokens.push(new Token("EOF", null!, this.pos));
        return { tokens, error: null! };
    }

    makePlus() {
        let tokType: TokenType = "PLUS";
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '+') {
            this.advance();
            tokType = "INC";
        }

        return new Token(tokType, null!, posStart, this.pos);
    }

    makeMinus() {
        let tokType: TokenType = "MINUS";
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '-') {
            this.advance();
            tokType = "DEINC";
        }

        return new Token(tokType, null!, posStart, this.pos);
    }

    makeEqual() {
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == "=") {
            this.advance();
            return { token: new Token("EE", null!, posStart, this.pos), error: null };
        }

        return { token: null, error: ExpectedCharError(`'=' (after '=')`, posStart, this.pos) };
    }

    makeNotEqual() {
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '=') {
            this.advance();
            return { token: new Token("NE", null!, posStart, this.pos), error: null};
        }

        this.advance();
        return { token: null, error: ExpectedCharError("'=' (after '!')", posStart, this.pos) }
    }

    makeLesserThan() {
        let tokType: TokenType = "LT";
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '=') {
            this.advance();
            tokType = "LTE";
        }

        return new Token(tokType, null!, posStart, this.pos);
    }

    makeGreaterThan() {
        let tokType: TokenType = "GT";
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '=') {
            this.advance();
            tokType = "GTE";
        }

        return new Token(tokType, null!, posStart, this.pos);
    }

    makeString(): Token {
        let string = "";
        let posStart = this.pos.copy();
        let escapeCharacter = false;
        this.advance();

        let escapeCharacters = {
            n: "\n",
            t: "\t"
        }

        while(this.currentChar != null && (this.currentChar != '"' || escapeCharacter)) {
            if(escapeCharacter) {
                string += (escapeCharacters as any)[this.currentChar];
            } else {
                if(this.currentChar == '\\') {
                    escapeCharacter = true;
                } else {
                    string += this.currentChar;
                }
            }

            this.advance();
            escapeCharacter = false;
        }

        this.advance();
        return new Token("STRING", string, posStart, this.pos);
    }

    makeNumber() {
        let numStr = "";
        let posStart = this.pos.copy();
        let digits = nums;
        digits += ".";

        while(this.currentChar != null && digits.includes(this.currentChar)) {
            numStr += this.currentChar;
            this.advance();
        }

        return new Token("NUMBER", numStr, posStart, this.pos);
    }

    makeIdentifier() {
        let idStr = "";
        let posStart = this.pos.copy();
        let letterNumbers = letters + nums;

        while(this.currentChar != null && letterNumbers.includes(this.currentChar)) {
            idStr += this.currentChar;
            this.advance();
        }

        let tokType: TokenType = keywords.includes(idStr) ? "KEYWORD" : "IDENTIFIER";
        return new Token(tokType, idStr, posStart, this.pos);
    }

    skipComment() {
        this.advance();

        while(this.currentChar != '\n') {
            this.advance();
        }

        this.advance();
    }

}
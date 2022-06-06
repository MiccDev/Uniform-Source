import { Node } from "./Node";
import { Token } from '../../lexer/Token';

export class NumberNode extends Node {
    tok: Token;

    constructor(tok: Token) {
        super("NumberNode");
        this.tok = tok;

        this.posStart = this.tok.posStart;
        this.posEnd = this.tok.posEnd;
    }

    toString() {
        return this.tok.toString();
    }

}
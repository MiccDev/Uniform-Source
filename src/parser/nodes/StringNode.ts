import { Node } from "./Node";
import { Token } from '../../lexer/Token';

export class StringNode extends Node {
    tok: Token;

    constructor(tok: Token) {
        super("StringNode");
        this.tok = tok;

        this.posStart = this.tok.posStart;
        this.posEnd = this.tok.posEnd;
    }

    toString() {
        return this.tok.toString();
    }

}
import { Node } from './Node';
import { Token } from '../../lexer/Token';

export class UnaryOpNode extends Node {
    opTok: Token;
    node: Node;

    constructor(opTok: Token, node: Node) {
        super("UnaryOpNode");
        this.opTok = opTok;
        this.node = node;

        this.posStart = this.opTok.posStart;
        this.posEnd = this.opTok.posEnd;
    }

    toString() {
        return `(${this.opTok.toString()}, ${this.node.toString()})`;
    }

}
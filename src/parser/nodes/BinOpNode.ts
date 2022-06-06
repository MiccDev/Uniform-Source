import { Node } from "./Node";
import { Token } from '../../lexer/Token';

export class BinOpNode extends Node {
    leftNode: Node;
    opTok: Token;
    rightNode: Node;

    constructor(leftNode: Node, opTok: Token, rightNode: Node) {
        super("BinOpNode");
        this.leftNode = leftNode;
        this.opTok = opTok;
        this.rightNode = rightNode;
    }

}
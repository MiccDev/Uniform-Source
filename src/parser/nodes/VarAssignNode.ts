import { Node } from './Node';
import { Token } from '../../lexer/Token';

export class VarAssignNode extends Node {
    varNameTok: Token;
    valueNode: Node;
    shouldBeConstant: boolean;

    constructor(varNameTok: Token, valueNode: Node, shouldBeConstant: boolean) {
        super("VarAssignNode");
        this.varNameTok = varNameTok;
        this.valueNode = valueNode;
        this.shouldBeConstant = shouldBeConstant;

        this.posStart = this.varNameTok.posStart;
        this.posEnd = this.valueNode.posEnd;
    }
}
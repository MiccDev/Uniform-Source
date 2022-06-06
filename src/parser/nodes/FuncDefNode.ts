import { Node } from './Node';
import { Token } from '../../lexer/Token';

export class FuncDefNode extends Node {
    varNameTok: Token;
    argNameToks: Token[];
    bodyNode: Node;
    shouldAutoReturn: boolean;

    constructor(varNameTok: Token, argNameToks: Token[], bodyNode: Node, shouldAutoReturn: boolean) {
        super("FuncDefNode");
        this.varNameTok = varNameTok;
        this.argNameToks = argNameToks;
        this.bodyNode = bodyNode;
        this.shouldAutoReturn = shouldAutoReturn;

        if(this.varNameTok) {
            this.posStart = this.varNameTok.posStart;
        } else if(this.argNameToks.length > 0) {
            this.posStart = this.argNameToks[0].posStart;
        } else {
            this.bodyNode.posStart;
        }

        this.posEnd = this.bodyNode.posEnd;
    }

}
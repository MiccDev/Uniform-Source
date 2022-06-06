import { Node } from './Node';
import { Token } from '../../lexer/Token';

export class VarAccessNode extends Node {
    varNameTok: Token;
    
    constructor(varNameTok: Token) {
        super("VarAccessNode");
        this.varNameTok = varNameTok;

        this.posStart = this.varNameTok.posStart;
        this.posEnd = this.varNameTok.posEnd;
    }

}
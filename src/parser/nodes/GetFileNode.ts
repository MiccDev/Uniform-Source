import { Token } from "../../lexer/Token";
import { Node } from "./Node";

export class GetFileNode extends Node {
    fileNameTok: Token;
    
    constructor(fileNameTok: Token) {
        super("GetFileNode");
        this.fileNameTok = fileNameTok;

        this.posStart = this.fileNameTok.posStart;
        this.posEnd = this.fileNameTok.posEnd;
    }

}
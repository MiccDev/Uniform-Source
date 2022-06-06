import { Position } from "../../utils";
import { Node } from "./Node";

export class ReturnNode extends Node {

    nodeToReturn: Node;

    constructor(nodeToReturn: Node, posStart: Position, posEnd: Position) {
        super("ReturnNode");
        this.nodeToReturn = nodeToReturn;
        
        this.posStart = posStart;
        this.posEnd = posEnd;
    }

}
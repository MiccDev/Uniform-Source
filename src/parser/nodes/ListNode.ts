import { Position } from "../../utils";
import { Node } from "./Node";

export class ListNode extends Node {

    elementNodes: Node[];

    constructor(elementNodes: Node[], posStart: Position, posEnd: Position) {
        super("ListNode");
        this.elementNodes = elementNodes;

        this.posStart = posStart;
        this.posEnd = posEnd;
    }

}
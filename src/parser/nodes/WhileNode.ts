import { Node } from "./Node";

export class WhileNode extends Node {
    conditionNode: Node;
    bodyNode: Node;
    shouldReturnNull!: any;

    constructor(conditionNode: Node, bodyNode: Node) {
        super("WhileNode");
        this.conditionNode = conditionNode;
        this.bodyNode = bodyNode;

        this.posStart = this.conditionNode.posStart;
        this.posEnd = this.bodyNode.posEnd;
    }
}
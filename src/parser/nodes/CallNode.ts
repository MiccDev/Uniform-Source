import { Node } from './Node';

export class CallNode extends Node {
    nodeToCall: Node;
    argNodes: Node[];
    
    constructor(nodeToCall: Node, argNodes: Node[]) {
        super("CallNode");
        this.nodeToCall = nodeToCall;
        this.argNodes = argNodes;

        this.posStart = this.nodeToCall.posStart;

        if(this.argNodes.length > 0) {
            this.posEnd = this.argNodes[this.argNodes.length - 1].posEnd;
        } else {
            this.posEnd = this.nodeToCall.posEnd;
        }
    }

}
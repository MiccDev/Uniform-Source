import { Node } from "./Node";

export class IfNode extends Node {
    cases: Array<Array<Node>>;
    elseCase: Node[];
    
    constructor(cases: Array<Array<Node>>, elseCase: Node[]) {
        super("IfNode");
        this.cases = cases;
        this.elseCase = elseCase;

        this.posStart = this.cases[0][0].posStart;
        this.posEnd = ((this.elseCase || this.cases[this.cases.length - 1])[0]).posEnd;
    }

}
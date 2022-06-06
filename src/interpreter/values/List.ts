import { Value } from "./Value";

export class List extends Value {
    elements: Value[];

    constructor(elements: Value[]) {
        super("List");
        this.elements = elements;
    }

    copy() {
        let copy = new List(this.elements);
        copy.setPos(this.posStart, this.posEnd);
        copy.setContext(this.context);
        return copy;
    }

    toString() {
        let n: string[] = [];
        this.elements.forEach(x => {
            n.push(x.toString());
        });
        return `[${n.join(", ")}]`;
    }

    logging() {
        let n: string[] = [];
        this.elements.forEach(x => {
            if(x) n.push(x.toString());
        });
        return `[${n.join(", ")}]`;
    }

}
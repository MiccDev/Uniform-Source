import { Position } from "../../utils";

export class Node {
    name: string;
    posStart!: Position;
    posEnd!: Position;

    constructor(name: string)  {
        this.name = name;
    }
}
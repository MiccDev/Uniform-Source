import { Context } from "./Context";
import { SymbolTable } from "./SymbolTable";
import { UniMath } from '../uniform/UniMath';

export class Uniform extends Context {

    constructor() {
        super("uniform");
        this.symbolTable = new SymbolTable();

        this.createObjs();
    }

    createObjs() {
        this.symbolTable.set("math", new UniMath());
    }

}
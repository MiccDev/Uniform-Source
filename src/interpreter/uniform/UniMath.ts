import { UniErr } from "../../types";
import { SymbolTable } from "../context/SymbolTable";
import { BuiltInFunction } from "../values/BuiltInFunction";
import { Number } from "../values/Number";
import { Value } from "../values/Value";

export class UniMath extends Value {

    constructor() {
        super("UniMath");

        this.propreties = new SymbolTable();
        
        this.propreties.set("pi", new Number(Math.PI));

        this.propreties.set("random", new BuiltInFunction("random"));
        this.propreties.set("round", new BuiltInFunction("round"));
        this.propreties.set("floor", new BuiltInFunction("floor"));
        this.propreties.set("sin", new BuiltInFunction("sin"));
        this.propreties.set("cos", new BuiltInFunction("cos"));
    }

    dottedBy(other: Value): any {
        return this.propreties.get(other.name);
    }

    copy() {
        let copy = new UniMath();
        copy.setPos(this.posStart, this.posEnd);
        copy.setContext(this.context);
        return copy;
    }

    logging() {
        let result = this.propreties.symbols;
        return result;
    }

}
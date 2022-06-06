import { UniErr } from "../../types";
import { SymbolTable } from "../context/SymbolTable";
import { BuiltInFunction } from "./BuiltInFunction";
import { Number } from "./Number";
import { Value } from "./Value";

export class String extends Value {
    value: string;

    constructor(value: string) {
        super("String");
        this.value = value;

        this.propreties.set("len", new Number(value.length));
        // this.propreties.set("testFunc", new BuiltInFunction("testFunc"));
    }

    addedTo(other: Value): any {
        if(other instanceof String) {
            return new String(this.value + other.value).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonEq(other: Value): any {
        if(other instanceof String) {
            return this.value == other.value ? Number.true : Number.false;
        } else {
            return Number.false;
        }
    }

    getComparisonNe(other: Value): any {
        if(other instanceof String) {
            return this.value != other.value ? Number.true : Number.false;
        } else {
            return Number.false;
        }
    }

    oredBy(other: String): any {
        return this.value || other.value ? Number.true : Number.false;
    }

    andedBy(other: String): any {
        return this.value && other.value ? Number.true : Number.false;
    }

    dottedBy(other: Value): any {
        if(other instanceof String) {
            return this.value != other.value ? Number.true : Number.false;
        } else {
            return Number.false;
        }
    }

    isTrue() {
        return this.value.length > 0;
    }

    copy() {
        let copy = new String(this.value);
        copy.setContext(this.context);
        copy.setPos(this.posStart, this.posEnd);
        return copy;
    }

    toString() {
        return `"${this.value}"`;
    }

    logging() {
        return `${this.value}`;
    }
}
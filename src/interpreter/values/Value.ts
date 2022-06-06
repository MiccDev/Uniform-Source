import { Position, RTError } from "../../utils";
import { SymbolTable } from "../context/SymbolTable";
import { Context } from '../context/Context';

export class Value extends SymbolTable {
    name: string;
    posStart!: Position;
    posEnd!: Position;
    context!: Context;
    propreties!: SymbolTable;

    constructor(name: string, parent: SymbolTable=null!) {
        super(parent);
        this.name = name;

        this.setPos();
        this.setContext();
        this.setPropreties();
    }

    addedTo(other: Value) {
        return this.illegalOperation(other)
    }

    subbedBy(other: Value) {
        return this.illegalOperation(other)
    }

    multedBy(other: Value) {
        return this.illegalOperation(other)
    }

    divedBy(other: Value) {
        return this.illegalOperation(other)
    }

    getComparisonEq(other: Value) {
        return this.illegalOperation(other);
    }

    getComparisonNe(other: Value) {
        return this.illegalOperation(other);
    }

    getComparisonLt(other: Value) {
        return this.illegalOperation(other);
    }

    getComparisonGt(other: Value) {
        return this.illegalOperation(other);
    }

    getComparisonLte(other: Value) {
        return this.illegalOperation(other);
    }

    getComparisonGte(other: Value) {
        return this.illegalOperation(other);
    }

    andedBy(other: Value) {
        return this.illegalOperation(other);
    }

    oredBy(other: Value) {
        return this.illegalOperation(other);
    }

    dottedBy(other: Value) {
        return this.illegalOperation(other);
    }

    notted() {
        throw new Error(`No notted method defined for ${this.name}`);
    }

    isTrue() {
        return false;
        // throw new Error(`No isTrue method defined for ${this.name}`);
    }

    illegalOperation(self: Value, other: Value=null!) {
        if(!other) other = self;
        return RTError(
            'Illegal operation',
            self.context,
            self.posStart, other.posEnd
        );
    }

    setPos(posStart?: Position, posEnd?: Position): Value {
        this.posStart = posStart!;
        this.posEnd = posEnd!;
        return this;
    }

    setContext(context: Context=null!): Value {
        this.context = context;
        return this;
    }

    setPropreties(propreties: SymbolTable=new SymbolTable()) {
        this.propreties = propreties;
        return this;
    }

    copy(): Value {
        throw new Error(`No copy method defined for '${this.name}'`);
    }

    boolToNum(bool: boolean): number {
        return bool ? 1 : 0;
    }
}
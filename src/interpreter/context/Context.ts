import { Position } from "../../utils";
import { SymbolTable } from "./SymbolTable";

export class Context {
    symbolTable: SymbolTable;
    displayName: string;
    parent: Context;
    parentEntryPos: Position;

    constructor(displayName: string, parent: Context=null!, parentEntryPos: Position=null!) {
        this.displayName = displayName;
        this.parent = parent;
        this.parentEntryPos = parentEntryPos;
        this.symbolTable = null!;
    }
}
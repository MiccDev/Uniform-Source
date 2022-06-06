export class SymbolTable {
    symbols: { [name: string]: any };
    parent: SymbolTable;

    constructor(parent: SymbolTable=null!) {
        this.symbols = {};
        this.parent = parent;
    }

    get(name: string): any {
        let value = this.symbols[name];
        if(value == null && this.parent) {
            return this.parent.get(name);
        }
        return value;
    }

    set(name: string, value: any, constant: boolean=false) {
        value.constant = constant;
        this.symbols[name] = value;
    }

    remove(name: string) {
        delete this.symbols[name];
    }

    add(obj: object) {
        this.symbols = {
            ...this.symbols,
            ...obj
        }
    }
}
import { RTError } from "../../utils";
import { Context } from "../context/Context";
import { SymbolTable } from "../context/SymbolTable";
import { RTResult } from "../RTResult";
import { Value } from "./Value";

export class BaseFunction extends Value {
    funcName: string;
    
    constructor(funcName: string) {
        super("BaseFunction");
        this.funcName = funcName || "<anounymous>";
    }

    generateNewContext() {
        let newContext = new Context(this.funcName, this.context, this.posStart);
        newContext.symbolTable = new SymbolTable(newContext.parent.symbolTable);
        return newContext;
    }

    checkArgs(argNames: any[], args: any[]) {
        let res = new RTResult();

        if(args) {
            if(args.length > argNames.length) {
                return res.failure(RTError(
                    `${args.length - argNames.length} too many args passed into '${this.funcName}'`,
                    this.context,
                    this.posStart, this.posEnd
                ));
            }
    
            if(args.length < argNames.length) {
                return res.failure(RTError(
                    `${args.length - argNames.length} too few args passed into '${this.funcName}'`,
                    this.context,
                    this.posStart, this.posEnd
                ));
            }
    
        }

        return res.success(null!);
    }

    populateArgs(argNames: any[], args: any[], execCtx: Context) {
        if(args) {
            for(let i = 0; i < args.length; i++) {
                let argName = argNames[i];
                let argValue = args[i];
                argValue.setContext(execCtx);
                execCtx.symbolTable.set(argName, argValue);
            }
        }
    }

    checkAndPopulateArgs(argNames: any[], args: any[], execCtx: Context) {
        let res = new RTResult();
        res.register(this.checkArgs(argNames, args));
        if(res.shouldReturn()) return res;
        this.populateArgs(argNames, args, execCtx);
        return res.success(null!);
    }
}
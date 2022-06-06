import promptSync from "prompt-sync";
const prompt = promptSync({
    sigint: true
});

import { getattr } from "../../utils";
import { Context } from "../context/Context";
import { SymbolTable } from "../context/SymbolTable";
import { Interpreter } from "../Interpreter";
import { RTResult } from "../RTResult";
import { BaseFunction } from "./BaseFunction";
import { Number } from "./Number";
import { String } from "./String";

export class BuiltInFunction extends BaseFunction {
    functionArgs: SymbolTable;

    constructor(funcName: string) {
        super(funcName);

        this.functionArgs = new SymbolTable();

        this.functionArgs.set("out", [ "data" ]);
        this.functionArgs.set("in", [ "data" ]);

        this.functionArgs.set("random", []);
        this.functionArgs.set("floor", [ "x" ]);
        this.functionArgs.set("round", [ "x" ]);
        this.functionArgs.set("sin", [ "x" ]);
        this.functionArgs.set("cos", [ "x" ]);
    }

    execute(interpreter: Interpreter, args: any[]) {
        let res = new RTResult();
        let execCtx = this.generateNewContext();

        let methodName = `execute_${this.funcName}`;
        let method = getattr(this, methodName, this.noVisitMethod);

        res.register(this.checkAndPopulateArgs(this.functionArgs.get(this.funcName), args, execCtx));
        if(res.shouldReturn()) return res;

        let returnValue = res.register(method(execCtx));
        if(res.shouldReturn()) return res;
        return res.success(returnValue);
    }

    noVisitMethod(node: Node, context: Context) {
        throw new Error(`No execute_${this.funcName} method defined`);
    }

    copy() {
        let copy = new BuiltInFunction(this.funcName);
        copy.setContext(this.context);
        copy.setPos(this.posStart, this.posEnd);
        return copy;
    }

    toString() {
        return `<built-in function ${this.funcName}>`;
    }

    // ###################################################################

    execute_out(execCtx: Context) {
        console.log(execCtx.symbolTable.get("data").logging());
        return new RTResult().success(Number.null);
    }

    execute_in(execCtx: Context) {
        let returnValue = prompt(execCtx.symbolTable.get("data").logging());
        return new RTResult().success(new String(returnValue!));
    }

    // ###################################################################
    // #####    MATH
    // ###################################################################

    execute_random(execCtx: Context) {
        return new RTResult().success(new Number(Math.random()));
    }

    execute_floor(execCtx: Context) {
        return new RTResult().success(new Number(Math.floor(execCtx.symbolTable.get("x"))));
    }

    execute_round(execCtx: Context) {
        return new RTResult().success(new Number(Math.round(execCtx.symbolTable.get("x"))));
    }

    execute_sin(execCtx: Context) {
        return new RTResult().success(new Number(Math.sin(execCtx.symbolTable.get("x"))));
    }

    execute_cos(execCtx: Context) {
        return new RTResult().success(new Number(Math.cos(execCtx.symbolTable.get("x"))));
    }
}
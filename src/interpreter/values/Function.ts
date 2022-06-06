import { Node } from "../../parser/nodes/Node";
import { Interpreter } from "../Interpreter";
import { RTResult } from "../RTResult";
import { BaseFunction } from "./BaseFunction";
import { Number } from "./Number";

export class Function extends BaseFunction {
    bodyNode: Node;
    argNames: string[];
    shouldAutoReturn: boolean;

    constructor(funcName: string, bodyNode: Node, argNames: string[], shouldAutoReturn: boolean) {
        super(funcName);
        this.bodyNode = bodyNode;
        this.argNames = argNames;
        this.shouldAutoReturn = shouldAutoReturn;

        this.name = "Function";
    }

    execute(interpreter: Interpreter, args: any[]) {
        let res = new RTResult();
        let execCtx = this.generateNewContext();

        res.register(this.checkAndPopulateArgs(this.argNames, args, execCtx));
        if(res.shouldReturn()) return res;

        let value = res.register(interpreter.visit(this.bodyNode, execCtx));
        if(res.shouldReturn() && res.funcReturnValue == null) return res;
        let retValue = (this.shouldAutoReturn ? value : null) || res.funcReturnValue || Number.null;
        return res.success(retValue);
    }

    copy() {
        let copy = new Function(this.name, this.bodyNode, this.argNames, this.shouldAutoReturn);
        copy.setContext(this.context);
        copy.setPos(this.posStart, this.posEnd);
        return copy;
    }

    toString() {
        return `<function ${this.name}>`;
    }
}
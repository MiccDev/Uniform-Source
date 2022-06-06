import { Node } from '../parser/nodes/Node';
import { Context } from './context/Context';
import { getattr, isError, RTError } from '../utils';
import { RTResult } from './RTResult';
import { Number } from './values/Number';
import { NumberNode } from '../parser/nodes/NumberNode';
import { StringNode } from '../parser/nodes/StringNode';
import { String } from './values/String';
import { ListNode } from '../parser/nodes/ListNode';
import { Value } from './values/Value';
import { List } from './values/List';
import { VarAccessNode } from '../parser/nodes/VarAccessNode';
import { VarAssignNode } from '../parser/nodes/VarAssignNode';
import { BinOpNode } from '../parser/nodes/BinOpNode';
import { UnaryOpNode } from '../parser/nodes/UnaryOpNode';
import { IfNode } from '../parser/nodes/IfNode';
import { WhileNode } from '../parser/nodes/WhileNode';
import { FuncDefNode } from '../parser/nodes/FuncDefNode';
import { Function } from './values/Function';
import { CallNode } from '../parser/nodes/CallNode';
import { ReturnNode } from '../parser/nodes/ReturnNode';
import { GetFileNode } from '../parser/nodes/GetFileNode';
import { run } from '../uniform';
import { BaseFunction } from './values/BaseFunction';
import { SymbolTable } from './context/SymbolTable';


export class Interpreter {
    constructor() {}

    visit(node: Node, context: Context) {
        let methodName = `visit_${node.name}`;
        let method = getattr(this, methodName, this.noVisitMethod);
        return method(node, context); 
    }

    noVisitMethod(node: Node, context: Context) {
        throw new Error(`No visit_${node.name} method defined`);
    }

    // ###############################################################

    visit_NumberNode(node: NumberNode, context: Context) {
        return new RTResult().success(
            new Number(parseFloat(node.tok.value)).setContext(context).setPos(node.posStart, node.posEnd)
        );
    }

    visit_StringNode(node: StringNode, context: Context) {
        return new RTResult().success(
            new String(node.tok.value).setContext(context).setPos(node.posStart, node.posEnd)
        );
    }

    visit_ListNode(node: ListNode, context: Context) {
        let res = new RTResult();
        let elements: Value[] = [];

        node.elementNodes.forEach(elementNode => {
            elements.push(res.register(this.visit(elementNode, context)));
        });
        if(res.error) return res;

        return res.success(
            new List(elements).setContext(context).setPos(node.posStart, node.posEnd)
        );
    }

    visit_VarAccessNode(node: VarAccessNode, context: Context) {
        let res = new RTResult();
        let varName = node.varNameTok.value;
        let value = context.symbolTable.get(varName);

        if(!value) {
            return res.failure(RTError(
                `'${varName}' is not defined`,
                context,
                node.posStart, node.posEnd
            ));
        }

        value = value.copy().setPos(node.posStart, node.posEnd).setContext(context);
        return res.success(value);
    }

    visit_VarAssignNode(node: VarAssignNode, context: Context) {
        let res = new RTResult();
        let varName = node.varNameTok.value;
        if(context.symbolTable.get(varName)?.constant) {
            return res.failure(RTError(
                `'${varName}' has already been defined as constant.`,
                context,
                node.posStart, node.posEnd 
            ));
        }

        let value = res.register(this.visit(node.valueNode, context));
        if(res.error) return res;

        context.symbolTable.set(varName, value, node.shouldBeConstant);
        return res.success(value);
    }

    visit_BinOpNode(node: BinOpNode, context: Context) {
        let res = new RTResult();

        let left = res.register(this.visit(node.leftNode, context));
        if(res.error) return res;
        context.symbolTable.add(left.propreties.symbols);

        var right = res.register(this.visit(node.rightNode, context));
        if(res.error) return res;

        if(node.opTok.type == "PLUS") {
            var result = left.addedTo(right);
            if(isError(result)) {
                return res.failure(result);
            }
            return res.success((result as Value).setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == "MINUS") {
            var result = left.subbedBy(right);
            if(isError(result)) {
                return res.failure(result);
            }
            return res.success((result as Value).setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == "MUL") {
            var result = left.multedBy(right);
            if(isError(result)) {
                return res.failure(result);
            }
            return res.success((result as Value).setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == "DIV") {
            var result = left.divedBy(right);
            if(isError(result)) {
                return res.failure(result);
            }
            return res.success((result as Value).setPos(node.posStart, node.posEnd));
        }  else if(node.opTok.type == "EE") {
            var result = left.getComparisonEq(right);
            if(isError(result)) {
                return res.failure(result);
            }
            return res.success((result as Value).setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == "NE") {
            var result = left.getComparisonNe(right);
            if(isError(result)) {
                return res.failure(result);
            }
            return res.success((result as Value).setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == "LT") {
            var result = left.getComparisonLt(right);
            if(isError(result)) {
                return res.failure(result);
            }
            return res.success((result as Value).setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == "GT") {
            var result = left.getComparisonGt(right);
            if(isError(result)) {
                return res.failure(result);
            }
            return res.success((result as Value).setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == "LTE") {
            var result = left.getComparisonLte(right);
            if(isError(result)) {
                return res.failure(result);
            }
            return res.success((result as Value).setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == "GTE") {
            var result = left.getComparisonGte(right);
            if(isError(result)) {
                return res.failure(result);
            }
            return res.success((result as Value).setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == "DOT") {
            return res.success((right as Value).setPos(node.posStart, node.posEnd).setContext(context));
        }

        // if(error) {
        //     return res.failure(error);
        // } else {
        //     return res.success(result.setPos(node.posStart, node.posStart));
        // }
        return res.failure(RTError(
            `There is no '${node.opTok.type.toLowerCase()}' operator.`,
            context,
            left.posStart, right.posStart
        ))
    }

    visit_UnaryOpNode(node: UnaryOpNode, context: Context) {
        let res = new RTResult();
        let number = res.register(this.visit(node.node, context));
        if(res.error) return res;

        let result = null;
        let error = null;

        if(node.opTok.type == "MINUS") {
            if(number.name == "Number") {
                result = number.multedBy(new Number(-1));
            } else {
                error = result;
            }
        } else if(node.opTok.matches("KEYWORD", "not")) {
            if(number.name == "Number") {
                result = number.notted();
            } else {
                error = result;
            }
        } else if(node.opTok.type == "INC") {
            if(number.name == "Number") {
                result = number.addedTo(new Number(1));
                context.symbolTable.set((node.node as VarAccessNode).varNameTok.value, result);
            } else {
                error = result;
            }
        } else if(node.opTok.type == "DEINC") {
            if(number.name == "Number") {
                result = number.subbedBy(new Number(1));
                context.symbolTable.set((node.node as VarAccessNode).varNameTok.value, result);
            } else {
                error = result;
            }
        }

        if(error) {
            return res.failure(error); 
        } else {
            return res.success(number.setPos(node.posStart, node.posEnd));
        }
    }

    visit_IfNode(node: IfNode, context: Context) {
        let res = new RTResult();
        let exprValue: Value | null = null;
        var shouldReturnNull = null;
        let conditionValue = null;
        let returnFromFor = false;

        // console.log(node);

        node.cases.forEach(c => {
            let condition = c[0];
            let expr = c[1];
            shouldReturnNull = c[2];
            conditionValue = res.register(this.visit(condition, context));
            if(res.error) return res;

            if(conditionValue.isTrue()) {
                exprValue = res.register(this.visit(expr, context));
                if(res.error) return res;
                returnFromFor = true;
            }
        });
        if(returnFromFor) return res.success(shouldReturnNull != null ? Number.null : exprValue!);

        if(node.elseCase) {
            let [ expr, shouldReturnNull ] = node.elseCase;
            let exprValue = res.register(this.visit(expr, context));
            if(res.error) return res;
            return res.success(shouldReturnNull ? Number.null : exprValue);
        }

        return res.success(Number.null);
    }

    visit_WhileNode(node: WhileNode, context: Context) {
        let res = new RTResult();
        let elements = [];

        while(true) {
            let condition = res.register(this.visit(node.conditionNode, context));
            if(res.error) return res;

            if(!condition.isTrue()) break;

            let value = res.register(this.visit(node.bodyNode, context));
            if(res.shouldReturn() && !res.loopShouldContinue && !res.loopShouldBreak) return res;

            if(res.loopShouldContinue)
                continue;

            if(res.loopShouldBreak)
                break;

            elements.push(value);
        }

        return res.success(
            node.shouldReturnNull ? Number.null : new List(elements).setContext(context).setPos(node.posStart, node.posEnd)
        );
    }

    visit_FuncDefNode(node: FuncDefNode, context: Context) {
        let res = new RTResult();

        let funcName = node.varNameTok.value ? node.varNameTok.value : null;
        let bodyNode = node.bodyNode;
        let argNames: string[] = [];
        node.argNameToks.forEach(argName => {
            argNames.push(argName.value);
        });
        let funcValue = new Function(funcName!, bodyNode, argNames, node.shouldAutoReturn).setContext(context).setPos(node.posStart, node.posEnd);

        if(node.varNameTok) {
            context.symbolTable.set(funcName!, funcValue);
        }
        
        return res.success(funcValue);
    }

    visit_CallNode(node: CallNode, context: Context) {
        let res = new RTResult();
        let args: Value[] = [];

        let valueToCall = res.register(this.visit(node.nodeToCall, context));
        if(res.error) return res;
        valueToCall = (valueToCall.copy().setPos(node.posStart, node.posEnd));

        node.argNodes.forEach(argNode => {
            args.push(res.register(this.visit(argNode, context)));
        });
        if(res.shouldReturn()) return res;

        let returnValue = res.register((valueToCall as Function).execute(this, args));
        if(res.shouldReturn()) return res;
        returnValue = returnValue.copy().setPos(node.posStart, node.posEnd).setContext(context);
        return res.success(returnValue);
    }

    visit_ReturnNode(node: ReturnNode, context: Context) {
        let res = new RTResult();

        if(node.nodeToReturn) {
            var value = res.register(this.visit(node.nodeToReturn, context));
            if(res.shouldReturn()) return res;
        } else {
            value = Number.null;
        }

        return res.successReturn(value);
    }

    visit_GetFileNode(node: GetFileNode, context: Context) {
        let res = new RTResult();

        let fileName = node.fileNameTok.value;
        // if(fileName == "uniform") {
        //     context.symbolTable.symbols = {
        //         ...new Uniform().symbolTable.symbols,
        //         ...context.symbolTable.symbols
        //     }
        //     return res.success(Number.null);
        // }

        let ctx = run(fileName, context.symbolTable);

        context.symbolTable.symbols = {
            ...ctx.symbolTable.symbols,
            ...context.symbolTable.symbols
        }

        return res.success(Number.null);
    }

}
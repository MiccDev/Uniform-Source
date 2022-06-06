import { Token } from "../lexer/Token";
import { getStringValue, InvalidSyntaxError, UniformError } from '../utils';
import { TokenType, UniErr } from '../types';
import { Node } from "./nodes/Node";
import { ListNode } from "./nodes/ListNode";
import { ReturnNode } from "./nodes/ReturnNode";
import { BinOpNode } from "./nodes/BinOpNode";
import { WhileNode } from "./nodes/WhileNode";
import { NumberNode } from "./nodes/NumberNode";
import { StringNode } from "./nodes/StringNode";
import { VarAccessNode } from "./nodes/VarAccessNode";
import { CallNode } from "./nodes/CallNode";
import { UnaryOpNode } from "./nodes/UnaryOpNode";
import { VarAssignNode } from "./nodes/VarAssignNode";
import { FuncDefNode } from "./nodes/FuncDefNode";
import { IfNode } from "./nodes/IfNode";
import { GetFileNode } from "./nodes/GetFileNode";

function extend(arry: any[], otherArray: any[]): any[] {
    otherArray.forEach((v) => { arry.push(v) });
    return otherArray;
}

export class ParseResult {
    error: UniErr;
    node: Node|any;
    lastRegisteredAdvanceCount: number;
    advanceCount: number;
    toReverseCount: number;

    constructor() {
        this.error = null!;
        this.node = null!;
        this.lastRegisteredAdvanceCount = 0;
        this.advanceCount = 0;
        this.toReverseCount = 0;
    }

    registerAdvancement() {
        this.lastRegisteredAdvanceCount = 1;
        this.advanceCount++;
    }

    register(res: ParseResult) {
        this.lastRegisteredAdvanceCount = res.advanceCount;
        this.advanceCount += res.advanceCount;
        if(res.error) this.error = res.error;
        return res.node;
    }

    tryRegister(res: ParseResult): Node {
        if(res.error) {
            this.toReverseCount = res.advanceCount;
            return null!;
        }
        return this.register(res);
    }

    success(node: Node|any): ParseResult {
        this.node = node;
        return this;
    }

    failure(error: any): ParseResult {
        if(!this.error || this.advanceCount == 0) {
            this.error = error;
        }
        return this;
    }
}

export class Parser {

    tokens: Token[];
    tokIdx: number;
    currentTok!: Token;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.tokIdx = -1;
        this.advance();
    }

    advance() {
        this.tokIdx++;
        this.updateCurrentTok();
        return this.currentTok;
    }

    reverse(amount: number=1) {
        this.tokIdx -= amount;
        this.updateCurrentTok();
        return this.currentTok;
    }

    updateCurrentTok() {
        if(this.tokIdx >= 0 && this.tokIdx < this.tokens.length) {
            this.currentTok = this.tokens[this.tokIdx];
        }
    }

    parse(): ParseResult {
        let res = this.statements();
        if(!res.error && this.currentTok.type != "EOF") {
            return res.failure(UniformError(
                "Invalid Syntax", "Expected any token.", 
                this.currentTok.posStart, this.currentTok.posEnd
            ));
        }
        return res;
    }

    // #######################################################

    statements(): ParseResult {
        let res = new ParseResult();
        let statements = [];
        let posStart = this.currentTok.posStart.copy();

        while(this.currentTok.type == "NEWLINE") {
            res.registerAdvancement();
            this.advance();
        }

        let statement = res.register(this.statement());
        if(res.error) return res;
        statements.push(statement);

        let moreStatements = true;

        while(true) {
            let newLineCount = 0;
            while((this.currentTok.type as TokenType) == "NEWLINE") {
                res.registerAdvancement();
                this.advance();
                newLineCount++;
            }
            if(newLineCount == 0) {
                moreStatements = false;
            }

            if(!moreStatements) break;
            statement = res.tryRegister(this.statement());
            if(!statement) {
                this.reverse(res.toReverseCount);
                moreStatements = false;
                continue;
            }
            statements.push(statement);
        }

        return res.success(new ListNode(
            statements,
            posStart,
            this.currentTok.posEnd.copy()
        ));
    }

    statement() {
        let res = new ParseResult();
        let posStart = this.currentTok.posStart.copy();

        if(this.currentTok.matches("KEYWORD", "return")) {
            res.registerAdvancement();
            this.advance();

            let expr = res.tryRegister(this.expr());
            if(!expr) {
                this.reverse(res.toReverseCount);
            }
            return res.success(new ReturnNode(expr, posStart, this.currentTok.posStart.copy()));
        }

        let expr = res.register(this.expr());
        if(res.error) {
            return res.failure(InvalidSyntaxError(
                "Expected 'return', 'put', 'if', 'while', 'task', number, identifier, '+', '-', '(' or '['",
                this.currentTok.posStart, this.currentTok.posEnd
            ));
        }
        return res.success(expr);
    }

    atom() {
        let res = new ParseResult();
        let tok = this.currentTok;

        if(tok.type == "NUMBER") {
            res.registerAdvancement();
            this.advance();
            return res.success(new NumberNode(tok));
        } else if(tok.type == "STRING") {
            res.registerAdvancement();
            this.advance();
            return res.success(new StringNode(tok));
        } else if(tok.type == "IDENTIFIER") {
            res.registerAdvancement();
            this.advance();
            return res.success(new VarAccessNode(tok));
        } else if(tok.type == "LPAREN") {
            res.registerAdvancement();
            this.advance();
            let expr = res.register(this.expr());
            if(res.error) return res;
            if(this.currentTok.type == "RPAREN") {
                res.registerAdvancement();
                this.advance();
                return res.success(expr);
            } else {
                return res.failure(InvalidSyntaxError(
                    "Expected ')'",
                    this.currentTok.posStart, this.currentTok.posEnd
                ));
            }
        } else if(tok.type == "LSQUARE") {
            let listExpr = res.register(this.listExpr());
            if(res.error) return res;
            return res.success(listExpr);
        } else if(tok.matches("KEYWORD", "get")) {
            let getExpr = res.register(this.getExpr());
            if(res.error != null) return res;
            return res.success(getExpr);
        } else if(tok.matches("KEYWORD", "if")) {
            let ifExpr = res.register(this.ifExpr());
            if(res.error) return res;
            return res.success(ifExpr);
        }else if(tok.matches("KEYWORD", "while")) {
            let whileExpr = res.register(this.whileExpr());
            if(res.error) return res;
            return res.success(whileExpr);
        } else if(tok.matches("KEYWORD", "task")) {
            let funcDef = res.register(this.funcDef());
            if(res.error) return res;
            return res.success(funcDef);
        }

        return res.failure(InvalidSyntaxError(
            "Expected number, identifier, '+', '-', '(', 'if', 'while', 'put', 'task' or 'task'",
            tok.posStart, tok.posEnd,
        ));
    }

    call() {
        let res = new ParseResult();
        let postfix = res.register(this.postfix());
        if(res.error) return res;

        if(this.currentTok.type == "LPAREN") {
            res.registerAdvancement();
            this.advance();
            let argNodes = [];

            if((this.currentTok.type as TokenType) == "RPAREN") {
                res.registerAdvancement();
                this.advance();
            } else {
                argNodes.push(res.register(this.expr()));
                if(res.error) {
                    return res.failure(InvalidSyntaxError(
                        `Expected ')', 'put', 'if', 'while', 'task', number, identifier, '+', '-' or '('`,
                        this.currentTok.posStart, this.currentTok.posEnd
                    ));
                }

                while((this.currentTok.type as TokenType) == "COMMA") {
                    res.registerAdvancement();
                    this.advance();

                    argNodes.push(res.register(this.expr()));
                    if(res.error) return res;
                }

                if((this.currentTok.type as TokenType) != "RPAREN") {
                    return res.failure(InvalidSyntaxError(
                        `Expected ',' or ')'`,
                        this.currentTok.posStart, this.currentTok.posEnd
                    ));
                }

                res.registerAdvancement();
                this.advance();
            }
            return res.success(new CallNode(postfix, argNodes));
        }
        return res.success(postfix);
    }

    postfix() {
        let res = new ParseResult();

        let atom = res.register(this.atom());
        if(res.error) return res;

        if(this.currentTok.type == "INC" || this.currentTok.type == "DEINC") {
            let tok = this.currentTok;
            res.registerAdvancement();
            this.advance();
            return res.success(new UnaryOpNode(tok, atom));
        }

        return res.success(atom);
    }

    factor() {
        let res = new ParseResult();
        let tok = this.currentTok;

        if((["PLUS", "MINUS"] as TokenType[]).includes(tok.type)) {
            res.registerAdvancement();
            this.advance();
            let factor = res.register(this.factor());
            if(res.error) return res;
            return res.success(new UnaryOpNode(tok, factor));
        }

        return this.call();
    }

    term() {
        return this.binOp(this.factor.bind(this), ["MUL", "DIV"] as TokenType[]);
    }

    arithExpr() {
        return this.binOp(this.term.bind(this), ["PLUS", "MINUS", "DOT"] as TokenType[]);
    }

    compExpr() {
        let res = new ParseResult();

        if(this.currentTok.matches("KEYWORD", 'not')) {
            let opTok = this.currentTok;
            res.registerAdvancement();
            this.advance();

            var node = res.register(this.arithExpr());
            if(res.error) return res;
            return res.success(new UnaryOpNode(opTok, node));
        }

        node = res.register(this.binOp(this.arithExpr.bind(this), ["EE", "NE", "LT", "GT", "LTE", "GTE"] as TokenType[]));

        if(res.error) {
            return res.failure(InvalidSyntaxError(
                "Expected number, identifier, '+', '-' or '('",
                this.currentTok.posStart, this.currentTok.posEnd
            ));
        }

        return res.success(node);
    }

    expr() {
        let res = new ParseResult();

        if(this.currentTok.matches("KEYWORD", 'put')) {
            res.registerAdvancement();
            this.advance();
            let shouldBeConstant = false;

            if(this.currentTok.type != "IDENTIFIER") {
                return res.failure(InvalidSyntaxError(
                    "Expected identifer",
                    this.currentTok.posStart, this.currentTok.posEnd
                ));
            } 

            let varName = this.currentTok;
            res.registerAdvancement();
            this.advance();

            let expr = res.register(this.expr());
            if(res.error) return res;

            if(this.currentTok.matches("KEYWORD", 'const')) {
                shouldBeConstant = true;
                res.registerAdvancement();
                this.advance();
            }

            return res.success(new VarAssignNode(varName, expr, shouldBeConstant));
        }

        let node = res.register(this.binOp(this.compExpr.bind(this), [("KEYWORD" + 'and'), ("KEYWORD" + 'or')]));
        if(res.error) {
            return res.failure(InvalidSyntaxError(
                "Expected 'put', int, float, identifier, '+', '-', '(' or 'non'",
                this.currentTok.posStart, this.currentTok.posEnd
            ));
        }

        return res.success(node);
    }

    getExpr() {
        let res = new ParseResult();

        if(!this.currentTok.matches("KEYWORD", "get")) {
            return res.failure(InvalidSyntaxError(
                "Expected 'get'",
                this.currentTok.posStart, this.currentTok.posEnd
            ));
        }

        res.registerAdvancement();
        this.advance();

        if(this.currentTok.type == "STRING") {
            let nameTok = this.currentTok;
            res.registerAdvancement();
            this.advance();
            
            return res.success(new GetFileNode(
                nameTok
            ));
        }

        return res.failure(InvalidSyntaxError(
            "Expected string",
            this.currentTok.posStart, this.currentTok.posEnd
        ));
    }

    funcDef() {
        let res = new ParseResult();

        if(!this.currentTok.matches("KEYWORD", "task")) {
            return res.failure(InvalidSyntaxError(
                "Expected 'task'",
                this.currentTok.posStart, this.currentTok.posEnd
            ));
        }

        res.registerAdvancement();
        this.advance();

        if(this.currentTok.type == "IDENTIFIER") {
            var varNameTok = this.currentTok;
            res.registerAdvancement();
            this.advance();
            if((this.currentTok.type as TokenType) != "LPAREN") {
                return res.failure(InvalidSyntaxError(
                    "Expected '('",
                    this.currentTok.posStart, this.currentTok.posEnd
                ));
            }
        } else {
            varNameTok = null!;
            if((this.currentTok.type as TokenType) != "LPAREN") {
                return res.failure(InvalidSyntaxError(
                    "Expected identifier or '('",
                    this.currentTok.posStart, this.currentTok.posEnd
                ));
            }
        }

        res.registerAdvancement();
        this.advance();
        let argNameToks = [];

        if(this.currentTok.type == "IDENTIFIER") {
            argNameToks.push(this.currentTok);
            res.registerAdvancement();
            this.advance();

            while((this.currentTok.type as TokenType) == "COMMA") {
                res.registerAdvancement();
                this.advance();

                if(this.currentTok.type != "IDENTIFIER") {
                    return res.failure(InvalidSyntaxError(
                        "Expected identifier",
                        this.currentTok.posStart, this.currentTok.posEnd
                    ));
                }

                argNameToks.push(this.currentTok);
                res.registerAdvancement();
                this.advance();
            }

            if((this.currentTok.type as TokenType) != "RPAREN") {
                return res.failure(InvalidSyntaxError(
                    "Expected ',' or ')'",
                    this.currentTok.posStart, this.currentTok.posEnd
                ));
            }
        } else {
            if((this.currentTok.type as TokenType) != "RPAREN") {
                return res.failure(InvalidSyntaxError(
                    "Expected identifier or ')'",
                    this.currentTok.posStart, this.currentTok.posEnd
                ));
            }
        }

        res.registerAdvancement();
        this.advance();

        // if(this.currentTok.type == TokenTypes.ARROW) {
        //     res.registerAdvancement();
        //     this.advance();

        //     let body = res.register(this.statement());
        //     if(res.error) return res;
    
        //     return res.success(new FuncDefNode(
        //         varNameTok,
        //         argNameToks,
        //         body,
        //         true
        //     ));
        // }

        if(this.currentTok.type != "NEWLINE") {
            return res.failure(InvalidSyntaxError(
                "Expected new line",
                this.currentTok.posStart, this.currentTok.posEnd
            ));
        }

        res.registerAdvancement();
        this.advance();

        let body = res.register(this.statements());
        if(res.error) return res;

        if(!this.currentTok.matches("KEYWORD", "end")) {
            return res.failure(InvalidSyntaxError(
                "Expected 'end'",
                this.currentTok.posStart, this.currentTok.posEnd
            ));
        }

        res.registerAdvancement();
        this.advance();

        return res.success(new FuncDefNode(
            varNameTok,
            argNameToks,
            body,
            false
        ));
    }

    listExpr() {
        let res = new ParseResult();
        let elementNodes = [];
        let posStart = this.currentTok.posStart.copy();

        if((this.currentTok.type as TokenType) != "LSQUARE") {
            return res.failure(InvalidSyntaxError(
                `Expected '['`,
                this.currentTok.posStart, this.currentTok.posEnd
            ));
        }

        res.registerAdvancement();
        this.advance();

        if(this.currentTok.type == "RSQUARE") {
            res.registerAdvancement();
            this.advance();
        } else {
            elementNodes.push(res.register(this.expr()));
            if(res.error) {
                return res.failure(InvalidSyntaxError(
                    "Expected ']', 'put', 'if', 'while', 'task', number, identifier, '+', '-', '(' or '['",
                    this.currentTok.posStart, this.currentTok.posEnd
                ));
            }

            while(this.currentTok.type == "COMMA") {
                res.registerAdvancement();
                this.advance();

                elementNodes.push(res.register(this.expr()));
                if(res.error) return res;
            }

            if((this.currentTok.type as TokenType) != "RSQUARE") {
                return res.failure(InvalidSyntaxError(
                    "Expected ',' or ']'",
                    this.currentTok.posStart, this.currentTok.posEnd
                ));
            }

            res.registerAdvancement();
            this.advance();
        }

        return res.success(new ListNode(
            elementNodes,
            posStart,
            this.currentTok.posEnd.copy()
        ));
    }

    ifExpr() {
        let res = new ParseResult();
        let allCases = res.register(this.ifExprCases('if'));
        if(res.error) return res;
        let { c: cases, elseCase } = allCases;
        return res.success(new IfNode(cases, elseCase));
    }

    ifExprB() {
        return this.ifExprCases('elif');
    }

    ifExprC() {
        let res = new ParseResult();
        let elseCase = null;

        if(this.currentTok.matches("KEYWORD", "else")) {
            res.registerAdvancement();
            this.advance();

            if(this.currentTok.type == "NEWLINE") {
                res.registerAdvancement();
                this.advance();

                let statements = res.register(this.statements());
                if(res.error) return res;
                elseCase = [ statements, true ];

                if(this.currentTok.matches("KEYWORD", "end")) {
                    res.registerAdvancement();
                    this.advance();
                } else {
                    return res.failure(InvalidSyntaxError(
                        "Expected 'end'",
                        this.currentTok.posStart, this.currentTok.posEnd
                    ));
                }
            } else {
                let expr = res.register(this.statement());
                if(res.error) return res;
                elseCase = [ expr, false ];
            }
        }
        return res.success(elseCase);
    }

    ifExprBorC() {
        let res = new ParseResult();
        var c = [];
        var elseCase = null;

        if(this.currentTok.matches("KEYWORD", 'elif')) {
            let allCases = res.register(this.ifExprB());
            if(res.error) return res;
            c = allCases.c;
            elseCase = allCases.elseCase;
        } else {
            elseCase = res.register(this.ifExprC()!);
            if(res.error) return res;
        }

        return res.success({ c, elseCase });
    }

    ifExprCases(caseKeyword: string) {
        let res = new ParseResult();
        var cases = [];
        var elseCase = null;

        if(!this.currentTok.matches("KEYWORD", caseKeyword)) {
            return res.failure(InvalidSyntaxError(
                `Expected '${caseKeyword}'`,
                this.currentTok.posStart, this.currentTok.posEnd
            ));
        }

        res.registerAdvancement();
        this.advance();

        let condition = res.register(this.expr());
        if(res.error) return res;

        if(this.currentTok.type == "NEWLINE") {
            res.registerAdvancement();
            this.advance();

            let statements = res.register(this.statements());
            if(res.error) return res;
            cases.push([ condition, statements, true ]);

            if(this.currentTok.matches("KEYWORD", "end")) {
                res.registerAdvancement();
                this.advance();
            } else {
                let allCases = res.register(this.ifExprBorC());
                if(res.error) return res;
                var { c, elseCase } = allCases;
                cases = extend(c, cases);
            }
        } else {
            let expr = res.register(this.statement());
            if(res.error) return res;
            cases.push([ condition, expr, false ]);

            let allCases = res.register(this.ifExprBorC());
            if(res.error) return res;
            var { c, elseCase } = allCases;
            cases = extend(c, cases);
        }

        return res.success({ c: cases, elseCase });
    }

    whileExpr() {
        let res = new ParseResult();

        if(!this.currentTok.matches("KEYWORD", 'while')) {
            return res.failure(InvalidSyntaxError(
                `Expected 'while'`,
                this.currentTok.posStart, this.currentTok.posEnd,
            ));
        }

        res.registerAdvancement();
        this.advance();

        let condition = res.register(this.expr());
        if(res.error) return res;

        if(this.currentTok.type == "NEWLINE") {
            res.registerAdvancement();
            this.advance();

            let body = res.register(this.statements());
            if(res.error) return res;
            
            if(!this.currentTok.matches("KEYWORD", "end")) {
                return res.failure(InvalidSyntaxError(
                    "Expected 'fin'",
                    this.currentTok.posStart, this.currentTok.posEnd,
                ));
            }

            res.registerAdvancement();
            this.advance();

            return res.success(new WhileNode(condition, body));
        }

        let body = res.register(this.statement());
        if(res.error) return res;

        return res.success(new WhileNode(condition, body));
    }

    // ###############################################################

    binOp(funcA: Function, ops: string[], funcB: Function=null!) {
        if(funcB == null) {
            funcB = funcA;
        }

        let res = new ParseResult();
        let left = res.register(funcA());
        if(res.error) return res;

        while(ops.includes(this.currentTok.type) || ops.includes(this.currentTok.type + this.currentTok.value)) {
            let opTok = this.currentTok;
            res.registerAdvancement();
            this.advance();
            let right = res.register(funcB());
            if(res.error) return res;
            left = new BinOpNode(left, opTok, right);
        }

        return res.success(left);
    }

}
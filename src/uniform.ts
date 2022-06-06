import fs from "fs";
import { Lexer } from "./lexer/Lexer";
import { Parser } from "./parser/Parser";
import { Interpreter } from "./interpreter/Interpreter";
import { Context } from "./interpreter/context/Context";
import { globalSymbolTable } from "./constants";
import { SymbolTable } from "./interpreter/context/SymbolTable";

export function run(file: string, symbolTable?: SymbolTable): Context {
    const data = fs.readFileSync(file, "utf-8");
    if(data.trim() == "") return null!;

    const lexer = new Lexer(file, data);
    const { tokens, error } = lexer.tokenize();
    if(error) {
        error.log();
        return null!;
    }

    const parser = new Parser(tokens);
    const ast = parser.parse();
    if(ast.error) {
        ast.error.log();
        return null!;
    }

    const interpreter = new Interpreter();
    const context = new Context("<program>");
    context.symbolTable = symbolTable || globalSymbolTable;
    const result = interpreter.visit(ast.node, context);

    if(result.error) {
        result.error.log();
        return null!;
    }
    return context;
}
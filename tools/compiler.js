var MAX_CODE_BLOCKS = 1024;
var CALLSTACK_SEGMENT = 63;
var CALLSTACK_DEPTH_OFFSET = 0;
var SYMBOL_START_SEGMENT = 59;
var MAX_SYMBOLS = 1024;
var SEGMENT_SIZE = 256;
var BlockType = {If: 0, While: 1, Func: 2};
var SymbolType = {Variable: 0, Constant: 1};

function compile() {
    var source = document.getElementById('vaporlang_input').value;
    var lines = source.split('\n');
    var data = {
        asm: '',
        instructionCount: 0
    };
    var blockDepth = 0;
    var endBlockLabelId = 1;
    var blockEnds = new Array(MAX_CODE_BLOCKS).fill({blockType: 0, labelId: 0});
    var symbolMap = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.length < 1 || line[0] == '\n' || line.startsWith('//'))
            continue;
        var tokens = line.split(' ');
        var end = -1;
        for (var t = 0; t < tokens.length; t++) {
            var token = tokens[t];
            if (token.startsWith('//')) {
                end = t;
                break;
            }
            var semiColon = token.indexOf(';');
            if (semiColon > -1) {
                tokens[t] = token.substring(0, semiColon);
                end = t + 1;
                break;
            }
            var comment = token.indexOf('//');
            if (comment > -1) {
                tokens[t] = token.substring(0, comment);
                end = t + 1;
                break;
            }
        }
        if (end > -1) {
            tokens = tokens.splice(end, tokens.length - end);
        }
        for (var t = 0; t < tokens.length; t++) {
            var token = tokens[t];
            if (token == '}') {
                blockDepth--;
                if (blockDepth < 0) {
                    console.log('Missing open curly brace for close curly brance on line ' + i);
                    return;
                }
                var block = blockEnds[blockDepth];
                if (block.labelId > 0) {
                    if (block.blockType == BlockType.While) {
                        data.asm += 'LRL r0 r1 @_while_' + block.blockType + '_' + block.labelId + '\n';
                        data.instructionCount += 2;
                        data.asm += 'JMP r0 r1\n';
                        data.instructionCount++;
                    }
                    data.asm += '@_end_' + block.blockType + '_' + block.labelId + '\n';
                }
                if (block.blockType == BlockType.Func) {
                    functionReturn(data);
                }
                block.blockType = 0;
                block.labelId = 0;
            }
            else if (token == 'while') {
                var expr = [];
                var e;
                for (e = t + 1; e < tokens.length && tokens[e] != '{'; e++) {
                    expr.push(tokens[e]);
                }
                var block = blockEnds[blockDepth];
                block.labelId = endBlockLabelId;
                block.blockType = BlockType.While;
                data.asm += '@_while_' + BlockType.While + '_' + endBlockLabelId;
                decomposeExpression(expr, symbolMap, data, 0);
                data.asm += 'LRC r1 #0\n';
                data.instructionCount++;
                data.asm += 'CMP r0 r0 r1\n';
                data.instructionCount++;
                data.asm += 'LRL r1 r2 @_end_' + block.blockType + '_' + block.labelId + '\n';
                data.instructionCount += 2;
                data.asm += 'JEQ r0 r1 r2\n';
                data.instructionCount++;
                endBlockLabelId++;
                blockDepth++;
                t = e;
            }
            else if (token == 'if') {
                var expr = [];
                var e;
                for (e = t + 1; e < tokens.length && tokens[e] != '{'; e++) {
                    expr.push(tokens[e]);
                }
                t = e;
                var block = blockEnds[blockDepth];
                block.blockType = BlockType.If;
                block.labelId = endBlockLabelId;
                endBlockLabelId++;
                decomposeExpression(expr, symbolMap, data, 0);
                data.asm += 'LRC r1 #0\n';
                data.instructionCount++;
                data.asm += 'CMP r0 r0 r1\n';
                data.instructionCount++;
                data.asm += 'LRL r1 r2 @_end_' + block.blockType + '_' + block.labelId + '\n';
                data.instructionCount += 2;
                data.asm += 'JEQ r0 r1 r2\n';
                data.instructionCount++;
                blockDepth++;
            }
            else if (token == 'var') {
                var ident = tokens[t + 1];
                var sym = symbolMap[ident];
                if (sym === undefined) {
                    addVariableTomap(ident, symbolMap);
                }
                else {
                    console.log('Redefinition of ' + ident + ' on line ' + i);
                    return;
                }
                t++;
            }
            else if (token == 'const') {
                var ident = tokens[t + 1];
                var sym = symbolMap[ident];
                if (sym === undefined) {
                    var value = parseInt(tokens[t + 2]);
                    addConstantToMap(ident, symbolMap, value);
                }
                else {
                    console.log('Redefinition of ' + ident + ' on line ' + i);
                    return;
                }
                t += 2;
            }
            else if (token == 'func') {
                var name = tokens[t + 1];
                if (name.startsWith('_')) {
                    console.log('Function ' + name + ' is not allowed to start with underbar on line ' + i);
                    return;
                }
                data.asm += '@' + name;
                blockEnds[blockDepth].blockType = BlockType.Func;
                t++;
            }
            else if (token == 'return') {
                functionReturn(data);
            }
            else if (token == 'call') {
                var name = tokens[t + 1];
                var returnInstruction = instructionCount + 13;
                data.asm += 'LRC r0 #' + CALLSTACK_SEGMENT + '\n';
                data.instructionCount++;
                data.asm += 'LRC r1 #' + CALLSTACK_DEPTH_OFFSET + '\n';
                data.instructionCount++;
                data.asm += 'LDR r2 r0 r1\n'
                data.instructionCount++;
                data.asm += 'ADDC r2 #1\n';
                data.instructionCount++;
                data.asm += 'LRC r3 #' + (returnInstruction / SEGMENT_SIZE) + '\n';
                data.instructionCount++;
                data.asm += 'STR r3 r0 r2\n';
                data.instructionCount++;
                data.asm += 'ADDC r2 #1\n';
                data.instructionCount++;
                data.asm += 'LRC r3 #' + (returnInstruction % SEGMENT_SIZE) + '\n';
                data.instructionCount++;
                data.asm += 'STR r3 r0 r2\n';
                data.instructionCount++;
                data.asm += 'STR r2 r0 r1\n';
                data.instructionCount++;
                data.asm += 'LRL r0 r1 @' + name + '\n';
                data.instructionCount += 2;
                data.asm += 'JMP r0 r1\n';
                data.instructionCount++;
                t++;
            }
            else if (token == 'halt') {
                data.asm += 'HALT\n';
                data.instructionCount++;
            }
            else if (token == 'break') {
                data.asm += 'BRKP\n';
                data.instructionCount++;
            }
            else if (token == '[') {
                var segment = [];
                var comma;
                for (var c = t + 1; c < tokens.length && tokens[c] != ','; c++) {
                    segment.push(tokens[c]);
                    comma = c + 1;
                }
                var offset = [];
                var close;
                for (var c = comma + 1; c < tokens.length && tokens[c] != ']'; c++) {
                    offset.push(tokens[c]);
                    close = c + 1;
                }
                if (tokens[close + 1] == '=') {
                    var expr = [];
                    for (var e = t + 5; e < tokens.length; e++) {
                        expr.push(tokens[e]);
                    }
                    t = e;
                    decomposeExpression(expr, symbolMap, data, 0);
                    decomposeExpression(segment, symbolMap, data, 1);
                    decomposeExpression(offset, symbolMap, data, 2);
                    data.asm += 'STR r0 r1 r2\n';
                    data.instructionCount++;
                }
            }
            else {
                var sym = symbolMap[token];
                if (sym !== undefined && sym.symbolType == SymbolType.Variable) {
                    if (tokens[t + 1] == '=') {
                        var expr = [];
                        for (var e = t + 2; e < tokens.length; e++) {
                            expr.push(tokens[e]);
                        }
                        decomposeExpression(expr, symbolMap, data, 0);
                        data.asm += 'LRC r1 #' + sym.segment + '\n';
                        data.instructionCount++;
                        data.asm += 'LRC r2 #' + sym.offset + '\n';
                        data.instructionCount++;
                        data.asm += 'STR r0 r1 r2\n';
                        data.instructionCount++;
                    }
                }
            }
        }
    }

    document.getElementById('assembly_input').value = data.asm;
}

function decomposeExpression(expr, symbolMap, data, destReg) {

}

function functionReturn(data) {
    data.asm += 'LRC r0 #' + CALLSTACK_SEGMENT + '\n';
    data.instructionCount++;
    data.asm += 'LRC r1 #' + CALLSTACK_DEPTH_OFFSET + '\n';
    data.instructionCount++;
    data.asm += 'LDR r2 r0 r1\n';
    data.instructionCount++;
    data.asm += 'LDR r3 r0 r2\n';
    data.instructionCount++;
    data.asm += 'SUBC r2 #1\n';
    data.instructionCount++;
    data.asm += 'LDR r4 r0 r2\n';
    data.instructionCount++;
    data.asm += 'SUBC r2 #1\n';
    data.instructionCount++;
    data.asm += 'STR r2 r0 r1\n';
    data.instructionCount++;
    data.asm += 'JMP r4 r3\n';
    data.instructionCount++;
}

function addConstantToMap(ident, symbolMap, value) {
    symbolMap[ident] = {
        value: value,
        symbolType: SymbolType.Constant
    };
}

function addVariableTomap(ident, symbolMap) {
    var segment = SYMBOL_START_SEGMENT;
    var offset = 0;
    for (var key in symbolMap) {
        var symbol = symbolMap[key];
        if (symbol.segment > segment) {
            segment = symbol.segment + 1;
            offset = symbol.offset + 1;
        }
        else if (symbol.segment == segment) {
            if (symbol.offset > offset)
                offset = symbol.offset + 1;
        }
    }
    if (offset == SEGMENT_SIZE) {
        segment++;
        offset = 0;
    }
    symbolMap[ident] = {
        segment: segment,
        offset: offset,
        symbolType: SymbolType.Variable
    };
}
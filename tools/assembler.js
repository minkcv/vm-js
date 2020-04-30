function assemble(asm) {
    var asm = document.getElementById('assembly_input').value;
    var numInstructions = countInstructions(asm);
    var labelMap = createLabelMap(asm);
    var bin = '';
    var lines = asm.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.startsWith('@'))
            continue;
        if (line.startsWith(';'))
            continue;
        if (line.length < 1)
            continue;
        var instruction = '';
        var noComment = line.split(';');
        var args = noComment[0].split(' ');
        var current = 0;
        while (current < args.length) {
            var arg = args[current];
            if (current == 0) {
                if (arg == 'LRL') {
                    var reg1, reg2, segment, offset;
                    if (args[1][0] == 'r') {
                        reg1 = parseInt(args[1].substring(1, args[1].length));
                    }
                    if (args[2][0] == 'r') {
                        reg2 = parseInt(args[2].substring(1, args[2].length));
                    }
                    if (args[3][0] == '@') {
                        var segoff = labelMap[args[3].substring(1, args[3].length).trim()];
                        segment = segoff.segment;
                        offset = segoff.offset;
                    }
                    if (reg1 === undefined || reg2 === undefined || segment === undefined || offset === undefined) {
                        console.log('Failed to parse LRL arguments');
                        return null;
                    }
                    var segmentHex = segment.toString(16);
                    if (segmentHex.length < 2)
                        segmentHex = '0' + segmentHex;
                    var offsetHex = offset.toString(16);
                    if (offsetHex.length < 2)
                        offsetHex = '0' + offsetHex;
                    instruction = 'b' + reg1.toString(16) + segmentHex;
                    bin += instruction;
                    instruction = 'b' + reg2.toString(16) + offsetHex;
                    current = 3;
                }
                else if (arg == 'HALT') {
                    instruction = '0000';
                    current = 3;
                }
                else if (arg == 'CPY') {
                    instruction += '01'
                }
                else if (arg == 'NOT') {
                    instruction += '02';
                }
                else if (arg == 'LSL') {
                    instruction += '03';
                }
                else if (arg == 'LSR') {
                    instruction += '04';
                }
                else if (arg == 'JMP') {
                    instruction += '05';
                }
                else if (arg == 'NOP') {
                    instruction += '06';
                }
                else if (arg == 'BRKP') {
                    instruction += '0700';
                    current = 3;
                }
                else if (arg == 'ADD') {
                    instruction += '1';
                }
                else if (arg == 'SUB') {
                    instruction += '2';
                }
                else if (arg == 'ADDC') {
                    instruction += '3'
                }
                else if (arg == 'SUBC') {
                    instruction += '4';
                }
                else if (arg == 'CMP') {
                    instruction += '5';
                }
                else if (arg == 'JLT') {
                    instruction += '6';
                }
                else if (arg == 'JGT') {
                    instruction += '7';
                }
                else if (arg == 'JEQ') {
                    instruction += '8';
                }
                else if (arg == 'LDR') {
                    instruction += '9';
                }
                else if (arg == 'STR') {
                    instruction += 'a';
                }
                else if (arg == 'LRC') {
                    instruction += 'b';
                }
                else if (arg == 'AND') {
                    instruction += 'c';
                }
                else if (arg == 'OR') {
                    instruction += 'd';
                }
                else if (arg == 'XOR') {
                    instruction += 'e';
                }
                current++;
            }
            else {
                if (arg.startsWith('r')) {
                    var regDecimal = parseInt(arg.substring(1, arg.length));
                    instruction += regDecimal.toString(16);
                }
                else if (arg.startsWith('#')) {
                    var constDecimal = parseInt(arg.substring(1, arg.length));
                    var constHex = constDecimal.toString(16);
                    if (constHex.length < 2)
                        constHex = '0' + constHex;
                    instruction += constHex;
                    current++;
                }
                else if (arg.startsWith('$')) {
                    var constHex = parseInt(arg.substring(1, arg.length), 16).toString(16);
                    if (constHex.length < 2)
                        constHex = '0' + constHex;
                    instruction += constHex;
                    current++;
                }
                current++;
            }
        }
        while (instruction.length < 4) {
            instruction += '0';
        }
        bin += instruction;
    }
    return bin;
}

function countInstructions(asm) {
    var lines = asm.split('\n');
    var instructions = 0;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.length < 1)
            continue;
        if (line[0] == '@')
            continue;
        if (line[0] == ';')
            continue;
        if (line.startsWith('LRL'))
            instructions += 2;
        else
            instructions++;
    }
    return instructions;
}

function createLabelMap(asm) {
    var lines = asm.split('\n');
    var instructions = 0;
    var map = {}
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.length < 1)
            continue;
        if (line[0] == '@') {
            var space = line.indexOf(' ');
            var comment = line.indexOf(';');
            var end = space < comment ? space : comment;
            if (end < 0)
                end = line.length;
            var labelName = line.substring(1, end);
            map[labelName] = {segment: Math.floor(instructions / JUMP_SEGMENT_SIZE), offset: instructions % JUMP_SEGMENT_SIZE};
            continue;
        }
        if (line[0] == ';')
            continue;
        if (line.startsWith('LRL'))
            instructions += 2;
        else
            instructions++;
    }
    return map;
}
var VM = {
    regs: null,
    memory: null,
    pc: 0,
    code: [],
    debugMode: false,
    breakState: false,
    step: false,
    startTime: null,
    gpu: {
        active: false,
        refreshed: false
    },
    canvas: null,
    ctx: null,
    imageData: null
}

function run(vm) {
    var delta = Date.now() - vm.startTime;
    if (vm.breakState)
        return;

    // The number of instructions that should be done based on how much time has passed.
    // Exec 250 instructions if 5 milliseconds have passed: 500,000 / 1 == 250 / 0.0005
    var numInstructions = INSTRUCTIONS_PER_SECOND * (delta / 1000)
    for (var i = 0; i < numInstructions; i++) {
        exec(vm);
        vm.pc++;
    }
    
    updateGPU(vm);
    if (vm.gpu.active) {
        render(vm, vm.gl, vm.imageData);
    }
    if (vm.step)
        vm.breakState = true;
        
    vm.startTime = Date.now();
    setTimeout(() => run(VM), 16);
}

function exec(vm) {
    var clean = 0xF;
    var instr = vm.code[vm.pc];
    var opcode = (instr >> 12) & clean;
    var arg0 = (instr >> 8) & clean;
    var arg1 = (instr >> 4) & clean;
    var arg2 = instr & clean;
    switch (opcode) {
        case OPCODES.EXT:
            switch (arg0) {
                case OPCODES.EXT_HALT:
                    vm.breakState = true;
                    break;
                case OPCODES.EXT_CPY:
                    vm.regs[arg1] = vm.regs[arg2];
                    break;
                case OPCODES.EXT_NOT:
                    vm.regs[arg1] = ~(vm.regs[arg2]);
                    break;
                case OPCODES.EXT_LSL:
                    vm.regs[arg1] = (vm.regs[arg1] << vm.regs[arg2]) % 256;
                    break;
                case OPCODES.EXT_LSR:
                    vm.regs[arg1] = (vm.regs[arg1] >> vm.regs[arg2]) % 256;
                    break;
                case OPCODES.EXT_JMP:
                    vm.pc = vm.regs[arg1] * JUMP_SEGMENT_SIZE + vm.regs[arg2] - 1;
                    break;
                case OPCODES.EXT_NOP:
                    break;
                case OPCODES.EXT_BRKP:
                    if (vm.debugMode)
                        vm.breakState = true;
                    break;
            }
            break;
        case OPCODES.ADD:
            vm.regs[arg0] = (vm.regs[arg1] + vm.regs[arg2]) % 256;
            break;
        case OPCODES.SUB:
            var sub = vm.regs[arg1] - vm.regs[arg2];
            if (sub < 0)
                sub = 256 + sub;
            vm.regs[arg0] = sub;
            break;
        case OPCODES.ADDC:
            vm.regs[arg0] += ((arg1 << 4) & 0xF0) + arg2;
            vm.regs[arg0] %= 256;
            break;
        case OPCODES.SUBC:
            var sub = vm.regs[arg0] - (((arg1 << 4) & 0xF0) + arg2);
            if (sub < 0)
                sub = 256 + sub;
            vm.regs[arg0] = sub;
            break;
        case OPCODES.CMP:
            if (vm.regs[arg1] < vm.regs[arg2])
                vm.regs[arg0] = 0;
            else if (vm.regs[arg1] > vm.regs[arg2])
                vm.regs[arg0] = 2;
            else
                vm.regs[arg0] = 1;
            break;
        case OPCODES.JLT:
            if (vm.regs[arg0] == 0)
                vm.pc = vm.regs[arg1] * JUMP_SEGMENT_SIZE + vm.regs[arg2] - 1;
            break;
        case OPCODES.JGT:
            if (vm.regs[arg0] == 2)
                vm.pc = vm.regs[arg1] * JUMP_SEGMENT_SIZE + vm.regs[arg2] - 1;
            break;
        case OPCODES.JEQ:
            if (vm.regs[arg0] == 1)
                vm.pc = vm.regs[arg1] * JUMP_SEGMENT_SIZE + vm.regs[arg2] - 1;
            break;
        case OPCODES.LDR:
            vm.regs[arg0] = vm.memory[vm.regs[arg1] * MEMORY_SEGMENT_SIZE + vm.regs[arg2]];
            break;
        case OPCODES.STR:
            if (vm.regs[arg1] < 128)
                vm.memory[vm.regs[arg1] * MEMORY_SEGMENT_SIZE + vm.regs[arg2]] = vm.regs[arg0];
            else
                vm.breakState = true;
            break;
        case OPCODES.LRC:
            vm.regs[arg0] = ((arg1 << 4) & 0xF0) + arg2;
            break;
        case OPCODES.AND:
            vm.regs[arg0] = vm.regs[arg1] & vm.regs[arg2];
            break;
        case OPCODES.OR:
            vm.regs[arg0] = vm.regs[arg1] | vm.regs[arg2];
            break;
        case OPCODES.XOR:
            vm.regs[arg0] = vm.regs[arg1] ^ vm.regs[arg2];
            break;
    }
}

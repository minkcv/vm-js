var VM = {
    regs: new Array(NUM_REGISTERS).fill(0),
    memory: new Array(NUM_SEGMENTS * MEMORY_SEGMENT_SIZE).fill(0),
    pc: 0,
    code: [],
    debugMode: false,
    breakState: false,
    step: false,
    wait: false,
    instrCount: 0,
    startTime: Date.now(),
    ipsFactor: 62,
    displayWait: 16,
    displayStartTime: Date.now(),
    gpu: {
        active: false,
        refreshed: false
    },
    canvas: null
}

function run(vm) {
    // TODO: keyboard input
    if (vm.breakState)
        return;

    if (!vm.wait) {
        exec(vm);
        vm.pc++;
        vm.instrCount++;

        if (vm.instrCount > INSTRUCTIONS_PER_SECOND / vm.ipsFactor)
            vm.wait = true;
    }
    if (Date.now() - vm.startTime > 1000 / vm.ipsFactor) {
        // 16ms have passed
        if (vm.instrCount < INSTRUCTIONS_PER_SECOND / vm.ipsFactor) {
            //console.log('running below desired ips');
        }
        vm.instrCount = 0;
        vm.startTime = Date.now();
        vm.wait = false;
    }
    if (vm.displayStartTime + vm.displayWait < Date.now()) {
        updateGPU(vm);
        if (vm.gpu.active) {
            render(vm, vm.canvas);
        }
    }
    if (vm.step)
        vm.breakState = true;

    setInterval(() => run(VM), 0);
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
            vm.regs[arg0] = Math.abs((vm.regs[arg1] - vm.regs[arg2]) % 256);
            break;
        case OPCODES.ADDC:
            vm.regs[arg0] += ((arg1 << 4) & 0xF0) + arg2;
            vm.regs[arg0] %= 256;
            break;
        case OPCODES.SUBC:
            vm.regs[arg0] -= ((arg1 << 4) & 0xF0) + arg2;
            vm.regs[arg0] %= 256;
            vm.regs[arg0] = Math.abs(vm.regs[arg0]);
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

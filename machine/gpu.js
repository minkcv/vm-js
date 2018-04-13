function updateGPU(vm) {
    vm.gpu.active = vm.memory[GPU_FLAG_SEG * MEMORY_SEGMENT_SIZE + GPU_FLAG_OFFSET] & 0x1;
    if (vm.gpu.active) {
        vm.gpu.refreshed = !vm.gpu.refreshed;
        vm.memory[GPU_FLAG_SEG * MEMORY_SEGMENT_SIZE + GPU_FLAG_OFFSET] &= 0xFD; // Clear the second bit
        vm.memory[GPU_FLAG_SEG * MEMORY_SEGMENT_SIZE + GPU_FLAG_OFFSET] |= (vm.gpu.refreshed << 1); // Set the second bit according to vm.gpu.refreshed
    }
}

function render(vm, canvas) {
    // TODO
}
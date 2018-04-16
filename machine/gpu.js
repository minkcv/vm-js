function updateGPU(vm) {
    vm.gpu.active = vm.memory[GPU_FLAG_SEG * MEMORY_SEGMENT_SIZE + GPU_FLAG_OFFSET] & 0x1;
    if (vm.gpu.active) {
        vm.gpu.refreshed = !vm.gpu.refreshed;
        vm.memory[GPU_FLAG_SEG * MEMORY_SEGMENT_SIZE + GPU_FLAG_OFFSET] &= 0xFD; // Clear the second bit
        vm.memory[GPU_FLAG_SEG * MEMORY_SEGMENT_SIZE + GPU_FLAG_OFFSET] |= (vm.gpu.refreshed << 1); // Set the second bit according to vm.gpu.refreshed
    }
}

function render(vm, canvas) {
    var ctx = canvas.getContext('2d');
    var paletteIndex = vm.memory[BACK_COLOR_SEG * MEMORY_SEGMENT_SIZE + BACK_COLOR_OFFSET];
    ctx.fillStyle = 'rgb(' + getRed(paletteIndex) + ',' + getGreen(paletteIndex) + ',' + getBlue(paletteIndex) + ')';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    var imageData = ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    var data = imageData.data;

    var segment = SPRITE_ATTR_SEG * MEMORY_SEGMENT_SIZE;
    var offset = 0;
    var end = SPRITE_ATTR_SEG * MEMORY_SEGMENT_SIZE + NUM_SPRITES * SPRITE_ATTR_LENGTH;
    for (var index = segment; index < end; index += SPRITE_ATTR_LENGTH) {
        var flags = vm.memory[index];
        if (flags & 128 != 128)
            continue; // Not enabled

        var flipH = flags & 64 == 64;
        var flipV = flags & 32 == 32;
        var alpha = flags & 16 == 16;
        var x = vm.memory[index + 1];
        var y = vm.memory[index + 2];
        var w = vm.memory[index + 3];
        var h = vm.memory[index + 4];
        var seg = vm.memory[index + 5];
        var off = vm.memory[index + 6];
        var spriteColorPalette = [];
        spriteColorPalette.push(vm.memory[index + 7]);
        spriteColorPalette.push(vm.memory[index + 8]);
        spriteColorPalette.push(vm.memory[index + 9]);
        spriteColorPalette.push(vm.memory[index + 10]);

        if (x + w > SCREEN_WIDTH)
            continue;
        if (y + h > SCREEN_HEIGHT)
            continue;

        var nBytes = w / 4 * h;
        var start = seg * MEMORY_SEGMENT_SIZE + off;
        for (var i = start; i < start + nBytes; i++) {
            for (var pixel = 0; pixel < 4; pixel++) {
                var paletteIndex = (vm.memory[i] >> (pixel * 2)) & 3;
                var color = spriteColorPalette[paletteIndex];
                var r = getRed(color);
                var g = getGreen(color);
                var b = getBlue(color);
                data[x + y + w + (h * SCREEN_WIDTH) + pixel]     = getRed(color);
                data[x + y + w + (h * SCREEN_WIDTH) + pixel + 1] = getGreen(color);
                data[x + y + w + (h * SCREEN_WIDTH) + pixel + 2] = getBlue(color);
                data[x + y + w + (h * SCREEN_WIDTH) + pixel + 3] = alpha ? 0 : 255;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function renderSprite(vm, ctx) {

}

function getRed(index) {
    return Math.floor((index / 32) * 36);
}

function getGreen(index) {
    return Math.floor((index % 32) / 4 * 36);
}

function getBlue(index) {
    return Math.floor((index % 4) * 85);
}

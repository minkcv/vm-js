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
        if ((flags & 128) != 128)
            continue; // Not enabled

        var flipH = (flags & 64) == 64;
        var flipV = (flags & 32) == 32;
        var alpha = (flags & 16) == 16;
        var spriteX = vm.memory[index + 1];
        var spriteY = vm.memory[index + 2];
        var spriteW = vm.memory[index + 3];
        var spriteH = vm.memory[index + 4];
        var seg = vm.memory[index + 5];
        var off = vm.memory[index + 6];
        var spriteColorPalette = [];
        spriteColorPalette.push(vm.memory[index + 7]);
        spriteColorPalette.push(vm.memory[index + 8]);
        spriteColorPalette.push(vm.memory[index + 9]);
        spriteColorPalette.push(vm.memory[index + 10]);

        if (spriteX + spriteW > SCREEN_WIDTH)
            continue;
        if (spriteY + spriteH > SCREEN_HEIGHT)
            continue;

        var nPixels = spriteW * spriteH;
        var startMemoryIndex = seg * MEMORY_SEGMENT_SIZE + off;
        var startDataIndex = (spriteY * SCREEN_WIDTH + spriteX) * 4;
        var spritePixels = [];
        for (var i = 0; i < nPixels / 4; i++) {
            for (var ii = 0; ii < 4; ii++) {
                var paletteIndex = (vm.memory[i + startMemoryIndex] >> (2 * (3 - ii))) & 3;
                spritePixels.push(paletteIndex);
                if (alpha && (paletteIndex == 3))
                    continue; // Skip this transparent pixel in the sprite
                var color = spriteColorPalette[paletteIndex];
                var r = getRed(color);
                var g = getGreen(color);
                var b = getBlue(color);
                var pixelX = ((i * 4) + ii) % spriteW;
                var pixelY = Math.floor(((i * 4) + ii) / spriteW) * SCREEN_WIDTH;
                var dataIndex = startDataIndex + (pixelY + pixelX) * 4;
                data[dataIndex]     = getRed(color);
                data[dataIndex + 1] = getGreen(color);
                data[dataIndex + 2] = getBlue(color);
                data[dataIndex + 3] = 255;
            }
        }
        if (index == 16640)
            console.log(spritePixels);
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

function updateGPU(vm) {
    vm.gpu.active = vm.memory[GPU_FLAG_SEG * MEMORY_SEGMENT_SIZE + GPU_FLAG_OFFSET] & 0x1;
    if (vm.gpu.active) {
        vm.gpu.refreshed = !vm.gpu.refreshed;
        vm.memory[GPU_FLAG_SEG * MEMORY_SEGMENT_SIZE + GPU_FLAG_OFFSET] &= 0xFD; // Clear the second bit
        vm.memory[GPU_FLAG_SEG * MEMORY_SEGMENT_SIZE + GPU_FLAG_OFFSET] |= (vm.gpu.refreshed << 1); // Set the second bit according to vm.gpu.refreshed
    }
}

function render(vm, gl, imageData) {
    var paletteIndex = vm.memory[BACK_COLOR_SEG * MEMORY_SEGMENT_SIZE + BACK_COLOR_OFFSET];
    gl.clearColor(getRed(paletteIndex), getGreen(paletteIndex), getBlue(paletteIndex), 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var bgRed = getRed(paletteIndex);
    var bgGreen = getGreen(paletteIndex);
    var bgBlue = getBlue(paletteIndex);
    for (var i = 0; i < SCREEN_WIDTH * SCREEN_HEIGHT * 3; i += 3) {
        imageData[i] = bgRed;
        imageData[i + 1] = bgGreen;
        imageData[i + 2] = bgBlue;
    }

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
        var startDataIndex = (spriteY * SCREEN_WIDTH + spriteX) * 3;
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
                var dataIndex = startDataIndex + (pixelY + pixelX) * 3;
                imageData[dataIndex]     = getRed(color);
                imageData[dataIndex + 1] = getGreen(color);
                imageData[dataIndex + 2] = getBlue(color);
            }
        }
    }

    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(vm.glProgram, "u_resolution");
    var textureSizeLocation = gl.getUniformLocation(vm.glProgram, "u_textureSize");
    var positionLocation = gl.getAttribLocation(vm.glProgram, "a_position");
    var texcoordLocation = gl.getAttribLocation(vm.glProgram, "a_texCoord");

    var positionBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0,
        256, 0,
        0, 192,
        0, 192,
        256, 0,
        256, 192
    ]), gl.STATIC_DRAW);
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // 192 / 256 = 0.75
    // Texture must be 256 x 256, so use 0.75 as the y coordinate to clip to 256 x 192
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  0.75,
        0.0,  0.75,
        1.0,  0.0,
        1.0,  0.75]), gl.STATIC_DRAW);

    //gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, vm.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, SCREEN_WIDTH, SCREEN_WIDTH, 0, gl.RGB, gl.UNSIGNED_BYTE, imageData);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);
  
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);
  
    // Turn on the teccord attribute
    gl.enableVertexAttribArray(texcoordLocation);
  
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset);
  
    // set the resolution
    gl.uniform2f(resolutionLocation, SCREEN_WIDTH, SCREEN_HEIGHT);
  
    // set the size of the image
    gl.uniform2f(textureSizeLocation, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function getRed(index) {
    return Math.min(255, Math.floor((index / 32) * 36));
}

function getGreen(index) {
    return Math.min(255, Math.floor((index % 32) / 4 * 36));
}

function getBlue(index) {
    return Math.min(255, Math.floor((index % 4) * 85));
}

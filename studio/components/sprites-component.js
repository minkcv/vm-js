layout.registerComponent( 'spritesComponent', function(container, componentState){
    container.getElement().html(
    `<div class='sprites' id='sprites'>
    <div id='sprite-controls'>
            <button onclick='addSprite()'>Add Sprite</button>
            <button onclick='deleteSprite()'>Delete Sprite</button>
            <select id='select-sprite' onchange='selectSprite()'></select>
            <button onclick='buildRom()'>Build sprites.rom</button>
            <br>
            Sprite Name: <input type='text' id='sprite-name' oninput='updateName()'></input>
            Sprite Width: <select id='sprite-width' onchange='setWidth()'></select>
            Sprite Height: <select id='sprite-height' onchange='setHeight()'></select>
            <br>
            <table>
                <tr>
                    <td id='sprite-color-palette'>
                        <input type='radio' id='color1' name='colors' value='0' checked><label for='color1' id='color1label'></label><br>
                        <input type='radio' id='color2' name='colors' value='1'><label for='color2' id='color2label'></label><br>
                        <input type='radio' id='color3' name='colors' value='2'><label for='color3' id='color3label'></label><br>
                        <input type='radio' id='color4' name='colors' value='3'><label for='color4' id='color4label'></label><br>
                    </td>
                    <td id='color-palette' class='color-buttons'>
                    </td>
                </tr>
            </table>
        </div>
        <div id='sprite' class='color-buttons'>
        </div>
    </div>`);
    container.on('open', function() {
        var colorPalette = document.getElementById('color-palette');
        for (var i = 0; i < 256; i++) {
            var btn = document.createElement('button');
            btn.style.backgroundColor = getColorAsCSS(i);
            btn.value = i;
            btn.onclick = function() {
                if (currentSprite < 0)
                    return;
                var color = parseInt(event.target.value);
                var colorIndex = parseInt($('input[name=colors]:checked').val());
                sprites[currentSprite].colors[colorIndex] = color;
                document.getElementById('color' + (colorIndex + 1) + 'label').style.backgroundColor = getColorAsCSS(color);
                updateSprite();
            };
            colorPalette.appendChild(btn);
            if ((i + 1) % 32 == 0 && i != 0)
                colorPalette.appendChild(document.createElement('br'))
        }
        var widthSelect = document.getElementById('sprite-width');
        for (var i = 4; i <= 256; i += 4) {
            var option = document.createElement('option');
            option.value = i;
            option.text = i;
            widthSelect.appendChild(option);
        }
        var heightSelect = document.getElementById('sprite-height');
        for (var i = 4; i <= 192; i += 4) {
            var option = document.createElement('option');
            option.value = i;
            option.text = i;
            heightSelect.appendChild(option);
        }
    });
});

var sprites = [];
var currentSprite = -1;
var previousName;

function buildRom() {
    var rom = [];
    log('--- Sprite Memory Locations ---');
    for (var i = 0; i < sprites.length; i++) {
        var segment = Math.floor(rom.length / MEMORY_SEGMENT_SIZE) + 128;
        var offset = rom.length % MEMORY_SEGMENT_SIZE;
        log(sprites[i].name + ' located at ' + segment + '.' + offset);
        for (var pixel = 0; pixel < sprites[i].data.length; pixel+=4) {
            var byte = 0;
            byte |= sprites[i].data[pixel] << 6;
            byte |= sprites[i].data[pixel + 1] << 4;
            byte |= sprites[i].data[pixel + 2] << 2;
            byte |= sprites[i].data[pixel + 3];
            rom.push(byte);
        }
    }
    var exists = null;
    for (var i = 0; i < loadedRoms.length; i++) {
        if (loadedRoms[i].name == 'sprites.rom')
            exists = loadedRoms[i];
    };
    if (exists != null)
        exists.data = rom;
    else {
        loadedRoms.push({name: 'sprites.rom', data: rom});
        var option = document.createElement('option');
        option.value = 'sprites.rom';
        option.innerHTML = 'sprites.rom';
        document.getElementById('rom_select').appendChild(option);
        option.selected = 'selected';
    }
}

function addSprite() {
    var name = 'Untitled';
    var j = '';
    for (var i = 0; i < sprites.length; i++) {
        if (sprites[i].name == name + j) {
            if (j == '')
                j = '1';
            else
                j = (parseInt(j) + 1).toString();
            i = 0;
        }
    }
    name += j;
    var sprite = {
        name: name,
        colors: [0, 1, 2, 3],
        width: 4,
        height: 4,
        data: new Array(16).fill(0)
    }
    sprites.push(sprite);
    currentSprite = sprites.length - 1;
    previousName = name;
    updateSelect();
    selectSprite();
}

function deleteSprite() {
    sprites.splice(currentSprite, 1);
    currentSprite = currentSprite - 1;
    if (currentSprite < 0)
        currentSprite = 0
    if (sprites.length == 0)
        currentSprite = -1;
    updateSelect();
    updateName();
    if (currentSprite >= 0)
        selectSprite();
}

function updateSelect() {
    var select = document.getElementById('select-sprite');
    var current = null;
    if (currentSprite >= 0) {
        current = sprites[currentSprite].name;
        document.getElementById('sprite-name').value = current;
    }
    while(select.length > 0) {
        select.remove(0);
    }
    for (var i = 0; i < sprites.length; i++) {
        var option = document.createElement('option');
        option.setAttribute('id', 'sprite-name-' + sprites[i].name);
        option.text = sprites[i].name;
        if (sprites[i].name == current) {
            option.selected = true;
            previousName = current;
        }
        select.add(option);
    }
}

function updateName() {
    if (currentSprite < 0) {
        document.getElementById('sprite-name').value = '';
        return;
    }
    if (event.target.value == '')
        return;
    var option = document.getElementById('sprite-name-' + previousName);
    sprites[currentSprite].name = event.target.value;
    option.setAttribute('id', 'sprite-name-' + event.target.value);
    previousName = event.target.value;
    updateSelect();
}

function selectSprite() {
    currentSprite = document.getElementById('select-sprite').selectedIndex;
    var sprite = sprites[currentSprite];
    document.getElementById('sprite-name').value = sprites[currentSprite].name;
    for (var i = 0; i < 4; i++) {
        var red = getRed(sprite.colors[i]);
        var green = getGreen(sprite.colors[i]);
        var blue = getBlue(sprite.colors[i]);
        document.getElementById('color' + (i + 1) + 'label').style.backgroundColor = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    }
    document.getElementById('sprite-width').selectedIndex = (sprite.width / 4) - 1;
    document.getElementById('sprite-height').selectedIndex = (sprite.height / 4) - 1;
    updateSprite();
}

function setWidth() {
    if (currentSprite < 0)
        return;
    var width = parseInt(document.getElementById('sprite-width').value);
    sprites[currentSprite].width = width;
    var height = sprites[currentSprite].height;
    sprites[currentSprite].data = new Array(width * height).fill(0);
    updateSprite();
}

function setHeight() {
    if (currentSprite < 0)
        return;
    var height = parseInt(document.getElementById('sprite-height').value);
    sprites[currentSprite].height = height;
    var width = sprites[currentSprite].width;
    sprites[currentSprite].data = new Array(width * height).fill(0);
    updateSprite();
}

var pixelClick = function() {
    if (event.buttons != 1 && event.which != 1)
        return;
    var colorIndex = parseInt($('input[name=colors]:checked').val());
    var color = sprites[currentSprite].colors[colorIndex];
    this.style.backgroundColor = getColorAsCSS(color);
    var pixelIndex = this.attributes['i'];
    sprites[currentSprite].data[pixelIndex] = colorIndex;
};

function updateSprite() {
    var div = document.getElementById('sprite');
    div.innerHTML = '';
    var sprite = sprites[currentSprite];
    var width = sprite.width;
    var height = sprite.height;
    var scale = 12;
    if (width > 48)
        scale = 8;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var i = x + (y * width);
            var pixel = document.createElement('span');
            var colorIndex = sprite.data[i];
            var color = sprite.colors[colorIndex];
            pixel.style.backgroundColor = getColorAsCSS(color);
            pixel.style.width = scale + 'px';
            pixel.style.height = scale + 'px';
            pixel.style.display = 'inline-block';
            pixel.attributes['i'] = i;
            pixel.onmousemove = pixelClick;
            pixel.onclick = pixelClick;
            div.appendChild(pixel);
        }
        div.appendChild(document.createElement('br'));
    }
}

function getColorAsCSS(i) {
    var red = getRed(i);
    var green = getGreen(i);
    var blue = getBlue(i);
    return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
}
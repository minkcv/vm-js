layout.registerComponent( 'spritesComponent', function(container, componentState){
    container.getElement().html(
    `<div class='sprites' id='sprites'>
        <button onclick='addSprite()'>Add Sprite</button>
        <button onclick='deleteSprite()'>Delete Sprite</button>
        <select id='select-sprite' onchange='selectSprite()'></select>
        <div id='sprite-controls'>
            Name: <input type='text' id='sprite-name' oninput='updateName()'></input>
            <br>
            <table>
                <tr>
                    <td id='sprite-color-palette'>
                        <input type='radio' id='color1' name='colors' value='0'><label for='color1' id='color1label'></label><br>
                        <input type='radio' id='color2' name='colors' value='1'><label for='color2' id='color2label'></label><br>
                        <input type='radio' id='color3' name='colors' value='2'><label for='color3' id='color3label'></label><br>
                        <input type='radio' id='color4' name='colors' value='3'><label for='color4' id='color4label'></label><br>
                    </td>
                    <td id='color-palette'>
                    </td>
                </tr>
            </table>
        </div>
    </div>`);
    container.on('open', function() {
        var colorPalette = document.getElementById('color-palette');
        for (var i = 0; i < 256; i++) {
            var btn = document.createElement('button');
            btn.style.backgroundColor = getColorAsCSS(i);
            btn.value = i;
            btn.onclick = function() {
                var color = parseInt(event.target.value);
                var colorIndex = parseInt($('input[name=colors]:checked').val());
                if (isNaN(colorIndex) || currentSprite < 0)
                    return;
                sprites[currentSprite].colors[colorIndex] = color;
                document.getElementById('color' + (colorIndex + 1) + 'label').style.backgroundColor = getColorAsCSS(color);
            };
            colorPalette.appendChild(btn);
            if ((i + 1) % 32 == 0 && i != 0)
                colorPalette.appendChild(document.createElement('br'))
        }
    });
});

var sprites = [];
var currentSprite = -1;
var previousName;

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
        colors: [0, 1, 2, 3]
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
}

function getColorAsCSS(i) {
    var red = getRed(i);
    var green = getGreen(i);
    var blue = getBlue(i);
    return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
}
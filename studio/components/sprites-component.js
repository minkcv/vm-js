layout.registerComponent( 'spritesComponent', function(container, componentState){
    container.getElement().html(
    `<div class='sprites' id='sprites'>
        <button onclick='addSprite()'>Add Sprite</button>
        <button onclick='deleteSprite()'>Delete Sprite</button>
        <select id='select-sprite' onchange='selectSprite()'></select>
        <div id='sprite-controls'>
            Name: <input type='text' id='sprite-name' oninput='updateName()'></input>
        </div>
    </div>`);
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
    document.getElementById('sprite-name').value = sprites[currentSprite].name;
}
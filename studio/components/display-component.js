layout.registerComponent( 'displayComponent', function(container, componentState){
    container.getElement().html(
    `<div class='display' id='display'>
        <canvas width=256 height=192 id='game_canvas'></canvas>
    </div>`);
    container.on('open', function() {
        VM.canvas = document.getElementById('game_canvas');
        VM.ctx = VM.canvas.getContext('2d');
    });
});
layout.registerComponent( 'fileComponent', function(container, componentState){
    container.getElement().html(
    `<div class='file-menu' id='file-menu'>
        <div class="input-group mb-3">
            <div class="custom-file">
                <input type="file" class="custom-file-input" id="load-project" multiple='false' onchange='loadProject(this.files)'>
                <label class="custom-file-label" for="load-project">Load Project</label>
            </div>
        </div>
        <button type='button' class='btn btn-sm' onclick='saveProject()'>Save Project</button><br>
        <button type='button' class='btn btn-sm' onclick='openViewport()'>Open Viewport</button>
        <button type='button' class='btn btn-sm' onclick='openWelcome()'>Open Welcome Screen</button>
    </div>`);
});

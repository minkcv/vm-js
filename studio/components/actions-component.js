layout.registerComponent( 'actionsComponent', function(container, componentState){
    container.getElement().html(
    `<div class='actions-menu' id='actions-menu'>
        <button type='button' onclick='asmEditor.setValue(compile(vaporEditor.getValue())); loadProgram(assemble(asmEditor.getValue()), getRom())'>Compile, Assemble, and Run</button>
        <br>
        Upload ROM:  <input type="file" id="upload_rom" multiple='false' onchange='uploadRom(this.files)'><br><br>
        Select ROM:  <select id='rom_select'>
            <option selected>[None]</option>
        </select><br>
    </div>`);
});

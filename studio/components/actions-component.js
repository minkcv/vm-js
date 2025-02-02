layout.registerComponent( 'actionsComponent', function(container, componentState){
    container.getElement().html(
    `<div class='actions-menu' id='actions-menu'>
        <button type='button' onclick='asmEditor.setValue(compile(vaporEditor.getValue())); loadProgram(programStringToBinary(assemble(asmEditor.getValue())), getRom())'>Compile, Assemble, and Run</button>
        <button type='button' onclick='asmEditor.setValue(compile(vaporEditor.getValue()));'>Compile</button>
        <button type='button' onclick='loadProgram(programStringToBinary(assemble(asmEditor.getValue())), getRom())'>Assemble and Run</button>
        <br><hr>
        Upload BIN:  <input type="file" id="upload_bin" multiple='false' onchange='uploadBin(this.files)'><br>
        Select BIN:  <select id='bin_select'>
            <option selected>[None]</option>
        </select>  
        <button onclick='loadProgram(getBin(), getRom())'>Run BIN</button>
        <br>
        Upload ROM:  <input type="file" id="upload_rom" multiple='false' onchange='uploadRom(this.files)'><br>
        Select ROM:  <select id='rom_select'>
            <option selected>[None]</option>
        </select><br><br>
        <a href='https://github.com/minkcv/vm'>Vapor Spec Repo</a><br>
        <a href='https://minkcv.github.io/vm-js/'>Simple interface</a>
    </div>`);
});

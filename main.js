var pong = 'b140b280a210b201b308a312b202b340a312b203b308a312b204b340a312b205b380a312b207b3ffa312b210b380a312b211b3f0a312b212b340a312b213b308a312b214b340a312b215b380a312b217b3ffa312b220b380a312b221b37ca312b222b35ca312b223b308a312b224b308a312b225b380a312b227b3ffa312b17fb211b301a312b101b240a201b102a201b103b27ca201b104b25ca201b17f9210b301c4235443be00bfa084efb17f9210b302c4235443be00bfa984efb17fb2019312c4325442be00bfb384efb17fb2019312b202c4325442be00bfbc84efb1059201be00bfc662efb1059201be00bfed72efb1069201be01bf1362efb1069201be01bf2672efb1019201b1029201b340b412a234b1019201b402a234b1039201b421a234b1049201b422a234be01bf3905efb17fb2119312a300be00bf4e05efbe00bf56b1029201542084ef4204a20105efbe00bf5eb1029201b380542384ef3204a20105efbe00bf66b1019201542084ef4204a20105efbe00bf6fb1019201b380542384ef3204a20105efb1039201b3045323be00bf4363efb3105323be00bfe673efb1019301b104940134085543b140111344085641be00bfe665ef76efb105b202a201be00bf7405efb10392014204a201be00bf7405efb1039201b3f45323be00bf4373efb3e85323be01bf0c63efb1029301b104940134085543b140111344085641be01bf0c65ef76efb105a001be00bf7905efb10392013204a201be00bf7905efb10492015102be01bf1f61efb106b202a201be00bf7e05efb10492014204a201be00bf7e05efb1049201b3b85123be01bf3261efb106a001be00bf7e05efb10492013204a201be00bf8305ef06000600060006000600060006000600b17fb21193129400b102c313c414e3345131be00bf9981efbe01bf3905ef';
var mars = 'b07fb111b301a301b041b100b390a301b101b378a301b102b358a301b103b310a301b104a301b405b580a504b407b5ffa504b408b536a504b409b50ba504b200b600b708b040b040b1101112b390a301b1111112b30013321332a301b1131112b320a301b1141112b340a301b4151442b580a504b4161442b540a504b4171442b500a504b4181442b5ffa504b4191442b5fea504321036015867be00bf2368efb190b390a301b191b320a301b192b360a301b193b310a301b194a301b195b382a301b196b340a301b197b360a301b198b3a4a301b07fb110b280a201b07fb100b3029201c2235423b900ba97849a9201b301c2235423b900baa3849a9201b304c2235423b900baaf849a9201b308c2235423b900babb849a0600b900bac7059abc7fbd119fcdaf00b900ba70059ab900ba77b541b6029756b4ae5474749ab8021778a756059ab900ba7eb541b6029756b4405474649ab8022778a756059ab900ba85b541b6019756b4005474849ab8022778a756059ab900ba8cb541b6019756b4f05474849ab8021778a756059a06000600060006000600060006000600bc7fbd119ecdbc02cece9f00cfcfeeef5cecb900ba908c9ab900bac7059a'
var marsrom = 'ff0000fffc00003ffc15583ffc15583ffc15683ffc05a03fff0000fffc00003ff000200ff000000ff000000ff0c0030ffcc3c33fffc3c3ffffc3c3ffffc3c3ff000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c0300000000000c0f0300000c00003c3f0f3cc03fc00ffcfffffff3fffcffffffffffffffffffffffffffffffffffffffffffffc7ffffff057fffff057ffffc157ffffc057ffff0057ffff0050fffc0055fffc0055fff001557ff001557ff00515ffff055fff'

//var loadedRoms = [{name: 'mars.rom', data: romStringToBinary(marsrom)}];
var loadedRoms = [];
var running;

function loadProgram(bin, rom) {
    if (bin === undefined || bin == null || bin == '')
        return;
    VM.pc = 0;
    VM.regs = new Array(NUM_REGISTERS).fill(0);
    VM.memory = new Array(NUM_SEGMENTS * MEMORY_SEGMENT_SIZE).fill(0);
    VM.startTime = Date.now();
    VM.gpu.active = false;
    VM.gpu.refreshed = false;
    var instruction = '';
    var program = []; // Make groups of 2 bytes
    for (var i = 0; i < bin.length + 4; i+=4) {
        instruction += bin.charAt(i);
        instruction += bin.charAt(i + 1);
        instruction += bin.charAt(i + 2);
        instruction += bin.charAt(i + 3);
        program.push(parseInt(instruction, 16));
        instruction = '';
    }
    VM.code = program;
    for (var i = 0; i < 128 * MEMORY_SEGMENT_SIZE; i++) {
        VM.memory[ROM_SEGMENT_START * MEMORY_SEGMENT_SIZE + i] = 0;
    }
    if (rom) {
        for (var i = 0; i < rom.length; i++) {
            VM.memory[ROM_SEGMENT_START * MEMORY_SEGMENT_SIZE + i] = rom[i];
        }
    }
    VM.startTime = Date.now();
    if (running)
        clearInterval(running);
    running = setInterval(()=>run(VM), 16);
}

function romStringToBinary(rom) {
    var byte = '';
    var data = new Array(NUM_SEGMENTS / 2 * MEMORY_SEGMENT_SIZE).fill(0);
    for (var i = 0; i < rom.length + 2; i += 2) {
        byte += rom.charAt(i);
        byte += rom.charAt(i + 1);
        data[i / 2] = parseInt(byte, 16);
        byte = '';
    }
    return data;
}

function uploadRom(files) {
    var file = files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
        var rom = new Uint8Array(reader.result);
        loadedRoms.push({name: file.name, data: rom});
        var option = document.createElement('option');
        option.value = file.name;
        option.innerHTML = file.name;
        document.getElementById('rom_select').appendChild(option);
        option.selected = 'selected';
    };
    if (file)
        reader.readAsArrayBuffer(file);
}

function getRom() {
    var romName = document.getElementById('rom_select').value;
    var rom = null;
    if (romName == '[None]')
        return null;
    loadedRoms.forEach((r) => {
        if (r.name == romName)
            rom = r.data;
    });
    return rom;
}

//loadProgram(mars, romStringToBinary(marsrom));

VM.canvas = document.getElementById('game_canvas');
VM.ctx = VM.canvas.getContext('2d');

document.getElementById('vaporlang_input').value = pong2;

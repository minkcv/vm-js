var vaporEditor;
var asmEditor;

layout.registerComponent( 'codeComponent', function(container, componentState) {
    container.getElement().html(
    `<textarea class='codeEditor' id='` + componentState.type + `_input'></textarea>`);
    container.on('open', function() {
        var myCodeMirror = CodeMirror.fromTextArea(document.getElementById(componentState.type + '_input'), {
            mode: '',
            theme: 'base16-dark',
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true
        });
        if (componentState.type == 'vaporlang')
            myCodeMirror.setValue(pong2);
        if (componentState.type == 'vaporlang')
            vaporEditor = myCodeMirror;
        else
            asmEditor = myCodeMirror;
    });
});

layout.on('stackCreated', function (stack) {
    if (stack.config.id == 'codeStack') {
        stack.on('activeContentItemChanged', function(contentItem) {
            if (contentItem.config.componentState.type == 'vaporlang' && vaporEditor)
                vaporEditor.refresh();
            if (contentItem.config.componentState.type == 'assembly' && asmEditor)
                asmEditor.refresh();
        });
    }
});
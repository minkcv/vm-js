var config = {
    settings: {
        showPopoutIcon: false,
        showMaximiseIcon: false,
        showCloseIcon: false
    },
    content: [{
        type: 'row',
        content:[{
            type: 'column',
            width: 25,
            content:[{
                type: 'component',
                height: 25,
                componentName: 'displayComponent',
                componentState: {},
                isClosable: false,
                title: 'Display'
            },{
                type: 'component',
                height: 25,
                componentName: 'actionsComponent',
                componentState: {},
                isClosable: false,
                title: 'Actions'
            },{
                type: 'component',
                height: 25,
                componentName: 'logComponent',
                componentState: {},
                isClosable: false,
                title: 'Log'
            }]
        },{
            type: 'column',
            content:[{
                type: 'stack',
                id: 'codeStack',
                height: 30,
                content: [{
                    type: 'component',
                    height: 35,
                    componentName: 'codeComponent',
                    componentState: {type: 'vaporlang'},
                    isClosable: false,
                    title: 'Vaporlang'
                },{
                    type: 'component',
                    componentName: 'codeComponent',
                    componentState: {type: 'assembly'},
                    isClosable: false,
                    title: 'Assembly'
                }]
            }]
        },{
            type: 'component',
            componentName: 'spritesComponent',
            componentState: {},
            isClosable: false,
            title: 'Sprites'
        }]
    }]
};
var layout = new GoldenLayout(config);

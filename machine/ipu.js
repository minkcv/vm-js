var keys1 = { "ArrowUp": KEY_UP, "ArrowDown": KEY_DOWN, "ArrowRight": KEY_RIGHT, "ArrowLeft": KEY_LEFT, "KeyO": KEY_RCTRL, "KeyU": KEY_RALT, "KeyY": KEY_RSHIFT, "KeyH": KEY_RETURN};
var keys2 = { "KeyA": KEY_A, "KeyS": KEY_S, "KeyW": KEY_W, "KeyD": KEY_D , "KeyQ": KEY_LCTRL, "KeyE": KEY_LALT, "KeyR": KEY_LSHIFT, "KeyF": KEY_TAB};
addEventListener("keydown", function(e) {
    if (keys1[e.code]) {
        var joystick1Bits = getJoystickBits(JOYSTICK_1_OFFSET);
        joystick1Bits |= keys1[e.code];
        setJoystickBits(JOYSTICK_1_OFFSET, joystick1Bits);
    }
    else if (keys2[e.code]) {
        var joystick2Bits = getJoystickBits(JOYSTICK_2_OFFSET);
        joystick2Bits |= keys2[e.code];
        setJoystickBits(JOYSTICK_2_OFFSET, joystick2Bits);
    }
}, false);

addEventListener("keyup", function(e) {
    if (keys1[e.code]) {
        var joystick1Bits = getJoystickBits(JOYSTICK_1_OFFSET);
        joystick1Bits &= (~keys1[e.code]);
        setJoystickBits(JOYSTICK_1_OFFSET, joystick1Bits);
    }
    else if (keys2[e.code]) {
        var joystick2Bits = getJoystickBits(JOYSTICK_2_OFFSET);
        joystick2Bits &= (~keys2[e.code]);
        setJoystickBits(JOYSTICK_2_OFFSET, joystick2Bits);
    }
}, false);

function getJoystickBits(jsNumber) {
    return VM.memory[JOYSTICK_SEGMENT * MEMORY_SEGMENT_SIZE + jsNumber];
}
function setJoystickBits(jsNumber, bits) {
    VM.memory[JOYSTICK_SEGMENT * MEMORY_SEGMENT_SIZE + jsNumber] = bits;
}
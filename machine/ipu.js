var keys1 = { "ArrowUp": KEY_UP, "ArrowDown": KEY_DOWN, "ArrowRight": KEY_RIGHT, "ArrowLeft": KEY_LEFT, "ControlRight": KEY_RCTRL, "AltRight": KEY_RALT, "ShiftRight": KEY_RSHIFT, "Enter": KEY_RETURN};
var keys2 = { "KeyA": KEY_A, "KeyS": KEY_S, "KeyW": KEY_W, "KeyD": KEY_D , "ControlLeft": KEY_LCTRL, "AltLeft": KEY_LALT, "ShiftLeft": KEY_LSHIFT, "Tab": KEY_TAB};
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
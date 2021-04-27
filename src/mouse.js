const gl = document.querySelector("#c").getContext("webgl");

var currentMouse = { x: -1, y: -1 };
var previousMouse = { x: -1, y: -1 };
var mouseButtons;

const MOUSE_LEFT = 1;
const MOUSE_RIGHT = 2;

module.exports = {

    handleInput: function (e) {
        previousMouse = currentMouse;
        currentMouse = { x: e.clientX, y: e.clientY };
        mouseButtons = e.buttons;
    },

    isMouseLeftDown: function () {
        return mouseButtons & MOUSE_LEFT;
    },

    isMouseRightDown: function () {
        return mouseButtons & MOUSE_RIGHT;
    },

    getMouseDelta: function () {
        return { dx: currentMouse.x - previousMouse.x, dy:  -(currentMouse.y - previousMouse.y) };
    },

    getMousePosNorm: function () {
        let normX = 2 * (currentMouse.x / gl.canvas.width) - 1;
        let normY = -(2 * (currentMouse.y / gl.canvas.height) - 1);
        return { x: normX, y: normY };
    },

    getMousePos: function () {
        return currentMouse;
    }

};
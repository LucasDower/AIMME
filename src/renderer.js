const twgl = require('twgl.js');
const fs = require('fs');
const mouseHandler = require('./src/mouse.js');
const cameraHandler = require('./src/camera.js');
const { Console } = require('console');

var vertex_shader = fs.readFileSync('./shaders/vertex.vs', 'utf8');
var fragment_shader = fs.readFileSync('./shaders/fragment.fs', 'utf8');

const m4 = twgl.m4;
const v3 = twgl.v3;
const gl = document.querySelector("#c").getContext("webgl");
const programInfo = twgl.createProgramInfo(gl, [vertex_shader, fragment_shader]);

const arrays = {
    position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
    normal: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
    texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    indices: [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
};
const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

const tex = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: [
        255, 255, 255, 255,
        192, 192, 192, 255,
        192, 192, 192, 255,
        255, 255, 255, 255,
    ],
});

const uniforms = {
    u_lightWorldPos: [4, 8, -10],
    u_lightColor: [1, 0.8, 0.8, 1],
    u_ambient: [0.2, 0.2, 0.2, 1],
    u_specular: [0.5, 0.5, 0.5, 1],
    u_shininess: 50,
    u_specularFactor: 1,
    u_diffuse: tex,
};

var camera = new cameraHandler.ArcballCamera(30, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 10.0);

gl.canvas.addEventListener('mousemove', (e) => {
    mouseHandler.handleInput(e);
    if (mouseHandler.isMouseLeftDown()) {
        var delta = mouseHandler.getMouseDelta();
        camera.updateCamera(delta);
    }
});


function render(time) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var world = camera.getWorldMatrix();
    uniforms.u_viewInverse = camera.getCameraMatrix();
    uniforms.u_world = world;
    uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
    uniforms.u_worldViewProjection = m4.multiply(camera.getViewProjection(), world);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
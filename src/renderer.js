const twgl = require('twgl.js');
const mouseHandler = require('./src/mouse.js');
const cameraHandler = require('./src/camera.js');
const meshManager = require('./src/mesh.js');
const shaderManager = require('./src/shaders.js');
const rayManager = require('./src/ray.js');

const m4 = twgl.m4;
const v3 = twgl.v3;
const gl = document.querySelector("#c").getContext("webgl");

var camera = new cameraHandler.ArcballCamera(30, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 30.0);

const gridMesh = meshManager.generateGridMesh();
const gridBuffer = twgl.createBufferInfoFromArrays(gl, gridMesh);


//let hopper = new meshManager.Model('./resources/models/block/hopper.json', gl);
let lectern = new meshManager.Model('./resources/models/block/lectern.json', gl);


gl.canvas.addEventListener('mousedown', (e) => {
    camera.isRotating = true;
});

gl.canvas.addEventListener('mouseup', (e) => {
    camera.isRotating = false;
});

gl.canvas.addEventListener('mousemove', (e) => {
    mouseHandler.handleInput(e);
    camera.updateCamera();
});

gl.canvas.addEventListener('wheel', (e) => {
    camera.handleScroll(e);
});


function drawGrid() {
    const uniforms = {
        u_worldViewProjection: camera.getWorldViewProjection(),
        u_scale: v3.create(2.0/16.0, 2.0, 2.0/16.0)
    };

    drawBufferWithShader(gl.LINES, gridBuffer, uniforms, shaderManager.unshadedProgram);
}


function drawModel(model, translation) {
    const uniforms = {
        u_lightWorldPos: [10, -5, 2.5],
        u_diffuse: model.textureUnit,
        u_viewInverse: camera.getCameraMatrix(),
        u_world: camera.getWorldMatrix(),
        u_worldInverseTranspose: camera.getWorldInverseTranspose(),
        u_worldViewProjection: camera.getWorldViewProjection(),
        u_translate: translation
    };

    drawBufferWithShader(gl.TRIANGLES, model.modelBuffer, uniforms, shaderManager.shadedProgram);
}


function drawBufferWithShader(drawMode, buffer, uniforms, shader) {
    gl.useProgram(shader.program);
    twgl.setBuffersAndAttributes(gl, shader, buffer);
    twgl.setUniforms(shader, uniforms);
    gl.drawElements(drawMode, buffer.numElements, gl.UNSIGNED_SHORT, 0);
}


function render(time) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawModel(lectern, v3.create(0.0, 0.0, 0));
    drawGrid();

    const ray = camera.getMouseRay();
    const rayHit = rayManager.intersectMesh(lectern.modelMesh, ray);
    if (rayHit) {
        /*
        const vs = rayHit.vertices;
        const n = rayHit.normal;
        const rayMesh = {
            position: [
                vs[0][0], vs[0][1], vs[0][2],
                vs[1][0], vs[1][1], vs[1][2],
                vs[2][0], vs[2][1], vs[2][2],
                vs[3][0], vs[3][1], vs[3][2]
            ],
            indices: [0, 1, 2, 3]
        };
        */
       const rayMesh = meshManager.getFaceMesh(lectern.modelMesh, rayHit);
        const uniforms = {
            u_worldViewProjection: camera.getWorldViewProjection(),
        };
        const buffer = twgl.createBufferInfoFromArrays(gl, rayMesh);
        drawBufferWithShader(gl.TRIANGLE_FAN, buffer, uniforms, shaderManager.testProgram);
    }

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
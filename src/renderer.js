const twgl = require('twgl.js');
const fs = require('fs');
const mouseHandler = require('./src/mouse.js');
const cameraHandler = require('./src/camera.js');
const meshManager = require('./src/mesh.js');
const rayManager = require('./src/ray.js');
const { Console } = require('console');

var shaded_vertex_shader = fs.readFileSync('./shaders/shaded_vertex.vs', 'utf8');
var shaded_fragment_shader = fs.readFileSync('./shaders/shaded_fragment.fs', 'utf8');

var unshaded_vertex_shader = fs.readFileSync('./shaders/unshaded_vertex.vs', 'utf8');
var unshaded_fragment_shader = fs.readFileSync('./shaders/unshaded_fragment.fs', 'utf8');

var test_vertex_shader = fs.readFileSync('./shaders/test_vertex.vs', 'utf8');
var test_fragment_shader = fs.readFileSync('./shaders/test_fragment.fs', 'utf8');

const m4 = twgl.m4;
const v3 = twgl.v3;
const v4 = twgl.v4;
const gl = document.querySelector("#c").getContext("webgl");
const shadedProgram = twgl.createProgramInfo(gl, [shaded_vertex_shader, shaded_fragment_shader]);
const unshadedProgram = twgl.createProgramInfo(gl, [unshaded_vertex_shader, unshaded_fragment_shader]);
const testProgram = twgl.createProgramInfo(gl, [test_vertex_shader, test_fragment_shader]);


let model = fs.readFileSync('./resources/template_anvil.json', 'utf8');
model = JSON.parse(model);
const arrays = meshManager.generateJSONMesh(model);

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

const points = meshManager.generateGridMesh();
const pointsBuffer = twgl.createBufferInfoFromArrays(gl, points);

const tex = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: './resources/anvil.png'
});



const shaded_uniforms = {
    u_lightWorldPos: [10, -5, 2.5],
    u_diffuse: tex,
};

var camera = new cameraHandler.ArcballCamera(30, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 30.0);

let mouseX = 0;
let mouseY = 0;

gl.canvas.addEventListener('mousemove', (e) => {
    mouseHandler.handleInput(e);
    if (mouseHandler.isMouseLeftDown()) {
        var delta = mouseHandler.getMouseDelta();
        camera.updateCamera(delta);
    }
    mouseX = 2 * (e.clientX / gl.canvas.width) - 1;
    mouseY = -(2 * (e.clientY / gl.canvas.height) - 1);
});


// Scroll wheen controls camera distance
gl.canvas.addEventListener('wheel', (e) => {
    camera.handleScroll(e);
});


function multiplyMV(mat, vec) {
    let res = [];
    res.push(mat[0]  * vec[0] + mat[4]  * vec[1] + mat[8]  * vec[2] + mat[12]  * vec[3]);
    res.push(mat[1]  * vec[0] + mat[5]  * vec[1] + mat[9]  * vec[2] + mat[13]  * vec[3]);
    res.push(mat[2]  * vec[0] + mat[6]  * vec[1] + mat[10] * vec[2] + mat[14] * vec[3]);
    res.push(mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15] * vec[3]);
    return res;
}

function render(time) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.clearColor(0.1,0.1,0.1,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var world = camera.getWorldMatrix();
    shaded_uniforms.u_viewInverse = camera.getCameraMatrix();
    shaded_uniforms.u_world = world;
    shaded_uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
    shaded_uniforms.u_worldViewProjection = m4.multiply(camera.getViewProjection(), world);



    var invProj = m4.inverse(shaded_uniforms.u_worldViewProjection);
    var from = multiplyMV(invProj, [mouseX, mouseY, -1.0, 1.0]);
    var to = multiplyMV(invProj, [mouseX, mouseY, 1.0, 1.0]);

    from[0] /= from[3];
    from[1] /= from[3];
    from[2] /= from[3];

    to[0] /= to[3];
    to[1] /= to[3];
    to[2] /= to[3];

    var unshaded_uniforms = {};
    unshaded_uniforms.u_worldViewProjection = m4.multiply(camera.getViewProjection(), world);
    unshaded_uniforms.u_scale = v3.create(2.0/16.0, 2.0, 2.0/16.0);

    // Render model
    
    gl.useProgram(shadedProgram.program);
    twgl.setBuffersAndAttributes(gl, shadedProgram, bufferInfo);
    twgl.setUniforms(shadedProgram, shaded_uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    
    // Render grid
    gl.useProgram(unshadedProgram.program);
    twgl.setBuffersAndAttributes(gl, unshadedProgram, pointsBuffer);
    twgl.setUniforms(unshadedProgram, unshaded_uniforms);
    gl.drawElements(gl.LINES, pointsBuffer.numElements, gl.UNSIGNED_SHORT, 0);

    // Render selection
    let rayOrigin = v3.create(from[0], from[1], from[2]);
    let rayDest = v3.create(to[0], to[1], to[2]);
    let hit = rayManager.intersectMesh(arrays, rayOrigin, rayDest);
    if (hit.length > 0) {
        gl.useProgram(testProgram.program);
        let test = {position: [hit[0][0], hit[0][1], hit[0][2], hit[1][0], hit[1][1], hit[1][2], hit[2][0], hit[2][1], hit[2][2]], indices: [0, 1, 2]};
        console.log(test);
        const testBuffer = twgl.createBufferInfoFromArrays(gl, test);
        var test_uniforms = {};
        test_uniforms.u_worldViewProjection = m4.multiply(camera.getViewProjection(), world);
        twgl.setBuffersAndAttributes(gl, testProgram, testBuffer);
        twgl.setUniforms(testProgram, test_uniforms);
        gl.drawElements(gl.LINE_LOOP, testBuffer.numElements, gl.UNSIGNED_SHORT, 0);
    }

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
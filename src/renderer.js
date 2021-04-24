const twgl = require('twgl.js');
const fs = require('fs');
const mouseHandler = require('./src/mouse.js');
const cameraHandler = require('./src/camera.js');
const meshManager = require('./src/mesh.js');
const rayManager = require('./src/ray.js');
const shaderManager = require('./src/shaders.js');
const mathUtil = require('./src/math.js');

const m4 = twgl.m4;
const v3 = twgl.v3;
const gl = document.querySelector("#c").getContext("webgl");


// Load anvil model data and texture
let model = fs.readFileSync('./resources/template_anvil.json', 'utf8');
model = JSON.parse(model);

const texture = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: './resources/anvil.png'
});

// Build mesh from model data
const modelMesh = meshManager.generateJSONMesh(model);
const modelBuffer = twgl.createBufferInfoFromArrays(gl, modelMesh);

const gridMesh = meshManager.generateGridMesh();
const gridBuffer = twgl.createBufferInfoFromArrays(gl, gridMesh);

const shaded_uniforms = {
    u_lightWorldPos: [10, -5, 2.5],
    u_diffuse: texture,
};

var camera = new cameraHandler.ArcballCamera(30, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 30.0);


gl.canvas.addEventListener('mousemove', (e) => {
    mouseHandler.handleInput(e);
    if (mouseHandler.isMouseLeftDown()) {
        var delta = mouseHandler.getMouseDelta();
        camera.updateCamera(delta);
    }
});


// Scroll wheen controls camera distance
gl.canvas.addEventListener('wheel', (e) => {
    camera.handleScroll(e);
});


function getMissingVert(v0, v1, v2) {
    let xs = [v0[0], v1[0], v2[0]];
    let ys = [v0[1], v1[1], v2[1]];
    let zs = [v0[2], v1[2], v2[2]];
    xs.sort();
    ys.sort();
    zs.sort();
    let x = xs[0] == xs[1] ? xs[2] : xs[1];
    let y = ys[0] == ys[1] ? ys[2] : ys[1];
    let z = zs[0] == zs[1] ? zs[2] : zs[1];
    return [x, y, z];
}

let pseudoTime = 0;
let hitting = false;

function render(time) {
    pseudoTime++;

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
    let mousePos = mouseHandler.getMousePosNorm();
    var from = mathUtil.multiplyMV(invProj, [mousePos.x, mousePos.y, -1.0, 1.0]);
    var to = mathUtil.multiplyMV(invProj, [mousePos.x, mousePos.y, 1.0, 1.0]);

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
    gl.useProgram(shaderManager.shadedProgram.program);
    twgl.setBuffersAndAttributes(gl, shaderManager.shadedProgram, modelBuffer);
    twgl.setUniforms(shaderManager.shadedProgram, shaded_uniforms);
    gl.drawElements(gl.TRIANGLES, modelBuffer.numElements, gl.UNSIGNED_SHORT, 0);
    
    // Render grid
    gl.useProgram(shaderManager.unshadedProgram.program);
    twgl.setBuffersAndAttributes(gl, shaderManager.unshadedProgram, gridBuffer);
    twgl.setUniforms(shaderManager.unshadedProgram, unshaded_uniforms);
    gl.drawElements(gl.LINES, gridBuffer.numElements, gl.UNSIGNED_SHORT, 0);


    const rayOrigin = v3.create(from[0], from[1], from[2]);
    const rayDest = v3.create(to[0], to[1], to[2]);
    let hit = rayManager.intersectMesh(modelMesh, rayOrigin, rayDest);

    // Render selection
    if (hit) {
        if (!hitting) {
            pseudoTime = 0;
            hitting = true;
            console.log('set pseudo');
        }
        const selectionVertices = {
            position: [hit[0][0], hit[0][1], hit[0][2], hit[1][0], hit[1][1], hit[1][2], hit[2][0], hit[2][1], hit[2][2], hit[3][0], hit[3][1], hit[3][2]],
            normal: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
            indices: [0, 1, 2, 3]
        };
        const selectionBuffer = twgl.createBufferInfoFromArrays(gl, selectionVertices);
        gl.useProgram(shaderManager.testProgram.program);
        twgl.setBuffersAndAttributes(gl, shaderManager.testProgram, selectionBuffer);
        twgl.setUniforms(shaderManager.testProgram, {u_worldViewProjection: camera.getWorldViewProjection(), time: pseudoTime});
        gl.drawElements(gl.TRIANGLE_FAN, selectionBuffer.numElements, gl.UNSIGNED_SHORT, 0);
    } else {
        hitting = false;
    }

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
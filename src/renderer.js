const twgl = require('twgl.js');
const fs = require('fs');
const mouseHandler = require('./src/mouse.js');
const cameraHandler = require('./src/camera.js');
const meshManager = require('./src/mesh.js');
const rayManager = require('./src/ray.js');
const shaderManager = require('./src/shaders.js');
const mathUtil = require('./src/math.js');
const textureUtil = require('./src/texture.js');

const m4 = twgl.m4;
const v3 = twgl.v3;
const gl = document.querySelector("#c").getContext("webgl");

var camera = new cameraHandler.ArcballCamera(30, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 30.0);

const gridMesh = meshManager.generateGridMesh();
const gridBuffer = twgl.createBufferInfoFromArrays(gl, gridMesh);

//let hopper = new meshManager.Model('./resources/models/block/hopper.json', gl);
let lectern = new meshManager.Model('./resources/models/block/lectern.json', gl);
console.log(lectern);


let hitting = false;
let rotateCamera = false;

/*
let pseudoTime = 0;

let hoverIndices = [];
let initialPositions = [{x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}];
let editingIndices = [];
let editing = false;

let initialEditMouse = null;
*/

gl.canvas.addEventListener('mousedown', (e) => {
    if (!hitting) {
        rotateCamera = true;
    }
    /*else {
        editingIndices = hoverIndices;
        initialPositions[0].x = modelMesh.position[editingIndices[0] + 0];
        initialPositions[0].y = modelMesh.position[editingIndices[0] + 1];
        initialPositions[0].z = modelMesh.position[editingIndices[0] + 2];
        initialPositions[1].x = modelMesh.position[editingIndices[1] + 0];
        initialPositions[1].y = modelMesh.position[editingIndices[1] + 1];
        initialPositions[1].z = modelMesh.position[editingIndices[1] + 2];
        initialPositions[2].x = modelMesh.position[editingIndices[2] + 0];
        initialPositions[2].y = modelMesh.position[editingIndices[2] + 1];
        initialPositions[2].z = modelMesh.position[editingIndices[2] + 2];
        initialPositions[3].x = modelMesh.position[editingIndices[3] + 0];
        initialPositions[3].y = modelMesh.position[editingIndices[3] + 1];
        initialPositions[3].z = modelMesh.position[editingIndices[3] + 2];
        initialEditMouse = mouseHandler.getMousePos();
        editing = true;
    }
    */
});

gl.canvas.addEventListener('mouseup', (e) => {
    rotateCamera = false;
    //editing = false;
});

gl.canvas.addEventListener('mousemove', (e) => {
    mouseHandler.handleInput(e);
    //console.log(initialEditMouse);
    if (rotateCamera) {
        var delta = mouseHandler.getMouseDelta();
        camera.updateCamera(delta);
    }
    /*
    else if (editing) {
        //console.log('editing');
        let curMou = mouseHandler.getMousePos();
        let dx = curMou.x - initialEditMouse.x;
        let dy = curMou.y - initialEditMouse.y;
        // get face normal
        let normal = modelMesh.normal.slice(editingIndices[0], editingIndices[0] + 3);
        if (normal[0] == 0 && normal[1] == 1 && normal[2] == 0) {
            // Update each of the 4 vertices' y-position
            let y0 = Math.round(initialPositions[0].y - dy * 0.05);
            let y1 = Math.round(initialPositions[1].y - dy * 0.05);
            let y2 = Math.round(initialPositions[2].y - dy * 0.05);
            let y3 = Math.round(initialPositions[3].y - dy * 0.05);
            meshManager.editMeshVertexY(modelMesh, editingIndices[0]/3, y0);
            meshManager.editMeshVertexY(modelMesh, editingIndices[1]/3, y1);
            meshManager.editMeshVertexY(modelMesh, editingIndices[2]/3, y2);
            meshManager.editMeshVertexY(modelMesh, editingIndices[3]/3, y3);
        }
        modelBuffer = twgl.createBufferInfoFromArrays(gl, modelMesh);
    }
    */
});

gl.canvas.addEventListener('wheel', (e) => {
    camera.handleScroll(e);
});


function drawGrid() {
    const world = camera.getWorldMatrix();

    const unshaded_uniforms = {
        u_worldViewProjection: m4.multiply(camera.getViewProjection(), world),
        u_scale: v3.create(2.0/16.0, 2.0, 2.0/16.0)
    };

    gl.useProgram(shaderManager.unshadedProgram.program);
    twgl.setBuffersAndAttributes(gl, shaderManager.unshadedProgram, gridBuffer);
    twgl.setUniforms(shaderManager.unshadedProgram, unshaded_uniforms);
    gl.drawElements(gl.LINES, gridBuffer.numElements, gl.UNSIGNED_SHORT, 0);
}


function drawModel(model, translation) {

    const world = camera.getWorldMatrix();

    const shaded_uniforms = {
        u_lightWorldPos: [10, -5, 2.5],
        u_diffuse: model.textureUnit,
        u_viewInverse: camera.getCameraMatrix(),
        u_world: world,
        u_worldInverseTranspose: m4.transpose(m4.inverse(world)),
        u_worldViewProjection: m4.multiply(camera.getViewProjection(), world),
        u_translate: translation
    };

    gl.useProgram(shaderManager.shadedProgram.program);
    twgl.setBuffersAndAttributes(gl, shaderManager.shadedProgram, model.modelBuffer);
    twgl.setUniforms(shaderManager.shadedProgram, shaded_uniforms);
    gl.drawElements(gl.TRIANGLES, model.modelBuffer.numElements, gl.UNSIGNED_SHORT, 0);
}

/*
function drawFaceHighlight() {
    const world = camera.getWorldMatrix();
    const worldViewProjection = m4.multiply(camera.getViewProjection(), world);
    const invProj = m4.inverse(worldViewProjection);
    const mousePos = mouseHandler.getMousePosNorm();
    var from = mathUtil.multiplyMV(invProj, [mousePos.x, mousePos.y, -1.0, 1.0]);
    var to = mathUtil.multiplyMV(invProj, [mousePos.x, mousePos.y, 1.0, 1.0]);

    from[0] /= from[3];
    from[1] /= from[3];
    from[2] /= from[3];

    to[0] /= to[3];
    to[1] /= to[3];
    to[2] /= to[3];

    // Cast ray through camera at mouse position
    const rayOrigin = v3.create(from[0], from[1], from[2]);
    const rayDest = v3.create(to[0], to[1], to[2]);
    let rayhit = rayManager.intersectMesh(modelMesh, rayOrigin, rayDest);

    // Render selection
    if (rayhit) {
        if (!hitting) {
            pseudoTime = 0;
            hitting = true;
        }
        let verts = rayhit.vertices;
        hoverIndices = rayhit.indices;
        const selectionVertices = {
            position: [verts[0][0], verts[0][1], verts[0][2], verts[1][0], verts[1][1], verts[1][2], verts[2][0], verts[2][1], verts[2][2], verts[3][0], verts[3][1], verts[3][2]],
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

}
*/

function render(time) {
    //pseudoTime++;

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.clearColor(0.1,0.1,0.1,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawModel(lectern, v3.create(0.0, 0.0, 0));
    //drawModel(hopper, v3.create(0.75, 0.0, 0));
    drawGrid();
    //drawFaceHighlight();

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
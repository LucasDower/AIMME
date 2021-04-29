const { v3: Vector3 } = require("twgl.js");
const twgl = require('twgl.js');
const fs = require('fs');
const textureUtil = require('./texture.js');

function getGridColour(i, j, isXAxis) {
    if (i == 0 && isXAxis) {
        return [0.25, 0.75, 0.25];
    }
    if (j == 0 && !isXAxis) {
        return [0.75, 0.25, 0.25];
    }
    return [0.25, 0.25, 0.25];
}

function generateGridMesh() {
    vertices = [];
    colours = [];
    indices = [];

    var gridSize = 64;

    for (let i = -gridSize / 2; i < gridSize / 2; i++) {
        for (let j = -gridSize / 2; j < gridSize / 2; j++) {
            let k = indices.length;

            let colour = getGridColour(i, j, false);
            vertices.push(i, 0, j);
            colours.push(colour[0], colour[1], colour[2]); // .push > .concat
            indices.push(k);

            vertices.push(i + 1, 0, j);
            colours.push(colour[0], colour[1], colour[2]);
            indices.push(k + 1);


            colour = getGridColour(i, j, true);
            vertices.push(i, 0, j);
            colours.push(colour[0], colour[1], colour[2]);
            indices.push(k + 2);

            vertices.push(i, 0, j + 1);
            colours.push(colour[0], colour[1], colour[2]);
            indices.push(k + 3);
        }
    }

    let k = indices.length;

    vertices.push(gridSize / 2, 0, -gridSize / 2);
    colours.push(0.0, 1.0, 1.0);
    indices.push(k);

    vertices.push(gridSize / 2, 0, gridSize / 2);
    colours.push(0.0, 1.0, 1.0);
    indices.push(k + 1);

    vertices.push(-gridSize / 2, 0, gridSize / 2);
    colours.push(1.0, 0.0, 0.0);
    indices.push(k + 2);

    vertices.push(gridSize / 2, 0, gridSize / 2);
    colours.push(1.0, 0.0, 0.0);
    indices.push(k + 3);

    return { position: { numComponents: 3, data: vertices }, colour: { numComponents: 3, data: colours }, indices: indices };
}

function getMeshVertex(mesh, vertexIndex, transform) {
    let v0 = mesh.position[vertexIndex * 3];
    let v1 = mesh.position[vertexIndex * 3 + 1];
    let v2 = mesh.position[vertexIndex * 3 + 2];

    if (transform) {
        v0 = (v0 / 16.0) - 0.5;
        v1 = (v1 / 16.0) - 0.5;
        v2 = (v2 / 16.0) - 0.5;
    }

    return Vector3.create(v0, v1, v2);
}

let vertexIndexMap = {};

function editMeshVertex(mesh, vertexIndex, editedVertex) {
    for (let duplicateVertexIndex of vertexIndexMap[vertexIndex]) {
        mesh.position[duplicateVertexIndex + 0] = editedVertex[0];
        mesh.position[duplicateVertexIndex + 1] = editedVertex[1];
        mesh.position[duplicateVertexIndex + 2] = editedVertex[2];
    }
}

function editMeshVertexY(mesh, vertexIndex, y) {
    for (let duplicateVertexIndex of vertexIndexMap[vertexIndex]) {
        mesh.position[duplicateVertexIndex + 1] = y;
    }
}


function getFaceMesh(mesh, index) {
    let vertexIndices = [0, 1, 2, 3].map(x => 3 * (x + index));

    let faceMesh = {
        position: [],
        normal: [],
        indices: [0, 1, 2, 3] 
    };

    const offset = Vector3.create(0.5, 0.0, 0.5);
    for (let vertexIndex of vertexIndices) {
        let vertexPosition = Vector3.create(mesh.position[vertexIndex], mesh.position[vertexIndex + 1], mesh.position[vertexIndex + 2]);
        const vertexNormal = Vector3.create(mesh.normal[vertexIndex], mesh.normal[vertexIndex + 1], mesh.normal[vertexIndex + 2]);

        vertexPosition = Vector3.divScalar(vertexPosition, 16.0);
        vertexPosition = Vector3.subtract(vertexPosition, offset);

        faceMesh.position = faceMesh.position.concat(Array.from(vertexPosition));
        faceMesh.normal = faceMesh.normal.concat(Array.from(vertexNormal));
    }

    return faceMesh;
}


function generateUVsFromPosition(vertex_position, vertex_normal, uv_offset, num_texs, rot) {
    let y = [0, 0];
    if (vertex_normal[1] == 0 && vertex_normal[2] == 0) {
        let tx = 1 - vertex_position[2] / 16;
        let ty = 1 - vertex_position[1] / 16;
        y = [tx / num_texs + uv_offset, ty]; 
    }
    else if (vertex_normal[0] == 0 && vertex_normal[1] == 0) {
        let tx = 1 - vertex_position[0] / 16;
        let ty = 1 - vertex_position[1] / 16;
        y = [tx / num_texs + uv_offset, ty]; 
    }
    // TODO: This one needs checking
    else if (vertex_normal[2] == 0 && vertex_normal[0] == 0) {
        let tx = 1 - vertex_position[2] / 16;
        let ty = 1 - vertex_position[0] / 16;
        y = [tx / num_texs + uv_offset, ty]; 
    } else {
        throw "Bad normal";
    }
    return y;
}


function generateFace(positions, faceNormal, face, mesh, element, uv_offsets) {
    if (face == undefined) {
        return;
    }

    let faceTexture = face.texture;
    let num_texs = Object.keys(uv_offsets).length;
    let uv_offset = uv_offsets[faceTexture.substring(1)];
    uv_offset /= 16 * num_texs;

    if (element.rotation) {
        rotateElement(element, positions);
    }

    let rot = (face.rotation || 180.0) / 90.0;
    //rot += 2;

    // Add a (x,y) UV coordinate for  
    let texcoord = [[0, 3], [2, 3], [2, 1], [0, 1]];
    for (let i = 0; i < 4; i++) {
        // Add vertex position
        mesh.position = mesh.position.concat(positions[i]);
        // Add vertex normal (all the same)
        mesh.normal = mesh.normal.concat(faceNormal);
        // Add vertex tex-coords, TODO: cleanup
        if (face.uv) {
            console.log('Generate from UVs');
            let tx = face.uv[(texcoord[i][0] + rot) % 4] / 16;
            tx = tx / num_texs + uv_offset;
            let ty = face.uv[(texcoord[i][1] + rot) % 4] / 16;
            mesh.texcoord.push(tx, ty);
        } else {
            console.log('Generate from positions');
            let t = generateUVsFromPosition(positions[i], faceNormal, uv_offset, num_texs, rot);
            mesh.texcoord.push(t[0], t[1]);
        }
    }

    // Add vertex indices
    let offset = mesh.facesDrawn * 4;
    let indices = [0, 1, 2, 0, 2, 3].map(x => x + offset);
    mesh.indices = mesh.indices.concat(indices);

    mesh.facesDrawn++;
}

function generateElement(element, mesh, uv_offsets) {
    // From and to coordinates
    const f = {x: element.from[0], y: element.from[1], z: element.from[2]};
    const t = {x: element.to[0], y: element.to[1], z: element.to[2]};

    const faceDirections = ['north', 'south', 'up', 'down', 'east', 'west'];

    let positions = {
        north: [[f.x, t.y, f.z], [t.x, t.y, f.z], [t.x, f.y, f.z], [f.x, f.y, f.z]],
        south: [[t.x, t.y, t.z], [f.x, t.y, t.z], [f.x, f.y, t.z], [t.x, f.y, t.z]],
        up:    [[f.x, t.y, t.z], [t.x, t.y, t.z], [t.x, t.y, f.z], [f.x, t.y, f.z]],
        down:  [[f.x, f.y, f.z], [t.x, f.y, f.z], [t.x, f.y, t.z], [f.x, f.y, t.z]],
        east:  [[f.x, t.y, t.z], [f.x, t.y, f.z], [f.x, f.y, f.z], [f.x, f.y, t.z]],
        west:  [[t.x, t.y, f.z], [t.x, t.y, t.z], [t.x, f.y, t.z], [t.x, f.y, f.z]]
    };

    const normals = {
        north: [0, 0, -1], south: [0, 0, 1],
        up: [0, 1, 0], down: [0, -1, 0],
        east: [-1, 0, 0], west: [1, 0,0]
    };

    faceDirections.forEach(face => generateFace(positions[face], normals[face], element.faces[face], mesh, element, uv_offsets));

    return mesh;
}


function createRotationMatrix(theta, l, m, n) {
    let matrix = [[0,0,0], [0,0,0], [0,0,0]];
    // Top row
    matrix[0][0] = l * l * (1 - Math.cos(theta)) + Math.cos(theta);
    matrix[0][1] = m * l * (1 - Math.cos(theta)) - n * Math.sin(theta);
    matrix[0][2] = n * l * (1 - Math.cos(theta)) + m * Math.sin(theta);
    // Middle row
    matrix[1][0] = l * m * (1 - Math.cos(theta)) + n * Math.sin(theta);
    matrix[1][1] = m * m * (1 - Math.cos(theta)) + Math.cos(theta);
    matrix[1][2] = n * m * (1 - Math.cos(theta)) - l * Math.sin(theta);
    // Bottom row
    matrix[2][0] = l * n * (1 - Math.cos(theta)) - m * Math.sin(theta);
    matrix[2][1] = m * n * (1 - Math.cos(theta)) + l * Math.sin(theta);
    matrix[2][2] = n * n * (1 - Math.cos(theta)) + Math.cos(theta);

    return matrix;
}

function multiplyMatrixVector(matrix, vector) {
    let result = [0, 0, 0];
    result[0] = matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2];
    result[1] = matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2];
    result[2] = matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2];
    return result;
}

function rotateElement(element, positions) {
    const angle = element.rotation.angle * 0.0174533;

    const axisToVector = {
        'x': {l: 1, m: 0, n: 0},
        'y': {l: 0, m: 1, n: 0},
        'z': {l: 0, m: 0, n: 1}
    };

    const axis = axisToVector[element.rotation.axis];
    const matrix = createRotationMatrix(angle, axis.l, axis.m, axis.n);
    const origin = element.rotation.origin;

    for (let position of positions) {
        position[0] -= origin[0];
        position[1] -= origin[1];
        position[2] -= origin[2];
        const rotated = multiplyMatrixVector(matrix, position);
        position[0] = rotated[0] + origin[0];
        position[1] = rotated[1] + origin[1];
        position[2] = rotated[2] + origin[2];
    }
}


function generateJSONMesh(json, uv_offsets) {
    let mesh = {
        position: [],
        normal: [],
        texcoord: [],
        indices: [],
        facesDrawn: 0
    };
    
    json.elements.forEach(element => generateElement(element, mesh, uv_offsets));
    delete mesh.facesDrawn;

    // Generate a map from triangle to square-face. When a ray intersects with a tri,
    // we must retrieve the other triangle which makes up the square-face.
    let intermediateMap = {};
    for (let i = 0; i < mesh.position.length; i+=3) {
        let vertex = mesh.position.slice(i, i+3);
        intermediateMap[vertex] = (intermediateMap[vertex] || []).concat(i);
    }
    for (let values of Object.values(intermediateMap)) {
        for (let v of values) {
            vertexIndexMap[v / 3] = values;
        }
    }

    return mesh;
}


class Model {

    constructor(filename, gl) {
        const model = fs.readFileSync(filename, 'utf8');
        this.modelJSON = JSON.parse(model);

        const textureAtlas = textureUtil.createTextureAtlas(this.modelJSON, gl);
        this.uvOffsets = textureAtlas.uv_offset;
        this.textureUnit = twgl.createTexture(gl, textureAtlas.tex);

        this.modelMesh = generateJSONMesh(this.modelJSON, this.uvOffsets);
        this.modelBuffer = twgl.createBufferInfoFromArrays(gl, this.modelMesh);
    }

}

module.exports.generateGridMesh = generateGridMesh;
module.exports.generateJSONMesh = generateJSONMesh;
module.exports.getMeshVertex = getMeshVertex;
module.exports.editMeshVertex = editMeshVertex;
module.exports.editMeshVertexY = editMeshVertexY;
module.exports.getFaceMesh = getFaceMesh;
module.exports.Model = Model;
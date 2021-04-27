const { v3: Vector3 } = require("twgl.js");

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
    console.log('a' + vertexIndex);
    for (let duplicateVertexIndex of vertexIndexMap[vertexIndex]) {
        mesh.position[duplicateVertexIndex + 1] = y;
    }
}

function generateFace(positions, faceNormal, face, mesh) {
    if (face == undefined) {
        return;
    }

    let uv = face.uv;
    let rot = (face.rotation || 0.0) / 90.0;

    // Add a (x,y) UV coordinate for  
    let texcoord = [[0, 3], [2, 3], [2, 1], [0, 1]];
    for (let i = 0; i < 4; i++) {
        // Add vertex position
        mesh.position = mesh.position.concat(positions[i]);
        // Add vertex normal (all the same)
        mesh.normal = mesh.normal.concat(faceNormal);
        // Add vertex tex-coords, TODO: cleanup
        let tx = uv[(texcoord[i][0] + rot) % 4] / 16;
        let ty = uv[(texcoord[i][1] + rot) % 4] / 16;
        mesh.texcoord.push(tx, ty);
    }

    // Add vertex indices
    let offset = mesh.facesDrawn * 4;
    let indices = [0, 1, 2, 0, 2, 3].map(x => x + offset);
    mesh.indices = mesh.indices.concat(indices);

    mesh.facesDrawn++;
}

function generateElement(element, mesh) {
    // From and to coordinates
    const f = {x: element.from[0], y: element.from[1], z: element.from[2]};
    const t = {x: element.to[0], y: element.to[1], z: element.to[2]};

    const faceDirections = ['north', 'south', 'up', 'down', 'east', 'west'];

    const positions = {
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

    faceDirections.forEach(face => generateFace(positions[face], normals[face], element.faces[face], mesh));

    return mesh;
}

function generateJSONMesh(json) {
    let mesh = {
        position: [],
        normal: [],
        texcoord: [],
        indices: [],
        facesDrawn: 0
    };
    
    json.elements.forEach(element => generateElement(element, mesh));
    delete mesh.facesDrawn;

    // Generate a map from triangle to square-face. When a ray intersects with a tri,
    // we must retrieve the other triangle which makes up the square-face.
    let intermediateMap = {};
    for (let i = 0; i < mesh.position.length; i+=3) {
        let vertex = mesh.position.slice(i, i+3);
        intermediateMap[vertex] = (intermediateMap[vertex] || []).concat(i);
        //console.log(vertex);
    }
    for (let values of Object.values(intermediateMap)) {
        for (let v of values) {
            vertexIndexMap[v / 3] = values;
        }
    }

    console.log(vertexIndexMap);

    return mesh;
}

module.exports.generateGridMesh = generateGridMesh;
module.exports.generateJSONMesh = generateJSONMesh;
module.exports.getMeshVertex = getMeshVertex;
module.exports.editMeshVertex = editMeshVertex;
module.exports.editMeshVertexY = editMeshVertexY;
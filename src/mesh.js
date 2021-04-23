
function generateGridMesh() {
    vertices = [];
    colours = [];
    indices = [];

    var gridSize = 64;
    var inc = 1.0 / gridSize;

    for (let i = -gridSize / 2; i < gridSize / 2; i++) {
        for (let j = -gridSize / 2; j < gridSize / 2; j++) {
            let k = indices.length;

            vertices.push(i, 0, j);
            colours.push(0.5, 0.5, 0.5);
            indices.push(k);

            vertices.push(i + 1, 0, j);
            colours.push(0.5, 0.5, 0.5);
            indices.push(k + 1);

            vertices.push(i, 0, j);
            colours.push(0.5, 0.5, 0.5);
            indices.push(k + 2);

            vertices.push(i, 0, j + 1);
            colours.push(0.5, 0.5, 0.5);
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

function generateFromToMesh(from, to) {
    let x0 = from[0];
    let y0 = from[1];
    let z0 = from[2];
    let x1 = to[0];
    let y1 = to[1];
    let z1 = to[2];
    const arrays = {
        position: [
            x1, y1, z0,
            x1, y1, z1,
            x1, y0, z1,
            x1, y0, z0,
            x0, y1, z1,
            x0, y1, z0,
            x0, y0, z0,
            x0, y0, z1,
            x0, y1, z1,
            x1, y1, z1,
            x1, y1, z0,
            x0, y1, z0,
            x0, y0, z0,
            x1, y0, z0,
            x1, y0, z1,
            x0, y0, z1,
            x1, y1, z1,
            x0, y1, z1,
            x0, y0, z1,
            x1, y0, z1,
            x0, y1, z0,
            x1, y1, z0,
            x1, y0, z0,
            x0, y0, z0],
        normal: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
        texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
        indices: [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
    };
    return arrays;
}

function generateJSONMesh(json) {
    let meshElements = json.elements;

    position = [];
    normal = [];
    texcoord = [];
    indices = [];

    for (let i = 0; i < meshElements.length; i++) {
        let element = meshElements[i];
        mesh = generateFromToMesh(element.from, element.to);

        position = position.concat(mesh.position);
        normal = normal.concat(mesh.normal);
        texcoord = texcoord.concat(mesh.texcoord);
        let offset = 24 * i;
        for (let j = 0; j < mesh.indices.length; j++) {
            indices.push(mesh.indices[j] + offset);
        }
    }

    return { position: position, normal: normal, texcoord: texcoord, indices: indices };
}

module.exports.generateGridMesh = generateGridMesh;
module.exports.generateJSONMesh = generateJSONMesh;
module.exports.generateFromToMesh = generateFromToMesh;

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

function generateFromToMesh(from, to, faces) {
    let x0 = from[0];
    let y0 = from[1];
    let z0 = from[2];
    let x1 = to[0];
    let y1 = to[1];
    let z1 = to[2];


    let south = faces.south.uv;
    south[0] /= 16.0;
    south[1] /= 16.0;
    south[2] /= 16.0;
    south[3] /= 16.0;

    let north = faces.north.uv;
    north[0] /= 16.0;
    north[1] /= 16.0;
    north[2] /= 16.0;
    north[3] /= 16.0;

    const arrays = {
        position: [
            // Front face
            x1, y1, z0,
            x1, y1, z1,
            x1, y0, z1,
            x1, y0, z0,
            // Back face
            x0, y1, z1,
            x0, y1, z0,
            x0, y0, z0,
            x0, y0, z1,
            // Top face
            x0, y1, z1,
            x1, y1, z1,
            x1, y1, z0,
            x0, y1, z0,
            // Bottom face
            x0, y0, z0,
            x1, y0, z0,
            x1, y0, z1,
            x0, y0, z1,
            // Right face
            x1, y1, z1,
            x0, y1, z1,
            x0, y0, z1,
            x1, y0, z1,
            // Left face
            x0, y1, z0,
            x1, y1, z0,
            x1, y0, z0,
            x0, y0, z0],

        normal: [
            // Front face
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            // Back face
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            // Top face
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            // Bottom face
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            // Right face
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            // Left face
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1],

        texcoord: [
            // Front face
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            // Back face
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            // Top face
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            // Bottom face
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            // Right face
            south[0], south[3],
            south[2], south[3],
            south[2], south[1],
            south[0], south[1],
            // Left face
            north[0], north[3],
            north[2], north[3],
            north[2], north[1],
            north[0], north[1]
        ],
        indices: [
            // Front face
            0, 1, 2, 0, 2, 3,
            // Back face
            4, 5, 6, 4, 6, 7,
            // Top face
            8, 9, 10, 8, 10, 11,
            // Bottom face
            12, 13, 14, 12, 14, 15,
            // Right face
            16, 17, 18, 16, 18, 19,
            // Left face
            20, 21, 22, 20, 22, 23],
    };
    return arrays;
}

function generateFromToMesh2(from, to, faces) {
    let x0 = from[0];
    let y0 = from[1];
    let z0 = from[2];
    let x1 = to[0];
    let y1 = to[1];
    let z1 = to[2];

    var positions = [];
    var normals = [];
    var texcoords = [];
    var indices = [];
    let facesDrawn = 0;
    let offset = 0;

    // Draw north (left) face
    if (faces.north) {
        let north = faces.north.uv;
        let rot = (faces.south.rotation || 0.0) / 90.0;
        positions.push(x0, y1, z0, x1, y1, z0, x1, y0, z0, x0, y0, z0);
        normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
        texcoords.push(north[(0 + rot) % 4]/16, north[(3 + rot) % 4]/16, north[(2 + rot) % 4]/16, north[(3 + rot) % 4]/16, north[(2 + rot) % 4]/16, north[(1 + rot) % 4]/16, north[(0 + rot) % 4]/16, north[(1 + rot) % 4]/16);
        offset = facesDrawn * 4;
        indices.push(offset, offset + 1, offset + 2, offset + 0, offset + 2, offset + 3);
        facesDrawn++;
    }

    // Draw south (right) face
    if (faces.south) {
        let south = faces.south.uv;
        let rot = (faces.south.rotation || 0.0) / 90.0;
        positions.push(x1, y1, z1, x0, y1, z1, x0, y0, z1, x1, y0, z1);
        normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
        texcoords.push(south[(0 + rot) % 4]/16, south[(3 + rot) % 4]/16, south[(2 + rot) % 4]/16, south[(3 + rot) % 4]/16, south[(2 + rot) % 4]/16, south[(1 + rot) % 4]/16, south[(0 + rot) % 4]/16, south[(1 + rot) % 4]/16);
        offset = facesDrawn * 4;
        indices.push(offset, offset + 1, offset + 2, offset + 0, offset + 2, offset + 3);
        facesDrawn++;
    }

    // Draw up (top) face
    if (faces.up) {
        let up = faces.up.uv;
        let rot = (faces.up.rotation || 0.0) / 90.0;
        positions.push(x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0);
        normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
        texcoords.push(up[(0 + rot) % 4]/16, up[(3 + rot) % 4]/16, up[(2 + rot) % 4]/16, up[(3 + rot) % 4]/16, up[(2 + rot) % 4]/16, up[(1 + rot) % 4]/16, up[(0 + rot) % 4]/16, up[(1 + rot) % 4]/16);
        offset = facesDrawn * 4;
        indices.push(offset, offset + 1, offset + 2, offset + 0, offset + 2, offset + 3);
        facesDrawn++;
    }

    // Draw down (bottom) face
    if (faces.down) {
        let down = faces.down.uv;
        let rot = (faces.down.rotation || 0.0)  / 90.0;
        positions.push(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1);
        normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);
        texcoords.push(down[(0 + rot) % 4]/16, down[(3 + rot) % 4]/16, down[(2 + rot) % 4]/16, down[(3 + rot) % 4]/16, down[(2 + rot) % 4]/16, down[(1 + rot) % 4]/16, down[(0 + rot) % 4]/16, down[(1 + rot) % 4]/16);
        offset = facesDrawn * 4;
        indices.push(offset, offset + 1, offset + 2, offset + 0, offset + 2, offset + 3);
        facesDrawn++;
    }

    // Draw east (back) face
    if (faces.east) {
        let east = faces.east.uv;
        let rot = (faces.east.rotation || 0.0) / 90.0;
        positions.push(x0, y1, z1, x0, y1, z0, x0, y0, z0, x0, y0, z1);
        normals.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0);
        texcoords.push(east[(0 + rot) % 4]/16, east[(3 + rot) % 4]/16, east[(2 + rot) % 4]/16, east[(3 + rot) % 4]/16, east[(2 + rot) % 4]/16, east[(1 + rot) % 4]/16, east[(0 + rot) % 4]/16, east[(1 + rot) % 4]/16);
        offset = facesDrawn * 4;
        indices.push(offset, offset + 1, offset + 2, offset + 0, offset + 2, offset + 3);
        facesDrawn++;
    }

    // Draw west (front) face
    if (faces.west) {
        let west = faces.west.uv;
        let rot = (faces.west.rotation || 0.0) / 90.0;
        positions.push(x1, y1, z0, x1, y1, z1, x1, y0, z1, x1, y0, z0);
        normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
        texcoords.push(west[(0 + rot) % 4]/16, west[(3 + rot) % 4]/16, west[(2 + rot) % 4]/16, west[(3 + rot) % 4]/16, west[(2 + rot) % 4]/16, west[(1 + rot) % 4]/16, west[(0 + rot) % 4]/16, west[(1 + rot) % 4]/16);
        offset = facesDrawn * 4;
        indices.push(offset, offset + 1, offset + 2, offset + 0, offset + 2, offset + 3);
        facesDrawn++;
    }
    
    return {position: positions, normal: normals, texcoord: texcoords, indices: indices, facesDrawn: facesDrawn};
}

function generateJSONMesh(json) {
    let meshElements = json.elements;

    let position = [];
    let normal = [];
    let texcoord = [];
    let indices = [];
    let offset = 0;

    for (let i = 0; i < meshElements.length; i++) {
        let element = meshElements[i];
        mesh = generateFromToMesh2(element.from, element.to, element.faces);

        position = position.concat(mesh.position);
        normal = normal.concat(mesh.normal);
        texcoord = texcoord.concat(mesh.texcoord);
        for (let j = 0; j < mesh.indices.length; j++) {
            indices.push(mesh.indices[j] + offset);
        }
        offset += mesh.facesDrawn * 4;
        
    }

    return { position: position, normal: normal, texcoord: texcoord, indices: indices };
}

module.exports.generateGridMesh = generateGridMesh;
module.exports.generateJSONMesh = generateJSONMesh;
module.exports.generateFromToMesh = generateFromToMesh;
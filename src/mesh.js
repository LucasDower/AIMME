
function generateGridMesh() {
    vertices = [];
    colours = [];
    indices = [];

    var gridSize = 64;
    var inc = 1.0/gridSize;
    
    for (let i = -gridSize/2; i < gridSize/2; i++) {
        for (let j = -gridSize/2; j < gridSize/2; j++) {
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

    vertices.push(gridSize/2, 0, -gridSize/2);
    colours.push(0.0, 1.0, 1.0);
    indices.push(k);

    vertices.push(gridSize/2, 0, gridSize/2);
    colours.push(0.0, 1.0, 1.0);
    indices.push(k + 1);

    vertices.push(-gridSize/2, 0, gridSize/2);
    colours.push(1.0, 0.0, 0.0);
    indices.push(k + 2);

    vertices.push(gridSize/2, 0, gridSize/2);
    colours.push(1.0, 0.0, 0.0);
    indices.push(k + 3);

    return {position: {numComponents: 3, data: vertices}, colour: {numComponents: 3, data: colours}, indices: indices};
}

module.exports.generateGridMesh = generateGridMesh;
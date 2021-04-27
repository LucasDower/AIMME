const { v3: Vector3 } = require('twgl.js');
const meshManager = require('./mesh.js');

const EPSILON = 1e-8;

function intersectTriangle(rayOrigin, rayDest, vert0, vert1, vert2) {
    let rayDir = Vector3.subtract(rayDest, rayOrigin);

    // find vectors for two edges sharing vert0
    let edge1 = Vector3.subtract(vert1, vert0);
    let edge2 = Vector3.subtract(vert2, vert0);

    // begin calculating determinant - also used to calculate U parameter
    let pvec = Vector3.cross(rayDir, edge2);

    // if determinant is near zero, ray lies in plane of triangle
    let det = Vector3.dot(edge1, pvec);
    //console.log('det:' + det);

    // use backface culling
    if (det < EPSILON)
        return;
    let inv_det = 1.0 / det;

    // calculate distance from vert0 to ray origin
    tvec = Vector3.subtract(rayOrigin, vert0);

    // calculate U parameter and test bounds
    let u = Vector3.dot(tvec, pvec) * inv_det;
    //console.log('u:' + u);
    if (u < 0.0 || u > 1.0)
        return;

    // prepare to test V parameter
    let qvec = Vector3.cross(tvec, edge1);

    // calculate V parameter and test bounds
    let v = Vector3.dot(rayDir, qvec) * inv_det;
    if (v < 0.0 || u + v > 1.0)
        return;

    // calculate t, ray intersects triangle
    let t = Vector3.dot(edge2, qvec) * inv_det;
    //console.log('i');
    return [t, u, v];
}

function intersectMesh(mesh, rayOrigin, rayDest) {
    let positions = mesh.position;
    let normals = mesh.normals;
    let indices = mesh.indices;
    
    let minDist = 10000;
    let hitIndices = [];
    for (let i = 0; i < indices.length; i += 3) {
        let i0 = indices[i + 0] * 3;
        let i1 = indices[i + 1] * 3;
        let i2 = indices[i + 2] * 3;

        //let v0_ = meshManager.getMeshVertex(mesh, i, true);
        //let v1_ = meshManager.getMeshVertex(mesh, indices[i + 1], true);
        //let v2_ = meshManager.getMeshVertex(mesh, indices[i + 2], true);
        //v0 = Vector3.divScalar(v0, 16.0);
        //v0 = Vector3.subtract(v0, Vector3.create(-0.5, -0.5, -0.5));
        let v0 = Vector3.create(positions[i0] / 16.0 - 0.5, positions[i0 + 1] / 16.0, positions[i0 + 2] / 16.0 - 0.5);
        let v1 = Vector3.create(positions[i1] / 16.0 - 0.5, positions[i1 + 1] / 16.0, positions[i1 + 2] / 16.0 - 0.5);
        let v2 = Vector3.create(positions[i2] / 16.0 - 0.5, positions[i2 + 1] / 16.0, positions[i2 + 2] / 16.0 - 0.5);

        //console.log(v0, v0_);

        let a = intersectTriangle(rayOrigin, rayDest, v0, v1, v2);
        if (a) {
            let k = a[0];
            if (k < minDist) {
                minDist = k;
                hitVertices = [v0, v1, v2];
                hitIndices = [indices[i + 0], indices[i + 1], indices[i + 2]];
            }
        }
    }

    // TODO: change
    if (hitIndices.length > 0) {
        let min = Math.min(hitIndices[0], hitIndices[1], hitIndices[2]);

        let is = [0, 1, 2, 3].map(x => 3 * (x + min));

        let v0_ = Vector3.create(positions[is[0]] / 16.0 - 0.5, positions[is[0] + 1] / 16.0, positions[is[0] + 2] / 16.0 - 0.5);
        let v1_ = Vector3.create(positions[is[1]] / 16.0 - 0.5, positions[is[1] + 1] / 16.0, positions[is[1] + 2] / 16.0 - 0.5);
        let v2_ = Vector3.create(positions[is[2]] / 16.0 - 0.5, positions[is[2] + 1] / 16.0, positions[is[2] + 2] / 16.0 - 0.5);
        let v3_ = Vector3.create(positions[is[3]] / 16.0 - 0.5, positions[is[3] + 1] / 16.0, positions[is[3] + 2] / 16.0 - 0.5);

        return {vertices: [v0_, v1_, v2_, v3_], indices:is};
    }
}

module.exports.intersectMesh = intersectMesh;
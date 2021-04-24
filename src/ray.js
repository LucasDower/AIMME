const { v3 } = require('twgl.js');

const EPSILON = 1e-8;

function IntersectTriangle_MT97(rayOrigin, rayDest, vert0, vert1, vert2)
{
    let rayDir = v3.subtract(rayDest, rayOrigin);

    // find vectors for two edges sharing vert0
    let edge1 = v3.subtract(vert1, vert0);
    let edge2 = v3.subtract(vert2, vert0);

    // begin calculating determinant - also used to calculate U parameter
    let pvec = v3.cross(rayDir, edge2);

    // if determinant is near zero, ray lies in plane of triangle
    let det = v3.dot(edge1, pvec);
    //console.log('det:' + det);

    // use backface culling
    if (det < EPSILON)
        return;
    let inv_det = 1.0 / det;

    // calculate distance from vert0 to ray origin
    tvec = v3.subtract(rayOrigin, vert0);

    // calculate U parameter and test bounds
    let u = v3.dot(tvec, pvec) * inv_det;
    //console.log('u:' + u);
    if (u < 0.0 || u > 1.0)
        return;

    // prepare to test V parameter
    let qvec = v3.cross(tvec, edge1);

    // calculate V parameter and test bounds
    let v = v3.dot(rayDir, qvec) * inv_det;
    if (v < 0.0 || u + v > 1.0)
        return;

    // calculate t, ray intersects triangle
    let t = v3.dot(edge2, qvec) * inv_det;
    //console.log('i');
    return t;
}

function intersectMesh(mesh, rayOrigin, rayDest) {
    positions = mesh.position;
    indices = mesh.indices;
    
    let minDist = 10000;
    let hitVertices = [];
    for (let i = 0; i < indices.length; i += 3) {
        let i0 = indices[i + 0] * 3;
        let i1 = indices[i + 1] * 3;
        let i2 = indices[i + 2] * 3;
        let v0 = v3.create(positions[i0] / 16.0 - 0.5, positions[i0 + 1] / 16.0, positions[i0 + 2] / 16.0 - 0.5);
        let v1 = v3.create(positions[i1] / 16.0 - 0.5, positions[i1 + 1] / 16.0, positions[i1 + 2] / 16.0 - 0.5);
        let v2 = v3.create(positions[i2] / 16.0 - 0.5, positions[i2 + 1] / 16.0, positions[i2 + 2] / 16.0 - 0.5);
        //console.log(v0, v1, v2);
        let k = IntersectTriangle_MT97(rayOrigin, rayDest, v0, v1, v2);
        if (k) {
            if (k < minDist) {
                minDist = k;
                hitVertices = [v0, v1, v2];
            }
        }
    }

    return hitVertices;    
}

//module.exports.IntersectTriangle_MT97 = IntersectTriangle_MT97;
module.exports.intersectMesh = intersectMesh;
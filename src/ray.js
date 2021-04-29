const { v3: Vector3 } = require('twgl.js');

const EPSILON = 1e-8;

function IntersectTriangle_MT97(rayOrigin, rayDest, vert0, vert1, vert2)
{
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
    return t;
}

function intersectMesh(mesh, ray) {
    const rayOrigin = Vector3.create(ray.origin[0], ray.origin[1], ray.origin[2]);
    const rayDest = Vector3.create(ray.dest[0], ray.dest[1], ray.dest[2]);

    const positions = mesh.position.map(x => x / 16.0);
    const indices = mesh.indices;

    let minDist = 10000;
    let hitIndices = [];
    for (let i = 0; i < indices.length; i += 3) {
        let i0 = indices[i + 0] * 3;
        let i1 = indices[i + 1] * 3;
        let i2 = indices[i + 2] * 3;
        
        let v0 = Vector3.create(positions[i0] - 0.5, positions[i0 + 1], positions[i0 + 2] - 0.5);
        let v1 = Vector3.create(positions[i1] - 0.5, positions[i1 + 1], positions[i1 + 2] - 0.5);
        let v2 = Vector3.create(positions[i2] - 0.5, positions[i2 + 1], positions[i2 + 2] - 0.5);

        let k = IntersectTriangle_MT97(rayOrigin, rayDest, v0, v1, v2);
        if (k) {
            if (k < minDist) {
                minDist = k;
                hitIndices = [indices[i + 0], indices[i + 1], indices[i + 2]];
            }
        }
    }
    if (hitIndices.length > 0) {
        let min = Math.min(hitIndices[0], hitIndices[1], hitIndices[2]);
        return min;
    }
}

module.exports.intersectMesh = intersectMesh;
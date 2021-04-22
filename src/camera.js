const { m4 } = require('twgl.js');

class ArcballCamera {

    constructor(fov, aspect, zNear, zFar) {
        this.fov = fov * Math.PI / 180;
        this.aspect = aspect;
        this.zNear = zNear;
        this.zFar = zFar;

        this.setCameraPosition(0.5, Math.PI/2, 8.0);

        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
    }

    updateCamera(mouseDelta) {
        this.azimuth += mouseDelta.dx * 0.005;
        this.elevation += mouseDelta.dy * 0.005;

        const eps = 0.01;
        this.elevation = Math.max(Math.min(Math.PI - eps, this.elevation), eps);

        this.updateCameraPosition();
    }

    setCameraPosition(azimuth, elevation, distance) {
        this.azimuth = azimuth;
        this.elevation = elevation;
        this.distance = distance;

        this.updateCameraPosition();
    }

    updateCameraPosition() {
        this.eye = [this.distance * Math.cos(this.azimuth) * -Math.sin(this.elevation), this.distance * Math.cos(this.elevation), this.distance * Math.sin(this.azimuth) * -Math.sin(this.elevation)];
    }

    getProjectionMatrix() {
        return m4.perspective(this.fov, this.aspect, this.zNear, this.zFar);
    }

    getCameraMatrix() {
        return m4.lookAt(this.eye, this.target, this.up);
    }

    getViewMatrix() {
        return m4.inverse(this.getCameraMatrix());
    }

    getViewProjection() {
        return m4.multiply(this.getProjectionMatrix(), this.getViewMatrix());
    }

    getWorldMatrix() {
        return m4.identity();
    }

}


module.exports.ArcballCamera = ArcballCamera;
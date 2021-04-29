const { m4, v3: Vector3 } = require('twgl.js');
const mouseHandler = require('./mouse.js');
const mathUtil = require('./math.js');

class ArcballCamera {

    constructor(fov, aspect, zNear, zFar) {
        this.fov = fov * Math.PI / 180;
        this.aspect = aspect;
        this.zNear = zNear;
        this.zFar = zFar;

        this.distance = 8.0;
        this.azimuth = 0.6;
        this.elevation = 1.3;
        this.updateCameraPosition();

        this.target = [0, 0.5, 0];
        this.up = [0, 1, 0];

        this.mouseSensitivity = 0.005;
        this.scrollSensitivity = 0.005;

        this.zoomDistMin = 2.0;
        this.zoomDistMax = 15.0;

        this.isRotating = false;
    }

    updateCamera() {
        if (!this.isRotating) {
            return;
        }

        const mouseDelta = mouseHandler.getMouseDelta();
        this.azimuth += mouseDelta.dx * this.mouseSensitivity;
        this.elevation += mouseDelta.dy * this.mouseSensitivity;

        // Prevent the camera going upside-down
        const eps = 0.01;
        this.elevation = Math.max(Math.min(Math.PI - eps, this.elevation), eps);

        this.updateCameraPosition();
    }

    handleScroll(e) {
        this.distance += e.deltaY * this.scrollSensitivity;
        this.distance = Math.max(Math.min(this.zoomDistMax, this.distance), this.zoomDistMin);

        this.updateCameraPosition();
    }

    updateCameraPosition() {
        this.eye = [
            this.distance * Math.cos(this.azimuth) * -Math.sin(this.elevation),
            this.distance * Math.cos(this.elevation),
            this.distance * Math.sin(this.azimuth) * -Math.sin(this.elevation)
        ];
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

    getWorldViewProjection() {
        return m4.multiply(this.getViewProjection(), this.getWorldMatrix());
    }

    getWorldInverseTranspose() {
        return m4.transpose(m4.inverse(this.getWorldMatrix()));
    }

    getInverseWorldViewProjection() {
        return m4.inverse(this.getWorldViewProjection());
    }

    getMouseRay() {
        const mousePos = mouseHandler.getMousePosNorm();
        const inverseProjectionMatrix = this.getInverseWorldViewProjection();
        var origin = mathUtil.multiplyMatVec4(inverseProjectionMatrix, [mousePos.x, mousePos.y, -1.0, 1.0]);
        var dest = mathUtil.multiplyMatVec4(inverseProjectionMatrix, [mousePos.x, mousePos.y, 1.0, 1.0]);
    
        origin[0] /= origin[3];
        origin[1] /= origin[3];
        origin[2] /= origin[3];
        dest[0] /= dest[3];
        dest[1] /= dest[3];
        dest[2] /= dest[3];
    
        return {origin: origin, dest: dest};
    }

}


module.exports.ArcballCamera = ArcballCamera;
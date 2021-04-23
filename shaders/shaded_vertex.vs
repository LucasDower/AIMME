uniform mat4 u_worldViewProjection;
uniform vec3 u_lightWorldPos;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_worldInverseTranspose;

attribute vec4 position;
attribute vec3 normal;
attribute vec2 texcoord;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_lightDir;

void main() {
  v_texCoord = texcoord;
  vec4 a_position = u_worldViewProjection * (position * vec4(0.0625, 0.0625, 0.0625, 1.0) - vec4(0.5, 0.0, 0.5, 0.0)); // TODO: Add model translation matrix
  v_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
  v_lightDir = normalize(-u_lightWorldPos);
  gl_Position = a_position;
}

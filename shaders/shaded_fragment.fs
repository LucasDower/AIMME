precision mediump float;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_lightDir;

uniform sampler2D u_diffuse;

vec4 lit(float l ,float h, float m) {
  return vec4(1.0,
              max(l, 0.0),
              (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
              1.0);
}

void main() {
  vec4 diffuseColor = texture2D(u_diffuse, v_texCoord);
  vec3 a_normal = normalize(v_normal);

  float brightness = dot(v_lightDir, a_normal);
  brightness = (0.65 * brightness) + 0.35;

  gl_FragColor = diffuseColor * vec4(vec3(brightness), 1.0);
}

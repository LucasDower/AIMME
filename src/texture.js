const fs = require('fs');
const PNG = require("pngjs").PNG;

function createTextureAtlas(model_json, gl) {
    if (!model_json.textures) {
        throw "No texture attribute found";
    }

    let uv_offset = {};
    let tex_array = [];
    let num_textures = 0;
    let textures = [];
    
    for (let texture_key of Object.keys(model_json.textures)) {
        let texture_path = "./resources/" + model_json.textures[texture_key] + ".png";
        var data = fs.readFileSync(texture_path);
        var png = PNG.sync.read(data);
        //tex_array = tex_array.concat(Array.from(png.data));
        textures.push(Array.from(png.data));
        uv_offset[texture_key] = 16 * num_textures;
        num_textures++;
    }

    for (let row = 0; row < 16; row++) {
        for (let texture of textures) {
            let pixel_row = [];
            for (let column = 0; column < 16; column++) {
                pixel_row.push(texture[row * 16 * 4 + column * 4]);
                pixel_row.push(texture[row * 16 * 4 + column * 4 + 1]);
                pixel_row.push(texture[row * 16 * 4 + column * 4 + 2]);
                pixel_row.push(texture[row * 16 * 4 + column * 4 + 3]);
            }
            tex_array = tex_array.concat(pixel_row);
        }
    }
    
    console.log(tex_array);

    return {tex: {
        width: 16 * num_textures,
        height: 16,
        mag: gl.NEAREST,
        min: gl.LINEAR,
        src: tex_array,
      }, uv_offset: uv_offset};
}


module.exports.createTextureAtlas = createTextureAtlas;
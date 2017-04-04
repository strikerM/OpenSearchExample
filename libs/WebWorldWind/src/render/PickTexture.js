/**
 * Created by Florin on 12/20/2016.
 */

define([], function () {

    var PickTexture = function (gl, image) {

        if (!gl) {
            throw new ArgumentError(Logger.logMessage(Logger.LEVEL_SEVERE, "Texture", "constructor",
                "missingGlContext"));
        }

        if (!image) {
            throw new ArgumentError(Logger.logMessage(Logger.LEVEL_SEVERE, "Texture", "constructor",
                "missingImage"));
        }

        var textureId = gl.createTexture();

        this.originalImageWidth = image.width;
        this.originalImageHeight = image.height;

        this.imageWidth = image.width;
        this.imageHeight = image.height;
        this.size = image.width * image.height * 4;

        gl.bindTexture(gl.TEXTURE_2D, textureId);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Setup 4x anisotropic texture filtering when this feature is available.
        // https://www.khronos.org/registry/webgl/extensions/EXT_texture_filter_anisotropic
       /* var ext = (
        gl.getExtension("EXT_texture_filter_anisotropic") ||
        gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic"));
        if (ext) {
            gl.texParameteri(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
        }*/

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);

        this.textureId = textureId;

        this.creationTime = new Date();
    };

    PickTexture.prototype.dispose = function (gl) {
        gl.deleteTexture(this.textureId);
        delete this.textureId;
    };

    PickTexture.prototype.bind = function (dc) {
        dc.currentGlContext.bindTexture(dc.currentGlContext.TEXTURE_2D, this.textureId);
        dc.frameStatistics.incrementTextureLoadCount(1);
        return true;
    };

    return PickTexture;

});
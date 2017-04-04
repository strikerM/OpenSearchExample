/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports PickProgram
 */
define([
        '../error/ArgumentError',
        '../util/Color',
        '../shaders/GpuProgram',
        '../util/Logger'
    ],
    function (ArgumentError,
              Color,
              GpuProgram,
              Logger) {
        "use strict";

        /**
         * Constructs a new program.
         * Initializes, compiles and links this GLSL program with the source code for its vertex and fragment shaders.
         * <p>
         * This method creates WebGL shaders for the program's shader sources and attaches them to a new GLSL program. This
         * method then compiles the shaders and then links the program if compilation is successful. Use the bind method to make the
         * program current during rendering.
         *
         * @alias PickProgram
         * @constructor
         * @augments GpuProgram
         * @classdesc PickProgram is a GLSL program that draws textured or untextured geometry.
         * @param {WebGLRenderingContext} gl The current WebGL context.
         * @throws {ArgumentError} If the shaders cannot be compiled, or if linking of
         * the compiled shaders into a program fails.
         */
        var PickProgram = function (gl) {
            var vertexShaderSource =
                    'attribute vec4 vertexPoint;\n' +
                    'attribute vec4 vertexTexCoord;\n' +

                    'uniform mat4 mvpMatrix;\n' +
                    'uniform mat4 texSamplerMatrix;\n' +
                    'uniform mat4 texMaskMatrix;\n' +

                    'varying vec2 texSamplerCoord;\n' +
                    'varying vec2 texMaskCoord;\n' +

                    'void main() {\n' +
                    '   gl_Position = mvpMatrix * vertexPoint;\n' +
                    /* Transform the vertex texture coordinate into sampler texture coordinates. */
                    '   texSamplerCoord = (texSamplerMatrix * vertexTexCoord).st;\n' +
                    /* Transform the vertex texture coordinate into mask texture coordinates. */
                    '   texMaskCoord = (texMaskMatrix * vertexTexCoord).st;\n' +
                    '}',
                fragmentShaderSource =
                    'precision mediump float;\n' +
                    /* Uniform sampler indicating the texture 2D unit (0, 1, 2, etc.) to use when sampling texture color. */
                    'uniform sampler2D texSampler;\n' +
                    'uniform float opacity;\n' +
                    'uniform vec4 color;\n' +
                    'uniform bool modulateColor;\n' +

                    'uniform vec2 mouseCoord;\n' +
                    //'uniform vec2 viewport;\n' +

                    'varying vec2 texSamplerCoord;\n' +
                    'varying vec2 texMaskCoord;\n' +
                    /*
                     * Returns true when the texture coordinate samples texels outside the texture image.
                     */
                    'bool isInsideTextureImage(const vec2 coord) {\n' +
                    '    return coord.x >= 0.0 && coord.x <= 1.0 && coord.y >= 0.0 && coord.y <= 1.0;\n' +
                    '}\n' +

                    'bool isPixelClicked() {\n' +
                    '   return gl_FragCoord.x == mouseCood.x && gl_FragCoord.y == mouseCoord.y;\n' +
                    '}\n'+
                    /*
                     * OpenGL ES Shading Language v1.00 fragment shader for SurfaceTileRendererProgram. Writes the value of the texture 2D
                     * object bound to texSampler at the current transformed texture coordinate, multiplied by the uniform opacity. Writes
                     * transparent black (0, 0, 0, 0) if the transformed texture coordinate indicates a texel outside of the texture data's
                     * standard range of [0,1].
                     */
                    'void main(void) {\n' +
                    '   float mask = float(isInsideTextureImage(texMaskCoord));\n' +
                    '   float picked = float(isPixelClicked());\n' +
                    '   gl_FragColor = texture2D(texSampler, texSamplerCoord) * mask * opacity * picked;\n' +
                    '}';

            // Specify bindings to avoid the WebGL performance warning that's generated when normalVector gets
            // bound to location 0.
            var bindings = ["vertexPoint", "vertexTexCoord"];

            // Call to the superclass, which performs shader program compiling and linking.
            GpuProgram.call(this, gl, vertexShaderSource, fragmentShaderSource, bindings);

            /**
             * The WebGL location for this program's 'vertexPoint' attribute.
             * @type {Number}
             * @readonly
             */
            this.vertexPointLocation = this.attributeLocation(gl, "vertexPoint");

            /**
             * The WebGL location for this program's 'vertexTexCoord' attribute.
             * @type {Number}
             * @readonly
             */
            this.vertexTexCoordLocation = this.attributeLocation(gl, "vertexTexCoord");

            /**
             * The WebGL location for this program's 'mvpMatrix' uniform.
             * @type {WebGLUniformLocation}
             * @readonly
             */
            this.mvpMatrixLocation = this.uniformLocation(gl, "mvpMatrix");

            /**
             * The WebGL location for this program's 'color' uniform.
             * @type {WebGLUniformLocation}
             * @readonly
             */
            this.colorLocation = this.uniformLocation(gl, "color");

            /**
             * The WebGL location for this program's 'enableTexture' uniform.
             * @type {WebGLUniformLocation}
             * @readonly
             */
            this.textureEnabledLocation = this.uniformLocation(gl, "enableTexture");

            /**
             * The WebGL location for this program's 'modulateColor' uniform.
             * @type {WebGLUniformLocation}
             * @readonly
             */
            this.modulateColorLocation = this.uniformLocation(gl, "modulateColor");

            /**
             * The WebGL location for this program's 'textureSampler' uniform.
             * @type {WebGLUniformLocation}
             * @readonly
             */
            this.textureUnitLocation = this.uniformLocation(gl, "textureSampler");

            /**
             * The WebGL location for this program's 'texCoordMatrix' uniform.
             * @type {WebGLUniformLocation}
             * @readonly
             */
            this.textureMatrixLocation = this.uniformLocation(gl, "texCoordMatrix");

            /**
             * The WebGL location for this program's 'opacity' uniform.
             * @type {WebGLUniformLocation}
             * @readonly
             */
            this.opacityLocation = this.uniformLocation(gl, "opacity");
        };

        /**
         * A string that uniquely identifies this program.
         * @type {string}
         * @readonly
         */
       PickProgram.key = "WorldWindGpuPickProgram";

        // Inherit from GpuProgram.
        PickProgram.prototype = Object.create(GpuProgram.prototype);

        /**
         * Loads the specified matrix as the value of this program's 'mvInverseMatrix' uniform variable.
         *
         * @param {WebGLRenderingContext} gl The current WebGL context.
         * @param {Matrix} matrix The matrix to load.
         * @throws {ArgumentError} If the specified matrix is null or undefined.
         */
        PickProgram.prototype.loadModelviewInverse = function (gl, matrix) {
            if (!matrix) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "BasicTextureProgram", "loadModelviewInverse", "missingMatrix"));
            }

            this.loadUniformMatrix(gl, matrix, this.mvInverseMatrixLocation);
        };

        /**
         * Loads the specified matrix as the value of this program's 'mvpMatrix' uniform variable.
         *
         * @param {WebGLRenderingContext} gl The current WebGL context.
         * @param {Matrix} matrix The matrix to load.
         * @throws {ArgumentError} If the specified matrix is null or undefined.
         */
        PickProgram.prototype.loadModelviewProjection = function (gl, matrix) {
            if (!matrix) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "BasicTextureProgram", "loadModelviewProjection", "missingMatrix"));
            }

            this.loadUniformMatrix(gl, matrix, this.mvpMatrixLocation);
        };

        /**
         * Loads the specified color as the value of this program's 'color' uniform variable.
         *
         * @param {WebGLRenderingContext} gl The current WebGL context.
         * @param {Color} color The color to load.
         * @throws {ArgumentError} If the specified color is null or undefined.
         */
        PickProgram.prototype.loadColor = function (gl, color) {
            if (!color) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "BasicTextureProgram", "loadColor", "missingColor"));
            }

            this.loadUniformColor(gl, color, this.colorLocation);
        };

        /**
         * Loads the specified boolean as the value of this program's 'enableTexture' uniform variable.
         * @param {WebGLRenderingContext} gl The current WebGL context.
         * @param {Boolean} enable true to enable texturing, false to disable texturing.
         */
        PickProgram.prototype.loadTextureEnabled = function (gl, enable) {
            gl.uniform1i(this.textureEnabledLocation, enable ? 1 : 0);
        };

        /**
         * Loads the specified boolean as the value of this program's 'modulateColor' uniform variable. When this
         * value is true and the value of the textureEnabled variable is true, the color uniform of this shader is
         * multiplied by the rounded alpha component of the texture color at each fragment. This causes the color
         * to be either fully opaque or fully transparent depending on the value of the texture color's alpha value.
         * This is used during picking to replace opaque or mostly opaque texture colors with the pick color, and
         * to make all other texture colors transparent.
         * @param {WebGLRenderingContext} gl The current WebGL context.
         * @param {Boolean} enable true to enable modulation, false to disable modulation.
         */
        PickProgram.prototype.loadModulateColor = function (gl, enable) {
            gl.uniform1i(this.modulateColorLocation, enable ? 1 : 0);
        };

        /**
         * Loads the specified number as the value of this program's 'textureSampler' uniform variable.
         * @param {WebGLRenderingContext} gl The current WebGL context.
         * @param {Number} unit The texture unit.
         */
        PickProgram.prototype.loadTextureUnit = function (gl, unit) {
            gl.uniform1i(this.textureUnitLocation, unit - gl.TEXTURE0);
        };

        /**
         * Loads the specified matrix as the value of this program's 'texCoordMatrix' uniform variable.
         * @param {WebGLRenderingContext} gl The current WebGL context.
         * @param {Matrix} matrix The texture coordinate matrix.
         */
        PickProgram.prototype.loadTextureMatrix = function (gl, matrix) {
            this.loadUniformMatrix(gl, matrix, this.textureMatrixLocation);
        };

        /**
         * Loads the specified number as the value of this program's 'opacity' uniform variable.
         * @param {WebGLRenderingContext} gl The current WebGL context.
         * @param {Number} opacity The opacity in the range [0, 1].
         */
        PickProgram.prototype.loadOpacity = function (gl, opacity) {
            gl.uniform1f(this.opacityLocation, opacity);
        };

        /**
         * Loads the specified boolean as the value of this program's 'applyLighting' uniform variable.
         * @param {WebGLRenderingContext} gl The current WebGL context.
         * @param {Number} applyLighting true to apply lighting, otherwise false.
         */
        PickProgram.prototype.loadApplyLighting = function (gl, applyLighting) {
            gl.uniform1i(this.applyLightingLocation, applyLighting);
        };

        return PickProgram;
    });
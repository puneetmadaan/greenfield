window.onload = function () {
  const width = 300
  const height = 600

  const yuvWidth = 304
  const yuvHeight = 608

  const opaqueWidth = yuvWidth
  const opaqueHeight = yuvHeight
  const alphaWidth = yuvWidth
  const alphaHeight = yuvHeight

  const opaqueBuffer = Uint8Array.from(opaqueYUV)
  const alphaBuffer = Uint8Array.from(alphaYUV)

  const canvas0nscreen = document.getElementById('canvas0')
  canvas0nscreen.width = width
  canvas0nscreen.height = height

  const ctx2d0 = canvas0nscreen.getContext('2d')
  ctx2d0.imageSmoothingEnabled = false

// off-screen webgl canvas
  const vertexQuad = {
    type: 'x-shader/x-vertex',
    source: `
  precision mediump float;

  uniform mat4 u_projection;
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main(){
      v_texCoord = a_texCoord;
      gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
  }
`
  }

  const fragmentYUVA = {
    type: 'x-shader/x-fragment',
    source: `
  precision lowp float;
  
  varying vec2 v_texCoord;
  
  uniform sampler2D yTexture;
  uniform sampler2D uTexture;
  uniform sampler2D vTexture;
  uniform sampler2D alphaYTexture;
    
  const mat4 YUV2RGB = mat4
  (
   1.1643828125,             0, 1.59602734375, -.87078515625,
   1.1643828125, -.39176171875,    -.81296875,     .52959375,
   1.1643828125,   2.017234375,             0,  -1.081390625,
              0,             0,             0,             1
  );

  void main(void) {
   vec4 pix = vec4(texture2D(yTexture,  v_texCoord).x, texture2D(uTexture, v_texCoord).x, texture2D(vTexture, v_texCoord).x, 1) * YUV2RGB;
   pix.w = (vec4(texture2D(alphaYTexture,  v_texCoord).x, 0.5019607843137255, 0.5019607843137255, 1) * YUV2RGB).x;
   gl_FragColor = pix;
  }
`
  }

  /**
   * @param {WebGLRenderingContext}gl
   * @return {{gl: WebGLRenderingContext, vertexBuffer: WebGLBuffer, shaderArgs: {yTexture: WebGLUniformLocation, uTexture: WebGLUniformLocation, vTexture: WebGLUniformLocation, alphaYTexture: WebGLUniformLocation, u_projection: WebGLUniformLocation, a_position: number, a_texCoord: number}, program: WebGLProgram}}
   */
  function createYUVASurfaceShader (gl) {
    const program = _initShaders(gl)
    const shaderArgs = _initShaderArgs(gl, program)
    const vertexBuffer = _initBuffers(gl)

    return {gl: gl, vertexBuffer: vertexBuffer, shaderArgs: shaderArgs, program: program}
  }

  /**
   * @param {WebGLRenderingContext}gl
   * @param {{type: String, source: String}}script
   * @return {WebGLShader}
   */
  function compile (gl, script) {
    let shader
    // Now figure out what type of shader script we have, based on its MIME type.
    if (script.type === 'x-shader/x-fragment') {
      shader = gl.createShader(gl.FRAGMENT_SHADER)
    } else if (script.type === 'x-shader/x-vertex') {
      shader = gl.createShader(gl.VERTEX_SHADER)
    } else {
      throw new Error('Unknown shader type: ' + script.type)
    }

    // Send the source to the shader object.
    gl.shaderSource(shader, script.source)

    // Compile the shader program.
    gl.compileShader(shader)

    // See if it compiled successfully.
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
    }

    return shader
  }

  /**
   * @param {WebGLRenderingContext}gl
   * @return {WebGLProgram}
   * @private
   */
  function _initShaders (gl) {
    const program = gl.createProgram()
    gl.attachShader(program, compile(gl, vertexQuad))
    gl.attachShader(program, compile(gl, fragmentYUVA))
    gl.linkProgram(program)
    // If creating the shader program failed, alert.
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program.')
    }
    gl.useProgram(program)
    return program
  }

  /**
   * @param {WebGLRenderingContext}gl
   * @param {WebGLProgram}program
   * @return {{yTexture: WebGLUniformLocation, uTexture: WebGLUniformLocation, vTexture: WebGLUniformLocation, alphaYTexture: WebGLUniformLocation, u_projection: WebGLUniformLocation, a_position: number, a_texCoord: number}}
   * @private
   */
  function _initShaderArgs (gl, program) {
    // find shader arguments
    const shaderArgs = {
      yTexture: gl.getUniformLocation(program, 'yTexture'),
      uTexture: gl.getUniformLocation(program, 'uTexture'),
      vTexture: gl.getUniformLocation(program, 'vTexture'),
      alphaYTexture: gl.getUniformLocation(program, 'alphaYTexture'),

      u_projection: gl.getUniformLocation(program, 'u_projection'),

      a_position: gl.getAttribLocation(program, 'a_position'),
      a_texCoord: gl.getAttribLocation(program, 'a_texCoord')
    }

    gl.enableVertexAttribArray(shaderArgs.a_position)
    gl.enableVertexAttribArray(shaderArgs.a_texCoord)

    return shaderArgs
  }

  /**
   * @param {WebGLRenderingContext}gl
   * @return {WebGLBuffer}
   * @private
   */
  function _initBuffers (gl) {
    // Create vertex buffer object.
    return gl.createBuffer()
  }

  /**
   * @param {{gl: WebGLRenderingContext, vertexBuffer: WebGLBuffer, shaderArgs: {yTexture: WebGLUniformLocation, uTexture: WebGLUniformLocation, vTexture: WebGLUniformLocation, alphaYTexture: WebGLUniformLocation, u_projection: WebGLUniformLocation, a_position: number, a_texCoord: number}, program: WebGLProgram}}shader
   * @param {{gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}textureY
   * @param {{gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}textureU
   * @param {{gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}textureV
   * @param {{gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}textureAlphaY
   * @private
   */
  function _setTextureYUVAShader (shader, textureY, textureU, textureV, textureAlphaY) {
    const gl = shader.gl

    gl.uniform1i(shader.shaderArgs.yTexture, 0)
    gl.uniform1i(shader.shaderArgs.uTexture, 1)
    gl.uniform1i(shader.shaderArgs.vTexture, 2)
    gl.uniform1i(shader.shaderArgs.alphaYTexture, 3)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textureY.texture)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, textureU.texture)

    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, textureV.texture)

    gl.activeTexture(gl.TEXTURE3)
    gl.bindTexture(gl.TEXTURE_2D, textureAlphaY.texture)
  }

  /**
   * @param {{gl: WebGLRenderingContext, vertexBuffer: WebGLBuffer, shaderArgs: {yTexture: WebGLUniformLocation, uTexture: WebGLUniformLocation, vTexture: WebGLUniformLocation, alphaYTexture: WebGLUniformLocation, u_projection: WebGLUniformLocation, a_position: number, a_texCoord: number}, program: WebGLProgram}}shader
   * @param {{gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}textureY
   * @param {{gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}textureU
   * @param {{gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}textureV
   * @param {{gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}textureAlphaY
   * @param {{w:number,h:number}}bufferSize
   */
  function drawYUVAShader (shader, textureY, textureU, textureV, textureAlphaY, bufferSize) {
    const gl = shader.gl
    _setTextureYUVAShader(shader, textureY, textureU, textureV, textureAlphaY)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.viewport(0, 0, bufferSize.w, bufferSize.h)

    shader.gl.uniformMatrix4fv(shader.shaderArgs.u_projection, false, [
      2.0 / bufferSize.w, 0, 0, 0,
      0, 2.0 / -bufferSize.h, 0, 0,
      0, 0, 1, 0,
      -1, 1, 0, 1
    ])
    gl.bindBuffer(gl.ARRAY_BUFFER, shader.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      // top left:
      0, 0, 0, 0,
      // top right:
      bufferSize.w, 0, 1, 0,
      // bottom right:
      bufferSize.w, bufferSize.h, 1, 1,
      // bottom right:
      bufferSize.w, bufferSize.h, 1, 1,
      // bottom left:
      0, bufferSize.h, 0, 1,
      // top left:
      0, 0, 0, 0
    ]), shader.gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(shader.shaderArgs.a_position, 2, gl.FLOAT, false, 16, 0)
    gl.vertexAttribPointer(shader.shaderArgs.a_texCoord, 2, gl.FLOAT, false, 16, 8)
    gl.drawArrays(shader.gl.TRIANGLE_STRIP, 0, 6)
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  /**
   * @return {{gl: WebGLRenderingContext, yuvaShader: {gl: WebGLRenderingContext, vertexBuffer: WebGLBuffer, shaderArgs: {yTexture: WebGLUniformLocation, uTexture: WebGLUniformLocation, vTexture: WebGLUniformLocation, alphaYTexture: WebGLUniformLocation, u_projection: WebGLUniformLocation, a_position: number, a_texCoord: number}, program: WebGLProgram}, canvas: HTMLCanvasElement}}
   */
  function createRenderer () {
    // create offscreen gl context
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    let gl = canvas.getContext('webgl2', {
      antialias: false,
      depth: false,
      alpha: true,
      preserveDrawingBuffer: false
    })
    if (!gl) {
      throw new Error('This browser doesn\'t support WebGL2!')
    }

    gl.clearColor(0, 0, 0, 0)
    const yuvaShader = createYUVASurfaceShader(gl)

    return {gl: gl, yuvaShader: yuvaShader, canvas: canvas}
  }

  /**
   * @param {WebGLRenderingContext}gl
   * @param {number}format
   * @return {{gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}
   */
  function createTexture (gl, format) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return {gl: gl, format: format, texture: texture}
  }

  function fillTexture (texture, textureData, size, stride) {
    const gl = texture.gl

    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, stride)
    gl.bindTexture(gl.TEXTURE_2D, texture.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, size.w, size.h, 0, texture.format, gl.UNSIGNED_BYTE, textureData)
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0)
  }

  /**
   * @param {WebGLRenderingContext}gl
   * @return {{gl: WebGLRenderingContext, YTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}, UTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}, VTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}, alphaYTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}}
   */
  function createViewState (gl) {
    const YTexture = createTexture(gl, gl.LUMINANCE)
    const UTexture = createTexture(gl, gl.LUMINANCE)
    const VTexture = createTexture(gl, gl.LUMINANCE)
    const alphaYTexture = createTexture(gl, gl.LUMINANCE)
    return {gl: gl, YTexture: YTexture, UTexture: UTexture, VTexture: VTexture, alphaYTexture: alphaYTexture}
  }

  /**
   * @param {{gl: WebGLRenderingContext, YTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}, UTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}, VTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}, alphaYTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}}viewState
   */
  function upateViewState (viewState) {
    if (!opaqueBuffer) { return }

    const lumaSize = opaqueWidth * opaqueHeight
    const chromaSize = lumaSize >> 2

    fillTexture(viewState.YTexture, opaqueBuffer.subarray(0, lumaSize), {w: width, h: height}, opaqueWidth)
    fillTexture(viewState.UTexture, opaqueBuffer.subarray(lumaSize, lumaSize + chromaSize),
      {w: width / 2, h: height / 2}, opaqueWidth / 2)
    fillTexture(viewState.VTexture, opaqueBuffer.subarray(lumaSize + chromaSize, lumaSize + (2 * chromaSize)),
      {w: width / 2, h: height / 2}, opaqueWidth / 2)

    const alphaLumaSize = alphaWidth * alphaHeight
    fillTexture(viewState.alphaYTexture, alphaBuffer.subarray(0, alphaLumaSize), {
      w: width,
      h: height
    }, alphaWidth)
  }

  /**
   * @param {{gl: WebGLRenderingContext, yuvaShader: {gl: WebGLRenderingContext, vertexBuffer: WebGLBuffer, shaderArgs: {yTexture: WebGLUniformLocation, uTexture: WebGLUniformLocation, vTexture: WebGLUniformLocation, alphaYTexture: WebGLUniformLocation, u_projection: WebGLUniformLocation, a_position: number, a_texCoord: number}, program: WebGLProgram}, canvas: HTMLCanvasElement}}renderer
   * @param {{gl: WebGLRenderingContext, YTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}, UTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}, VTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}, alphaYTexture: {gl: WebGLRenderingContext, format: number, texture: WebGLTexture}}}viewState
   */
  function render (renderer, viewState) {
    upateViewState(viewState)

    renderer.gl.useProgram(renderer.yuvaShader.program)
    drawYUVAShader(renderer.yuvaShader, viewState.YTexture, viewState.UTexture,
      viewState.VTexture, viewState.alphaYTexture, {w: width, h: height})
  }

  const renderer = createRenderer()
  const viewState = createViewState(renderer.gl)
  render(renderer, viewState)

  ctx2d0.drawImage(renderer.canvas, 0, 0)
}

import * as Utils from './webgl-utils';
import * as Shaders from './shaders';

export interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

export interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

class Program {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: WebGLProgram | null;
  uniforms: Record<string, WebGLUniformLocation | null>;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, vs: WebGLShader | null, fs: WebGLShader | null) {
    this.gl = gl;
    this.program = Utils.createProgram(gl, vs, fs);
    this.uniforms = this.program ? Utils.getUniforms(gl, this.program) : {};
  }

  bind() {
    if (this.program) this.gl.useProgram(this.program);
  }
}

class Material {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  vs: WebGLShader | null;
  fsSource: string;
  programs: Record<number, WebGLProgram | null> = {};
  activeProgram: WebGLProgram | null = null;
  uniforms: Record<string, WebGLUniformLocation | null> = {};

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, vs: WebGLShader | null, fsSource: string) {
    this.gl = gl;
    this.vs = vs;
    this.fsSource = fsSource;
  }

  setKeywords(keywords: string[]) {
    let hash = 0;
    for (const kw of keywords) {
      let h = 0;
      for (let i = 0; i < kw.length; i++) h = (h << 5) - h + kw.charCodeAt(i);
      hash += (h | 0);
    }
    if (!this.programs[hash]) {
      const fs = Utils.compileShader(this.gl, this.gl.FRAGMENT_SHADER, this.fsSource, keywords);
      this.programs[hash] = Utils.createProgram(this.gl, this.vs, fs);
    }
    if (this.programs[hash] === this.activeProgram) return;
    this.activeProgram = this.programs[hash];
    if (this.activeProgram) {
      this.uniforms = Utils.getUniforms(this.gl, this.activeProgram);
    }
  }

  bind() {
    if (this.activeProgram) this.gl.useProgram(this.activeProgram);
  }
}

export class Simulation {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  ext: any;
  config: any;
  canvas: HTMLCanvasElement;

  programs: Record<string, any> = {};
  fbos: Record<string, any> = {};
  blit: (target: FBO | null, doClear?: boolean) => void;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, ext: any, config: any, canvas: HTMLCanvasElement) {
    this.gl = gl;
    this.ext = ext;
    this.config = config;
    this.canvas = canvas;

    const vs = Utils.compileShader(gl, gl.VERTEX_SHADER, Shaders.baseVertexShader);
    this.programs.copy = new Program(gl, vs, Utils.compileShader(gl, gl.FRAGMENT_SHADER, Shaders.copyShader));
    this.programs.clear = new Program(gl, vs, Utils.compileShader(gl, gl.FRAGMENT_SHADER, Shaders.clearShader));
    this.programs.splat = new Program(gl, vs, Utils.compileShader(gl, gl.FRAGMENT_SHADER, Shaders.splatShader));
    this.programs.advection = new Program(gl, vs, Utils.compileShader(gl, gl.FRAGMENT_SHADER, Shaders.advectionShader, ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']));
    this.programs.divergence = new Program(gl, vs, Utils.compileShader(gl, gl.FRAGMENT_SHADER, Shaders.divergenceShader));
    this.programs.curl = new Program(gl, vs, Utils.compileShader(gl, gl.FRAGMENT_SHADER, Shaders.curlShader));
    this.programs.vorticity = new Program(gl, vs, Utils.compileShader(gl, gl.FRAGMENT_SHADER, Shaders.vorticityShader));
    this.programs.pressure = new Program(gl, vs, Utils.compileShader(gl, gl.FRAGMENT_SHADER, Shaders.pressureShader));
    this.programs.gradienSubtract = new Program(gl, vs, Utils.compileShader(gl, gl.FRAGMENT_SHADER, Shaders.gradientSubtractShader));
    this.programs.display = new Material(gl, vs, Shaders.displayShaderSource);

    this.blit = this.initBlit();
  }

  initBlit() {
    const gl = this.gl;
    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const elemBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return (target: FBO | null, doClear = false) => {
      if (!target) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      if (doClear) {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  }

  createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
      attach(id: number) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      }
    };
  }

  createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
    let fbo1 = this.createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = this.createFBO(w, h, internalFormat, format, type, param);
    return {
      width: w, height: h, texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
      read: fbo1, write: fbo2,
      swap() {
        const tmp = this.read;
        this.read = this.write;
        this.write = tmp;
      }
    };
  }

  initFramebuffers() {
    const { gl, ext, config } = this;
    const simRes = this.getResolution(config.SIM_RESOLUTION);
    const dyeRes = this.getResolution(config.DYE_RESOLUTION);
    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    
    if (!rgba || !rg || !r) return;

    gl.disable(gl.BLEND);

    this.fbos.dye = this.createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    this.fbos.velocity = this.createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    this.fbos.divergence = this.createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    this.fbos.curl = this.createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    this.fbos.pressure = this.createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
  }

  getResolution(resolution: number) {
    const w = this.gl.drawingBufferWidth, h = this.gl.drawingBufferHeight;
    const aspectRatio = w / h;
    const min = Math.round(resolution), max = Math.round(resolution * (aspectRatio < 1 ? 1 / aspectRatio : aspectRatio));
    return w > h ? { width: max, height: min } : { width: min, height: max };
  }

  step(dt: number) {
    const gl = this.gl;
    const { velocity, dye, divergence, curl, pressure } = this.fbos;
    if (!velocity || !dye || !divergence || !curl || !pressure) return;

    gl.disable(gl.BLEND);

    this.programs.curl.bind();
    if (this.programs.curl.uniforms.texelSize) gl.uniform2f(this.programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (this.programs.curl.uniforms.uVelocity) gl.uniform1i(this.programs.curl.uniforms.uVelocity, velocity.read.attach(0));
    this.blit(curl);

    this.programs.vorticity.bind();
    if (this.programs.vorticity.uniforms.texelSize) gl.uniform2f(this.programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (this.programs.vorticity.uniforms.uVelocity) gl.uniform1i(this.programs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
    if (this.programs.vorticity.uniforms.uCurl) gl.uniform1i(this.programs.vorticity.uniforms.uCurl, curl.attach(1));
    if (this.programs.vorticity.uniforms.curl) gl.uniform1f(this.programs.vorticity.uniforms.curl, this.config.CURL);
    if (this.programs.vorticity.uniforms.dt) gl.uniform1f(this.programs.vorticity.uniforms.dt, dt);
    this.blit(velocity.write);
    velocity.swap();

    this.programs.divergence.bind();
    if (this.programs.divergence.uniforms.texelSize) gl.uniform2f(this.programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (this.programs.divergence.uniforms.uVelocity) gl.uniform1i(this.programs.divergence.uniforms.uVelocity, velocity.read.attach(0));
    this.blit(divergence);

    this.programs.clear.bind();
    if (this.programs.clear.uniforms.uTexture) gl.uniform1i(this.programs.clear.uniforms.uTexture, pressure.read.attach(0));
    if (this.programs.clear.uniforms.value) gl.uniform1f(this.programs.clear.uniforms.value, this.config.PRESSURE);
    this.blit(pressure.write);
    pressure.swap();

    this.programs.pressure.bind();
    if (this.programs.pressure.uniforms.texelSize) gl.uniform2f(this.programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (this.programs.pressure.uniforms.uDivergence) gl.uniform1i(this.programs.pressure.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
      if (this.programs.pressure.uniforms.uPressure) gl.uniform1i(this.programs.pressure.uniforms.uPressure, pressure.read.attach(1));
      this.blit(pressure.write);
      pressure.swap();
    }

    this.programs.gradienSubtract.bind();
    if (this.programs.gradienSubtract.uniforms.texelSize) gl.uniform2f(this.programs.gradienSubtract.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (this.programs.gradienSubtract.uniforms.uPressure) gl.uniform1i(this.programs.gradienSubtract.uniforms.uPressure, pressure.read.attach(0));
    if (this.programs.gradienSubtract.uniforms.uVelocity) gl.uniform1i(this.programs.gradienSubtract.uniforms.uVelocity, velocity.read.attach(1));
    this.blit(velocity.write);
    velocity.swap();

    this.programs.advection.bind();
    if (this.programs.advection.uniforms.texelSize) gl.uniform2f(this.programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!this.ext.supportLinearFiltering && this.programs.advection.uniforms.dyeTexelSize) {
      gl.uniform2f(this.programs.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    }
    const velId = velocity.read.attach(0);
    if (this.programs.advection.uniforms.uVelocity) gl.uniform1i(this.programs.advection.uniforms.uVelocity, velId);
    if (this.programs.advection.uniforms.uSource) gl.uniform1i(this.programs.advection.uniforms.uSource, velId);
    if (this.programs.advection.uniforms.dt) gl.uniform1f(this.programs.advection.uniforms.dt, dt);
    if (this.programs.advection.uniforms.dissipation) gl.uniform1f(this.programs.advection.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
    this.blit(velocity.write);
    velocity.swap();

    if (!this.ext.supportLinearFiltering && this.programs.advection.uniforms.dyeTexelSize) {
      gl.uniform2f(this.programs.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    }
    if (this.programs.advection.uniforms.uVelocity) gl.uniform1i(this.programs.advection.uniforms.uVelocity, velocity.read.attach(0));
    if (this.programs.advection.uniforms.uSource) gl.uniform1i(this.programs.advection.uniforms.uSource, dye.read.attach(1));
    if (this.programs.advection.uniforms.dissipation) gl.uniform1f(this.programs.advection.uniforms.dissipation, this.config.DENSITY_DISSIPATION);
    this.blit(dye.write);
    dye.swap();
  }

  render(target: FBO | null) {
    const gl = this.gl;
    const { dye } = this.fbos;
    if (!dye) return;

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    const width = target ? target.width : gl.drawingBufferWidth, height = target ? target.height : gl.drawingBufferHeight;
    this.programs.display.bind();
    if (this.config.SHADING && this.programs.display.uniforms.texelSize) gl.uniform2f(this.programs.display.uniforms.texelSize, 1 / width, 1 / height);
    if (this.programs.display.uniforms.uTexture) gl.uniform1i(this.programs.display.uniforms.uTexture, dye.read.attach(0));
    this.blit(target, false);
  }

  splat(x: number, y: number, dx: number, dy: number, color: any) {
    const gl = this.gl;
    const { velocity, dye } = this.fbos;
    if (!velocity || !dye) return;

    this.programs.splat.bind();
    if (this.programs.splat.uniforms.uTarget) gl.uniform1i(this.programs.splat.uniforms.uTarget, velocity.read.attach(0));
    if (this.programs.splat.uniforms.aspectRatio) gl.uniform1f(this.programs.splat.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    if (this.programs.splat.uniforms.point) gl.uniform2f(this.programs.splat.uniforms.point, x, y);
    if (this.programs.splat.uniforms.color) gl.uniform3f(this.programs.splat.uniforms.color, dx, dy, 0);
    if (this.programs.splat.uniforms.radius) gl.uniform1f(this.programs.splat.uniforms.radius, this.correctRadius(this.config.SPLAT_RADIUS / 100));
    this.blit(velocity.write);
    velocity.swap();

    if (this.programs.splat.uniforms.uTarget) gl.uniform1i(this.programs.splat.uniforms.uTarget, dye.read.attach(0));
    if (this.programs.splat.uniforms.color) gl.uniform3f(this.programs.splat.uniforms.color, color.r, color.g, color.b);
    this.blit(dye.write);
    dye.swap();
  }

  correctRadius(radius: number) {
    const aspectRatio = this.canvas.width / this.canvas.height;
    return aspectRatio > 1 ? radius * aspectRatio : radius;
  }
}

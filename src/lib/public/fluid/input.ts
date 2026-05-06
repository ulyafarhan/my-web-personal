export interface Pointer {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: { r: number; g: number; b: number };
}

export function createPointer(): Pointer {
  return { id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, down: false, moved: false, color: { r: 0, g: 0, b: 0 } };
}

export function updatePointerDownData(pointer: Pointer, id: number, posX: number, posY: number, canvas: HTMLCanvasElement) {
  pointer.id = id; pointer.down = true; pointer.moved = false;
  pointer.texcoordX = posX / canvas.width;
  pointer.texcoordY = 1 - posY / canvas.height;
  pointer.prevTexcoordX = pointer.texcoordX;
  pointer.prevTexcoordY = pointer.texcoordY;
  pointer.deltaX = 0; pointer.deltaY = 0;
  pointer.color = generateColor();
}

export function updatePointerMoveData(pointer: Pointer, posX: number, posY: number, canvas: HTMLCanvasElement) {
  pointer.prevTexcoordX = pointer.texcoordX;
  pointer.prevTexcoordY = pointer.texcoordY;
  pointer.texcoordX = posX / canvas.width;
  pointer.texcoordY = 1 - posY / canvas.height;
  pointer.deltaX = (pointer.texcoordX - pointer.prevTexcoordX) * Math.min(1, canvas.width / canvas.height);
  pointer.deltaY = (pointer.texcoordY - pointer.prevTexcoordY) * Math.min(1, canvas.height / canvas.width);
  pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
}

export function generateColor() {
  const c = HSVtoRGB(Math.random(), 1.0, 1.0);
  return { r: c.r * 0.8, g: c.g * 0.8, b: c.b * 0.8 };
}

function HSVtoRGB(h: number, s: number, v: number) {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r, g, b };
}

export function scaleByPixelRatio(input: number) {
  return Math.floor(input * (window.devicePixelRatio || 1));
}

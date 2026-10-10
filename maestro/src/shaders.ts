/**
 * Paper shader integration hooks.
 *
 * Paper MCP runs on the user's local machine — do not invent shaders here.
 * Mount points use [data-shader-mount] + optional <canvas data-shader-canvas>.
 * Drop in @paper-design/shaders (or Paper MCP output) by targeting these nodes.
 */

export type ShaderMountId =
  | 'up-next'
  | 'practice-0'
  | 'practice-1'
  | 'practice-2'
  | 'practice-3'

export interface ShaderMount {
  id: ShaderMountId
  el: HTMLElement
  canvas: HTMLCanvasElement | null
}

/** Collect all shader mount points for a future Paper drop-in. */
export function getShaderMounts(root: ParentNode = document): ShaderMount[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-shader-mount]')).map(
    (el) => ({
      id: el.dataset.shaderMount as ShaderMountId,
      el,
      canvas: el.querySelector<HTMLCanvasElement>('[data-shader-canvas]'),
    }),
  )
}

/**
 * Placeholder: keep UV bitmap visible until a real Paper shader is attached.
 * Call `attachPaperShader(mount, shader)` from local Paper tooling later.
 */
export function prepareShaderMounts(root: ParentNode = document): ShaderMount[] {
  const mounts = getShaderMounts(root)
  for (const mount of mounts) {
    mount.el.dataset.shaderReady = 'true'
    if (mount.canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = mount.el.getBoundingClientRect()
      mount.canvas.width = Math.max(1, Math.floor(width * dpr))
      mount.canvas.height = Math.max(1, Math.floor(height * dpr))
      // Leave WebGL context free for Paper — do not draw fake shaders.
    }
  }
  return mounts
}

/** Example signature for local Paper integration (no-op until wired). */
export function attachPaperShader(
  _mount: ShaderMount,
  _shader: unknown,
): void {
  // Intentionally empty — replace with Paper / @paper-design/shaders mount.
}

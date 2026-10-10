import './style.css'
import { renderDashboard } from './dashboard'
import { prepareShaderMounts } from './shaders'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('#app root missing')
}

app.innerHTML = renderDashboard()
const mounts = prepareShaderMounts(app)

// Expose mounts for local Paper MCP / @paper-design/shaders drop-in
;(window as unknown as { __maestroShaders: typeof mounts }).__maestroShaders =
  mounts

console.info(
  `[maestro] ${mounts.length} shader mount(s) ready — attach Paper shaders locally`,
  mounts.map((m) => m.id),
)

let posToWorld;
{
const canvas = document.createElement("canvas")
canvas.id = "mainCanvas"
document.body.prepend(canvas)
const ctx = canvas.getContext('2d')

const scale = 3
const hexRadius = 12

const hexWidth = Math.round(Math.sqrt(3) * hexRadius / 2) * 2
const halfW = hexWidth / 2
const halfR = hexRadius / 2

const hDist = hexWidth
const vDist = hexRadius * 1.5

let camX = 0; let camY = 0

function drawHexagon(x, y, fillColor) {
    ctx.beginPath()
    ctx.moveTo(x, y + hexRadius)
    ctx.lineTo(x - halfW, y + halfR)
    ctx.lineTo(x - halfW, y - halfR)
    ctx.lineTo(x, y - hexRadius)
    ctx.lineTo(x + halfW, y - halfR)
    ctx.lineTo(x + halfW, y + halfR)
    ctx.closePath()
    ctx.fillStyle = fillColor
    ctx.fill()
    ctx.strokeStyle = '#111'
    ctx.lineWidth = 2
    ctx.stroke()
}

posToWorld = function(strpos) {
    const pos = (strpos || "0 0").split(' ').map(it=>parseInt(it))
    const col = pos[0]??0
    const row = pos[1]??0

    const xoffs = (((row % 2) + 2) % 2 === 0) ? 0 : hDist / 2
    return { x: col * hDist + xoffs, y: row * vDist }
}

function readBound(name) {
    for (const el of [canvas, document.body, document.documentElement]) {
        const v = el?.getAttribute(name)
        if (v != null && v.trim() !== '') {
            return posToWorld(v)
        }
    }
    return null
}

function clampAxis(v, lo, hi) {
    if (lo > hi) [lo, hi] = [hi, lo]
    return Math.min(Math.max(v, lo), hi)
}

function clampCam() {
    const min = readBound('data-min')
    const max = readBound('data-max')

    const loX = min ? min.x : -Infinity
    const hiX = max ? max.x : Infinity
    const loY = min ? min.y : -Infinity
    const hiY = max ? max.y : Infinity

    camX = clampAxis(camX, loX, hiX)
    camY = clampAxis(camY, loY, hiY)
}

function moveCam(dx, dy) {
    camX += dx
    camY += dy
    clampCam()
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cx = Math.round(camX - canvas.width / 2)
    const cy = Math.round(camY - canvas.height / 2)

    const firstRow = Math.floor(cy / vDist) - 1
    const lastRow = Math.ceil((cy + canvas.height) / vDist) + 2

    for (let row = firstRow; row <= lastRow; row++) {
        const xoffs = (((row % 2) + 2) % 2 === 0) ? 0 : hDist / 2

        const firstCol = Math.floor((cx - xoffs) / hDist) - 1
        const lastCol = Math.ceil((cx + canvas.width - xoffs) / hDist) + 1

        const worldY = row * vDist
        for (let col = firstCol; col <= lastCol; col++) {
            const worldX = col * hDist + xoffs
            drawHexagon(worldX - cx, worldY - cy, getPixelAt(col, row))
        }
    }

    const rect = canvas.getBoundingClientRect()
    const sx = rect.width / canvas.width
    const sy = rect.height / canvas.height
    placeElms(cx, cy, sx, sy)
}

let drawQueued = false
function requestDraw() {
    if (drawQueued) return
    drawQueued = true
    requestAnimationFrame(() => {
        drawQueued = false
        update()
    })
}

function resize() {
    canvas.width = Math.ceil(window.innerWidth/scale)
    canvas.height = Math.ceil(window.innerHeight/scale)
    ctx.imageSmoothingEnabled = false
    clampCam()
    update()
}
window.addEventListener('resize', resize)

let dragging = false
let lastX = 0
let lastY = 0

canvas.style.touchAction = 'none'
canvas.style.cursor = 'grab'

canvas.addEventListener('pointerdown', e => {
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    canvas.setPointerCapture(e.pointerId)
    canvas.style.cursor = 'grabbing'
})

canvas.addEventListener('pointermove', e => {
    if (!dragging) return
    moveCam(-(e.clientX - lastX) / scale, -(e.clientY - lastY) / scale)
    lastX = e.clientX
    lastY = e.clientY
    requestDraw()
})

function endDrag() {
    dragging = false
    canvas.style.cursor = 'grab'
}
canvas.addEventListener('pointerup', endDrag)
canvas.addEventListener('pointercancel', endDrag)

canvas.addEventListener('wheel', e => {
    e.preventDefault()
    moveCam(e.deltaX / scale, e.deltaY / scale)
    requestDraw()
}, { passive: false })

window.addEventListener('keydown', e => {
    const step = 4 * hexRadius
    switch (e.key) {
        case 'ArrowLeft': moveCam(-step, 0); break
        case 'ArrowRight': moveCam(step, 0); break
        case 'ArrowUp': moveCam(0, -step); break
        case 'ArrowDown': moveCam(0, step); break
        default: return
    }
    e.preventDefault()
    requestDraw()
})

resize()
}

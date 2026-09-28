let posToWorld;
{
const canvas = document.createElement("canvas")
canvas.id = "mainCanvas"
document.body.prepend(canvas)
const ctx = canvas.getContext('2d')

const scale = 3
const smooth = true
const hexRadius = 12

const hexWidth = Math.round(Math.sqrt(3) * hexRadius / 2) * 2
const halfW = hexWidth / 2
const halfR = hexRadius / 2

const hDist = hexWidth
const vDist = hexRadius * 1.5

let camX = 0; let camY = 0
let viewW = 0; let viewH = 0

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

function update() {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(canvas.width / viewW, 0, 0, canvas.height / viewH, 0, 0)

    const snap = smooth ? (v => v) : Math.round
    const cx = snap(camX - viewW / 2)
    const cy = snap(camY - viewH / 2)

    const firstRow = Math.floor(cy / vDist) - 1
    const lastRow = Math.ceil((cy + viewH) / vDist) + 2

    for (let row = firstRow; row <= lastRow; row++) {
        const xoffs = (((row % 2) + 2) % 2 === 0) ? 0 : hDist / 2

        const firstCol = Math.floor((cx - xoffs) / hDist) - 1
        const lastCol = Math.ceil((cx + viewW - xoffs) / hDist) + 1

        const worldY = row * vDist
        for (let col = firstCol; col <= lastCol; col++) {
            const worldX = col * hDist + xoffs
            drawHexagon(worldX - cx, worldY - cy, getPixelAt(col, row))
        }
    }

    const rect = canvas.getBoundingClientRect()
    const sx = rect.width / viewW
    const sy = rect.height / viewH
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
    viewW = Math.ceil(window.innerWidth / scale)
    viewH = Math.ceil(window.innerHeight / scale)

    if (smooth) {
        const dpr = window.devicePixelRatio || 1
        canvas.width = Math.round(window.innerWidth * dpr)
        canvas.height = Math.round(window.innerHeight * dpr)
    } else {
        canvas.width = viewW
        canvas.height = viewH
    }

    ctx.imageSmoothingEnabled = smooth
    canvas.style.imageRendering = smooth ? 'auto' : 'pixelated'
    clampCam()
    update()
}
window.addEventListener('resize', resize)


var iafid; // inertia animation frame id
function moveCam(dx, dy) {
    camX += dx
    camY += dy
    clampCam()
    if (iafid) cancelAnimationFrame(iafid)
    iafid = requestAnimationFrame(()=>{
        iafid = null
        inertia(dx, dy)
    })
}

let dragging = false
let lastX = 0
let lastY = 0
const friction = 0.88
const rememberedDrags = 3

canvas.style.touchAction = 'none'
canvas.style.cursor = 'grab'

function inertia(x, y) {
    if (dragging) return

    x *= friction
    y *= friction

    if (Math.abs(x) < 0.01) {
        x = 0
    }
    if (Math.abs(y) < 0.01) {
        y = 0
        if (x == 0) return;
    }

    moveCam(x, y)
    requestDraw()
}

var lastDrags
canvas.addEventListener('pointerdown', e => {
    dragging = true
    lastDrags = []
    lastX = e.clientX
    lastY = e.clientY
    canvas.setPointerCapture(e.pointerId)
    canvas.style.cursor = 'grabbing'
})

canvas.addEventListener('pointermove', e => {
    if (!dragging) return
    const dx = -(e.clientX - lastX) / scale
    const dy = -(e.clientY - lastY) / scale
    lastDrags = lastDrags.slice(-rememberedDrags)
    lastDrags.push([dx,dy])
    moveCam(dx, dy)
    lastX = e.clientX
    lastY = e.clientY
    requestDraw()
})

function endDrag() {
    dragging = false
    if (lastDrags && lastDrags.length > 0) {
        const tots = lastDrags.reduce((prev,i)=>[prev[0]+i[0], prev[1]+i[1]], [0,0])
        moveCam(tots[0]/lastDrags.length, tots[1]/lastDrags.length)
    }
    lastDrags = null
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
    const step = hexRadius
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

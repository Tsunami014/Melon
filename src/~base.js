let posToWorld;
{
const root = document.documentElement

const canvas = document.createElement("canvas")
canvas.id = "mainCanvas"
document.body.prepend(canvas)
const ctx = canvas.getContext('2d', { alpha: false })

const hexRadius = 34
const hexThick = 5
const scrollDamp = 0.45

const hexWidth = Math.sqrt(3) * hexRadius
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
    ctx.lineWidth = hexThick
    ctx.stroke()
}

posToWorld = function(strpos) {
    const pos = (strpos || "0 0").split(' ').map(it=>parseFloat(it))
    const col = pos[0]??0
    const row = pos[1]??0

    const xoffs = (((row % 2) + 2) % 2 === 0) ? 0 : hDist / 2
    return { x: col * hDist + xoffs, y: row * vDist }
}

function readBound(name) {
    const v = document.body.getAttribute(name)
    if (v != null && v.trim() !== '') {
        return posToWorld(v)
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

let dpr = 1
function update() {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const cx = camX - viewW / 2
    const cy = camY - viewH / 2

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

    placeElms(cx, cy)
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
    const w = window.innerWidth, h = window.innerHeight
    const d = Math.min(window.devicePixelRatio || 1, 2)
    if (w === viewW && h === viewH && d === dpr) return
    viewW = w; viewH = h; dpr = d
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
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

const maxDragAge = 100 // ms
var lastDrags
var moved = false
var clickable
window.addEventListener('pointerdown', e => {
    root.classList.remove('block')
    const elm = e.target
    clickable = e.target? e.target.closest('.allowclick, .allowdrag') : null
    if (clickable && clickable.classList.contains('allowdrag')) {
        clickable = null
        return;
    }
    if (elm && elm !== canvas && elm !== root && elm !== document.body && !clickable) {
        return;
    }
    root.classList.add('block')
    moved = false
    dragging = true
    lastDrags = []
    lastX = e.clientX
    lastY = e.clientY
    if (iafid) { cancelAnimationFrame(iafid); iafid = null }
    canvas.setPointerCapture(e.pointerId)
    canvas.style.cursor = 'grabbing'
})

canvas.addEventListener('pointermove', e => {
    if (!dragging) return
    moved = true
    const dx = -(e.clientX - lastX)
    const dy = -(e.clientY - lastY)
    lastDrags = lastDrags.slice(-rememberedDrags)
    lastDrags.push([dx, dy, performance.now()])
    moveCam(dx, dy)
    lastX = e.clientX
    lastY = e.clientY
    requestDraw()
})

function endDrag() {
    if (!dragging) return
    root.classList.remove('block')
    if (!moved && clickable) {
        clickable.click()
    }
    clickable = null
    dragging = false
    if (lastDrags) {
        const now = performance.now()
        const recent = lastDrags.filter(d => now - d[2] <= maxDragAge)
        if (recent.length > 0) {
            const tots = recent.reduce((p, d) => [p[0] + d[0], p[1] + d[1]], [0, 0])
            moveCam(tots[0] / recent.length, tots[1] / recent.length)
        } else if (iafid) {
            cancelAnimationFrame(iafid)
            iafid = null
        }
    }
    lastDrags = null
    canvas.style.cursor = 'grab'
}
window.addEventListener('pointerup', endDrag)
window.addEventListener('pointercancel', endDrag)

// The only click an .allowclick element should ever receive is the synthetic one from endDrag
window.addEventListener('click', e => {
    if (e.isTrusted && e.target.closest?.('.allowclick')) e.stopPropagation()
}, true)

window.addEventListener('wheel', e => {
    e.preventDefault()
    var dx = e.deltaX; var dy = e.deltaY
    if (e.shiftKey && dx === 0) { dx = dy; dy = 0 }
    moveCam(dx * scrollDamp, dy * scrollDamp)
    requestDraw()
}, { passive: false })

window.addEventListener('keydown', e => {
    const step = 0.75*hexRadius
    const bigstep = 2*hexRadius
    switch (e.key) {
        case 'h': case 'ArrowLeft': moveCam(-step, 0); break
        case 'l': case 'ArrowRight': moveCam(step, 0); break
        case 'k': case 'ArrowUp': moveCam(0, -step); break
        case 'j': case 'ArrowDown': moveCam(0, step); break
        case 'Home': moveCam(-bigstep, 0); break
        case 'End': moveCam(bigstep, 0); break
        case 'PageUp': moveCam(0, -bigstep); break
        case 'PageDown': moveCam(0, bigstep); break
        default: return
    }
    e.preventDefault()
    requestDraw()
})

resize()
}

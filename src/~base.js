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

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cx = Math.round(camX)
    const cy = Math.round(camY)

    const firstRow = Math.floor(cy / vDist) - 1
    const lastRow = Math.ceil((cy + canvas.height) / vDist) + 2

    for (let row = firstRow; row <= lastRow; row++) {
        const xoffs = (((row % 2) + 2) % 2 === 0) ? 0 : hDist / 2

        const firstCol = Math.floor((cx - xoffs) / hDist) - 1
        const lastCol = Math.ceil((cx + canvas.width - xoffs) / hDist) + 1

        const worldY = row * vDist - hexRadius

        for (let col = firstCol; col <= lastCol; col++) {
            const worldX = col * hDist + xoffs

            drawHexagon(worldX - cx, worldY - cy, getPixelAt(worldX, worldY))
        }
    }
}

let drawQueued = false
function requestDraw() {
    if (drawQueued) return
    drawQueued = true
    requestAnimationFrame(() => {
        drawQueued = false
        drawGrid()
    })
}

function resize() {
    canvas.width = Math.ceil(window.innerWidth/scale)
    canvas.height = Math.ceil(window.innerHeight/scale)
    ctx.imageSmoothingEnabled = false
    drawGrid()
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
    camX -= (e.clientX - lastX) / scale
    camY -= (e.clientY - lastY) / scale
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
    camX += e.deltaX / scale
    camY += e.deltaY / scale
    requestDraw()
}, { passive: false })

window.addEventListener('keydown', e => {
    const step = 4 * hexRadius
    switch (e.key) {
        case 'ArrowLeft': camX -= step; break
        case 'ArrowRight': camX += step; break
        case 'ArrowUp': camY -= step; break
        case 'ArrowDown': camY += step; break
        default: return
    }
    e.preventDefault()
    requestDraw()
})

resize()

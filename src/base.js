const canvas = document.createElement("canvas")
document.body.prepend(canvas)
const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360)
    const lightness = Math.floor(Math.random() * 40) + 40
    return `hsl(${hue}, 80%, ${lightness}%)`
}

const scale = 3
const hexRadius = 12

const hexWidth = Math.round(Math.sqrt(3) * hexRadius / 2) * 2
const halfW = hexWidth / 2
const halfR = hexRadius / 2

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

    const hDist = hexWidth
    const vDist = hexRadius * 1.5

    const cols = Math.ceil(canvas.width / hDist) + 2
    const rows = Math.ceil(canvas.height / vDist) + 2

    for (let row = 0; row < rows; row++) {
        const xoffs = (row % 2 === 0) ? 0 : hDist / 2

        for (let col = 0; col < cols; col++) {
            const x = col * hDist + xoffs
            const y = row * vDist - hexRadius
            drawHexagon(x, y, getRandomColor())
        }
    }
}


function resize() {
    canvas.width = window.innerWidth/scale
    canvas.height = window.innerHeight/scale
    drawGrid()
}
window.addEventListener('resize', resize)
resize()

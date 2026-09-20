const perlinscale = 0.01
function getPixelAt(x, y) {
    let val = (perlin.get(x*perlinscale, y*perlinscale)+1)/2
    val = Math.min(Math.max(val, 0.25), 0.7)
    return `hsl(${Math.floor(val*360)}, 80%, 60%)`
}

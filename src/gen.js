let getPixelAt;
{
const scale = 0.005
getPixelAt = function(x, y) {
    let val = perlinOctaves(x, y, scale, 5, 0.5, 2)
    const worldscale = 4
    val = Math.max(Math.min((val*worldscale+1)/2, 1), 0)
    return `hsl(${Math.floor(90+val*160)}, 80%, 60%)`
}
}

let getPixelAt;
{
const COLOURS = [
    // hue, lightness, whether the colour above is darker
    [220, 45, false],
    [200, 55, false],
    [180, 50, false],
    [50, 60, true],
    [95, 55, true],
    [130, 25, true],
];

const scale = 0.045
getPixelAt = function(x, y) {
    let val = perlinOctaves(x, y, scale, 5, 0.5, 2)

    const worldscale = 3
    val = Math.max(Math.min((val*worldscale+1)/2, 1), 0)

    {
    const heightscale = 1.9
    const v2 = val ** heightscale
    val = v2 / (v2 + (1-val)**heightscale)
    }

    val = Math.min(val, 0.999)
    var col = COLOURS[Math.floor(val*COLOURS.length)]
    var ldiff = (val % (1/COLOURS.length))*COLOURS.length
    if (col[2]) ldiff = 1-ldiff
    const lightdiffamnt = 8
    return `hsl(${col[0]}, 80%, ${ldiff*lightdiffamnt + col[1]}%)`
}
}

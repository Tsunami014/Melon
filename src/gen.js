let getPixelAt;
{
const WATER = [
    // hue, lightness, whether the colour above is darker, saturation (default 80)
    [220, 45, false],
    [200, 55, false],
    [180, 50, false],
    [50, 60, true], // Sand
];
const BIOMES = [
    [ // Forest
        [95, 55, true],
        [130, 25, true],
    ], [ // Plains
        [95, 55, true],
        [85, 40, true],
    ], [ // More plains
        [95, 55, true],
        [85, 40, true],
        [85, 35, true],
    ], [ // Hills
        [95, 55, true],
        [85, 40, true],
        [40, 40, true, 30],
        [40, 40, true, 30],
        [200, 30, true, 8],
    ], [ // Mountains
        [95, 55, true],
        [85, 40, true],
        [200, 30, false, 8],
        [200, 35, false, 8],
        [200, 40, false, 8],
        [200, 45, false, 8],
        [200, 50, false, 8],
        [70, 80, false, 8],
    ]
];

const adjscale = 3
function adjustNoise(val) {
    return Math.max(Math.min((val*adjscale+1)/2, 1), 0)
}

const scale = 0.045
const biomeScale = 0.02
const heightscale = 1.9
getPixelAt = function(x, y) {
    let val = adjustNoise(perlinOctaves(x, y, scale, 5, 0.5, 2))

    {
    const v2 = val ** heightscale
    val = v2 / (v2 + (1-val)**heightscale)
    }

    var colopts;
    if (val <= 0.6) {
        val = val/0.6
        colopts = WATER
    } else {
        val = (val-0.6)/0.4
        let coval = adjustNoise(perlinOctaves(x+1234, y-4321, biomeScale, 2, 0.5, 2))
        colopts = BIOMES[Math.floor(Math.min(coval, 0.999)*BIOMES.length)]
    }
    val = Math.min(val, 0.999)
    var col = colopts[Math.floor(val*colopts.length)]
    var ldiff = (val % (1/colopts.length))*colopts.length
    if (col[2]) ldiff = 1-ldiff
    const lightdiffamnt = 8
    return `hsl(${col[0]}, ${col[3] ?? 80}%, ${ldiff*lightdiffamnt + col[1]}%)`
}
}

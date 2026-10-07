let getPixelAt;
{
const WATER = [
    // hue, lightness, whether the colour above is darker, saturation (default 80)
    [225, 48, false, 55],
    [205, 56, false, 58],
    [186, 52, false, 50],
    [38, 66, true, 55],
];

const BIOMES = [
    [ // Forest
        [105, 52, true, 40],
        [140, 28, true, 30],
    ], [ // Plains
        [105, 52, true, 40],
        [95, 42, true, 38],
    ], [ // More plains
        [105, 52, true, 40],
        [95, 42, true, 38],
        [95, 35, true, 36],
    ], [ // Low hills
        [105, 52, true, 40],
        [95, 42, true, 38],
        [30, 42, true, 28],
        [30, 42, true, 28],
    ], [ // Hills
        [105, 52, true, 40],
        [95, 42, true, 38],
        [30, 42, true, 28],
        [30, 42, true, 28],
        [230, 36, true, 14],
    ], [ // Mountains
        [105, 52, true, 40],
        [95, 42, true, 38],
        [230, 32, false, 14],
        [229, 38, false, 14],
        [228, 44, false, 15],
        [227, 50, false, 16],
        [227, 56, false, 18],
        [226, 85, false, 30],
    ]
];

const adjscale = 3
function adjustNoise(val) {
    return Math.max(Math.min((val*adjscale+1)/2, 1), 0)
}

const scale = 0.045
const riverScale = 0.03
const biomeScale = 0.02
const heightscale = 1.9
const rivercutoff = 0.2
const oceancutoff = 0.3
getPixelAt = function(x, y) {
    let val = adjustNoise(perlinOctaves(x, y, scale, 5, 0.6, 2))

    {
    let river = perlinOctaves(x-4321, y+4321, riverScale, 2, 0.6, 2)
    river = Math.min(Math.abs(river), rivercutoff)/rivercutoff
    river = (1-river)*oceancutoff
    val = Math.max(val - river, 0)
    }

    {
    const v2 = val ** heightscale
    val = v2 / (v2 + (1-val)**heightscale)
    }

    var colopts;
    if (val <= oceancutoff) {
        val = val/oceancutoff
        colopts = WATER
    } else {
        val = (val-oceancutoff)/oceancutoff
        let coval = adjustNoise(perlinOctaves(x+1234, y-1234, biomeScale, 2, 0.6, 2))
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

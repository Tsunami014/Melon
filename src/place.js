let placeElms;
{
    const elms = []
    for (const child of document.body.children) {
        elms.push(child)
    }

    placeElms = function(cx, cy, sx, sy) {
        for (const e of elms) {
            const worldX = 0
            const worldY = 0

            e.style.left = ((worldX - cx) * sx) + 'px'
            e.style.top = ((worldY - cy) * sy) + 'px'
        }
    }
}

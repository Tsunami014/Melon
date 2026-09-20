let placeElms;
{
    const elms = []
    for (const child of document.body.children) {
        elms.push(child)
    }

    placeElms = function(cx, cy, sx, sy) {
        for (const e of elms) {
            const wpos = posToWorld(e.dataset.pos)
            e.style.left = ((wpos.x - cx) * sx) + 'px'
            e.style.top = ((wpos.y - cy) * sy) + 'px'
        }
    }
}

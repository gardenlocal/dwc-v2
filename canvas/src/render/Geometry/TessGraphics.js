import * as PIXI from 'pixi.js'
import Tess2 from './tess2';

function triangulate(graphicsData, graphicsGeometry)
{
    let points = graphicsData.points;
    const holes = graphicsData.holes;
    const verts = graphicsGeometry.points;
    const indices = graphicsGeometry.indices;

    if (points.length >= 6)
    {
        const holeArray = [];
        // Comming soon
        for (let i = 0; i < holes.length; i++)
        {
            const hole = holes[i];

            holeArray.push(points.length / 2);
            points = points.concat(hole.points);
        }

        // Tesselate
        const res = Tess2.tesselate({
            contours: [points],
            windingRule: Tess2.WINDING_ODD ,
            elementType: Tess2.POLYGONS,
            polySize: 3,
            vertexSize: 2
        });

        if (!res.elements.length)
        {
            return;
        }

        const vrt = res.vertices;
        const elm = res.elements;

        const vertPos = verts.length / 2;

        for (var i = 0; i < res.elements.length; i++ )
        {
            indices.push(res.elements[i] + vertPos);
        }

        for(let i = 0; i < vrt.length; i++) {
            verts.push(vrt[i]);
        }
    }
}

export default class TessGraphics extends PIXI.Graphics {
    render(r) { 
        PIXI.graphicsUtils.buildPoly.triangulate = triangulate;
        super.render(r);
    }
}


import * as PIXI from 'pixi.js'
import * as geometric from 'geometric'
import { distanceAndAngleBetweenTwoPoints } from '../utils'

export default class SVGLayer extends PIXI.Graphics {
    constructor(name, svgObj, pointCount = 200) {
        super()
        this.name = name
        this.svgObj = svgObj
        

        //this.points = this.svgObj._geometry.points
        // In order to implement holes, we probably need to do some odd/even stuff here.
        // For now, we can deal with simple shapes.
        this.points = this.svgObj.geometry.graphicsData[0].points        
        this.points = this.resampleByPoints(pointCount)
        this.draw()

        console.log('g: ', geometric)
        console.log('Perimeter: ', this.calculatePerimeter())
    }

    toGeometricPoly(p) {
        let points = []
        for (let i = 0; i < p.length; i += 2) {
            points.push([p[i], p[i + 1]])
        }
        return points
    }

    tick() {
        /*
        const now = new Date().getTime() / 100
        for (let i = 0; i < this.points.length; i += 2) {
            const param = (now + i) / 10
            this.points[i] += Math.sin(param) * 0.1
            this.points[i + 1] += Math.cos(param) * 0.1
        }
        this.draw()
        */
    }

    setStyle(style, matrix) {
		const { fill, opacity, stroke, strokeWidth, strokeOpacity, fillOpacity } = style;

		const isStrokable = stroke !== undefined && stroke !== "none" && stroke !== "transparent";
		const isFillable = fill !== undefined && fill !== "none" && fill !== "transparent";

		const defaultLineWidth = isStrokable ? this.svgObj.options.lineWidth || 1 : 0;
		const lineWidth = strokeWidth !== undefined ? Math.max(0.5, parseFloat(strokeWidth)) : defaultLineWidth;
		const lineColor = isStrokable ? this.svgObj.hexToUint(stroke) : this.svgObj.options.lineColor;

		let strokeOpacityValue = 0;
		let fillOpacityValue = 0;

		if (isStrokable) {
			strokeOpacityValue =
				opacity || strokeOpacity ? parseFloat(opacity || strokeOpacity) : this.svgObj.options.lineOpacity;
		}
		if (isFillable) {
			fillOpacityValue = opacity || fillOpacity ? parseFloat(opacity || fillOpacity) : this.svgObj.options.fillOpacity;
		}

		if (fill) {
			if (!isFillable) {
				this.beginFill(0, 0);
			} else {
				this.beginFill(this.svgObj.hexToUint(fill), fillOpacityValue);
			}
		} else {
			this.beginFill(this.svgObj.options.fillColor, 1);
		}

		this.lineStyle(lineWidth, lineColor, strokeOpacityValue);
		this.setMatrix(matrix);
	}

    resampleByDistance(targetDist) {
        let totalDist = 0
        let newPoints = []

        for (let i = 0; i < this.points.length; i += 2) {
            let dst = distanceAndAngleBetweenTwoPoints(this.points[i], this.points[i + 1], this.points[i + 2], this.points[i + 3]).distance
            console.log(i, dst)
            if (totalDist + dst > targetDist) {
                let interpAlphas = []
                while (totalDist + dst > targetDist) {
                    let advanceDist = targetDist - totalDist
                    interpAlphas.push(advanceDist / dst)
                    totalDist = 0
                    dst -= advanceDist
                }
                totalDist = dst

                console.log(i, interpAlphas)

                interpAlphas.forEach(a => {
                    let newPoint = geometric.lineInterpolate([[this.points[i], this.points[i + 1]], [this.points[i + 2], this.points[i + 3]]])(a)
                    newPoints.push(newPoint[0], newPoint[1])
                })
            } else {
                totalDist += dst
            }
        }

        return newPoints
    }

    resampleByPoints(noPoints) {
        const p = this.calculatePerimeter()
        return this.resampleByDistance(p / noPoints)
    }

    calculatePerimeter() {
        return geometric.polygonLength(this.toGeometricPoly(this.points))
    }

    draw() {
        this.clear()
        this.setStyle(this.svgObj.__style, this.svgObj.__matrix)
        this.drawPolygon(this.points)        
        this.endFill()

        this.drawDebug()
    }

    drawDebug() {
        this.beginFill(0xff0000);
        for (let i = 0; i < this.points.length; i += 2) {
            this.drawCircle(this.points[i], this.points[i + 1], 5)
        }
        this.endFill()
    }
}
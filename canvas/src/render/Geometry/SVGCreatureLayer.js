import * as PIXI from 'pixi.js'

export default class SVGLayer extends PIXI.Graphics {
    constructor(name, svgObj) {
        super()
        this.name = name
        this.svgObj = svgObj
        this.points = this.svgObj._geometry.points
        
        this.draw()
    }

    tick() {
        const now = new Date().getTime() / 100
        for (let i = 0; i < this.points.length; i += 2) {
            const param = (now + i) / 10
            this.points[i] += Math.sin(param) * 0.1
            this.points[i + 1] += Math.cos(param) * 0.1
        }
        this.draw()
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

    draw() {
        this.clear()
        this.setStyle(this.svgObj.__style, this.svgObj.__matrix)
        this.drawPolygon(this.points)
        this.endFill()
    }
}
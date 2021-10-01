import { SVG } from "./svg";
import { SVGNode } from "./svgnode"
import { SVGGroup } from "./svggroup"

//faster, better, longer!!
SVGGroup.prototype.parseChildren = SVGNode.prototype.parseChildren;

export {
	SVGNode, SVGGroup
}

export default SVG;
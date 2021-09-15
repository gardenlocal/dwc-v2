import p5 from 'p5';

export default class Metaball {
	constructor(p5) {
		this.p = p5;
		const size = Math.pow(Math.random(), 2);
		this.vel = this.p.createVector(Math.random(), Math.random())   
		this.radius = 30 * size + 20;
		
		this.pos = this.p.createVector(Math.random*this.p.width/2, Math.random*this.p.height/2)   
	}
	
	update() {
		this.pos.add(this.vel);
		
		if (this.pos.x < this.radius || this.pos.x > this.p.width  - this.radius) this.vel.x *= -1;
		if (this.pos.y < this.radius || this.pos.y > this.p.height - this.radius) this.vel.y *= -1;
	}
}
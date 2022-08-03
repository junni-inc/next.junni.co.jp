import * as THREE from 'three';
import * as ORE from 'ore-three';

export class MipmapGeometry extends THREE.BufferGeometry {

	public resolution: number = 0;

	constructor( resolution: number = 7 ) {

		super();

		this.resolution = resolution;

		let posArray = [];
		let uvArray = [];
		let indexArray = [];

		let p = new THREE.Vector2( 0, 0 );
		let s = 2.0;

		posArray.push( p.x, p.y, 0 );
		posArray.push( p.x + s, p.y, 0 );
		posArray.push( p.x + s, p.y - s, 0 );
		posArray.push( p.x, p.y - s, 0 );

		uvArray.push( 0.0, 1.0 );
		uvArray.push( 1.0, 1.0 );
		uvArray.push( 1.0, 0.0 );
		uvArray.push( 0.0, 0.0 );

		indexArray.push( 0, 2, 1, 0, 3, 2 );

		p.set( s, 0 );

		for ( let i = 0; i < resolution; i ++ ) {

			s *= 0.5;

			posArray.push( p.x,		p.y,		0 );
			posArray.push( p.x + s, p.y,		0 );
			posArray.push( p.x + s, p.y - s,	0 );
			posArray.push( p.x,		p.y - s, 	0 );

			uvArray.push( 0.0, 1.0 );
			uvArray.push( 1.0, 1.0 );
			uvArray.push( 1.0, 0.0 );
			uvArray.push( 0.0, 0.0 );

			let indexOffset = ( i + 0.0 ) * 4;
			indexArray.push( indexOffset + 0, indexOffset + 2, indexOffset + 1, indexOffset + 0, indexOffset + 3, indexOffset + 2 );

			p.y = p.y - s;

		}

		let posAttr = new THREE.BufferAttribute( new Float32Array( posArray ), 3 );
		let uvAttr = new THREE.BufferAttribute( new Float32Array( uvArray ), 2 );
		let indexAttr = new THREE.BufferAttribute( new Uint16Array( indexArray ), 1 );

		let gs = 1;
		posAttr.applyMatrix4( new THREE.Matrix4().makeScale( ( 1.0 / 1.5 ), gs, gs ) );
		posAttr.applyMatrix4( new THREE.Matrix4().makeTranslation( - 1.0, 1.0, 0 ) );

		this.setAttribute( 'position', posAttr );
		this.setAttribute( 'uv', uvAttr );
		this.setIndex( indexAttr );

	}

}

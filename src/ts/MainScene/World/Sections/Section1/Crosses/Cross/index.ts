import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Mesh } from 'three';

import crossVert from './shaders/cross.vs';
import crossFrag from './shaders/cross.fs';

export class Cross extends THREE.Mesh {

	private animatorId: string;
	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;

	constructor( origin: Mesh, parentUniforms: ORE.Uniforms ) {

		let originGeo = origin.geometry;
		let geo = new THREE.InstancedBufferGeometry();
		geo.setAttribute( 'position', originGeo.getAttribute( 'position' ) );
		geo.setAttribute( 'uv', originGeo.getAttribute( 'uv' ) );
		geo.setIndex( originGeo.getIndex() );

		geo.setAttribute( 'offsetPos', new THREE.InstancedBufferAttribute( new Float32Array( [
			0, 0, 0,
			0.2, 0, 0,
			0.4, 0, 0,
		] ), 3 ) );

		geo.setAttribute( 'num', new THREE.InstancedBufferAttribute( new Float32Array( [
			1.0 / 3 * 0,
			1.0 / 3 * 1,
			1.0 / 3 * 2
		] ), 1 ) );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {} );

		let parentId = origin.uuid;
		let animator = window.gManager.animator;

		uni.uRotate = animator.add( {
			name: 'rotate' + parentId,
			initValue: 0,
			easing: ORE.Easings.linear
		} );

		let mat = new THREE.ShaderMaterial( {
			fragmentShader: crossFrag,
			vertexShader: crossVert,
			uniforms: uni
		} );

		super( geo, mat );

		this.animator = animator;
		this.animatorId = parentId;
		this.commonUniforms = uni;

	}

	public rotate() {

		this.animator.setValue( 'rotate' + this.animatorId, 0 );
		this.animator.animate( 'rotate' + this.animatorId, 1, 2, () => {

			this.rotate();

		} );

	}

}

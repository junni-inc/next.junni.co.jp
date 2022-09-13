import * as THREE from 'three';
import * as ORE from 'ore-three';

import bgVert from './shaders/bg.vs';
import bgFrag from './shaders/bg.fs';

export class BG extends THREE.Mesh {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		uni.uSection = window.gManager.animator.add( {
			name: 'bgSection',
			initValue: [ 0, 0, 0, 0, 0, 0 ]
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		let geo = new THREE.SphereBufferGeometry( 100.0 );
		geo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( - 0.7, - 0.12, 1.095 ) ) );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: bgVert,
			fragmentShader: bgFrag,
			uniforms: uni,
			side: THREE.BackSide,
		} );

		super( geo, mat );

		this.commonUniforms = uni;
		this.animator = animator;

	}

	public changeSection( sectionIndex: number ) {

		let sec = [ 0, 0, 0, 0, 0, 0 ];

		if ( sectionIndex >= sec.length ) return;

		sec[ sectionIndex ] = 1;

		this.animator.animate( 'bgSection', sec, 1 );

	}

}

import * as THREE from 'three';
import * as ORE from 'ore-three';

import introTextVert from './shaders/introText.vs';
import introTextFrag from './shaders/introText.fs';

export class IntroText extends THREE.Mesh {

	private animator: ORE.Animator;

	constructor( parentUniforms: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			tex: window.gManager.assetManager.getTex( 'introText' )
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		uni.visibility = animator.add( {
			name: 'introTextVisibility',
			initValue: 0
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		let width = 2.2;

		let geo = new THREE.PlaneBufferGeometry( width, width * 302 / 655 );
		let mat = new THREE.ShaderMaterial( {
			fragmentShader: introTextFrag,
			vertexShader: introTextVert,
			uniforms: uni,
			transparent: true,
			side: THREE.DoubleSide
		} );

		super( geo, mat );

		this.animator = animator;

	}

	public switchVisible( visible: boolean ) {

		this.animator.animate( 'introTextVisibility', visible ? 1 : 0, 1 );

	}

}

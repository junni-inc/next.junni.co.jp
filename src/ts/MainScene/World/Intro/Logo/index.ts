import * as THREE from 'three';
import * as ORE from 'ore-three';

import logoVert from './shaders/logo.vs';
import logoFrag from './shaders/logo.fs';

export class Logo extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;
	private layoutController: ORE.LayoutController;

	constructor( parentUniforms: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			tex: window.gManager.assetManager.getTex( 'logo' )
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		animator.add( {
			name: 'introLogoPosition',
			initValue: 0,
			easing: ORE.Easings.easeOutCubic
		} );


		/*-------------------------------
			Mesh
		-------------------------------*/

		let width = 1.0;

		let geo = new THREE.PlaneBufferGeometry( width, width * 360 / 1060 );
		let mat = new THREE.ShaderMaterial( {
			fragmentShader: logoFrag,
			vertexShader: logoVert,
			uniforms: uni,
			transparent: true,
			side: THREE.DoubleSide,
			depthTest: false,
		} );

		super( geo, mat );

		this.commonUniforms = uni;
		this.animator = animator;

		/*-------------------------------
			Layout
		-------------------------------*/

		this.layoutController = new ORE.LayoutController( this, {
			position: new THREE.Vector3( 0.0, 0.6, 0.0 )
		} );

	}

	public update( deltaTime: number ) {

		this.layoutController.updateTransform( this.animator.get( 'introLogoPosition' ) || 0 );

	}

	public move() {

		this.animator.animate( 'introLogoPosition', 1, 1 );

	}

}

import * as THREE from 'three';
import * as ORE from 'ore-three';
import EventEmitter from 'wolfy87-eventemitter';

import displayVert from './shaders/display.vs';
import displayFrag from './shaders/display.fs';

import containerVert from './shaders/container.vs';
import containerFrag from './shaders/container.fs';

export class Displays extends EventEmitter {

	public root: THREE.Object3D;
	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uNoiseTex: window.gManager.assetManager.getTex( 'noise' ),
			uDisplayTex: window.gManager.assetManager.getTex( 'display' )
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'displayVisibility',
			initValue: 0
		} );

		this.animator.add( {
			name: 'raymarchEffect',
			initValue: 0,
			easing: ORE.Easings.cubicBezier( 0, .85, .25, 1.01 )
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.root = root;
		this.root.children.forEach( ( item, index ) => {

			let container = item as THREE.Mesh;

			container.material = new THREE.ShaderMaterial( {
				vertexShader: containerVert,
				fragmentShader: containerFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( THREE.UniformsUtils.clone( THREE.UniformsLib.lights ), this.commonUniforms, {
				} ),
				transparent: true,
				lights: true,
			} );

			container.renderOrder = 10;

			let display = item.children[ 0 ] as THREE.Mesh;

			let defines: any = {};

			let uniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				uOffset: {
					value: index
				}
			} );

			if ( display.name.indexOf( 'Raymarching' ) > - 1 ) {

				defines[ "IS_RAYMARCH" ] = '';
				defines[ "IS_RAYMARCH_" + display.name.split( "_" )[ 1 ] ] = '';
				uniforms.uRaymarchEffect = this.animator.getVariableObject( 'raymarchEffect' )!;

			}

			display.material = new THREE.ShaderMaterial( {
				vertexShader: displayVert,
				fragmentShader: displayFrag,
				uniforms,
				transparent: true,
				defines
			} );

			display.renderOrder = 10;

		} );


		let animate = () => {

			this.animator.animate( 'raymarchEffect', Math.random(), Math.random() * 1.0 + 0.8, () => {

				animate();

			} );

		};

		animate();

	}

	public switchVisibility( visibility: boolean ) {

		if ( visibility ) this.root.visible = true;

		this.animator.animate( 'displayVisibility', visibility ? 1 : 0, 1, () => {

			if ( ! visibility ) this.root.visible = false;

		} );

	}

}

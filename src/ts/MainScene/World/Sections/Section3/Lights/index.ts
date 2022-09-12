import * as THREE from 'three';
import * as ORE from 'ore-three';
import EventEmitter from 'wolfy87-eventemitter';

import lightVert from './shaders/light.vs';
import lightFrag from './shaders/light.fs';

import wireVert from './shaders/wire.vs';
import wireFrag from './shaders/wire.fs';

export class Lights extends EventEmitter {

	private animator: ORE.Animator;
	private root: THREE.Object3D;
	private commonUniforms: ORE.Uniforms;
	private lightList: THREE.Light[] = [];

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uNoiseTex: window.gManager.assetManager.getTex( 'noise' )
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'sec3LightsVisibility',
			initValue: 0,
		 } );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.root = root;

		this.root.children.forEach( item => {

			let wire = item as THREE.Mesh;

			wire.material = new THREE.ShaderMaterial( {
				vertexShader: wireVert,
				fragmentShader: wireFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( THREE.UniformsUtils.clone( THREE.UniformsLib.lights ), this.commonUniforms, {
				} ),
				transparent: true,
				lights: true,
			} );

			wire.renderOrder = 5;

			let light = wire.children[ 0 ] as THREE.Mesh;

			light.material = new THREE.ShaderMaterial( {
				vertexShader: lightVert,
				fragmentShader: lightFrag,
				uniforms: this.commonUniforms,
				transparent: true,
			} );

			light.renderOrder = 5;

			let adapter = light.children[ 0 ] as THREE.Mesh;

			if ( adapter ) {

				adapter.material = new THREE.ShaderMaterial( {
					vertexShader: lightVert,
					fragmentShader: lightFrag,
					uniforms: this.commonUniforms,
					defines: {
						"IS_ADAPTER": ''
					},
					transparent: true,
				} );

				adapter.renderOrder = 5;

			}

		} );

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( "sec3LightsVisibility", visible ? 1 : 0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}



}

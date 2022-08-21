import * as THREE from 'three';
import * as ORE from 'ore-three';
import EventEmitter from 'wolfy87-eventemitter';

import lightVert from './shaders/light.vs';
import lightFrag from './shaders/light.fs';

export class Lights extends EventEmitter {

	private root: THREE.Object3D;
	private commonUniforms: ORE.Uniforms;
	private lightList: THREE.Light[] = [];

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uNoiseTex: window.gManager.assetManager.getTex( 'noise' )
		} );

		this.root = root;

		this.root.children.forEach( item => {

			let mesh = item as THREE.Mesh;

			mesh.material = new THREE.ShaderMaterial( {
				vertexShader: lightVert,
				fragmentShader: lightFrag,
				uniforms: this.commonUniforms
			} );

			let adapter = mesh.children[ 0 ] as THREE.Mesh;

			if ( adapter ) {

				adapter.material = new THREE.ShaderMaterial( {
					vertexShader: lightVert,
					fragmentShader: lightFrag,
					uniforms: this.commonUniforms,
					defines: {
						"IS_ADAPTER": ''
					}
				} );

			}

		} );


	}

}

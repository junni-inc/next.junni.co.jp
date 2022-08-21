import * as THREE from 'three';
import * as ORE from 'ore-three';
import EventEmitter from 'wolfy87-eventemitter';

import displayVert from './shaders/display.vs';
import displayFrag from './shaders/display.fs';

export class Displays extends EventEmitter {

	private root: THREE.Object3D;
	private commonUniforms: ORE.Uniforms;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uNoiseTex: window.gManager.assetManager.getTex( 'noise' ),
			uDisplayTex: window.gManager.assetManager.getTex( 'display' )
		} );

		this.root = root;

		this.root.children.forEach( ( item, index ) => {

			let mesh = item.children[ 0 ] as THREE.Mesh;

			mesh.material = new THREE.ShaderMaterial( {
				vertexShader: displayVert,
				fragmentShader: displayFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
					uOffset: {
						value: index
					}
				} )
			} );

		} );


	}

}

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
			uNoiseTex: window.gManager.assetManager.getTex( 'noise' )
		} );

		this.root = root;

		this.root.children.forEach( item => {

			let mesh = item as THREE.Mesh;

			mesh.material = new THREE.ShaderMaterial( {
				vertexShader: displayVert,
				fragmentShader: displayFrag,
				uniforms: this.commonUniforms
			} );

		} );


	}

}

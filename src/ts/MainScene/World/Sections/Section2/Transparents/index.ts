import * as THREE from 'three';
import * as ORE from 'ore-three';

import transparentVert from './shaders/transparent.vs';
import transparentFrag from './shaders/transparent.fs';

export class Transparents {

	private root: THREE.Object3D;

	private commonUniforms: ORE.Uniforms;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.root.children.forEach( item => {

			let mesh = item as THREE.Mesh;

			mesh.material = new THREE.ShaderMaterial( {
				fragmentShader: transparentFrag,
				vertexShader: transparentVert,
				uniforms: this.commonUniforms,
				transparent: true,
			} );

			mesh.renderOrder = 999;

		} );

	}

}

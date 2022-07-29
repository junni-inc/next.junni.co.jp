import * as THREE from 'three';
import * as ORE from 'ore-three';

import shadowVert from './shaders/shadow.vs';
import shadowFrag from './shaders/shadow.fs';

export class Shadow {

	private commonUniforms: ORE.Uniforms;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		mesh.material = new THREE.ShaderMaterial( {
			vertexShader: shadowVert,
			fragmentShader: shadowFrag,
			uniforms: this.commonUniforms,
		} );

	}

}

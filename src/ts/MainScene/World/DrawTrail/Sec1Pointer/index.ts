import * as THREE from 'three';
import * as ORE from 'ore-three';

import sec1PointerVert from './shaders/sec1Pointer.vs';
import sec1PointerFrag from './shaders/sec1Pointer.fs';

export class Sec1Pointer extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		let commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let geo = new THREE.SphereBufferGeometry( 0.1 );

		let mat = new THREE.ShaderMaterial( {
			fragmentShader: sec1PointerFrag,
			vertexShader: sec1PointerVert,
			uniforms: commonUniforms,
		} );

		super( geo, mat );

		this.commonUniforms = commonUniforms;

	}

}

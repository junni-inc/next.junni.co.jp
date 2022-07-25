import * as THREE from 'three';
import * as ORE from 'ore-three';

import bgVert from './shaders/bg.vs';
import bgFrag from './shaders/bg.fs';

export class BG {

	private commonUniforms: ORE.Uniforms;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uColor: {
				value: ( mesh.material as THREE.MeshStandardMaterial ).color.convertLinearToSRGB()
			}
		} );

		mesh.material = new THREE.ShaderMaterial( {
			vertexShader: bgVert,
			fragmentShader: bgFrag,
			uniforms: this.commonUniforms
		} );

	}

}

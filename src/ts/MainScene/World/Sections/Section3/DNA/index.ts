import * as THREE from 'three';
import * as ORE from 'ore-three';

import dnaFrag from './shaders/dna.fs';
import { PowerMesh } from 'power-mesh';

export class DNA extends PowerMesh {

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		super( mesh, {
			fragmentShader: dnaFrag,
			uniforms: parentUniforms,
		}, true );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

	}

}

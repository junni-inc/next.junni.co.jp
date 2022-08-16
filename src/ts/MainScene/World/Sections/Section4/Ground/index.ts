import * as THREE from 'three';
import * as ORE from 'ore-three';
import { PowerMesh } from 'power-mesh';

import groundFrag from './shaders/ground.fs';

export class Ground extends PowerMesh {

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		super( mesh, {
			// uniforms: ORE.UniformsLib.mergeUniforms( parentUniforms, {
			// } ),
			fragmentShader: groundFrag,
		}, true );

		this.receiveShadow = true;
		this.castShadow = true;

	}

}

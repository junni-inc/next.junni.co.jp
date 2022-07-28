import * as THREE from 'three';
import * as ORE from 'ore-three';
import { PowerReflectionMesh } from 'power-mesh';

import groundFrag from './shaders/ground.fs';

export class Ground extends PowerReflectionMesh {

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		super( mesh, {
			uniforms: ORE.UniformsLib.mergeUniforms( parentUniforms, {
			} ),
			fragmentShader: groundFrag,
		}, true );

		this.resize( new THREE.Vector2( 1024, 512 ) );

	}

}

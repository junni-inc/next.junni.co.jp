import * as THREE from 'three';
import * as ORE from 'ore-three';

import introGridVert from './shaders/introGrid.vs';
import introGridFrag from './shaders/introGrid.fs';

export class IntroGrid extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		let geo = new THREE.PlaneGeometry( 10, 10 );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {} );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: introGridVert,
			fragmentShader: introGridFrag,
			uniforms: uni
		} );

		super( geo, mat );

		this.commonUniforms = uni;

	}

}

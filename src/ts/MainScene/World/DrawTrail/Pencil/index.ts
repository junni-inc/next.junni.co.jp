import * as THREE from 'three';
import * as ORE from 'ore-three';

import pencilVert from './shaders/pencil.vs';
import pencilFrag from './shaders/pencil.fs';

export class Pencil extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		let commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let size = new THREE.Vector2( 0.8, 3.0 );
		let geo = new THREE.PlaneBufferGeometry( size.x, size.y );
		geo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeTranslation( 0.0, size.y / 2.0, 0.0 ) );
		geo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( 0.0, 0.0, - 0.2 ) ) );

		let mat = new THREE.ShaderMaterial( {
			fragmentShader: pencilFrag,
			vertexShader: pencilVert,
			uniforms: commonUniforms,
			transparent: true,
		} );

		super( geo, mat );

		this.commonUniforms = commonUniforms;


	}

}

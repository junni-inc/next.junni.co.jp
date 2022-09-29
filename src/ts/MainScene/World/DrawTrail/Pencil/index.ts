import * as THREE from 'three';
import * as ORE from 'ore-three';

import pencilVert from './shaders/pencil.vs';
import pencilFrag from './shaders/pencil.fs';

export class Pencil extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		let commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uTex: window.gManager.assetManager.getTex( 'signpen' )
		} );

		let height = 3.0;

		let size = new THREE.Vector2( 147 / 1024 * height * 1.3, height );
		let geo = new THREE.PlaneBufferGeometry( size.x, size.y );
		// geo = new THREE.BoxBufferGeometry( size.x, size.y, 1.0 );
		geo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeTranslation( 0.05, size.y / 2.0 - 0.1, 0.0 ) );
		geo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( 0.0, 0.7, - 0.2, 'YZX' ) ) );

		let mat = new THREE.ShaderMaterial( {
			fragmentShader: pencilFrag,
			vertexShader: pencilVert,
			uniforms: commonUniforms,
			side: THREE.DoubleSide,
			transparent: true,
		} );

		super( geo, mat );

		this.customDepthMaterial = new THREE.ShaderMaterial( {
			fragmentShader: pencilFrag,
			vertexShader: pencilVert,
			uniforms: commonUniforms,
			side: THREE.DoubleSide,
			defines: {
				DEPTH: ""
			},
		} );

		this.castShadow = true;
		this.frustumCulled = false;

		this.commonUniforms = commonUniforms;


	}

}

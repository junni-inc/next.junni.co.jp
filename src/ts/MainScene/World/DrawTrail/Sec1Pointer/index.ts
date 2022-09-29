import * as THREE from 'three';
import * as ORE from 'ore-three';

import sec1PointerVert from './shaders/sec1Pointer.vs';
import sec1PointerFrag from './shaders/sec1Pointer.fs';

export class Sec1Pointer {

	public mesh: THREE.Mesh;
	private commonUniforms: ORE.Uniforms;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		let baseMat = mesh.material as THREE.MeshStandardMaterial;

		let commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uTex: {
				value: baseMat.map
			},
			uMatCapTex: window.gManager.assetManager.getTex( 'matCap' ),
		} );

		let mat = new THREE.ShaderMaterial( {
			fragmentShader: sec1PointerFrag,
			vertexShader: sec1PointerVert,
			uniforms: commonUniforms,
		} );

		this.mesh = mesh;

		this.mesh.material = mat;

		this.mesh.children.forEach( item => {

			let mesh = item as THREE.Mesh;

			let mat = new THREE.ShaderMaterial( {
				fragmentShader: sec1PointerFrag,
				vertexShader: sec1PointerVert,
				uniforms: commonUniforms,
				defines: {
					"GRADATION": ''
				}
			} );

			mesh.material = mat;

		} );

		this.commonUniforms = commonUniforms;

	}

}

import * as ORE from 'ore-three';
import * as THREE from 'three';

import logoVert from './shaders/logo.vs';
import logoFrag from './shaders/logo.fs';

export class Logo {

	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;
	private meshList: THREE.Mesh[] = [];

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {} );

		this.root.traverse( obj => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				let baseMaterial = mesh.material as THREE.MeshStandardMaterial;

				let mat = new THREE.ShaderMaterial( {
					vertexShader: logoVert,
					fragmentShader: logoFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						uColor: {
							value: baseMaterial.emissive.convertLinearToSRGB()
						},
						uMatCapTex: window.gManager.assetManager.getTex( 'matCap' )
					} ),
					side: THREE.DoubleSide
				} );


				mesh.material = mat;

			}

		} );

	}

}

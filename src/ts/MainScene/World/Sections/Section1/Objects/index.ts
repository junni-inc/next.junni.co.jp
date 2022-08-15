import * as ORE from 'ore-three';
import * as THREE from 'three';

import objectVert from './shaders/object.vs';
import objectFrag from './shaders/object.fs';

export class Objects {

	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;
	private objects: THREE.Mesh[] = [];

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {} );

		this.root.traverse( obj => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				let baseMaterial = mesh.material as THREE.MeshStandardMaterial;

				let mat = new THREE.ShaderMaterial( {
					vertexShader: objectVert,
					fragmentShader: objectFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						uColor: {
							value: baseMaterial.emissive
						}
					} ),
					side: THREE.DoubleSide
				} );


				mesh.material = mat;

				this.objects.push( mesh );

			}

		} );

	}

}

import * as ORE from 'ore-three';
import * as THREE from 'three';

import objectVert from './shaders/object.vs';
import objectFrag from './shaders/object.fs';

import slashVert from './shaders/slash.vs';
import slashFrag from './shaders/slash.fs';

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

				mesh.material = this.getMat( mesh );

				this.objects.push( mesh );

			}

		} );

	}

	private getMat( mesh: THREE.Mesh ) {

		let baseMaterial = mesh.material as THREE.MeshStandardMaterial;

		let type = mesh.name.split( '_' )[ 1 ];

		if ( type ) {

			if ( type == 'Slash' ) {

				return new THREE.ShaderMaterial( {
					vertexShader: slashVert,
					fragmentShader: slashFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						uColor: {
							value: baseMaterial.emissive
						}
					} ),
					side: THREE.DoubleSide
				} );

			}

		}

		return new THREE.ShaderMaterial( {
			vertexShader: objectVert,
			fragmentShader: objectFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				uColor: {
					value: baseMaterial.emissive
				}
			} ),
			side: THREE.DoubleSide
		} );


	}

}

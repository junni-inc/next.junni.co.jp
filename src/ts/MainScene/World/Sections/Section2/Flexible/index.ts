import * as THREE from 'three';
import * as ORE from 'ore-three';

import flexibleVert from './shaders/flexible.vs';
import flexibleFrag from './shaders/flexible.fs';

export class Flexible {

	private commonUniforms: ORE.Uniforms;

	private animator: ORE.Animator;

	private mesh: THREE.Mesh;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'flexibleVisibility',
			initValue: 0
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.mesh = mesh;


		this.mesh.traverse( obj => {

			let mesh = obj as THREE.Mesh;
			if ( mesh.isMesh ) {

				let baseMat = mesh.material as THREE.MeshStandardMaterial;

				mesh.material = new THREE.ShaderMaterial( {
					vertexShader: flexibleVert,
					fragmentShader: flexibleFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						uTex: {
							value: baseMat.map
						}
					} ),
					depthTest: true,
					depthWrite: false,
					transparent: true,
				} );

				mesh.renderOrder = 2;

			}

		} );


	}

	public switchVisibility( visible: boolean, duration: number = 1 ) {

		if ( visible ) this.mesh.visible = true;

		this.animator.animate( 'flexibleVisibility', visible ? 1 : 0, duration, () => {

			if ( ! visible ) this.mesh.visible = false;

		} );

	}

}

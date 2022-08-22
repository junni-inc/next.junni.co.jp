import * as THREE from 'three';
import * as ORE from 'ore-three';

import slashVert from './shaders/slash.vs';
import slashFrag from './shaders/slash.fs';

export class Slashes {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {

		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'sec1SlashVisibile',
			initValue: 0,
			easing: ORE.Easings.easeOutCubic
		} );


		this.root.children.forEach( ( obj, index ) => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				let baseMaterial = mesh.material as THREE.MeshStandardMaterial;

				mesh.material = new THREE.ShaderMaterial( {
					vertexShader: slashVert,
					fragmentShader: slashFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						uColor: {
							value: baseMaterial.emissive
						}
					} ),
					side: THREE.DoubleSide,
					transparent: true,
				} );

			}

		} );

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'sec1SlashVisibile', visible ? 1 : 0, 0.5, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

}

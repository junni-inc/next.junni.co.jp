import * as THREE from 'three';
import * as ORE from 'ore-three';

import gradationVert from './shaders/gradation.vs';
import gradationFrag from './shaders/gradation.fs';

export class Gradation {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;
	public root: THREE.Object3D;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {

		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'sec1GradVisibility',
			initValue: 0,
			easing: ORE.Easings.linear
		} );


		this.root.children.forEach( ( obj, index ) => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				mesh.material = new THREE.ShaderMaterial( {
					vertexShader: gradationVert,
					fragmentShader: gradationFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						num: {
							value: index / this.root.children.length
						}
					} ),
					transparent: true,
				} );

			}

		} );

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'sec1GradVisibility', visible ? 1 : 0, 0.5, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

}

import * as THREE from 'three';
import * as ORE from 'ore-three';

import dotVert from './shaders/dot.vs';
import dotFrag from './shaders/dot.fs';

export class Dots {

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
			name: 'sec1DotVisibility',
			initValue: 0,
			easing: ORE.Easings.linear
		} );


		this.root.children.forEach( ( obj, index ) => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				let baseMaterial = mesh.material as THREE.MeshStandardMaterial;

				mesh.material = new THREE.ShaderMaterial( {
					vertexShader: dotVert,
					fragmentShader: dotFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						uColor: {
							value: baseMaterial.emissive
						},
						num: {
							value: index / this.root.children.length
						}
					} ),
					side: THREE.DoubleSide,
					transparent: true
				} );

			}

		} );

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'sec1DotVisibility', visible ? 1 : 0, 0.5, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

}

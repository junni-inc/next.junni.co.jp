import * as THREE from 'three';
import * as ORE from 'ore-three';

import transparentVert from './shaders/transparent.vs';
import transparentFrag from './shaders/transparent.fs';

export class Transparents {

	private root: THREE.Object3D;

	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'transparentVisibility',
			initValue: 0,
		} );

		this.root.children.forEach( item => {

			let mesh = item as THREE.Mesh;

			let baseMat = mesh.material as THREE.MeshStandardMaterial;

			mesh.material = new THREE.ShaderMaterial( {
				fragmentShader: transparentFrag,
				vertexShader: transparentVert,
				uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
					uColor: { value: baseMat.color }
				} ),
				transparent: true,
			} );

			mesh.renderOrder = 999;

		} );

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'transparentVisibility', visible ? 1.0 : 0.0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}


}

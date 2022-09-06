import * as THREE from 'three';
import * as ORE from 'ore-three';

import textVert from './shaders/introText.vs';
import textFrag from './shaders/introText.fs';

export class IntroText {

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
			name: 'introTextVisibility',
			initValue: 0,
		} );

		/*-------------------------------
			Material
		-------------------------------*/

		this.root.children.forEach( item => {

			let mesh = item as THREE.Mesh;

			if ( mesh.isMesh ) {

				let baseMaterial = mesh.material as THREE.MeshStandardMaterial;

				let map = baseMaterial.map;

				if ( map ) {

					map.magFilter = THREE.LinearFilter;
					map.minFilter = THREE.LinearFilter;

				}

				mesh.material = new THREE.ShaderMaterial( {
					vertexShader: textVert,
					fragmentShader: textFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						tex: {
							value: map
						}
					} ),
					transparent: true
				} );

			}

		} );

		this.root.visible = false;

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'introTextVisibility', 1, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

}

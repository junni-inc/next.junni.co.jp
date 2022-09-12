import * as THREE from 'three';
import * as ORE from 'ore-three';

import wireVert from './shaders/wire.vs';
import wireFrag from './shaders/wire.fs';

export class Wire {

	private animator: ORE.Animator;
	private root: THREE.Mesh;
	private commonUniforms: ORE.Uniforms;

	constructor( root: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'wireVisibility',
			initValue: 0
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.root.material = new THREE.ShaderMaterial( {
			vertexShader: wireVert,
			fragmentShader: wireFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( THREE.UniformsUtils.clone( THREE.UniformsLib.lights ), this.commonUniforms, {
			} ),
			transparent: true,
			lights: true,
		} );

		this.root.renderOrder = 5;

	}

	public switchVisibility( visibility: boolean ) {

		if ( visibility ) this.root.visible = true;

		this.animator.animate( 'wireVisibility', visibility ? 1 : 0, 1, () => {

			if ( ! visibility ) this.root.visible = false;

		} );

	}

}

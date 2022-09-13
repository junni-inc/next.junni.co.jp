import * as THREE from 'three';
import * as ORE from 'ore-three';

import backTextVert from './shaders/backText.vs';
import backTextFrag from './shaders/backText.fs';

export class BackText {

	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;
	private mesh: THREE.Mesh;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		this.mesh = mesh;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'sec4BackTextVisibility',
			initValue: 0.0,
			easing: ORE.Easings.easeOutCubic
		} );

		/*-------------------------------
			Material
		-------------------------------*/

		let baseMat = this.mesh.material as THREE.MeshStandardMaterial;

		if ( baseMat.map ) {

			baseMat.map.wrapS = THREE.RepeatWrapping;

		}

		this.commonUniforms.uTex = {
			value: baseMat.map
		};

		mesh.material = new THREE.ShaderMaterial( {
			vertexShader: backTextVert,
			fragmentShader: backTextFrag,
			uniforms: this.commonUniforms,
		} );

	}

	private timer: number | null = null;

	public switchVisibility( visible: boolean ) {

		if ( this.timer ) {

			window.clearInterval( this.timer );
			this.timer = null;

		}

		let wait = visible ? 1000 : 0;

		this.timer = window.setTimeout( () => {

			if ( visible ) this.mesh.visible = true;

			this.animator.animate( 'sec4BackTextVisibility', visible ? 1 : 0, 2, () => {

				if ( ! visible ) this.mesh.visible = false;

			} );

			this.timer = null;

		}, wait );

	}

}

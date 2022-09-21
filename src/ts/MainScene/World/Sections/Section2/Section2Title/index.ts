import * as THREE from 'three';
import * as ORE from 'ore-three';

import titleContainerVert from './shaders/titleContainer.vs';
import titleContainerFrag from './shaders/titleContainer.fs';

import titleBackgroundVert from './shaders/titleBackground.vs';
import titleBackgroundFrag from './shaders/titleBackground.fs';

import titleTextVert from './shaders/titleText.vs';
import titleTextFrag from './shaders/titleText.fs';

export class Section2Title {

	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;

	private container: THREE.Mesh;
	private bg: THREE.Mesh;
	private text: THREE.Object3D;
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
			name: 'section2TitleVisibility',
			initValue: 0,
		} );

		/*-------------------------------
			Container
		-------------------------------*/

		this.container = root.getObjectByName( 'TitleContainer' ) as THREE.Mesh;

		this.container.material = new THREE.ShaderMaterial( {
			fragmentShader: titleContainerFrag,
			vertexShader: titleContainerVert,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			} ),
			transparent: true,
		} );

		this.container.renderOrder = 999;

		/*-------------------------------
			BG
		-------------------------------*/

		this.bg = root.getObjectByName( 'Background' ) as THREE.Mesh;

		this.bg.material = new THREE.ShaderMaterial( {
			fragmentShader: titleBackgroundFrag,
			vertexShader: titleBackgroundVert,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			} ),
			transparent: true,
		} );
		this.bg.renderOrder = 2;

		/*-------------------------------
			Text
		-------------------------------*/

		this.text = root.getObjectByName( 'TitleText' ) as THREE.Object3D;
		this.text.children.forEach( obj => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				mesh.material = new THREE.ShaderMaterial( {
					vertexShader: titleTextVert,
					fragmentShader: titleTextFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms )
				} );

			}

		} );


	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'section2TitleVisibility', visible ? 1.0 : 0.0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

	public update( deltaTime: number ) {

		this.container.rotateX( deltaTime * 0.3 );

	}

}

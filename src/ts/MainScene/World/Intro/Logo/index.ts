import * as THREE from 'three';
import * as ORE from 'ore-three';

import logoVert from './shaders/logo.vs';
import logoFrag from './shaders/logo.fs';
import logoIsVert from './shaders/logoIs.vs';
import logoIsFrag from './shaders/logoIs.fs';

import imagingVert from './shaders/imaging.vs';
import imagingFrag from './shaders/imaging.fs';
import EventEmitter from 'wolfy87-eventemitter';

export class Logo extends EventEmitter {

	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;
	private layoutController: ORE.LayoutController;

	private logoMesh: THREE.Mesh;
	private lineMesh: THREE.Mesh;
	private isMesh: THREE.Mesh;
	private imagingMesh: THREE.Mesh;

	private canceled: boolean = false;

	constructor( logoMesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uIntroLogoVisibility = this.animator.add( {
			name: 'introLogoVisibility',
			initValue: 1,
			// easing: ORE.Easings.easeOutCubic
		} );

		this.commonUniforms.uImaging = this.animator.add( {
			name: 'introLogoImaging',
			initValue: 0,
		} );

		this.commonUniforms.uIsVisibility = this.animator.add( {
			name: 'introLogoIs',
			initValue: 0,
			easing: ORE.Easings.linear
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		// logo

		this.logoMesh = logoMesh;

		this.logoMesh.material = new THREE.ShaderMaterial( {
			fragmentShader: logoFrag,
			vertexShader: logoVert,
			uniforms: this.commonUniforms,
			transparent: true
		} );

		// line

		this.lineMesh = this.logoMesh.getObjectByName( 'LogoLine' ) as THREE.Mesh;
		this.lineMesh.material = new THREE.ShaderMaterial( {
			fragmentShader: logoIsFrag,
			vertexShader: logoIsVert,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				uNum: {
					value: 1
				}
			} ),
			transparent: true,
			defines: {
				'IS_LINE': ''
			}
		} );

		// isMesh

		this.isMesh = this.logoMesh.getObjectByName( 'LogoIs' ) as THREE.Mesh;
		this.isMesh.material = new THREE.ShaderMaterial( {
			fragmentShader: logoIsFrag,
			vertexShader: logoIsVert,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				uNum: {
					value: 2
				}
			} ),
			transparent: true,
		} );

		// imaging

		this.imagingMesh = this.logoMesh.getObjectByName( 'Imaging' ) as THREE.Mesh;

		let baseMat = this.imagingMesh.material as THREE.MeshStandardMaterial;

		this.imagingMesh.material = new THREE.ShaderMaterial( {
			fragmentShader: imagingFrag,
			vertexShader: imagingVert,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				uTex: { value: baseMat.map },
				uNoiseTex: window.gManager.assetManager.getTex( 'noise' ),
			} ),
			transparent: true
		} );

		/*-------------------------------
			Layout
		-------------------------------*/

		this.layoutController = new ORE.LayoutController( this.logoMesh, {
			position: new THREE.Vector3( 0.0, 0.0, 0.0 ),
		}, true );

	}

	public update( deltaTime: number ) {

		// this.layoutController.updateTransform( this.animator.get( 'introLogoVisibility' ) || 0 );
		this.logoMesh.position.x = - ( this.animator.get<number>( 'introLogoImaging' ) || 0 ) * 0.4;

	}

	public async start() {

		await this.animator.animate( 'introLogoIs', 0, 1 );

		await this.animator.animate( 'introLogoIs', 1, 1 );

		await this.animator.animate( 'introLogoIs', 1, 0.8 );

		setTimeout( () => {

			if ( this.canceled ) return;

			window.subtitles.show( 'わたしたちは、想像します。', 0.8 );

			this.emitEvent( 'showImaging' );

		}, 500 );


		await this.animator.animate( 'introLogoImaging', 1, 1.5 );

		await this.animator.animate( 'introLogoImaging', 1, 0.5 );

		setTimeout( () => {

			window.subtitles.hideAll();

		}, 500 );

		await this.animator.animate( 'introLogoVisibility', 0, 1 );

		this.logoMesh.visible = false;
		this.isMesh.visible = false;
		this.lineMesh.visible = false;
		this.imagingMesh.visible = false;

	}

	public cancel() {

		this.canceled = true;

	}

}

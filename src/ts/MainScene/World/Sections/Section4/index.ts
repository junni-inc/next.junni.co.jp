import * as THREE from 'three';
import * as ORE from 'ore-three';

import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Peoples } from './Peoples';

import textVert from './shaders/text.vs';
import textFrag from './shaders/text.fs';

import makingVert from './shaders/making.vs';

import { TileText } from './TileText';

export class Section4 extends Section {

	private renderer: THREE.WebGLRenderer;
	private peoples?: Peoples;

	private title?: TileText;
	private word?: TileText;

	private light?: THREE.DirectionalLight;

	private textIndex: number = 0;
	private textList: string[] = [
		'surprise',
		"emotion",
		"story",
		"awesome"
	];

	// layout

	private baseCameraTarget: THREE.Vector3 = new THREE.Vector3();
	private layoutContorllerList: ORE.LayoutController[] = [];
	private info: ORE.LayerInfo | null = null;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms, renderer: THREE.WebGLRenderer ) {

		super( manager, 'section_4', parentUniforms );

		this.renderer = renderer;

		this.bakuParam.materialType = 'line';
		this.ppParam.vignet = 1.5;
		this.ppParam.filmNoise = 1.0;
		this.cameraSPFovWeight = 12;

		// params

		this.elm = document.querySelector( '.section4' ) as HTMLElement;

		this.commonUniforms.uTextSwitch = this.animator.add( {
			name: 'sec4TextSwtich',
			initValue: 0,
			easing: ORE.Easings.linear
		} );

		/*-------------------------------
			Light1
		-------------------------------*/

		this.light1Data = {
			position: new THREE.Vector3( 10.7, 15.5, 18.7 ),
			targetPosition: new THREE.Vector3(
				- 1.2926819324493408,
				- 12.504984855651855,
				13.764548301696777
			),
			intensity: 1
		};

		this.light2Data = {
			position: new THREE.Vector3( 5.0, 10.7, 20 ),
			targetPosition: new THREE.Vector3( - 1.7, - 6.7, 12 ),
			intensity: 0.2
		};

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;
		this.add( scene );

		/*-------------------------------
			Shadow
		-------------------------------*/

		// new Shadow( scene.getObjectByName( 'Shadow' ) as THREE.Mesh, this.commonUniforms );

		let text = scene.getObjectByName( 'Making' ) as THREE.Object3D;
		text.children.forEach( item => {

			let mesh = item as THREE.Mesh;
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			let uni = ORE.UniformsLib.mergeUniforms( this.commonUniforms, THREE.UniformsUtils.clone( THREE.UniformsLib.lights ), {
				uMatCapTex: window.gManager.assetManager.getTex( 'matCapOrange' ),
				shadowLightModelViewMatrix: {
					value: new THREE.Matrix4()
				},
				shadowLightProjectionMatrix: {
					value: new THREE.Matrix4()
				},
				shadowLightDirection: {
					value: new THREE.Vector3()
				},
				shadowLightCameraClip: {
					value: new THREE.Vector2()
				},
				shadowMap: {
					value: null
				},
				shadowMapSize: {
					value: new THREE.Vector2()
				},
				shadowMapResolution: {
					value: new THREE.Vector2()
				},
				cameraNear: {
					value: 0.01
				},
				cameraFar: {
					value: 1000.0
				},
			} );

			let defines: any = {};
			if ( mesh.name == 'Sapuraizu' ) {

				defines[ "MAIN" ] = '';

			}

			mesh.material = new THREE.ShaderMaterial( {
				vertexShader: textVert,
				fragmentShader: textFrag,
				uniforms: uni,
				lights: true,
				defines
			} );

			mesh.customDepthMaterial = new THREE.ShaderMaterial( {
				vertexShader: textVert,
				fragmentShader: textFrag,
				uniforms: uni,
				lights: true,
				defines: {
					DEPTH: ""
				}
			} );

		} );

		/*-------------------------------
			Ground
		-------------------------------*/

		let ground = this.getObjectByName( 'Ground' ) as THREE.Mesh<any, THREE.MeshStandardMaterial>;
		ground.material.visible = false;

		/*-------------------------------
			Peoples
		-------------------------------*/

		this.peoples = new Peoples( this.renderer, 26, this.commonUniforms, ground.getObjectByName( 'Avoids' ) as THREE.Object3D, [] );
		this.peoples.switchVisibility( this.sectionVisibility, 2 );
		this.peoples.position.y += 0.5;
		ground.add( this.peoples );

		/*-------------------------------
			Text
		-------------------------------*/

		// title

		this.title = new TileText( this.commonUniforms, {
			vertexShader: makingVert
		} );

		this.title.position.set( - 4.8, 3.5, - 0.7 );
		this.title.scale.setScalar( 1.0 );
		this.title.setText( 'making' );
		this.title.switchVisiblity( this.sectionVisibility );
		ground.add( this.title );

		this.layoutContorllerList.push( new ORE.LayoutController( this.title, {
			position: new THREE.Vector3( 3.5, 0.0, - 3.0 ),
			scale: 1.3
		} ) );

		// words

		this.word = new TileText( this.commonUniforms );
		this.word.position.set( 0.0, 3.0, 3.5 );
		this.word.scale.setScalar( 1.0 );
		this.word.switchVisiblity( this.sectionVisibility );
		this.word.setText( this.textList[ 0 ] );
		this.textIndex = 1;
		ground.add( this.word );

		this.layoutContorllerList.push( new ORE.LayoutController( this.word, {
			position: new THREE.Vector3( - 5.0, 0.0, 3.0 )
		} ) );

		/*-------------------------------
			Layout
		-------------------------------*/

		this.baseCameraTarget.copy( this.cameraTransform.targetPosition );

		// resize

		if ( this.info ) {

			this.resize( this.info );

		}

	}

	public resize( info: ORE.LayerInfo ): void {

		super.resize( info );

		this.info = info;

		this.cameraTransform.targetPosition.copy( this.baseCameraTarget.clone().add( new THREE.Vector3( - 0.2, 0.0, 1.0 ).multiplyScalar( info.size.portraitWeight ) ) );

		this.layoutContorllerList.forEach( item => {

			item.updateTransform( info.size.portraitWeight );

		} );

	}

	public update( deltaTime: number ): void {

		if ( this.peoples ) {

			this.peoples.update( deltaTime );

		}

		if ( this.light ) {

			this.light.intensity = this.animator.get( 'sectionVisibility' + this.sectionName ) || 0;

		}

	}

	public switchViewingState( viewing: ViewingState ): void {

		super.switchViewingState( viewing );

		if ( this.peoples ) {

			let passed = viewing == 'passed';

			this.peoples.switchVisibility( this.sectionVisibility, passed ? 2 : 1.5 );
			this.peoples.switchAscension( passed, passed ? 2 : 1.5 );

		}

		if ( this.title ) this.title.switchVisiblity( this.sectionVisibility );
		if ( this.word ) this.word.switchVisiblity( this.sectionVisibility );

	}

	public switchText() {

		setTimeout( () => {

			if ( this.peoples ) this.peoples.jump();

		}, 400 );

		this.animator.setValue( 'sec4TextSwtich', 0 );
		this.animator.animate( 'sec4TextSwtich', 1, 1 );

		if ( this.word ) {

			this.word.setText( this.textList[ this.textIndex ] );

		}

		this.textIndex = ( this.textIndex + 1 ) % this.textList.length;

	}

}

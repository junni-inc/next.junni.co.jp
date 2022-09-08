import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as CANNON from 'cannon';

import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Peoples } from './Peoples';
import { FallText } from './FallText';

type PhysicsObj = {
	visual: THREE.Object3D;
	body: CANNON.Body
}


import textVert from './shaders/text.vs';
import textFrag from './shaders/text.fs';

export class Section4 extends Section {

	private renderer: THREE.WebGLRenderer;
	private peoples?: Peoples;

	private cannonWorld: CANNON.World;
	private groundBody?: CANNON.Body;

	private textList: FallText[] = [];

	private light?: THREE.DirectionalLight;


	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms, renderer: THREE.WebGLRenderer ) {

		super( manager, 'section_4', parentUniforms );

		this.renderer = renderer;

		this.bakuMaterialType = 'line';
		this.ppParam.vignet = 1.5;

		// params

		this.elm = document.querySelector( '.section4' ) as HTMLElement;

		// animator

		this.commonUniforms.uTextSwitch = this.animator.add( {
			name: 'sec4TextSwtich',
			initValue: 0,
			easing: ORE.Easings.linear
		} );

		this.commonUniforms.uJumping = this.animator.add( {
			name: 'sec4Jumping',
			initValue: 0,
			easing: ORE.Easings.easeOutCubic
		} );

		/*-------------------------------
			Cannon
		-------------------------------*/

		this.cannonWorld = new CANNON.World();
		this.cannonWorld.iterations = 50;
		this.cannonWorld.gravity = new CANNON.Vec3( 0.0, - 9.8, 0.0 );

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
			intensity: 0
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

		let size = new THREE.Box3().setFromObject( ground ).getSize( new THREE.Vector3() );

		let body = new CANNON.Body( { type: CANNON.Body.KINEMATIC } );
		body.addShape( new CANNON.Box( new CANNON.Vec3( size.x / 2, size.y / 2, size.z / 2 ) ) );
		body.position.set( 0, 0, 0 );

		this.cannonWorld.addBody( body );

		/*-------------------------------
			Text
		-------------------------------*/

		let textRoot = scene.getObjectByName( 'FallTexts' );
		let textAssets = scene.getObjectByName( 'TextAssets' ) as THREE.Object3D;

		if ( textRoot && textAssets ) {

			textRoot.children.concat().forEach( ( item, index ) => {

				let text = new FallText( item as THREE.Mesh, textAssets.getObjectByName( 'Text' + ( index + 1 ) ) as THREE.Object3D, this.commonUniforms, ground );
				// ground.add( text.root );
				this.cannonWorld.addBody( text.body );
				this.textList.push( text );

			} );

		}

		/*-------------------------------
			Peoples
		-------------------------------*/

		this.peoples = new Peoples( this.renderer, 26, this.commonUniforms, ground.getObjectByName( 'Avoids' ) as THREE.Object3D, this.textList );
		this.peoples.switchVisibility( this.sectionVisibility, 2 );
		this.peoples.position.y += 0.5;
		ground.add( this.peoples );

	}

	public update( deltaTime: number ): void {

		// this.cannonWorld.step( deltaTime );

		this.textList.forEach( item => {

			item.update();

		} );

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

			this.peoples.switchVisibility( this.sectionVisibility, passed ? 4 : 1.5 );
			this.peoples.switchJump( passed, passed ? 4 : 1.5 );

		}

		this.textList.forEach( item => {

			item.switchVisibility( this.sectionVisibility );

		} );

		// if ( this.sectionVisibility ) {

		// 	this.createInterval();

		// } else {

		// 	this.clearInterval();

		// }

	}

	private intervalTimer: number | null = null;
	private currentTextIndex: number = 0;

	public switchText() {

		this.animator.setValue( 'sec4TextSwtich', 0 );
		this.animator.animate( 'sec4TextSwtich', 1, 1 );

		this.animator.setValue( 'sec4Jumping', 1 );
		this.animator.animate( 'sec4Jumping', 0, 1.0, ()=> {

			// this.animator.animate( 'sec4Jumping', 0, 0.5 );

		} );

		this.textList.forEach( ( item, index ) => {

			setTimeout( () => {

				item.switchText( this.currentTextIndex );

			}, 50 * index + 100.0 );

		} );

		this.currentTextIndex = ( this.currentTextIndex + 1 ) % 3;

	}

	// public createInterval() {

	// this.clearInterval();

	// this.intervalTimer = window.setInterval( () => {

	// 	this.switchText();

	// }, 5000 );

	// }

	// public clearInterval() {

	// 	if ( this.intervalTimer ) {

	// 		window.clearInterval( this.intervalTimer );
	// 		this.intervalTimer = null;

	// 	}

	// }

}

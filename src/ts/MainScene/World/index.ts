import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section1 } from './Sections/Section1';
import { Section2 } from './Sections/Section2';
import { BakuTransform, Section } from './Sections/Section';
import { Section3 } from './Sections/Section3';
import { Section4 } from './Sections/Section4';
import { Baku } from './Baku';
import { Section5 } from './Sections/Section5';
import { Intro } from './Intro';
import { Section6 } from './Sections/Section6';
import { BG } from './BG';
import { Ground } from './Ground';
import { Lights } from './Lights';
import { DrawTrail } from './DrawTrail';

export class World extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	private lights: Lights;

	// manager

	private manager: THREE.LoadingManager;

	// bg

	public bg: BG;

	// ground

	public ground: Ground;

	// intro

	public intro: Intro;

	// section

	public sections: Section[] = [];
	public section1: Section1;
	public section2: Section2;
	public section3: Section3;
	public section4: Section4;
	public section5: Section5;
	public section6: Section6;

	// baku

	private baku: Baku;

	// trail

	public trail?: DrawTrail;

	// state

	public loaded: boolean = false;
	public splashed: boolean = false;

	constructor( renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uEnvMap: {
				value: null
			}
		} );

		/*-------------------------------
			Manager
		-------------------------------*/

		this.manager = new THREE.LoadingManager(
			() => {

			},
			( url, loaded, total ) => {

				let percentage = loaded / total;

				if ( percentage == 1.0 ) {

					this.loaded = true;

					/*-------------------------------
						コンパイル走るといいな～
					-------------------------------*/

					let camera = new THREE.OrthographicCamera( - 100, 100, 100, - 100, 0.01, 1000.0 );
					camera.position.set( 0, 0, 500 );

					let visibility: boolean[] = [];

					this.sections.forEach( section => {

						visibility.push( section.visible );
						section.visible = true;

					} );

					renderer.render( this.scene, camera );

					this.sections.forEach( section => {

						visibility.push( section.visible );
						section.visible = visibility.shift() || false;

					} );

					// -----------------------------------

					this.dispatchEvent( {
						type: 'load',
					} );

				}

				this.intro.updateLoadState( percentage );

				this.dispatchEvent( {
					type: 'loadProgress',
					percentage
				} );

			}
		);

		/*-------------------------------
			Lights
		-------------------------------*/

		this.lights = new Lights( this.scene );

		/*-------------------------------
			BG
		-------------------------------*/

		this.bg = new BG( this.commonUniforms );
		this.scene.add( this.bg );

		/*-------------------------------
			Ground
		-------------------------------*/

		this.ground = new Ground( this.scene.getObjectByName( 'CommonGround' ) as THREE.Mesh, this.commonUniforms );

		/*-------------------------------
			Intro
		-------------------------------*/

		this.intro = new Intro( renderer, this.scene.getObjectByName( 'Intro' ) as THREE.Object3D, this.commonUniforms );

		/*-------------------------------
			Baku
		-------------------------------*/

		this.baku = new Baku( this.manager, this.commonUniforms );
		this.add( this.baku );

		window.setInterval( () => {

			if ( this.section4.sectionVisibility ) {

				this.baku.jump();

			}

		}, 3500 );

		/*-------------------------------
			Trail
		-------------------------------*/

		let trailAssets = this.scene.getObjectByName( 'TrailAssets' ) as THREE.Object3D;

		if ( ! window.isSP ) {

			this.trail = new DrawTrail( renderer, trailAssets, this.commonUniforms );
			this.trail.position.set( 0, 0, 0 );
			this.trail.frustumCulled = false;
			this.add( this.trail );

		} else {

			trailAssets.visible = false;

		}

		/*-------------------------------
			Sections
		-------------------------------*/

		this.section1 = new Section1( this.manager, this.commonUniforms );
		this.add( this.section1 );
		this.section1.wall.setTex( this.intro.renderTarget.texture );
		this.sections.push( this.section1 );

		this.section2 = new Section2( this.manager, this.commonUniforms );
		this.add( this.section2 );
		this.sections.push( this.section2 );

		this.section3 = new Section3( this.manager, this.commonUniforms, renderer );
		this.add( this.section3 );
		this.sections.push( this.section3 );

		this.section4 = new Section4( this.manager, this.commonUniforms, renderer );
		this.add( this.section4 );
		this.sections.push( this.section4 );

		this.baku.addEventListener( 'jump', () => {

			setTimeout( () => {

				this.section4.switchText();
				window.cameraController.shake( 0.08, 0.3, 7 );

			}, 700 );

		} );

		this.section5 = new Section5( this.manager, this.commonUniforms );
		this.add( this.section5 );
		this.sections.push( this.section5 );

		this.section6 = new Section6( this.manager, this.commonUniforms );
		this.add( this.section6 );
		this.sections.push( this.section6 );

		this.baku.onLoaded = () => {

			this.section2.setSceneTex( this.baku.sceneRenderTarget.texture );

			if ( this.trail ) {

				this.trail.setSceneTex( this.baku.sceneRenderTarget.texture );

			}

		};

		/*-------------------------------
			EnvMap
		-------------------------------*/

		let cubemapLoader = new THREE.CubeTextureLoader();
		cubemapLoader.load( [
			'/assets/envmap/sec2/px.png',
			'/assets/envmap/sec2/nx.png',
			'/assets/envmap/sec2/py.png',
			'/assets/envmap/sec2/ny.png',
			'/assets/envmap/sec2/pz.png',
			'/assets/envmap/sec2/nz.png',
		], ( tex ) => {

			this.commonUniforms.uEnvMap.value = tex;

		} );


	}

	public changeSection( sectionIndex: number ) {

		let viewingIndex = 0;

		this.sections.forEach( ( item, index ) => {

			if ( index > sectionIndex ) {

				item.switchViewingState( 'ready' );

			} else if ( index < sectionIndex ) {

				item.switchViewingState( 'passed' );

			} else {

				item.switchViewingState( 'viewing' );

				viewingIndex = index;

			}

		} );

		let section = this.sections[ viewingIndex ];

		// light

		this.lights.changeSection( section );

		// baku

		this.baku.changeRotateSpeed( section.bakuParam.rotateSpeed );
		this.baku.changeMaterial( section.bakuParam.materialType );
		this.baku.changeSectionAction( section.sectionName );

		//  bg

		this.bg.changeSection( sectionIndex );

		// ground

		this.ground.changeSection( sectionIndex );

		// trail

		if ( this.trail ) this.trail.changeMaterial( sectionIndex );

		return section;

	}

	public updateTransform( scrollValue: number ) {

		let index = Math.max( 0.0, Math.min( this.sections.length - 1, Math.floor( scrollValue ) ) );
		let t = scrollValue % 1;

		let from = this.sections[ index ];
		let to = this.sections[ index + 1 ] || from;

		//  cameraTransform

		let cameraTransform = {
			position: from.cameraTransform.position.clone().lerp( to.cameraTransform.position, t ),
			targetPosition: from.cameraTransform.targetPosition.clone().lerp( to.cameraTransform.targetPosition, t ),
			fov: from.cameraTransform.fov + ( to.cameraTransform.fov - from.cameraTransform.fov ) * t
		};

		// bakuTransform

		let bakuTransform: BakuTransform = {
			position: from.bakuTransform.position.clone().lerp( to.bakuTransform.position, t ),
			rotation: from.bakuTransform.rotation.clone().slerp( to.bakuTransform.rotation, t ),
			scale: from.bakuTransform.scale.clone().lerp( to.bakuTransform.scale, t ),
		};

		this.baku.position.copy( bakuTransform.position );
		this.baku.scale.copy( bakuTransform.scale );
		this.baku.quaternion.copy( bakuTransform.rotation );

		return {
			cameraTransform,
			bakuTransform
		};

	}

	public update( deltaTime: number ) {

		this.intro.update( deltaTime );

		this.sections.forEach( item => {

			item.update( deltaTime );

		} );

		this.baku.update( deltaTime );

		this.lights.update( deltaTime );

		if ( this.trail ) this.trail.update( deltaTime );

	}

	public resize( info: ORE.LayerInfo ) {

		if ( this.trail ) this.trail.resize( info );

		this.intro.resize( info );

		this.baku.resize( info );

		this.sections.forEach( item => {

			item.resize( info );

		} );

	}

	public splash( camera: THREE.PerspectiveCamera ) {

		if ( this.splashed ) return;

		this.splashed = true;
		this.section1.wall.init( camera );
		this.section1.splash();

		this.baku.show();

		setTimeout( () => {

			this.section1.switchViewingState( "viewing" );

		}, 500 );

		setTimeout( () => {

			this.section1.wall.dispose();

		}, 1500 );


	}

	public cancelIntro() {

		if ( this.splashed ) return;

		this.splashed = true;
		this.intro.skip();
		this.section1.wall.dispose();
		this.section1.splash();
		this.baku.show( 0 );


	}

}

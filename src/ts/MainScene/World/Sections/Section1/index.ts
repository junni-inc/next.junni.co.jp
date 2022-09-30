import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as CANNON from 'cannon';

import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Section, ViewingState } from '../Section';
import { Wall } from './Wall';
import { BakuCollision } from './BakuCollision';
import { Logo } from './Logo';
import { Crosses } from './Crosses';
import { Gradation } from './Gradation';
import { Lines } from './Lines';
import { Slashes } from './Slashes';
import { Dots } from './Dots';

export class Section1 extends Section {

	private bakuStartPos: THREE.Vector3;
	private bakuGoalPos: THREE.Vector3;

	private cannonWorld: CANNON.World;
	private bakuCollision: BakuCollision;

	// objects

	public wall: Wall;
	private logo?: Logo;
	private crosses?: Crosses;
	private gradation?: Gradation;
	private lines?: Lines;
	private slashes?: Slashes;
	private dots?: Dots;

	// layout

	private layoutControllerList: ORE.LayoutController[] = [];

	// state

	private layerInfo: ORE.LayerInfo | null = null;
	public splashed: boolean = false; //ここがtrueにならないとswitchVisivilityがきかない( splash後にボヨンしたいから )

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_1', parentUniforms );

		// params

		this.cameraRange.set( 0.01, 0.01 );
		this.elm = document.querySelector( '.section1' ) as HTMLElement;
		this.ppParam.vignet = 0.7;
		this.trailDepth = 0.95;

		// baku

		this.bakuStartPos = new THREE.Vector3();
		this.bakuGoalPos = new THREE.Vector3();

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator.add( {
			name: 'bakuSplash',
			initValue: 0,
			easing: ORE.Easings.easeOutCubic
		} );

		/*-------------------------------
			Light
		-------------------------------*/

		this.light1Data = {
			intensity: 1,
			position: new THREE.Vector3( 1.0, 1.0, 1.0 ),
			targetPosition: new THREE.Vector3( 0, 0, 0 ),
		};

		this.light2Data = {
			intensity: 1,
			position: new THREE.Vector3( 3, - 1, 1 ),
			targetPosition: new THREE.Vector3( 0, 0, 0 ),
		};

		/*-------------------------------
			Physics
		-------------------------------*/

		this.cannonWorld = new CANNON.World();
		this.cannonWorld.gravity.set( 0.0, - 2.0, 0.0 );
		this.cannonWorld.solver.iterations = 10;
		this.cannonWorld.allowSleep = true;

		this.cannonWorld.defaultContactMaterial.contactEquationStiffness = 5e6;
		this.cannonWorld.defaultContactMaterial.contactEquationRelaxation = 3;

		/*-------------------------------
			BakuCollision
		-------------------------------*/

		this.bakuCollision = new BakuCollision( this.cannonWorld, this.commonUniforms );
		this.add( this.bakuCollision );

		/*-------------------------------
			Wall
		-------------------------------*/

		this.wall = new Wall( this.cannonWorld, this.commonUniforms );
		this.add( this.wall );

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;
		this.add( scene );

		this.bakuStartPos.set( 0, 1, - 2 );
		this.bakuGoalPos.copy( this.bakuTransform.position );
		this.bakuTransform.position.copy( this.bakuStartPos );

		if ( this.splashed ) {

			this.bakuTransform.position.copy( this.bakuGoalPos );

		}

		/*-------------------------------
			Logo
		-------------------------------*/

		this.logo = new Logo( scene.getObjectByName( 'Logo' ) as THREE.Object3D, this.commonUniforms );
		this.logo.switchVisibility( this.sectionVisibility );

		/*-------------------------------
			crosses
		-------------------------------*/

		this.crosses = new Crosses( this.getObjectByName( 'Crosses' ) as THREE.Object3D, this.commonUniforms );
		this.crosses.switchVisibility( this.sectionVisibility );

		this.layoutControllerList.push( new ORE.LayoutController( this.crosses.root.getObjectByName( 'Cross_Right' )!, {
			position: new THREE.Vector3( - 0.3, 0.4, 0.0 ),
			scale: 0.8
		} ) );

		this.layoutControllerList.push( new ORE.LayoutController( this.crosses.root.getObjectByName( 'Cross_Left' )!, {
			position: new THREE.Vector3( 0.4, - 0.6, 0.0 ),
			scale: 0.8
		} ) );

		/*-------------------------------
			Gradations
		-------------------------------*/

		this.gradation = new Gradation( this.getObjectByName( 'Gradations' ) as THREE.Object3D, this.commonUniforms );
		this.gradation.switchVisibility( this.sectionVisibility );

		this.layoutControllerList.push( new ORE.LayoutController( this.gradation.root.getObjectByName( 'Gradation_RightTop' )!, {
			position: new THREE.Vector3( - 3.0, 2.0, 0.0 )
		} ) );

		this.layoutControllerList.push( new ORE.LayoutController( this.gradation.root.getObjectByName( 'Gradation_LeftBottom' )!, {
			position: new THREE.Vector3( 3.0, - 4.0, 0.0 )
		} ) );

		this.layoutControllerList.push( new ORE.LayoutController( this.gradation.root.getObjectByName( 'Gradation_RightBottom' )!, {
			position: new THREE.Vector3( - 2.0, - 3.0, 0.0 )
		} ) );

		/*-------------------------------
			Lines
		-------------------------------*/

		this.lines = new Lines( this.getObjectByName( 'Lines' ) as THREE.Object3D, this.commonUniforms );
		this.lines.switchVisibility( this.viewing );

		this.layoutControllerList.push( new ORE.LayoutController( this.lines.root, {
			scale: 0.6,
			position: new THREE.Vector3( 0.0, - 0.2, 0.0 )
		} ) );

		/*-------------------------------
			Slash
		-------------------------------*/

		this.slashes = new Slashes( this.getObjectByName( 'Slashes' ) as THREE.Object3D, this.commonUniforms );
		this.slashes.switchVisibility( this.sectionVisibility );

		/*-------------------------------
			Dots
		-------------------------------*/

		this.dots = new Dots( this.getObjectByName( 'Dots' ) as THREE.Object3D, this.commonUniforms );
		this.dots.switchVisibility( this.sectionVisibility );

		this.layoutControllerList.push( new ORE.LayoutController( this.dots.root.getObjectByName( 'Dots_RightTop' )!, {
			position: new THREE.Vector3( - 5.0, 3, 0.0 )
		} ) );

		this.layoutControllerList.push( new ORE.LayoutController( this.dots.root.getObjectByName( 'Dots_RightBottom' )!, {
			position: new THREE.Vector3( - 2.0, - 1.5, 0.0 )
		} ) );

		this.layoutControllerList.push( new ORE.LayoutController( this.dots.root.getObjectByName( 'Dots_LeftBottom' )!, {
			position: new THREE.Vector3( 3.0, - 3.5, 0.0 )
		} ) );

		// resize

		if ( this.layerInfo ) {

			this.resize( this.layerInfo );

		}

	}

	public update( deltaTime: number ): void {

		if ( this.wall.visible ) {

			this.cannonWorld.step( deltaTime );

			this.bakuCollision.update( deltaTime );
			this.wall.update( deltaTime );

		}

		if ( this.animator.isAnimatingVariable( 'bakuSplash' ) ) {

			this.bakuTransform.position.copy( this.bakuStartPos.clone().lerp( this.bakuGoalPos, this.animator.get<number>( 'bakuSplash' ) || 0 ) );

		}

		if ( this.animationMixer ) {

			this.animationMixer.update( deltaTime );

		}

		if ( this.logo ) {

			this.logo.update( deltaTime );

		}

	}

	public splash() {

		this.splashed = true;
		this.animator.animate( 'bakuSplash', 1, 1 );

		this.animationActionList.forEach( action => {

			action.setLoop( THREE.LoopOnce, 1 );
			action.clampWhenFinished = true;
			action.play();

		} );

		this.bakuCollision.splash();

	}

	public hover( args: ORE.TouchEventArgs, camera: THREE.PerspectiveCamera ) {

		if ( this.logo ) {

			this.logo.hover( args, camera );

		}

	}


	public resize( info: ORE.LayerInfo ) {

		this.layerInfo = info;

		// baku layout

		let baku = this.getObjectByName( 'Baku' );

		if ( baku ) {

			this.bakuGoalPos.copy( baku.position.clone().add( new THREE.Vector3( info.size.portraitWeight * 0.2, 0.0, 0.0 ) ) );
			this.bakuTransform.position.copy( this.bakuStartPos.clone().lerp( this.bakuGoalPos, this.animator.get<number>( 'bakuSplash' ) || 0 ) );

		}

		// object layout

		this.layoutControllerList.forEach( item => {

			item.updateTransform( info.size.portraitWeight );

		} );

		// logo layout

		if ( this.logo ) this.logo.resize( this.layerInfo );


	}

	public switchViewingState( viewing: ViewingState ): void {

		if ( ! this.splashed ) return;

		super.switchViewingState( viewing );

		if ( this.logo ) this.logo.switchVisibility( this.sectionVisibility );
		if ( this.gradation ) this.gradation.switchVisibility( this.sectionVisibility );
		if ( this.lines ) this.lines.switchVisibility( viewing );
		if ( this.slashes ) this.slashes.switchVisibility( this.sectionVisibility );
		if ( this.crosses ) this.crosses.switchVisibility( this.sectionVisibility );
		if ( this.dots ) this.dots.switchVisibility( this.sectionVisibility );

	}

}

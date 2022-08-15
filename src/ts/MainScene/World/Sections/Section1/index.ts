import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as CANNON from 'cannon';

import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Section, ViewingState } from '../Section';
import { Wall } from './Wall';
import { BakuCollision } from './BakuCollision';
import { Objects } from './Objects';
import { Logo } from './Logo';

export class Section1 extends Section {

	private bakuStartPos: THREE.Vector3;
	private bakuGoalPos: THREE.Vector3;

	private cannonWorld: CANNON.World;
	private bakuCollision: BakuCollision;

	private sceneRoot?: THREE.Object3D;

	public wall: Wall;
	private objects?: Objects;
	private logo?: Logo;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_1', parentUniforms );


		// params

		this.cameraRange.set( 0.01, 0.01 );
		this.elm = document.querySelector( '.section1' ) as HTMLElement;

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

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 1, 1 );
		this.add( light );

		light = new THREE.DirectionalLight();
		light.position.set( 3, - 1, 1 );
		this.add( light );

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

		/*-------------------------------
			Logo
		-------------------------------*/

		this.logo = new Logo( scene.getObjectByName( 'Logo' ) as THREE.Object3D, this.commonUniforms );

		/*-------------------------------
			Objects
		-------------------------------*/

		this.objects = new Objects( scene.getObjectByName( 'Objects' ) as THREE.Object3D, this.commonUniforms );

	}

	public update( deltaTime: number ): void {

		this.cannonWorld.step( deltaTime );
		this.bakuCollision.update( deltaTime );
		this.wall.update( deltaTime );

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

		this.animator.animate( 'bakuSplash', 1, 1 );

		this.animationActionList.forEach( action => {

			action.setLoop( THREE.LoopOnce, 1 );
			action.clampWhenFinished = true;
			action.play();

		} );

		setTimeout( () => {

			this.bakuCollision.splash();

		}, 200 );

	}

	public hover( args: ORE.TouchEventArgs, camera: THREE.PerspectiveCamera ) {

		if ( this.logo ) {

			this.logo.hover( args, camera );

		}

	}

	public switchViewingState( viewing: ViewingState ): void {

		super.switchViewingState( viewing );

	}

}

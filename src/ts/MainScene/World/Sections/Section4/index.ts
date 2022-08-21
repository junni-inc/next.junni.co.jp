import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as CANNON from 'cannon';

import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Shadow } from './Shadow';
import { Peoples } from './Peoples';
import { Text } from './Text';

type PhysicsObj = {
	visual: THREE.Object3D;
	body: CANNON.Body
}

export class Section4 extends Section {

	private renderer: THREE.WebGLRenderer;
	private peoples?: Peoples;

	private cannonWorld: CANNON.World;
	private groundBody?: CANNON.Body;
	private textList: Text[] = [];

	private light?: THREE.DirectionalLight;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms, renderer: THREE.WebGLRenderer ) {

		super( manager, 'section_4', parentUniforms );

		this.renderer = renderer;

		this.bakuMaterialType = 'line';

		// params

		this.elm = document.querySelector( '.section4' ) as HTMLElement;

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
			position: new THREE.Vector3( 2.7, - 2.5, 18.7 ),
			targetPosition: new THREE.Vector3(
				- 1.2926819324493408,
				- 12.504984855651855,
				13.764548301696777
			),
			intensity: 1
		};

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;

		this.add( scene );

		/*-------------------------------
			Shadow
		-------------------------------*/

		// new Shadow( scene.getObjectByName( 'Shadow' ) as THREE.Mesh, this.commonUniforms );

		/*-------------------------------
			Text
		-------------------------------*/

		let textRoot = scene.getObjectByName( 'FallTexts' );

		if ( textRoot ) {

			textRoot.children.concat().forEach( item => {

				let text = new Text( item, this.commonUniforms );
				this.add( text.mesh );
				this.cannonWorld.addBody( text.body );
				this.textList.push( text );

				setTimeout( () => {

					// text.small();

				}, 2000 );

			} );

		}

		let ground = this.getObjectByName( 'Ground' ) as THREE.Mesh<any, THREE.MeshStandardMaterial>;
		ground.material.visible = false;

		let size = new THREE.Box3().setFromObject( ground ).getSize( new THREE.Vector3() );
		let body = new CANNON.Body( { type: CANNON.Body.KINEMATIC } );
		body.addShape( new CANNON.Box( new CANNON.Vec3( size.x / 2, size.y / 2, size.z / 2 ) ) );
		body.position.set( ground.position.x, ground.position.y, ground.position.z );
		body.quaternion.set( ground.quaternion.x, ground.quaternion.y, ground.quaternion.z, ground.quaternion.z );

		this.cannonWorld.addBody( body );

		/*-------------------------------
			Peoples
		-------------------------------*/

		this.peoples = new Peoples( this.renderer, 30, this.commonUniforms, ground.getObjectByName( 'Avoids' ) as THREE.Object3D );
		this.peoples.switchVisibility( this.sectionVisibility, 2 );
		this.peoples.position.y = 0.5;
		ground.add( this.peoples );

	}

	public update( deltaTime: number ): void {

		this.cannonWorld.step( deltaTime );

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

		this.viewing = viewing;
		this.sectionVisibility = viewing == 'viewing';

		if ( viewing == 'ready' ) {

			this.animator.animate( 'sectionViewing' + this.sectionName, 0 );

		} else if ( viewing == 'viewing' ) {

			this.animator.animate( 'sectionViewing' + this.sectionName, 1 );

		} else if ( viewing == 'passed' ) {

			this.animator.animate( 'sectionViewing' + this.sectionName, 2 );

		}

		if ( this.sectionVisibility ) {

			this.visible = true;

		}

		this.animator.animate( 'sectionVisibility' + this.sectionName, this.sectionVisibility ? 1 : 0, 1 );

		if ( this.elm ) {

			this.elm.setAttribute( 'data-visible', viewing == 'viewing' ? 'true' : 'false' );

		}

		if ( this.peoples ) {

			let passed = viewing == 'passed';

			this.peoples.switchVisibility( this.sectionVisibility, passed ? 4 : 1.5 );
			this.peoples.switchJump( passed, passed ? 4 : 1.5 );

		}

	}

}

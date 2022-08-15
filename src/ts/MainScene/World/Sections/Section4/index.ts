import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as CANNON from 'cannon';

import { Section } from '../Section';
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
	private ground?: CANNON.Body;
	private textList: Text[] = [];

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
		this.cannonWorld.gravity = new CANNON.Vec3( 0.0, - 9.8, 0.0 );

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;

		this.add( scene );

		/*-------------------------------
			Light
		-------------------------------*/

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 1, 1 );
		light.intensity = 1.5;
		this.add( light );

		/*-------------------------------
			Shadow
		-------------------------------*/

		new Shadow( scene.getObjectByName( 'Shadow' ) as THREE.Mesh, this.commonUniforms );

		/*-------------------------------
			Peoples
		-------------------------------*/

		this.peoples = new Peoples( this.renderer, 40, this.commonUniforms, scene.getObjectByName( 'Avoids' ) as THREE.Object3D );
		this.peoples.position.y = - 2;
		this.add( this.peoples );

		/*-------------------------------
			Text
		-------------------------------*/

		let textRoot = scene.getObjectByName( 'FallTexts' );

		if ( textRoot ) {

			textRoot.children.forEach( item => {

				let text = new Text( item, this.commonUniforms );
				this.cannonWorld.addBody( text.body );
				this.textList.push( text );

				setTimeout( () => {

					text.small();

				}, 2000 );

			} );

		}

		/*-------------------------------
			Ground
		-------------------------------*/

		let ground = scene.getObjectByName( 'Ground' );

		if ( ground ) {

			let size = new THREE.Box3().setFromObject( ground ).getSize( new THREE.Vector3() );

			let body = new CANNON.Body( { type: CANNON.Body.KINEMATIC } );
			body.addShape( new CANNON.Box( new CANNON.Vec3( size.x / 2, size.y / 2, size.z / 2 ) ) );
			body.position.set( ground.position.x, ground.position.y, ground.position.z );
			this.cannonWorld.addBody( body );

		}

	}

	public update( deltaTime: number ): void {

		this.cannonWorld.step( deltaTime );

		this.textList.forEach( item => {

			item.update();

		} );

		if ( this.peoples ) {

			this.peoples.update( deltaTime );

		}

	}

}

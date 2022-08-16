import * as THREE from 'three';
import * as ORE from 'ore-three';
import * as CANNON from 'cannon';

import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Shadow } from './Shadow';
import { Peoples } from './Peoples';
import { Text } from './Text';
import { Ground } from './Ground';

type PhysicsObj = {
	visual: THREE.Object3D;
	body: CANNON.Body
}

export class Section4 extends Section {

	private renderer: THREE.WebGLRenderer;
	private peoples?: Peoples;

	private cannonWorld: CANNON.World;
	private groundBody?: CANNON.Body;
	private ground?: Ground;
	private textList: Text[] = [];

	private light?: THREE.DirectionalLight;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms, renderer: THREE.WebGLRenderer ) {

		super( manager, 'section_4', parentUniforms );

		this.renderer = renderer;

		this.bakuMaterialType = 'line';

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
			Shadow
		-------------------------------*/

		new Shadow( scene.getObjectByName( 'Shadow' ) as THREE.Mesh, this.commonUniforms );

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

					text.small();

				}, 2000 );

			} );

		}

		/*-------------------------------
			Ground
		-------------------------------*/

		this.ground = new Ground( scene.getObjectByName( 'Ground' ) as THREE.Mesh, this.commonUniforms );

		let size = new THREE.Box3().setFromObject( this.ground ).getSize( new THREE.Vector3() );
		let body = new CANNON.Body( { type: CANNON.Body.KINEMATIC } );
		body.addShape( new CANNON.Box( new CANNON.Vec3( size.x / 2, size.y / 2, size.z / 2 ) ) );
		body.position.set( this.ground.position.x, this.ground.position.y, this.ground.position.z );
		body.quaternion.set( this.ground.quaternion.x, this.ground.quaternion.y, this.ground.quaternion.z, this.ground.quaternion.z );

		this.cannonWorld.addBody( body );

		/*-------------------------------
			Peoples
		-------------------------------*/

		this.peoples = new Peoples( this.renderer, 40, this.commonUniforms, this.ground.getObjectByName( 'Avoids' ) as THREE.Object3D );
		this.peoples.switchVisibility( this.sectionVisibility );
		this.peoples.position.y = 0.5;
		this.ground.add( this.peoples );


		/*-------------------------------
			Light
		-------------------------------*/

		this.light = new THREE.DirectionalLight();
		this.light.position.copy( this.ground.position );
		this.light.position.add( new THREE.Vector3( 4, 10, 5 ) );
		this.light.target = this.ground;

		this.light.castShadow = true;
		let shadowSize = 10.0;
		this.light.shadow.blurSamples = 100;
		this.light.shadow.camera.left = - shadowSize;
		this.light.shadow.camera.right = shadowSize;
		this.light.shadow.camera.top = shadowSize;
		this.light.shadow.camera.bottom = - shadowSize;
		this.light.shadow.camera.far = 35.0;
		this.light.shadow.bias = - 0.002;
		this.light.shadow.mapSize.set( 512, 512 );

		this.light.intensity = 1;
		this.add( this.light );

		let helper = new THREE.DirectionalLightHelper( this.light );
		this.add( helper );

		let cameraHelper = new THREE.CameraHelper( this.light.shadow.camera );
		this.add( cameraHelper );

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

		super.switchViewingState( viewing );

		if ( this.peoples ) {

			this.peoples.switchVisibility( this.sectionVisibility );

		}

	}

}

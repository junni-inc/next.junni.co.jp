import * as THREE from 'three';
import * as ORE from 'ore-three';

import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Objects } from './Objects';
import { Comrades } from './Comrades';
import { Wind } from './Wind';
import { Particle } from './Particle';

export class Section6 extends Section {

	private info: ORE.LayerInfo | null = null;
	private objects?: Objects;
	private comrades?: Comrades;
	private wind?: Wind;
	private particle?: Particle;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_6', parentUniforms );


		this.elm = document.querySelector( '.section6' );

		this.bakuMaterialType = 'normal';
		this.ppParam.bloomBrightness = 1.0;

		// this.ppParam.bloomBrightness = 0.0;

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		/*-------------------------------
			Lights
		-------------------------------*/

		this.light1Data = {
			position: new THREE.Vector3( - 10, 1, 0 ),
			targetPosition: new THREE.Vector3( 0, 0, 0 ),
			intensity: 1,
		};

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;
		this.add( scene );

		/*-------------------------------
			Comrades
		-------------------------------*/

		this.comrades = new Comrades( this.getObjectByName( 'Comrades' ) as THREE.Object3D, this.getObjectByName( "Comrades_Origin_Wrap" ) as THREE.SkinnedMesh, gltf.animations, this.commonUniforms );
		this.comrades.switchVisibility( this.sectionVisibility );

		/*-------------------------------
			Wind
		-------------------------------*/

		this.wind = new Wind( this.commonUniforms );
		this.wind.quaternion.copy( ( this.getObjectByName( 'Baku' ) as THREE.Object3D ).quaternion );
		this.wind.position.copy( ( this.getObjectByName( 'Baku' ) as THREE.Object3D ).position );
		this.wind.rotateY( Math.PI / 2 );
		this.wind.frustumCulled = false;
		this.wind.switchVisibility( this.sectionVisibility );
		this.add( this.wind );

		/*-------------------------------
			Paritcle
		-------------------------------*/

		this.particle = new Particle( this.commonUniforms );
		this.particle.quaternion.copy( ( this.getObjectByName( 'Baku' ) as THREE.Object3D ).quaternion );
		this.particle.position.copy( ( this.getObjectByName( 'Baku' ) as THREE.Object3D ).position );
		this.particle.rotateY( Math.PI / 2 );
		this.particle.switchVisibility( this.sectionVisibility );
		this.add( this.particle );

		if ( this.info ) {

			this.particle.resize( this.info );

		}

	}

	private speed: number = 0.0;

	public wheel( e: WheelEvent ) {

		if ( this.sectionVisibility && e.deltaY > 0 ) {

			if ( this.particle ) this.particle.boost();

		}


	}

	public update( deltaTime: number ): void {

		this.bakuTransform.rotation.multiply( new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0.0, 0.0, 1.0 ), deltaTime * 0.5 ) );

		if ( this.comrades ) this.comrades.update( deltaTime );

		if ( this.particle ) this.particle.update( deltaTime );

	}

	public switchViewingState( viewing: ViewingState ): void {

		super.switchViewingState( viewing );

		if ( this.particle ) {

			if ( this.particle ) this.particle.switchVisibility( this.sectionVisibility );

			if ( this.sectionVisibility ) {

				this.particle.boost();

			} else {

				this.particle.boostCancel();

			}

		}

		if ( this.wind ) this.wind.switchVisibility( this.sectionVisibility );
		if ( this.comrades ) this.comrades.switchVisibility( this.sectionVisibility );

	}

	public resize( info: ORE.LayerInfo ) {

		this.info = info;

		if ( this.particle ) {

			this.particle.resize( info );

		}

	}

}

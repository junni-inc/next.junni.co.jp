import * as THREE from 'three';
import * as ORE from 'ore-three';

import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Objects } from './Objects';
import { TextRing } from './TextRing';
import { Grid } from './Grid';
import { Outro } from './Outro';

export class Section5 extends Section {

	private objects?: Objects;
	private textring: TextRing;
	private grid: Grid;
	private outro: Outro;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_5', parentUniforms );

		// params

		this.elm = document.querySelector( '.section5' ) as HTMLElement;

		this.bakuParam.materialType = 'dark';
		this.bakuParam.rotateSpeed = 0.18;
		this.ppParam.bloomBrightness = 1.0;
		this.ppParam.vignet = 1.0;
		this.cameraRange.set( 0.02, 0.02 );

		/*-------------------------------
			Lights
		-------------------------------*/

		this.light1Data = {
			position: new THREE.Vector3( 10.7, 15.5, 18.7 ),
			targetPosition: new THREE.Vector3(
				- 1.2926819324493408,
				- 12.504984855651855,
				13.764548301696777
			),
			intensity: 0
		};

		this.light2Data = {
			position: new THREE.Vector3( 5.0, - 10.7, 20 ),
			targetPosition: new THREE.Vector3( - 1.7, - 6.7, 12 ),
			intensity: 0.5,
		};

		/*-------------------------------
			TextRing
		-------------------------------*/

		this.textring = new TextRing( this.commonUniforms );
		this.textring.switchVisibility( this.sectionVisibility );

		/*-------------------------------
			Grid
		-------------------------------*/

		this.grid = new Grid( this.commonUniforms );
		this.grid.switchVisibility( this.sectionVisibility );

		/*-------------------------------
			Outro
		-------------------------------*/

		this.outro = new Outro();

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;

		this.add( scene );

		// baku

		let baku = this.getObjectByName( 'Baku' ) as THREE.Object3D;

		// textring

		baku.add( this.textring );

		// grid

		baku.add( this.grid );

	}

	public update( deltaTime: number ): void {

		if ( this.sectionVisibility ) {
			// this.bakuTransform.rotation.multiply( new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0.0, 0.0, 1.0 ), deltaTime * 0.1 ) );
		}

		let baku = this.getObjectByName( 'Baku' ) as THREE.Object3D;

		if ( baku ) {


			baku.rotateZ( - deltaTime * 0.1 );


		}

	}

	private outroTextTimer: number | null = null;

	public switchViewingState( viewing: ViewingState ): void {

		super.switchViewingState( viewing );

		this.textring.switchVisibility( this.sectionVisibility );
		this.grid.switchVisibility( this.sectionVisibility );

		if ( this.outroTextTimer ) {

			window.clearTimeout( this.outroTextTimer );
			this.outroTextTimer = null;

		}

		this.outroTextTimer = window.setTimeout( () => {

			this.outro.switchVisibility( this.sectionVisibility );
			this.outroTextTimer = null;

		}, this.sectionVisibility ? 100 : 0 );

	}

}

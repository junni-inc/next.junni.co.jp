import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section1 } from './Sections/Section1';
import { Section2 } from './Sections/Section2';
import { BakuTransform, Section } from './Sections/Section';
import { Section3 } from './Sections/Section3';
import { Section4 } from './Sections/Section4';
import { Baku } from './Baku';

export class World extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	// manager

	private manager: THREE.LoadingManager;

	// section

	public sections: Section[] = [];
	private section1: Section1;
	private section2: Section2;
	private section3: Section3;
	private section4: Section4;

	// baku

	private baku: Baku;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 2, 1 );
		this.scene.add( light );

		/*-------------------------------
			Manager
		-------------------------------*/

		this.manager = new THREE.LoadingManager(
			() => {

			},
			( url, loaded, total ) => {

				let percentage = loaded / total;

				this.dispatchEvent( {
					type: 'loadProgress',
					percentage
				} );

			}
		);

		/*-------------------------------
			Baku
		-------------------------------*/

		this.baku = new Baku( this.manager, this.commonUniforms );
		this.add( this.baku );

		/*-------------------------------
			Sections
		-------------------------------*/

		this.section1 = new Section1( this.manager, this.commonUniforms );
		this.add( this.section1 );
		this.sections.push( this.section1 );

		this.section2 = new Section2( this.manager, this.commonUniforms );
		this.add( this.section2 );
		this.sections.push( this.section2 );

		this.section3 = new Section3( this.manager, this.commonUniforms );
		this.add( this.section3 );
		this.sections.push( this.section3 );

		this.section4 = new Section4( this.manager, this.commonUniforms );
		this.add( this.section4 );
		this.sections.push( this.section4 );

	}

	public changeSection( sectionNum: number ) {

		let viewingIndex = 0;

		this.sections.forEach( ( item, index ) => {

			if ( index > sectionNum ) {

				item.switchViewingState( 'ready' );

			} else if ( index < sectionNum ) {

				item.switchViewingState( 'passed' );

			} else {

				item.switchViewingState( 'viewing' );

				viewingIndex = index;

			}

		} );

		return this.sections[ viewingIndex ];

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

		this.sections.forEach( item => {

			item.update( deltaTime );

		} );

	}

	public dispose() {
	}

}

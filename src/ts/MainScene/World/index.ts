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

export class World extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	// manager

	private manager: THREE.LoadingManager;

	// intro

	public intro: Intro;

	// section

	public sections: Section[] = [];
	public section1: Section1;
	public section2: Section2;
	public section3: Section3;
	public section4: Section4;
	public section5: Section5;

	// baku

	private baku: Baku;

	constructor( renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Manager
		-------------------------------*/

		this.manager = new THREE.LoadingManager(
			() => {

			},
			( url, loaded, total ) => {

				let percentage = loaded / total;

				this.intro.updateLoadState( percentage );

				this.dispatchEvent( {
					type: 'loadProgress',
					percentage
				} );

			}
		);

		/*-------------------------------
			Intro
		-------------------------------*/

		this.intro = new Intro( renderer, this.commonUniforms );

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
		this.section1.wall.setTex( this.intro.renderTarget.texture );
		this.sections.push( this.section1 );

		this.section2 = new Section2( this.manager, this.commonUniforms );
		this.add( this.section2 );
		this.sections.push( this.section2 );

		this.section3 = new Section3( this.manager, this.commonUniforms );
		this.add( this.section3 );
		this.sections.push( this.section3 );

		this.section4 = new Section4( this.manager, this.commonUniforms, renderer );
		this.add( this.section4 );
		this.sections.push( this.section4 );

		this.section5 = new Section5( this.manager, this.commonUniforms );
		this.add( this.section5 );
		this.sections.push( this.section5 );

		this.baku.onLoaded = () => {

			this.section2.setSceneTex( this.baku.sceneRenderTarget.texture );

		};

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

		let section = this.sections[ viewingIndex ];

		this.baku.changeMaterial( section.bakuMaterialType );
		this.baku.changeAction( section.sectionName );

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

	}

	public resize( info: ORE.LayerInfo ) {

		this.intro.resize( info );

		this.baku.resize( info );

		this.sections.forEach( item => {

			item.resize( info );

		} );

	}

	public dispose() {
	}

}

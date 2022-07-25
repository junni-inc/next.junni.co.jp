import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section1 } from './Sections/Section1';
import { Section2 } from './Sections/Section2';
import { Section } from './Sections/Section';
import { Section3 } from './Sections/Section3';
import { Section4 } from './Sections/Section4';

export class World extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	public sections: Section[] = [];
	private section1: Section1;
	private section2: Section2;
	private section3: Section3;
	private section4: Section4;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 2, 1 );
		this.scene.add( light );

		/*-------------------------------
			Sections
		-------------------------------*/

		this.section1 = new Section1( this.commonUniforms );
		this.add( this.section1 );
		this.sections.push( this.section1 );

		this.section2 = new Section2( this.commonUniforms );
		this.add( this.section2 );
		this.sections.push( this.section2 );

		this.section3 = new Section3( this.commonUniforms );
		this.add( this.section3 );
		this.sections.push( this.section3 );

		this.section4 = new Section4( this.commonUniforms );
		this.add( this.section4 );
		this.sections.push( this.section4 );

		let loaded = 0;

		const onLoadGltf = () => {

			loaded ++;

			this.dispatchEvent( {
				type: 'loadProgress',
				percentage: loaded / this.sections.length
			} );

		};

		this.sections.forEach( item => {

			item.addEventListener( 'loaded', onLoadGltf );

		} );

	}

	public update( deltaTime: number ) {
	}

	public changeSection( sectionNum: number ) {

		this.sections.forEach( ( item, index ) => {

			if ( index > sectionNum ) {

				item.switchViewingState( 'ready' );

			} else if ( index < sectionNum ) {

				item.switchViewingState( 'passed' );

			} else {

				item.switchViewingState( 'viewing' );

			}

		} );

	}

	public dispose() {
	}

}

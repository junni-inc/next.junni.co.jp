import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Slides } from './Slides';
import { Transparents } from './Transparents';

export class Section2 extends Section {

	private slides?: Slides;
	private transparents?: Transparents;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_2', ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uSceneTex: {
				value: null
			},
			winResolution: {
				value: new THREE.Vector2()
			}
		} ) );

		// params

		this.elm = document.querySelector( '.section2' ) as HTMLElement;

		this.ppParam.bloomBrightness = 0;
		this.ppParam.vignet = 1.5;

		this.bakuMaterialType = 'grass';

		/*-------------------------------
			Light
		-------------------------------*/

		this.light1Data = {
			position: new THREE.Vector3( - 1, 2, 1 ),
			targetPosition: new THREE.Vector3( 0, 0, 0 ),
			intensity: 1
		};

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;

		this.add( scene );

		/*-------------------------------
			Slide
		-------------------------------*/

		this.slides = new Slides( scene.getObjectByName( 'Slides' ) as THREE.Object3D, this.commonUniforms );
		this.slides.switchVisibility( this.viewing );

		/*-------------------------------
			Transparent
		-------------------------------*/

		this.transparents = new Transparents( scene.getObjectByName( 'Transparents' ) as THREE.Object3D, this.commonUniforms );

	}

	public setSceneTex( tex: THREE.Texture ) {

		this.commonUniforms.uSceneTex.value = tex;

	}

	public update( deltaTime: number ) {

	}

	public resize( info: ORE.LayerInfo ): void {

		super.resize( info );

		this.commonUniforms.winResolution.value.copy( info.size.canvasPixelSize );

	}

	public switchViewingState( viewing: ViewingState ): void {

		super.switchViewingState( viewing );

		if ( this.slides ) this.slides.switchVisibility( viewing );

	}

}

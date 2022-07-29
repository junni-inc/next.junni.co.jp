import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BG } from './BG';
import { DNA } from './DNA';
import { Slides } from './Slides';
import { Transparents } from './Transparents';

export class Section3 extends Section {

	private dna?: DNA;
	private slides?: Slides;
	private transparents?: Transparents;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_3', ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uSceneTex: {
				value: null
			},
			winResolution: {
				value: new THREE.Vector2()
			}
		} ) );

		this.ppParam.bloomBrightness = 0;
		this.ppParam.vignet = 1.0;

		this.bakuMaterialType = 'grass';

		/*-------------------------------
			Light
		-------------------------------*/

		let light = new THREE.DirectionalLight();
		light.position.set( - 1, 1, 1 );
		this.add( light );

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;

		this.add( scene );

		/*-------------------------------
			BG
		-------------------------------*/

		new BG( scene.getObjectByName( 'BG' ) as THREE.Mesh, this.commonUniforms );

		/*-------------------------------
			DNA
		-------------------------------*/

		this.dna = new DNA( scene.getObjectByName( 'DNA' ) as THREE.Mesh, this.commonUniforms );

		/*-------------------------------
			Slide
		-------------------------------*/

		this.slides = new Slides( scene.getObjectByName( 'Slides' ) as THREE.Object3D, this.commonUniforms );

		/*-------------------------------
			Transparent
		-------------------------------*/

		this.transparents = new Transparents( scene.getObjectByName( 'Transparents' ) as THREE.Object3D, this.commonUniforms );

	}

	public setSceneTex( tex: THREE.Texture ) {

		this.commonUniforms.uSceneTex.value = tex;

	}

	public update( deltaTime: number ) {

		if ( this.dna ) {

			this.dna.rotateY( deltaTime );

		}

	}

	public resize( info: ORE.LayerInfo ): void {

		super.resize( info );

		this.commonUniforms.winResolution.value.copy( info.size.canvasPixelSize );

	}

}

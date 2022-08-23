import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Displays } from './Displays';
import { Lights } from './Lights';
import { NoiseText } from '../../../NoiseText';

export class Section3 extends Section {

	private displays?: Displays;
	private lights?: Lights;
	private directionLightList: THREE.DirectionalLight[] = [];
	private noiseTextEn: NoiseText;
	private noiseTextJa: NoiseText;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_3', ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uEnvMap: {
				value: null
			}
		} ) );

		// params

		this.elm = document.querySelector( '.section3' ) as HTMLElement;

		this.ppParam.bloomBrightness = 1.0;

		/*-------------------------------
			Light
		-------------------------------*/

		this.light2Data = {
			intensity: 1,
			position: new THREE.Vector3( - 3.0, - 11.0, - 3.0 ),
			targetPosition: new THREE.Vector3( 0, - 11.0, 0 ),
		};

		/*-------------------------------
			EnvMap
		-------------------------------*/

		let cubemapLoader = new THREE.CubeTextureLoader();
		cubemapLoader.load( [
			'/assets/envmap/sec2/px.png',
			'/assets/envmap/sec2/nx.png',
			'/assets/envmap/sec2/py.png',
			'/assets/envmap/sec2/ny.png',
			'/assets/envmap/sec2/pz.png',
			'/assets/envmap/sec2/nz.png',
		], ( tex ) => {

			this.commonUniforms.uEnvMap.value = tex;

		} );

		/*-------------------------------
			Message
		-------------------------------*/

		this.noiseTextJa = new NoiseText( this.elm.querySelector( '.section3-message-text.ja' ) as HTMLElement, "革新的な提案を実現するために 私たちは挑戦をやめません。", "Junni is... !&#%$)#'%" );
		this.noiseTextEn = new NoiseText( this.elm.querySelector( '.section3-message-text.en' ) as HTMLElement, "We never stop challenging to realize innovative plans.", "Junni is... !&#%$)#'%" );

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		this.add( gltf.scene );

		/*-------------------------------
			Displays
		-------------------------------*/

		this.displays = new Displays( this.getObjectByName( 'Displays' ) as THREE.Object3D, this.commonUniforms );

		/*-------------------------------
			Lights
		-------------------------------*/

		this.lights = new Lights( this.getObjectByName( 'Lights' ) as THREE.Object3D, this.commonUniforms );

	}

	public update( deltaTime: number ) {

		super.update( deltaTime );

	}

	public resize( info: ORE.LayerInfo ) {

		super.resize( info );

	}

	private textTimer: number | null = null;

	public switchViewingState( viewing: ViewingState ): void {

		if ( this.textTimer ) {

			window.clearTimeout( this.textTimer );
			this.textTimer = null;

		}

		let cViewing = this.viewing;

		super.switchViewingState( viewing );

		this.visible = this.sectionVisibility;

		if ( this.visible ) {

			this.noiseTextEn.clear();
			this.noiseTextJa.clear();

			this.textTimer = window.setTimeout( () => {

				this.noiseTextJa.show( 1, 40 );
				this.noiseTextEn.show( 1, 40 );
				this.textTimer = null;

			}, 1000 );

		} else {

			this.noiseTextJa.hide();
			this.noiseTextEn.hide();

		}


	}

}

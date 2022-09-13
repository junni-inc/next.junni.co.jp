import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Displays } from './Displays';
import { Lights } from './Lights';
import { BackText } from './BackText';
import { CursorLight } from './CursorLight';
import { Wire } from './Wire';

export class Section3 extends Section {

	private displays?: Displays;
	private lights?: Lights;
	private wire?: Wire;
	private directionLightList: THREE.DirectionalLight[] = [];
	private backText?: BackText;
	private cursorLight: CursorLight;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_3', ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uEnvMap: {
				value: null
			}
		} ) );

		// params

		this.elm = document.querySelector( '.section3' ) as HTMLElement;

		this.ppParam.bloomBrightness = 1.5;

		/*-------------------------------
			Light
		-------------------------------*/

		this.light2Data = {
			intensity: 1,
			position: new THREE.Vector3( - 3.0, - 11.0, - 3.0 ),
			targetPosition: new THREE.Vector3( 0, - 11.0, 0 ),
		};

		// cursorLight

		this.cursorLight = new CursorLight();
		this.add( this.cursorLight );

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


	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		this.add( gltf.scene );

		/*-------------------------------
			Displays
		-------------------------------*/

		this.displays = new Displays( this.getObjectByName( 'Displays' ) as THREE.Object3D, this.commonUniforms );
		this.displays.switchVisibility( this.sectionVisibility );

		/*-------------------------------
			Lights
		-------------------------------*/

		this.lights = new Lights( this.getObjectByName( 'Lights' ) as THREE.Object3D, this.commonUniforms );
		this.lights.switchVisibility( this.sectionVisibility );

		/*-------------------------------
			Wire
		-------------------------------*/

		this.wire = new Wire( this.getObjectByName( 'Wire' )as THREE.Mesh, this.commonUniforms );
		this.wire.switchVisibility( this.sectionVisibility );

		/*-------------------------------
			BackText
		-------------------------------*/

		this.backText = new BackText( this.getObjectByName( 'BackText' ) as THREE.Mesh, this.commonUniforms );
		this.backText.switchVisibility( this.sectionVisibility );

	}

	public update( deltaTime: number ) {

		super.update( deltaTime );

		this.cursorLight.update( deltaTime );
		this.cursorLight.intensity = this.animator.get( 'sectionVisibility' + this.sectionName ) || 0;

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

		super.switchViewingState( viewing );

		if ( this.backText ) this.backText.switchVisibility( this.sectionVisibility );

		window.cameraController.switchCameraMove( this.sectionVisibility );

		if ( this.lights ) {

			this.lights.switchVisibility( this.sectionVisibility );

		}

		if ( this.wire ) {

			this.wire.switchVisibility( this.sectionVisibility );

		}

		if ( this.displays ) {

			this.displays.switchVisibility( this.sectionVisibility );

		}

	}

	public hover( args: ORE.TouchEventArgs ) {

		this.cursorLight.hover( args );

	}


}

import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Displays } from './Displays';
import { Lights } from './Lights';
import { BackText } from './BackText';
import { CursorLight } from './CursorLight';
import { Wire } from './Wire';
import { Sec3Particle } from './Sec3Particle';

export class Section3 extends Section {

	private displays?: Displays;
	private lights?: Lights;
	private wire?: Wire;
	private directionLightList: THREE.DirectionalLight[] = [];
	private backText?: BackText;
	private cursorLight: CursorLight;
	private renderer: THREE.WebGLRenderer;
	private particle?: Sec3Particle;

	private info?: ORE.LayerInfo;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms, renderer: THREE.WebGLRenderer ) {

		super( manager, 'section_3', ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uEnvMap: {
				value: null
			}
		} ) );

		// params

		this.renderer = renderer;
		this.elm = document.querySelector( '.section3' ) as HTMLElement;
		this.ppParam.bloomBrightness = 1.5;
		this.bakuParam.rotateSpeed = 0.0;
		this.cameraSPFovWeight = 18;

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

		/*-------------------------------
			Particle
		-------------------------------*/

		let baku = this.getObjectByName( 'Baku' )!;

		this.particle = new Sec3Particle( this.commonUniforms );
		this.particle.switchVisibility( this.sectionVisibility );
		this.particle.position.copy( baku.position );
		this.particle.position.y += 2.8;

		this.add( this.particle );

		if ( this.info ) {

			this.resize( this.info );

		}

	}

	public update( deltaTime: number ) {

		super.update( deltaTime );

		this.cursorLight.update( deltaTime );
		this.cursorLight.intensity = this.animator.get( 'sectionVisibility' + this.sectionName ) || 0;

	}

	public resize( info: ORE.LayerInfo ) {

		super.resize( info );

		this.info = info;

	}

	public switchViewingState( viewing: ViewingState ): void {

		super.switchViewingState( viewing );

		if ( this.backText ) this.backText.switchVisibility( this.sectionVisibility );

		window.cameraController.switchCameraMove( this.sectionVisibility );

		if ( this.lights ) this.lights.switchVisibility( this.sectionVisibility );

		if ( this.wire ) this.wire.switchVisibility( this.sectionVisibility );

		if ( this.displays ) this.displays.switchVisibility( this.sectionVisibility );

		if ( this.particle ) this.particle.switchVisibility( this.sectionVisibility );

	}

	public hover( args: ORE.TouchEventArgs ) {

		this.cursorLight.hover( args );

	}


}

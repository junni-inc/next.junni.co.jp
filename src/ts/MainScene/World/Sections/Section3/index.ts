import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Displays } from './Displays';
import { Lights } from './Lights';
import { BackText } from './BackText';
import { CursorLight } from './CursorLight';
import { Wire } from './Wire';
import { DrawTrail } from './DrawTrail';

export class Section3 extends Section {

	private displays?: Displays;
	private lights?: Lights;
	private wire?: Wire;
	private directionLightList: THREE.DirectionalLight[] = [];
	private backText?: BackText;
	private cursorLight: CursorLight;
	private drawTrail?: DrawTrail;
	private renderer: THREE.WebGLRenderer;

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
			DrawTrail
		-------------------------------*/

		let baku = this.getObjectByName( 'Baku' ) as THREE.Object3D;

		this.drawTrail = new DrawTrail( this.renderer, this.commonUniforms );
		this.drawTrail.position.copy( baku.position );
		this.drawTrail.frustumCulled = false;
		this.add( this.drawTrail );

	}

	public update( deltaTime: number ) {

		super.update( deltaTime );

		this.cursorLight.update( deltaTime );
		this.cursorLight.intensity = this.animator.get( 'sectionVisibility' + this.sectionName ) || 0;

		if ( this.drawTrail ) this.drawTrail.update( deltaTime );

	}

	public resize( info: ORE.LayerInfo ) {

		super.resize( info );

	}

	public switchViewingState( viewing: ViewingState ): void {

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

	public hover( args: ORE.TouchEventArgs, worldPos: THREE.Vector3 ) {

		this.cursorLight.hover( args );

		if ( this.drawTrail ) this.drawTrail.updateCursorPos( worldPos );

	}


}

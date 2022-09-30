import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Slides } from './Slides';
import { Transparents } from './Transparents';
import { Flexible } from './Flexible';
import { Section2Title } from './Section2Title';

export class Section2 extends Section {

	private slides?: Slides;
	private transparents?: Transparents;
	private flexible?: Flexible;
	private title?: Section2Title;
	private info?: ORE.LayerInfo;
	private layoutControllerList: ORE.LayoutController[] = [];

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
		this.bakuParam.rotateSpeed = - 0.05;

		this.bakuParam.materialType = 'glass';

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
			Titles
		-------------------------------*/

		this.title = new Section2Title( scene.getObjectByName( 'Title' ) as THREE.Mesh, this.commonUniforms );
		this.title.switchVisibility( this.sectionVisibility );

		/*-------------------------------
			Transparent
		-------------------------------*/

		this.transparents = new Transparents( scene.getObjectByName( 'Transparents' ) as THREE.Object3D, this.commonUniforms );
		this.transparents.switchVisibility( this.sectionVisibility );

		/*-------------------------------
			Flexible
		-------------------------------*/

		this.flexible = new Flexible( scene.getObjectByName( 'Flexible' ) as THREE.Mesh, this.commonUniforms );
		this.flexible.switchVisibility( this.sectionVisibility );

		this.layoutControllerList.push( new ORE.LayoutController( this.flexible.mesh, {
			scale: 0.45,
			rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, 0.0 ) )
		} ) );

		if ( this.info ) {

			this.resize( this.info );

		}

	}

	public setSceneTex( tex: THREE.Texture ) {

		this.commonUniforms.uSceneTex.value = tex;

	}

	public update( deltaTime: number ) {

		if ( this.title ) this.title.update( deltaTime );
		if ( this.transparents ) this.transparents.update( deltaTime );

	}

	public hover( args: ORE.TouchEventArgs, camera: THREE.PerspectiveCamera ) {

		if ( this.transparents ) this.transparents.hover( args, camera );

	}

	public resize( info: ORE.LayerInfo ): void {

		super.resize( info );

		this.info = info;

		this.commonUniforms.winResolution.value.copy( info.size.canvasPixelSize );

		if ( this.transparents ) {

			this.transparents.resize( info );

		}

		this.layoutControllerList.forEach( item => {

			item.updateTransform( info.size.portraitWeight );

		} );

		if ( this.flexible ) this.flexible.resize( this.info );

	}

	public switchViewingState( viewing: ViewingState ): void {

		super.switchViewingState( viewing );

		if ( this.slides ) this.slides.switchVisibility( viewing );
		if ( this.title ) this.title.switchVisibility( this.sectionVisibility );
		if ( this.transparents ) this.transparents.switchVisibility( this.sectionVisibility );
		if ( this.flexible ) this.flexible.switchVisibility( this.sectionVisibility );

	}

}

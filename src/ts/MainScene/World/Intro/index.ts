import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Logo } from './Logo';
import { IntroText } from './Text';
import { CameraController } from './CameraController';

export class Intro {

	private commonUniforms: ORE.Uniforms;

	private animator: ORE.Animator;

	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private cameraController: CameraController;

	public renderTarget: THREE.WebGLRenderTarget;

	private logo: Logo;
	private text: IntroText;

	public paused: boolean = false;

	constructor( renderer: THREE.WebGLRenderer, parentUniforms: ORE.Uniforms ) {

		this.renderer = renderer;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( "#000" );

		this.camera = new THREE.PerspectiveCamera( 45, 16 / 9, 0.01, 1000, );
		this.camera.position.set( 0, 0, 5 );
		this.scene.add( this.camera );

		this.renderTarget = new THREE.WebGLRenderTarget( 1920, 1080 );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.animator = window.gManager.animator;

		this.commonUniforms.loaded = this.animator.add( {
			name: 'loaded',
			initValue: 0,
			userData: {
				pane: {
					min: 0,
					max: 1
				}
			}
		} );

		/*-------------------------------
			Logo
		-------------------------------*/

		this.logo = new Logo( this.commonUniforms );
		this.scene.add( this.logo );

		/*-------------------------------
			IntroText
		-------------------------------*/

		this.text = new IntroText( this.commonUniforms );
		this.text.position.set( 0, - 0.5, 0 );
		this.scene.add( this.text );

		/*-------------------------------
			Scene
		-------------------------------*/

		let light = new THREE.DirectionalLight();
		light.position.set( - 1, 1, 0.0 );
		light.intensity = 0.3;
		this.scene.add( light );

		let sphere = new THREE.Mesh( new THREE.SphereBufferGeometry( 1, 10, 30 ), new THREE.MeshStandardMaterial() );
		sphere.position.set( 4, - 2, - 5 );
		sphere.scale.setScalar( 4 );
		this.scene.add( sphere );

		/*-------------------------------
			CameraController
		-------------------------------*/

		this.cameraController = new CameraController( this.camera );

	}

	public hover( args: ORE.TouchEventArgs ) {

		this.cameraController.updateCursor( args.screenPosition );

	}

	public update( deltaTime: number ) {

		if ( this.paused ) return;

		this.logo.update( deltaTime );

		this.cameraController.update( deltaTime );

		let rt = this.renderer.getRenderTarget();
		this.renderer.setRenderTarget( this.renderTarget );
		this.renderer.render( this.scene, this.camera );
		this.renderer.setRenderTarget( rt );

	}

	public updateLoadState( percentage: number ) {

		this.animator.animate( 'loaded', percentage, 0.5, () => {

			if ( percentage == 1.0 ) {

				setTimeout( () => {

					this.logo.move();

				}, 500 );

				setTimeout( () => {

					this.text.switchVisible( true );

				}, 1400 );

			}

		} );

	}

	public resize( info: ORE.LayerInfo ) {

	}

}

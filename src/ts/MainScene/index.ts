import * as THREE from 'three';
import * as ORE from 'ore-three';

import { GlobalManager } from './GlobalManager';
import { RenderPipeline } from './RenderPipeline';
import { CameraController } from './CameraController';
import { World } from './World';
import { Scroller } from './Scroller';

export class MainScene extends ORE.BaseLayer {

	private gManager?: GlobalManager;
	private renderPipeline?: RenderPipeline;
	private cameraController?: CameraController;
	private scroller: Scroller;

	private world?: World;

	constructor() {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			uTimeMod: {
				value: 0
			}
		} );

		/*-------------------------------
			Scroller
		-------------------------------*/

		this.scroller = new Scroller();

		this.scroller.addListener( 'changeSelectingSection', ( sectionIndex: number ) => {

			if ( this.world ) {

				let section = this.world.changeSection( sectionIndex );

				if ( this.cameraController ) {

					this.cameraController.changeRange( section.cameraRange );

				}

				if ( this.renderPipeline ) {

					this.renderPipeline.updateParam( section.ppParam );

				}

				this.world.bg.changeSection( sectionIndex );

				document.body.setAttribute( 'data-section', ( sectionIndex + 1 ).toString() );

				window.gManager.emitEvent( 'sectionChange', [ section.sectionName ] );

			}

		} );

	}

	onBind( info: ORE.LayerInfo ) {

		super.onBind( info );

		this.gManager = new GlobalManager();

		this.gManager.assetManager.load( { assets: [
			{ name: 'commonScene', path: './assets/scene/common.glb', type: "gltf", timing: 'must' },
			{ name: 'logo', path: './assets/textures/junni_logo.png', type: 'tex', timing: 'must' },
			{ name: 'introText', path: './assets/textures/intro-text.png', type: 'tex', timing: 'must' },
			{ name: 'topLogo', path: './assets/textures/top_logo.png', type: 'tex', timing: 'must' },
			{ name: 'matCap', path: './assets/textures/matcap.png', type: 'tex', timing: 'must' },
			{ name: 'noise', path: './assets/textures/noise.png', type: 'tex', timing: 'sub', onLoad( value: THREE.Texture ) {

				value.wrapS = THREE.RepeatWrapping;
				value.wrapT = THREE.RepeatWrapping;

			}, },
			{ name: 'people', path: './assets/textures/people1.png', type: 'tex', timing: 'sub' }
		] } );

		this.gManager.assetManager.addEventListener( 'loadMustAssets', ( e ) => {

			let gltf = window.gManager.assetManager.getGltf( 'commonScene' );

			if ( gltf ) {

				this.scene.add( gltf.scene );

			}

			this.initScene();
			this.onResize();

		} );

	}

	private initScene() {

		/*-------------------------------
			RenderPipeline
		-------------------------------*/

		if ( this.renderer ) {

			this.renderer.shadowMap.enabled = true;

			this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );

		}

		/*-------------------------------
			CameraController
		-------------------------------*/

		this.cameraController = new CameraController( this.camera );

		/*-------------------------------
			World
		-------------------------------*/

		if ( this.renderer ) {

			this.world = new World( this.renderer, this.scene, this.commonUniforms );
			this.world.changeSection( 0 );
			this.scene.add( this.world );

			this.scroller.changeSectionNum( this.world.sections.length );

		}

		/*-------------------------------
			HashChange
		-------------------------------*/

		const onSectionChange = ( secName: string ) => {

			window.removeEventListener( 'hashchange', onChangeHash );

			if ( secName ) {

				window.location.hash = secName;

			}

			setTimeout( () => {

				window.addEventListener( 'hashchange', onChangeHash );

			}, 50 );

		};

		const onChangeHash = ( e?: Event ) => {

			let hash = window.location.hash;

			if ( ! this.world ) return;

			for ( let i = 0; i < this.world.sections.length; i ++ ) {

				let sec = this.world.sections[ i ];

				if ( sec && "#" + sec.sectionName == hash ) {

					window.gManager.removeListener( 'sectionChange', onSectionChange );

					this.scroller.move( i, 0.1, () => {

						window.gManager.addListener( 'sectionChange', onSectionChange );

					} );

					break;

				}

			}

		};

		window.gManager.addListener( 'sectionChange', onSectionChange );
		window.addEventListener( 'hashchange', onChangeHash );

		onChangeHash();

	}

	public animate( deltaTime: number ) {

		deltaTime = Math.min( 0.1, deltaTime );

		this.commonUniforms.uTimeMod.value = this.time % 1;

		this.scroller.update( deltaTime );

		if ( this.gManager ) {

			this.gManager.update( deltaTime );

		}

		if ( this.cameraController ) {

			this.cameraController.update( deltaTime );

		}

		if ( this.world ) {

			this.world.update( deltaTime );

			let transform = this.world.updateTransform( this.scroller.value );

			if ( this.cameraController ) {

				this.cameraController.updateTransform( transform.cameraTransform );

			}

		}

		if ( this.renderPipeline ) {

			this.renderPipeline.render( this.scene, this.camera );

		}

	}

	public onResize() {

		super.onResize();

		if ( this.cameraController ) {

			this.cameraController.resize( this.info );

		}

		if ( this.renderPipeline ) {

			this.renderPipeline.resize( this.info );

		}

		if ( this.world ) {

			this.world.resize( this.info );

		}

	}

	public onHover( args: ORE.TouchEventArgs ) {

		if ( args.position.x != args.position.x ) return;

		if ( this.cameraController ) {

			this.cameraController.updateCursor( args.screenPosition );

		}

		if ( this.world ) {

			this.world.intro.hover( args );
			this.world.section1.hover( args, this.camera );

		}

	}

	public onWheel( event: WheelEvent, trackpadDelta: number ): void {

		this.scroller.addVelocity( event.deltaY * 0.00005 );

		if ( this.world ) {

			this.world.intro.paused = true;
			this.world.section1.splash();

		}

	}

	public onTouchStart( args: ORE.TouchEventArgs ) {

		this.scroller.catch();

	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

		this.scroller.drag( args.delta.y );

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {


		this.scroller.release( args.delta.y );

	}

}

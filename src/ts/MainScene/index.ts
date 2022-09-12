import * as THREE from 'three';
import * as ORE from 'ore-three';

import { GlobalManager } from './GlobalManager';
import { RenderPipeline } from './RenderPipeline';
import { CameraController } from './CameraController';
import { World } from './World';
import { Scroller } from './Scroller';
import { Subtitles } from './Subtitle';

export class MainScene extends ORE.BaseLayer {


	private gManager?: GlobalManager;
	private renderPipeline?: RenderPipeline;
	private cameraController?: CameraController;
	private scroller: Scroller;

	private subtitles: Subtitles;
	private world?: World;

	private canScroll: boolean = false;

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

				this.subtitles.changeSection( sectionIndex );

				if ( this.cameraController ) this.cameraController.changeRange( section.cameraRange );

				if ( this.renderPipeline ) this.renderPipeline.updateParam( section.ppParam );

				this.world.bg.changeSection( sectionIndex );

				document.body.setAttribute( 'data-section', ( sectionIndex + 1 ).toString() );

				window.gManager.emitEvent( 'sectionChange', [ section.sectionName ] );

			}

		} );

		/*-------------------------------
			Subtitles
		-------------------------------*/

		this.subtitles = new Subtitles();
		window.subtitles = this.subtitles;

	}

	onBind( info: ORE.LayerInfo ) {

		super.onBind( info );

		this.gManager = new GlobalManager();

		this.gManager.assetManager.load( { assets: [
			{ name: 'commonScene', path: './assets/scene/common.glb', type: "gltf", timing: 'must' },
			{ name: 'logo', path: './assets/textures/junni_logo.png', type: 'tex', timing: 'must' },
			{ name: 'sec2BGText', path: './assets/textures/sec2-bg-text.png', type: 'tex', timing: 'must', onLoad( value: THREE.Texture ) {

				value.wrapS = THREE.RepeatWrapping;
				value.wrapT = THREE.RepeatWrapping;

			} },
			{ name: 'introText', path: './assets/textures/intro-text.png', type: 'tex', timing: 'must' },
			{ name: 'topLogo', path: './assets/textures/top_logo.png', type: 'tex', timing: 'must' },
			{ name: 'matCap', path: './assets/textures/matcap.png', type: 'tex', timing: 'must' },
			{ name: 'matCapOrange', path: './assets/textures/matcap_orange.png', type: 'tex', timing: 'must' },
			{ name: 'noise', path: './assets/textures/noise.png', type: 'tex', timing: 'sub', onLoad( value: THREE.Texture ) {

				value.wrapS = THREE.RepeatWrapping;
				value.wrapT = THREE.RepeatWrapping;

			}, },
			{ name: 'display', path: './assets/textures/display.png', type: 'tex', timing: 'sub' },
			{ name: 'human', path: './assets/textures/humans/human.png', type: 'tex', timing: 'sub' },
			{ name: 'outro', path: './assets/textures/outro-text.png', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;

			} },
			{ name: 'lensDirt', path: './assets/textures/lens-dirt.png', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;

			} },
			{ name: 'groundIllust', path: './assets/textures/illust.jpg', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;

			} },
			{ name: 'groundGrid', path: './assets/textures/grid.jpg', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;

			} },
			{ name: 'random', path: './assets/textures/random.png', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.minFilter = THREE.NearestFilter;
				tex.magFilter = THREE.NearestFilter;

			} },
			{ name: 'filmNoise', path: './assets/textures/film-noise.jpg', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;

			} },
		] } );

		this.gManager.assetManager.addEventListener( 'loadMustAssets', ( e ) => {

			let gltf = window.gManager.assetManager.getGltf( 'commonScene' );

			if ( gltf ) {

				this.scene.add( gltf.scene );

			}

			this.initScene();
			this.onResize();

		} );

		/*-------------------------------
			CameraController
		-------------------------------*/

		this.cameraController = new CameraController( this.camera );
		window.cameraController = this.cameraController;

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
			World
		-------------------------------*/

		if ( this.renderer ) {

			this.world = new World( this.renderer, this.scene, this.commonUniforms );
			this.world.changeSection( 0 );
			this.scene.add( this.world );

			this.scroller.changeSectionNum( this.world.sections.length );

			this.world.intro.addListener( 'finishIntro', () => {

				this.splash();

			} );

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

					if ( i > 0 && ! this.canScroll ) {

						this.world.cancelIntro();
						this.canScroll = true;

					}

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

			let transform = this.world.updateTransform( this.scroller.value );

			this.world.update( deltaTime );

			if ( this.cameraController ) {

				this.cameraController.updateTransform( transform.cameraTransform );

			}


		}

		if ( this.renderPipeline ) {

			if ( this.world && ! this.world.intro.paused ) {

				this.renderPipeline.render( this.world.intro.scene, this.world.intro.camera );
				return;

			}

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

		if ( this.gManager ) {

			this.gManager.eRay.update( args.screenPosition, this.camera );

		}

		if ( this.cameraController ) {

			this.cameraController.updateCursor( args.screenPosition );

		}

		if ( this.world ) {

			this.world.intro.hover( args );
			this.world.section1.hover( args, this.camera );
			this.world.section3.hover( args );

		}


	}

	public onWheel( event: WheelEvent ): void {

		if ( this.world ) {

			if ( this.canScroll ) {

				this.scroller.addVelocity( event.deltaY * 0.00005 );
				this.world.section6.wheel( event );

			} else {

				this.splash();

			}

		}

	}

	public onTouchStart( args: ORE.TouchEventArgs ) {

		this.scroller.catch();

	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

		if ( this.canScroll ) {

			this.scroller.drag( args.delta.y );

		} else {

			this.splash();

		}


	}

	private splash() {

		if ( this.world ) {

			this.world.splash( this.camera );

			setTimeout( () => {

				this.canScroll = true;

			}, 1000 );

		}

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {

		this.scroller.release( args.delta.y );

	}

}

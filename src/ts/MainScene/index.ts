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

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {} );

		/*-------------------------------
			Scroller
		-------------------------------*/

		this.scroller = new Scroller();

		this.scroller.addListener( 'changeSelectingSection', ( sectionNum: number ) => {

			if ( this.world ) {

				let section = this.world.changeSection( sectionNum );

				window.gManager.emitEvent( 'sectionChange', [ section.sectionName ] );

			}

		} );

	}

	onBind( info: ORE.LayerInfo ) {

		super.onBind( info );

		this.gManager = new GlobalManager();

		this.gManager.assetManager.load( { assets: [
			{ name: 'noise', path: './assets/noise.png', type: 'tex', timing: 'sub', onLoad( value: THREE.Texture ) {

				value.wrapS = THREE.RepeatWrapping;
				value.wrapT = THREE.RepeatWrapping;

			}, }
		] } );

		this.gManager.assetManager.addEventListener( 'loadMustAssets', ( e ) => {

			this.initScene();
			this.onResize();

		} );

	}

	private initScene() {

		/*-------------------------------
			RenderPipeline
		-------------------------------*/

		if ( this.renderer ) {

			this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );

		}

		/*-------------------------------
			CameraController
		-------------------------------*/

		this.cameraController = new CameraController( this.camera );

		/*-------------------------------
			World
		-------------------------------*/

		this.world = new World( this.scene, this.commonUniforms );
		this.world.changeSection( 0 );
		this.scene.add( this.world );

		this.scroller.changeSectionNum( this.world.sections.length );

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

	}

	public onHover( args: ORE.TouchEventArgs ) {

		if ( this.cameraController ) {

			this.cameraController.updateCursor( args.screenPosition );

		}

	}

	public onWheel( event: WheelEvent, trackpadDelta: number ): void {

		this.scroller.addVelocity( event.deltaY * 0.00005 );

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

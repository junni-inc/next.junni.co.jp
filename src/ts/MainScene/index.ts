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

				this.world.changeSection( sectionNum );

			}

		} );

	}

	onBind( info: ORE.LayerInfo ) {

		super.onBind( info );

		this.gManager = new GlobalManager();

		this.gManager.assetManager.load( { assets: [
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
		this.scene.add( this.world );

		this.world.addEventListener( 'loadProgress', ( e ) => {
		} );

		this.world.changeSection( 0 );

		this.scroller.changeSectionNum( this.world.sections.length );

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

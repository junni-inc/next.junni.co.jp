import * as ORE from 'ore-three';
import EventEmitter from 'wolfy87-eventemitter';

import { AssetManager } from './AssetManager';
import { EasyRaycaster } from './EasyRaycaster';
import { Pane } from 'tweakpane';

export class GlobalManager extends EventEmitter {

	public eRay: EasyRaycaster;
	public assetManager: AssetManager;
	public animator: ORE.Animator;

	private pane: Pane;

	constructor( ) {

		super();

		window.gManager = this;

		this.eRay = new EasyRaycaster();

		this.assetManager = new AssetManager();

		/*-------------------------------
			Animator
		-------------------------------*/


		this.animator = new ORE.Animator();

		// pane

		this.pane = new Pane();

		this.animator.addEventListener( 'added', ( e ) => {

			let opt = e.variable.userData && e.variable.userData.pane;

			this.pane.addInput( this.animator.dataBase, e.varName, opt );

		} );

	}

	public update( deltaTime: number ) {

		this.animator.update( deltaTime );

		this.pane.refresh();

	}

}


import * as ORE from 'ore-three';
import EventEmitter from 'wolfy87-eventemitter';

import { AssetManager } from './AssetManager';
import { EasyRaycaster } from './EasyRaycaster';

export class GlobalManager extends EventEmitter {

	public eRay: EasyRaycaster;
	public assetManager: AssetManager;
	public animator: ORE.Animator;

	constructor( ) {

		super();

		window.gManager = this;

		this.animator = new ORE.Animator();
		this.assetManager = new AssetManager();
		this.eRay = new EasyRaycaster();

	}

	public update( deltaTime: number ) {

		this.animator.update( deltaTime );

	}

}


import * as THREE from 'three';
import * as ORE from 'ore-three';

import { AssetManager, AssetManagerParams } from './AssetManager';
import { EasyRaycaster } from './EasyRaycaster';
import { Uniform } from 'three';

export class GlobalManager {

	public eRay: EasyRaycaster
	public assetManager: AssetManager;
	public animator: ORE.Animator;

	constructor( ) {

		window.gManager = this;

		this.animator = new ORE.Animator();
		this.assetManager = new AssetManager();
		this.eRay = new EasyRaycaster();

	}

	public update( deltaTime: number ) {

		this.animator.update( deltaTime );

	}

}


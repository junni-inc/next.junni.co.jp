import * as THREE from 'three';
import * as ORE from 'ore-three';

import { Section } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BG } from './BG';
import { Shadow } from './Shadow';
import { Peoples } from './Peoples';

export class Section4 extends Section {

	private renderer: THREE.WebGLRenderer;
	private peoples?: Peoples;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms, renderer: THREE.WebGLRenderer ) {

		super( manager, 'section_4', parentUniforms );

		this.renderer = renderer;

		this.bakuMaterialType = 'line';

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;

		this.add( scene );

		/*-------------------------------
			BG
		-------------------------------*/

		new BG( scene.getObjectByName( 'BG' ) as THREE.Mesh, this.commonUniforms );

		/*-------------------------------
			Shadow
		-------------------------------*/

		new Shadow( scene.getObjectByName( 'Shadow' ) as THREE.Mesh, this.commonUniforms );

		/*-------------------------------
			Peoples
		-------------------------------*/

		this.peoples = new Peoples( this.renderer, 40, this.commonUniforms, scene.getObjectByName( 'Avoids' ) as THREE.Object3D );
		this.add( this.peoples );

	}

	public update( deltaTime: number ): void {

		if ( this.peoples ) {

			this.peoples.update( deltaTime );

		}

	}

}

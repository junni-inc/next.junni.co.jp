import * as THREE from 'three';
import * as ORE from 'ore-three';

import { Section } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BG } from './BG';

export class Section5 extends Section {

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_5', parentUniforms );

		this.bakuMaterialType = 'normal';

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;

		this.add( scene );

		/*-------------------------------
			light
		-------------------------------*/

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 1, 1 );
		this.add( light );

		/*-------------------------------
			BG
		-------------------------------*/

		new BG( scene.getObjectByName( 'BG' ) as THREE.Mesh, this.commonUniforms );

	}

	public update( deltaTime: number ): void {


	}

}

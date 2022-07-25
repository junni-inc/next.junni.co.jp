import * as THREE from 'three';
import * as ORE from 'ore-three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Section } from '../Section';
import { BG } from './BG';

export class Section1 extends Section {

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_1', parentUniforms );

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;

		this.add( scene );

		/*-------------------------------
			BG
		-------------------------------*/

		new BG( scene.getObjectByName( 'BG' ) as THREE.Mesh, this.commonUniforms );

	}

}

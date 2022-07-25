import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export class Section2 extends Section {

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_2', parentUniforms );

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		this.add( gltf.scene );

	}

	public update( deltaTime: number ) {

		super.update( deltaTime );

		if ( this.viewing == 'viewing' ) {

			// this.bakuTransform.rotation.premultiply( new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.01, 0.0 ) ) );

		}

	}

}

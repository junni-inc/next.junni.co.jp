import * as ORE from 'ore-three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Section } from '../Section';

export class Section1 extends Section {

	constructor( parentUniforms: ORE.Uniforms ) {

		super( 'section_1', parentUniforms );

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		this.add( gltf.scene );

	}

}

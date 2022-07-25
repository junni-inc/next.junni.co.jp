import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export class Section4 extends Section {

	constructor( parentUniforms: ORE.Uniforms ) {

		super( 'section_4', parentUniforms );

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		this.add( gltf.scene );

	}

}

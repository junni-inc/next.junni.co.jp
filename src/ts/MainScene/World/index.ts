import * as THREE from 'three';
import * as ORE from 'ore-three';

export class World extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 2, 1 );
		this.scene.add( light );

	}

	public update( deltaTime: number ) {
	}

	public dispose() {
	}

}

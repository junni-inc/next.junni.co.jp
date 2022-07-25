import * as THREE from 'three';
import * as ORE from 'ore-three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PowerMesh } from 'power-mesh';

export class Baku extends THREE.Object3D {

	private manager: THREE.LoadingManager;
	private commonUniforms: ORE.Uniforms;

	private mesh?: PowerMesh;

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super();

		this.manager = manager;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Load
		-------------------------------*/

		let loader = new GLTFLoader( this.manager );

		loader.load( './assets/scene/baku.glb', ( gltf ) => {

			let bakuWrap = gltf.scene.getObjectByName( "baku_amature" ) as THREE.Object3D;

			this.add( bakuWrap );

			this.mesh = new PowerMesh( bakuWrap.getObjectByName( 'Baku' ) as THREE.Mesh, undefined, true );


		} );

	}

}

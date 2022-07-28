import * as THREE from 'three';
import * as ORE from 'ore-three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CameraTransform } from '../../../CameraController';


export type BakuTransform = {
	position: THREE.Vector3;
	rotation: THREE.Quaternion;
	scale: THREE.Vector3;
}

export type ViewingState = 'ready' | 'viewing' | 'passed'

export class Section extends THREE.Object3D {

	public sectionName: string;

	protected commonUniforms: ORE.Uniforms;

	protected animator: ORE.Animator;

	// manager

	protected manager: THREE.LoadingManager;

	// transforms

	public cameraTransform: CameraTransform = {
		position: new THREE.Vector3(),
		targetPosition: new THREE.Vector3()
	};

	public bakuTransform: BakuTransform = {
		position: new THREE.Vector3(),
		rotation: new THREE.Quaternion(),
		scale: new THREE.Vector3( 1, 1, 1 )
	};

	// state

	protected viewing: ViewingState = 'ready';

	constructor( manager: THREE.LoadingManager, sectionName: string, parentUniforms: ORE.Uniforms ) {

		super();

		this.sectionName = sectionName;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.visibility = this.animator.add( {
			name: 'sectionVisibility' + this.sectionName,
			initValue: 0,
		} );

		/*-------------------------------
			Load
		-------------------------------*/

		this.manager = manager;

		this.loadGLTF( this.sectionName );

	}

	private loadGLTF( gltfName: string ) {

		let loader = new GLTFLoader( this.manager );

		loader.load( './assets/scene/' + gltfName + '.glb', ( gltf ) => {

			this.onLoadedGLTF( gltf );

			// camera transform

			let camera = gltf.scene.getObjectByName( 'Camera' );

			if ( camera ) {

				this.cameraTransform.position.copy( camera.position );

			}

			let target = gltf.scene.getObjectByName( 'CameraTarget' );

			if ( target ) {

				this.cameraTransform.targetPosition.copy( target.position );

			}

			// baku transform

			let baku = gltf.scene.getObjectByName( 'Baku' ) as THREE.Object3D;

			if ( baku ) {

				this.bakuTransform.position.copy( baku.position );
				this.bakuTransform.rotation.copy( baku.quaternion );
				this.bakuTransform.scale.copy( baku.scale );

			}

			// emitevent

			this.dispatchEvent( { type: 'loaded' } );

		} );

	}

	protected onLoadedGLTF( gltf: GLTF ) {
	}

	public switchViewingState( viewing: ViewingState ) {

		this.viewing = viewing;

		if ( viewing == 'ready' ) {

			this.animator.animate( 'sectionVisibility' + this.sectionName, 0 );

			this.visible = false;

		} else if ( viewing == 'viewing' ) {

			this.animator.animate( 'sectionVisibility' + this.sectionName, 1 );

			this.visible = true;

		} else if ( viewing == 'passed' ) {

			this.animator.animate( 'sectionVisibility' + this.sectionName, 2 );

			this.visible = false;

		}

	}

	public update( deltaTime: number ) {


	}

}

import * as THREE from 'three';
import * as ORE from 'ore-three';

import transparentVert from './shaders/transparent.vs';
import transparentFrag from './shaders/transparent.fs';

export class Transparent {

	// position

	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;

	private velocity: THREE.Vector3;
	private positionWorld: THREE.Vector3;
	public root: THREE.Object3D;


	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		/*-------------------------------
			Material
		-------------------------------*/

		this.root.traverse( item => {

			let mesh = item as THREE.Mesh;

			if ( mesh.isMesh ) {

				let baseMat = mesh.material as THREE.MeshStandardMaterial;

				mesh.material = new THREE.ShaderMaterial( {
					fragmentShader: transparentFrag,
					vertexShader: transparentVert,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						uColor: { value: baseMat.color }
					} ),
					transparent: true,
				} );

				mesh.renderOrder = 999;

			}

		} );

		/*-------------------------------
			Position
		-------------------------------*/

		this.velocity = new THREE.Vector3();
		this.positionWorld = new THREE.Vector3();

	}

	public update( deltaTime: number ) {

		this.velocity.multiplyScalar( 0.98 );

		this.root.applyQuaternion(
			new THREE.Quaternion().setFromEuler(
				new THREE.Euler(
					this.velocity.y * 3.0,
					this.velocity.x * 3.0 + 0.004,
					deltaTime * 0.2,
				) )
		);

	}

	public hover( args: ORE.TouchEventArgs, camera: THREE.PerspectiveCamera ) {

		let screenPos = this.root.getWorldPosition( this.positionWorld ).applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

		// @ts-ignore
		let d = args.screenPosition.distanceTo( new THREE.Vector2( screenPos.x, screenPos.y ) );

		// this.velocity.add( new THREE.Vector3( args.delta.x, - args.delta.y ).multiplyScalar( 0.001 * Math.max( 0.0, 1.0 - d * 2.0 ) ) );
		this.velocity.add( new THREE.Vector3( args.delta.x, args.delta.y, 0.0 ).multiplyScalar( 0.0003 * Math.max( 0.0, 1.0 - d * 2.0 ) ) );

	}

}

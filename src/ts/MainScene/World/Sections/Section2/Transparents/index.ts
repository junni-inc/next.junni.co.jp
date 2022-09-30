import * as THREE from 'three';
import * as ORE from 'ore-three';

import transparentVert from './shaders/transparent.vs';
import transparentFrag from './shaders/transparent.fs';

export class Transparents {

	private root: THREE.Object3D;


	// position

	private basePosition: THREE.Vector3;
	private transformedPosition: THREE.Vector3;
	private transformedWorldPosition: THREE.Vector3;

	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;

	private velocity: THREE.Vector3;


	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'transparentVisibility',
			initValue: 0,
		} );

		this.root.children.forEach( item => {

			let mesh = item as THREE.Mesh;

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

		} );

		this.basePosition = this.root.position.clone();
		this.transformedPosition = this.basePosition.clone();
		this.transformedWorldPosition = this.root.getWorldPosition( new THREE.Vector3() );
		this.velocity = new THREE.Vector3();

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'transparentVisibility', visible ? 1.0 : 0.0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

	public hover( args: ORE.TouchEventArgs, camera: THREE.PerspectiveCamera ) {

		let screenPos = this.transformedWorldPosition.clone().applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

		// @ts-ignore
		let d = args.screenPosition.distanceTo( new THREE.Vector2( screenPos.x, screenPos.y ) );

		this.velocity.add( new THREE.Vector3( args.delta.x, - args.delta.y ).multiplyScalar( 0.001 * Math.max( 0.0, 1.0 - d * 2.0 ) ) );

	}

}

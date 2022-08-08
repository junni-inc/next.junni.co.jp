import * as THREE from 'three';
import * as ORE from 'ore-three';

import logoVert from './shaders/logo.vs';
import logoFrag from './shaders/logo.fs';

export class LogoPart {

	private commonUniforms: ORE.Uniforms;

	private mesh: THREE.Mesh;
	private worldPosition: THREE.Vector3;
	private basePosition: THREE.Vector3;
	private velocity: THREE.Vector3;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.mesh = mesh;
		let baseMaterial = mesh.material as THREE.MeshStandardMaterial;

		let mat = new THREE.ShaderMaterial( {
			vertexShader: logoVert,
			fragmentShader: logoFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				uColor: {
					value: baseMaterial.emissive.convertLinearToSRGB()
				},
				uMatCapTex: window.gManager.assetManager.getTex( 'matCap' )
			} ),
			side: THREE.DoubleSide
		} );

		this.mesh.material = mat;

		this.basePosition = mesh.position.clone();
		this.worldPosition = mesh.getWorldPosition( new THREE.Vector3() );

		this.velocity = new THREE.Vector3();

	}

	public update( deltaTime: number ) {

		this.velocity.add( this.basePosition.clone().sub( this.mesh.position ).multiplyScalar( deltaTime ) );
		this.velocity.multiplyScalar( 0.9 );

		this.mesh.position.add( this.velocity );

	}

	public hover( args: ORE.TouchEventArgs, camera: THREE.PerspectiveCamera ) {

		let screenPos = this.worldPosition.clone().applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

		// @ts-ignore
		let d = args.screenPosition.distanceTo( new THREE.Vector2( screenPos.x, screenPos.y ) );

		this.velocity.add( new THREE.Vector3( args.delta.x, - args.delta.y ).multiplyScalar( 0.0002 * Math.max( 0.0, 1.0 - d * 2.0 ) ) );

	}

}

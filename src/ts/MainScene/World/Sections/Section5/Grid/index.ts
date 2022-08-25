import * as THREE from 'three';
import * as ORE from 'ore-three';

import gridVert from './shaders/grid.vs';
import gridfs from './shaders/grid.fs';

export class Grid extends THREE.LineSegments {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;
	private animatorId: string;

	constructor( parentUniforms?: ORE.Uniforms ) {

		let range = new THREE.Vector3( 5.0, 5.0, 8.0 );
		let resScale = 1.5;
		let res = new THREE.Vector3( range.x * resScale, range.y * resScale, range.z * resScale );

		let animatorId = Math.floor( Math.random() * 10000 ).toString();

		let offsetPosArray: number[] = [];
		let numArray: number[] = [];

		for ( let i = 0; i < res.z; i ++ ) {

			for ( let j = 0; j < res.y; j ++ ) {

				for ( let k = 0; k < res.x; k ++ ) {

					offsetPosArray.push(
						k / res.x * range.x,
						j / res.y * range.y,
						i / res.z * range.z,
					);

					numArray.push( i );

				}

			}

		}

		// let originGeo = new THREE.BoxBufferGeometry( 0.01, 0.01, 0.01 );

		let geo = new THREE.InstancedBufferGeometry();

		let scale = 0.9;
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
			- scale, 0.0, 0.0,
			scale, 0.0, 0.0,
			0.0, scale, 0.0,
			0.0, - scale, 0.0,
			0.0, 0.0, scale,
			0.0, 0.0, - scale,
		] ), 3 ) );
		geo.setIndex( new THREE.BufferAttribute( new Uint8Array( [ 0, 1, 2, 3, 4, 5 ] ), 1 ) );

		geo.setAttribute( 'offsetPos', new THREE.InstancedBufferAttribute( new Float32Array( offsetPosArray ), 3 ) );
		geo.setAttribute( 'num', new THREE.InstancedBufferAttribute( new Float32Array( numArray ), 1 ) );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			range: {
				value: range
			},
			total: {
				value: res
			},
			noiseTex: window.gManager.assetManager.getTex( 'noise' )
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		uni.visibility = animator.add( {
			name: 'windVisibility' + animatorId,
			initValue: 1,
		} );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: gridVert,
			fragmentShader: gridfs,
			uniforms: uni,
			side: THREE.DoubleSide,
			depthTest: false,
			blending: THREE.AdditiveBlending
		} );

		super( geo, mat );

		this.commonUniforms = uni;
		this.animator = animator;
		this.animatorId = animatorId;

		/*-------------------------------
			Dispose
		-------------------------------*/

		const onDispose = () => {

			geo.dispose();
			mat.dispose();

			this.removeEventListener( 'dispose', onDispose );

		};

		this.addEventListener( 'dispose', onDispose );

	}

	public switchVisibility( visible: boolean, duration: number = 1 ) {

		if ( visible ) this.visible = true;

		this.animator.animate( 'windVisibility' + this.animatorId, visible ? 1 : 0, duration, () => {

			if ( ! visible ) this.visible = false;

		} );

	}

	public dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

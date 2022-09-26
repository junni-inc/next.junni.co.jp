import * as THREE from 'three';
import * as ORE from 'ore-three';

import textRingVert from './shaders/textRing.vs';
import textRingFrag from './shaders/textRing.fs';

export class TextRing extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;

	constructor( parentUniforms: ORE.Uniforms ) {

		let res = 4;

		let numArray: number[] = [];
		let rndArray: number[] = [];
		let posArray: number[] = [];
		let indexArray: number[] = [];
		let uvArray: number[] = [];

		let radius = 0.6;
		let height = 0.048;

		for ( let i = 0; i <= res; i ++ ) {

			let theta = i / res * Math.PI * 2.0 + Math.PI / 4.0;

			let x = Math.cos( theta ) * radius;
			let y = Math.sin( theta ) * radius;

			posArray.push( x, y, height / 2 );
			posArray.push( x, y, - height / 2 );

			if ( i < res ) {

				indexArray.push( i * 2.0 + 0.0 );
				indexArray.push( i * 2.0 + 1.0 );
				indexArray.push( ( i + 1 ) * 2.0 );

				indexArray.push( i * 2.0 + 1.0 );
				indexArray.push( ( i + 1 ) * 2.0 + 1.0 );
				indexArray.push( ( i + 1 ) * 2.0 + 0.0 );

			}

			let uvx = i / res * 5.0;

			uvArray.push( uvx, 1.0 );
			uvArray.push( uvx, 0.0 );

		}

		let num = 100.0;

		for ( let i = 0; i < num; i ++ ) {

			numArray.push( i );
			rndArray.push( Math.random(), Math.random(), Math.random() );

		}

		let geo = new THREE.InstancedBufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( posArray ), 3 ) );
		geo.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvArray ), 2 ) );
		geo.setIndex( new THREE.BufferAttribute( new Uint8Array( indexArray ), 1 ) );

		geo.setAttribute( 'num', new THREE.InstancedBufferAttribute( new Float32Array( numArray ), 1 ) );
		geo.setAttribute( 'rnd', new THREE.InstancedBufferAttribute( new Float32Array( rndArray ), 3 ) );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			total: {
				value: res
			},
			noiseTex: window.gManager.assetManager.getTex( 'noise' ),
			tex: window.gManager.assetManager.getTex( 'outro' ),
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		uni.uVisibility = animator.add( {
			name: 'sec5TextRingVisibility',
			initValue: 1,
			easing: ORE.Easings.linear
		} );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: textRingVert,
			fragmentShader: textRingFrag,
			uniforms: uni,
			side: THREE.DoubleSide,
			transparent: true,
		} );

		super( geo, mat );

		this.commonUniforms = uni;
		this.animator = animator;
		this.renderOrder = 10;

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

	private timer: number | null = null;

	public switchVisibility( visible: boolean ) {

		if ( this.timer != null ) {

			window.clearTimeout( this.timer );

		}

		this.timer = window.setTimeout( () => {

			if ( visible ) this.visible = true;

			this.animator.animate( 'sec5TextRingVisibility', visible ? 1 : 0, visible ? 2 : 0.5, () => {

				if ( ! visible ) this.visible = false;

			} );

		}, ( visible ? 0.5 : 0.0 ) * 1000 );

	}

	public dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}


}

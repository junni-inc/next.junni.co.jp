import * as THREE from 'three';
import * as ORE from 'ore-three';

import slideVert from './shaders/slide.vs';
import slideFrag from './shaders/slide.fs';
import { ViewingState } from '../../Section';

export class Slides {

	private animator: ORE.Animator;

	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'sec2SlidesVisibility',
			initValue: 0,
		} );

		this.commonUniforms.uSlide = this.animator.add( {
			name: 'sec2SlidesSlide',
			initValue: 0,
		} );

		this.root = root;

		let res = 4;

		let posArray: number[] = [];
		let indexArray: number[] = [];
		let uvArray: number[] = [];

		let radius = 9.0;
		let height = 1.6;

		for ( let i = 0; i <= res; i ++ ) {

			let theta = i / res * Math.PI * 2.0 + Math.PI / 4.0;

			let x = Math.cos( theta ) * radius * 2.0;
			let z = Math.sin( theta ) * radius;

			posArray.push( x, height / 2, z );
			posArray.push( x, - height / 2, z );

			if ( i < res ) {

				indexArray.push( i * 2.0 + 0.0 );
				indexArray.push( i * 2.0 + 1.0 );
				indexArray.push( ( i + 1 ) * 2.0 );

				indexArray.push( i * 2.0 + 1.0 );
				indexArray.push( ( i + 1 ) * 2.0 + 1.0 );
				indexArray.push( ( i + 1 ) * 2.0 + 0.0 );

			}

			let uvx = i / res;

			uvArray.push( uvx, 1.0 );
			uvArray.push( uvx, 0.0 );

		}

		let offsetPosArray = [];
		let scaleArray = [];
		let rndArray = [];

		let num = 50;

		let posY = 0.0;

		for ( let i = 0; i < num; i ++ ) {

			let scale = 0.3 + 1.0 * Math.random();
			let scaleH = scale / 2;

			let h = height * 0.80;

			posY -= scaleH * h;
			offsetPosArray.push( 0.0, posY, 0.0 );
			posY -= scaleH * h;

			scaleArray.push( scale );
			rndArray.push( Math.random() );
			rndArray.push( Math.random() );

		}

		for ( let i = 0; i < num; i ++ ) {

			offsetPosArray[ i * 3.0 + 1 ] -= posY / 2;

		}

		let geo = new THREE.InstancedBufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( posArray ), 3 ) );
		geo.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvArray ), 2 ) );
		geo.setAttribute( 'offsetPos', new THREE.InstancedBufferAttribute( new Float32Array( offsetPosArray ), 3 ) );
		geo.setAttribute( 'scale', new THREE.InstancedBufferAttribute( new Float32Array( scaleArray ), 1 ) );
		geo.setAttribute( 'rnd', new THREE.InstancedBufferAttribute( new Float32Array( rndArray ), 2 ) );
		geo.setIndex( new THREE.BufferAttribute( new Uint8Array( indexArray ), 1 ) );

		let mat = new THREE.ShaderMaterial( {
			fragmentShader: slideFrag,
			vertexShader: slideVert,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				tex: window.gManager.assetManager.getTex( 'sec2BGText' ),
				speed: {
					value: Math.random() * 0.5 + 0.5,
				}
			} ),
			transparent: true,
		} );

		let mesh = new THREE.Mesh( geo, mat );
		this.root.add( mesh );

	}

	public switchVisibility( viewing: ViewingState ) {

		let visible = viewing == 'viewing';

		if ( visible ) this.root.visible = true;

		let slide = 1.0;
		if ( viewing == 'viewing' ) slide = 0.0;
		if ( viewing == 'passed' ) slide = - 1.0;

		this.animator.animate( 'sec2SlidesSlide', slide, 1 );
		this.animator.animate( 'sec2SlidesVisibility', visible ? 1 : 0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

}

import * as THREE from 'three';
import * as ORE from 'ore-three';

import tileTextVert from './shaders/tileText.vs';
import tileTextFrag from './shaders/tileText.fs';

import { TileTextInfo } from '..';

export class TileTextMesh extends THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> {

	private animator: ORE.Animator;

	public size: THREE.Vector2;
	private uniforms: ORE.Uniforms;
	private bgMesh: THREE.Mesh;
	private animatorId?: string;

	constructor( char: string, info: TileTextInfo, texture: THREE.Texture, height: number = 1, uniforms?: ORE.Uniforms, animatorId?: string ) {

		if ( animatorId === undefined ) {

			animatorId = ( Math.random() * 10000 ).toString();

		}

		let uni = ORE.UniformsLib.mergeUniforms( uniforms, {
			uTile: {
				value: info.tile
			},
			uTextSelector: {
				value: info.charList.split( '' ).findIndex( item => item == char )
			},
			uTex: {
				value: texture
			},
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		uni.uVisibility = animator.add( {
			name: 'tileTextVisibility' + animatorId,
			initValue: 0,
			// easing: ORE.Easings.easeOutCubic
		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		let size = new THREE.Vector2( height, height );
		let geo = new THREE.PlaneBufferGeometry( size.x, size.y );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: tileTextVert,
			fragmentShader: tileTextFrag,
			transparent: true,
			side: THREE.DoubleSide,
			uniforms: uni,
		} );

		super( geo, mat );

		this.animatorId = animatorId;
		this.animator = window.gManager.animator;

		this.size = new THREE.Vector2( size.x * 0.7, size.y );

		if ( char == 'i' ) {

			this.size.x *= 0.6;

		}

		this.uniforms = uni;

		// depth

		// this.customDepthMaterial = new THREE.ShaderMaterial( {
		// 	vertexShader: tileTextVert,
		// 	fragmentShader: tileTextFrag,
		// 	uniforms: uni,
		// 	defines: {
		// 		IS_DEPTH: '',
		// 	}
		// } );

		// this.castShadow = true;

		// bgMesh

		this.bgMesh = new THREE.Mesh( geo, new THREE.ShaderMaterial( {
			vertexShader: tileTextVert,
			fragmentShader: tileTextFrag,
			transparent: true,
			uniforms: uni,
			defines: {
				IS_BG: ''
			}
		} ) );

		this.bgMesh.position.set( 0, 0, - 0.15 );
		this.add( this.bgMesh );

	}

	public show( duration: number = 0.5 ) {

		this.animator.animate( 'tileTextVisibility' + this.animatorId, 1, duration );

	}

	public dispose( duration: number = 0.5 ) {

		this.animator.animate( 'tileTextVisibility' + this.animatorId, 2, duration, () => {

			if ( this.parent ) {

				this.geometry.dispose();
				this.material.dispose();
				( this.bgMesh.material as THREE.ShaderMaterial ).dispose();

				this.parent.remove( this );

			}

		} );

	}

}

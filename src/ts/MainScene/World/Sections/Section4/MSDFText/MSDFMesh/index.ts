import * as THREE from 'three';
import * as ORE from 'ore-three';

import msdfVert from './shaders/msdf.vs';
import msdfFrag from './shaders/msdf.fs';

export class MSDFMesh extends THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> {

	public size: THREE.Vector2;
	protected fontInfo: any;
	protected uniforms: ORE.Uniforms;

	constructor( char: string, info: any, texture: THREE.Texture, height: number = 1, shaderOption?: THREE.ShaderMaterialParameters ) {

		let charInfo;

		for ( let i = 0; i < info.chars.length; i ++ ) {

			let c = info.chars[ i ];

			if ( c.char == char ) {

				charInfo = c;

			}

		}

		let left: number, top: number;
		let w: number, h: number;

		let size = new THREE.Vector2( 0.0, charInfo.height / info.common.scaleH * height );
		size.x = size.y * charInfo.width / charInfo.height;

		let uniforms = ( shaderOption && shaderOption.uniforms ) || {};

		if ( charInfo ) {

			left = charInfo.x / info.common.scaleW;
			top = charInfo.y / info.common.scaleH;

			w = charInfo.width / info.common.scaleW;
			height = charInfo.height / info.common.scaleH;

			uniforms = ORE.UniformsLib.mergeUniforms( uniforms, {
				left: {
					value: left
				},
				top: {
					value: top
				},
				width: {
					value: w
				},
				height: {
					value: height
				},
				msdf: {
					value: texture
				},
			} );

		}

		let geo = new THREE.BufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
			0, - 0.5 * size.y, 0.0,
			1.0 * size.x, - 0.5 * size.y, 0.0,
			1.0 * size.x, 0.5 * size.y, 0.0,
			0, 0.5 * size.y, 0.0
		] ), 3.0 ) );

		geo.applyMatrix4( new THREE.Matrix4().makeTranslation( - size.x / 2, 0.0, 0.0 ) );

		if ( charInfo.char == '"' ) {

			// wip
			geo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 0.03, 0 ) );

		}

		geo.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( [
			0, 0,
			1, 0,
			1, 1,
			0, 1
		] ), 2.0 ) );

		geo.setIndex( new THREE.BufferAttribute( new Uint16Array( [
			0, 1, 2,
			0, 2, 3
		] ), 1 ) );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: msdfVert,
			fragmentShader: msdfFrag,
			transparent: true,
			...shaderOption,
			uniforms: uniforms,
		} );

		super( geo, mat );

		this.size = size;
		this.uniforms = uniforms;

	}

}

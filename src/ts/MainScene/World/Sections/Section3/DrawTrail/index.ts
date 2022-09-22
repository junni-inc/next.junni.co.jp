import * as THREE from 'three';
import * as ORE from 'ore-three';

import drawTrailVert from './shaders/drawTrail.vs';
import drawTrailFrag from './shaders/drawTrail.fs';

import computePosition from './shaders/trailComputePosition.glsl';

declare interface Kernels{
    position: ORE.GPUComputationKernel
}

declare interface Datas{
    position: ORE.GPUcomputationData
}

export class DrawTrail extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;
	private meshUniforms: ORE.Uniforms;

	private renderer: THREE.WebGLRenderer;

	private radialSegments: number;
	private heightSegments: number;
	private positionAttr: THREE.BufferAttribute;

	private gCon: ORE.GPUComputationController;
	private kernels: Kernels;
	private datas: Datas;

	constructor( renderer: THREE.WebGLRenderer, parentUniforms: ORE.Uniforms ) {

		let radialSegments = 2;
		let heightSegments = 30;

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uCursorPos: {
				value: new THREE.Vector3( 0, 0 )
			},
			uPosDataTex: {
				value: null
			},
			uDataSize: {
				value: new THREE.Vector2()
			}
		} );

		let meshUniforms = ORE.UniformsLib.mergeUniforms( uni );

		let radius = 0.05;

		let geo = new THREE.CylinderBufferGeometry( radius, radius, 0.0, radialSegments, heightSegments, true );
		let mat = new THREE.ShaderMaterial( {
			vertexShader: drawTrailVert,
			fragmentShader: drawTrailFrag,
			uniforms: meshUniforms,
			side: THREE.DoubleSide,
			wireframe: false,
			transparent: true,
			blending: THREE.AdditiveBlending
		} );


		let computeUVArray = [];

		for ( let i = 0; i <= heightSegments; i ++ ) {

			for ( let j = 0; j <= radialSegments; j ++ ) {

				computeUVArray.push(
					i / ( heightSegments ), 0
				);

			}

		}

		geo.setAttribute( 'computeUV', new THREE.BufferAttribute( new Float32Array( computeUVArray ), 2 ), );

		super( geo, mat );

		this.renderOrder = 999;

		this.renderer = renderer;
		this.commonUniforms = uni;
		this.meshUniforms = meshUniforms;
		this.radialSegments = radialSegments;
		this.heightSegments = heightSegments;

		this.positionAttr = this.geometry.getAttribute( 'position' ) as THREE.BufferAttribute;

		/*-------------------------------
			GPU Controller
		-------------------------------*/

		let gpuCommonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
		} );

		this.gCon = new ORE.GPUComputationController( this.renderer, new THREE.Vector2( heightSegments, 1 ) );

		this.commonUniforms.uDataSize.value.copy( this.gCon.dataSize );

		// create computing position kernel

		let posUni = ORE.UniformsLib.mergeUniforms( gpuCommonUniforms, {
			uPosDataTex: { value: null },
		} );

		let posKernel = this.gCon.createKernel( {
			fragmentShader: computePosition,
			uniforms: posUni
		} );

		// matomeru

		this.kernels = {
			position: posKernel,
		};

		this.datas = {
			position: this.gCon.createData()
		};

	}

	public update( deltaTime: number ) {

		this.kernels.position.uniforms.uPosDataTex.value = this.datas.position.buffer.texture;
		this.gCon.compute( this.kernels.position, this.datas.position );

		this.meshUniforms.uPosDataTex.value = this.datas.position.buffer.texture;

	}

	public updateCursorPos( worldPos: THREE.Vector3 ) {

		let localPos = this.worldToLocal( worldPos );

		this.commonUniforms.uCursorPos.value.copy( localPos );

	}

}

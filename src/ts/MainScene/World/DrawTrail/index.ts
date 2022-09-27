import * as THREE from 'three';
import * as ORE from 'ore-three';

import drawTrailVert from './shaders/drawTrail.vs';
import drawTrailFrag from './shaders/drawTrail.fs';

import computePosition from './shaders/trailComputePosition.glsl';
import { Pencil } from './Pencil';

declare interface Kernels{
    position: ORE.GPUComputationKernel
}

declare interface Datas{
    position: ORE.GPUcomputationData
}

export class DrawTrail extends THREE.Mesh {

	private animator: ORE.Animator;

	private commonUniforms: ORE.Uniforms;
	private meshUniforms: ORE.Uniforms;

	private renderer: THREE.WebGLRenderer;

	private radialSegments: number;
	private heightSegments: number;
	private positionAttr: THREE.BufferAttribute;

	private gCon: ORE.GPUComputationController;
	private kernels: Kernels;
	private datas: Datas;

	// children

	private childrenWrapper: THREE.Object3D;
	private pencil: Pencil;

	constructor( renderer: THREE.WebGLRenderer, parentUniforms: ORE.Uniforms ) {

		let radialSegments = 9;
		let heightSegments = 128;

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uCursorPos: {
				value: new THREE.Vector3( 0, 0 )
			},
			uPosDataTex: {
				value: null
			},
			uDataSize: {
				value: new THREE.Vector2()
			},
			uMaterial: window.gManager.animator.add( {
				name: 'trailMaterial',
				initValue: [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0 ],
			} ),
		} );

		let meshUniforms = ORE.UniformsLib.mergeUniforms( THREE.UniformsUtils.clone( THREE.UniformsLib.lights ), uni, {
			uSceneTex: {
				value: null
			},
			uWinResolution: {
				value: new THREE.Vector2()
			},
		} );

		let radius = 0.05;

		let geo = new THREE.CylinderBufferGeometry( radius, radius, 1.0, radialSegments, heightSegments, true );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: drawTrailVert,
			fragmentShader: drawTrailFrag,
			uniforms: meshUniforms,
			lights: true,
			transparent: true
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
		geo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
		geo.getAttribute( 'normal' ).applyMatrix4( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );

		super( geo, mat );

		this.castShadow = true;

		this.animator = window.gManager.animator;

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
			uNoiseTex: window.gManager.assetManager.getTex( 'noise' )
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

		/*-------------------------------
			Children
		-------------------------------*/

		this.childrenWrapper = new THREE.Object3D();
		this.add( this.childrenWrapper );

		this.pencil = new Pencil( this.commonUniforms );
		this.childrenWrapper.add( this.pencil );

	}

	public setSceneTex( texture: THREE.Texture ) {

		this.meshUniforms.uSceneTex.value = texture;

	}

	public update( deltaTime: number ) {

		this.kernels.position.uniforms.uPosDataTex.value = this.datas.position.buffer.texture;
		this.gCon.compute( this.kernels.position, this.datas.position );

		this.meshUniforms.uPosDataTex.value = this.datas.position.buffer.texture;

	}

	public updateCursorPos( worldPos: THREE.Vector3, raycasterWorldPos: THREE.Vector3 ) {

		let localPos = this.worldToLocal( worldPos.clone() ).lerp( raycasterWorldPos, this.animator.get<number[]>( 'trailMaterial' )![ 3 ] );

		this.commonUniforms.uCursorPos.value.copy( localPos );

		this.childrenWrapper.position.copy( localPos );

	}

	public changeMaterial( sectionIndex: number ) {

		let mat = [ 0, 0, 0, 0, 0, 0 ];

		mat[ sectionIndex ] = 1.0;

		this.animator.animate( 'trailMaterial', mat );

	}

	public resize( info: ORE.LayerInfo ) {

		this.meshUniforms.uWinResolution.value.copy( info.size.canvasPixelSize );

	}

}

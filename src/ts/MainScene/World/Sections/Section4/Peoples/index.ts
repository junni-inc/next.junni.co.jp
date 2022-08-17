import * as THREE from 'three';
import * as ORE from 'ore-three';

import comPosition from './shaders/computePosition.glsl';
import comVelocity from './shaders/computeVelocity.glsl';

import peopleVert from './shaders/people.vs';
import peopleFrag from './shaders/people.fs';

declare interface Kernels{
    velocity: ORE.GPUComputationKernel,
    position: ORE.GPUComputationKernel
}

declare interface Datas{
    velocity: ORE.GPUcomputationData,
    position: ORE.GPUcomputationData
}

export class Peoples extends THREE.Mesh {

	private renderer: THREE.WebGLRenderer;
	private animator: ORE.Animator;

	private num: number;

	private gCon: ORE.GPUComputationController;
	private kernels: Kernels;
	private datas: Datas;

	private meshUniforms: ORE.Uniforms;
	private commonUniforms: ORE.Uniforms;

	private avoidRoot: THREE.Object3D;

	constructor( renderer: THREE.WebGLRenderer, num: number, parentUniforms: ORE.Uniforms, avoidRoot: THREE.Object3D ) {

		let commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			deltaTime: {
				value: 1
			},
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		commonUniforms.uVisibility = animator.add( {
			name: 'peopleVisibility',
			initValue: 0,
			easing: ORE.Easings.linear
		} );

		/*-------------------------------
			CreateTrails
		-------------------------------*/

		let size = 0.6;

		let originGeo = new THREE.PlaneBufferGeometry( size, size );
		originGeo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeTranslation( 0.0, size / 2, 0.0 ) );

		let geo = new THREE.InstancedBufferGeometry();
		geo.setAttribute( 'position', originGeo.getAttribute( 'position' ) );
		geo.setAttribute( 'uv', originGeo.getAttribute( 'uv' ) );
		geo.setAttribute( 'normal', originGeo.getAttribute( 'normal' ) );
		geo.setIndex( originGeo.getIndex() );

		//instanecing attribute

		let computUVArray = [];

		for ( let i = 0; i < num; i ++ ) {

			for ( let j = 0; j < num; j ++ ) {

				computUVArray.push( j / ( num - 1 ), i / ( num - 1 ) );

			}

		}

		geo.setAttribute( 'computeUV', new THREE.InstancedBufferAttribute( new Float32Array( computUVArray ), 2 ) );

		let meshUniforms = ORE.UniformsLib.mergeUniforms( commonUniforms, {
			dataPos: {
				value: null
			},
			dataVel: {
				value: null
			},
			tex: window.gManager.assetManager.getTex( 'people' )
		} );

		/*-------------------------------
			Super
		-------------------------------*/

		super( geo, new THREE.ShaderMaterial( {
			vertexShader: peopleVert,
			fragmentShader: peopleFrag,
			uniforms: meshUniforms,
			transparent: true,
			side: THREE.DoubleSide,
		} ) );

		this.castShadow = true;
		this.animator = animator;
		this.renderer = renderer;
		this.num = num;
		this.avoidRoot = avoidRoot;

		this.commonUniforms = commonUniforms;
		this.meshUniforms = meshUniforms;

		this.customDepthMaterial = new THREE.ShaderMaterial( {
			vertexShader: peopleVert,
			fragmentShader: peopleFrag,
			uniforms: meshUniforms,
			side: THREE.DoubleSide,
			defines: {
				DEPTH: ''
			}
		} );

		/*-------------------------------
			GPU Controller
		-------------------------------*/

		let gpuCommonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			uAvoid: {
				value: this.avoidRoot.children.map( item => {

					item.visible = false;

					return {
						position: item.position,
						scale: item.scale,
					};

				} )
			}
		} );

		this.gCon = new ORE.GPUComputationController( this.renderer, new THREE.Vector2( num, num ) );

		// create computing position kernel

		let posUni = ORE.UniformsLib.mergeUniforms( gpuCommonUniforms, {
			dataPos: { value: null },
			dataVel: { value: null },
		} );

		let posKernel = this.gCon.createKernel( {
			fragmentShader: comPosition,
			uniforms: posUni
		} );

		// create computing velocity kernel

		let velUni = ORE.UniformsLib.mergeUniforms( gpuCommonUniforms, {
			dataPos: { value: null },
			dataVel: { value: null },
		} );

		let velKernel = this.gCon.createKernel( {
			fragmentShader: comVelocity.replace( /AVOID_COUNT/g, this.avoidRoot.children.length.toString() ),
			uniforms: velUni
		} );

		// matomeru

		this.kernels = {
			position: posKernel,
			velocity: velKernel,
		};

		this.datas = {
			position: this.gCon.createData( this.createInitialPositionData() ),
			velocity: this.gCon.createData(),
		};

		this.frustumCulled = false;

	}

	private createInitialPositionData() {

    	let dataArray: number[] = [];

    	for ( let i = 0; i < this.num; i ++ ) {

			for ( let j = 0; j < this.num; j ++ ) {

				let r = Math.random() * Math.PI * 2.0;

				let radius = 6.0 + Math.random() * 10.0;

				let pos = [
					Math.sin( r ) * radius,
					0.0,
					Math.cos( r ) * radius,
					0,
				];

				pos.forEach( item => {

					dataArray.push( item );

				} );

    		}

    	}

    	let tex = new THREE.DataTexture( new Float32Array( dataArray ), this.num, this.num, THREE.RGBAFormat, THREE.FloatType );
		tex.needsUpdate = true;
		return tex;

	}

	public update( deltaTime: number ) {

		this.commonUniforms.deltaTime.value = deltaTime;

		this.kernels.velocity.uniforms.dataPos.value = this.datas.position.buffer.texture;
		this.kernels.velocity.uniforms.dataVel.value = this.datas.velocity.buffer.texture;
		this.gCon.compute( this.kernels.velocity, this.datas.velocity );

		this.kernels.position.uniforms.dataPos.value = this.datas.position.buffer.texture;
		this.kernels.position.uniforms.dataVel.value = this.datas.velocity.buffer.texture;
		this.gCon.compute( this.kernels.position, this.datas.position );

		this.meshUniforms.dataPos.value = this.datas.position.buffer.texture;
		this.meshUniforms.dataVel.value = this.datas.velocity.buffer.texture;

	}

	public switchVisibility( visible: boolean ) {

		this.animator.animate( 'peopleVisibility', visible ? 1 : 0, visible ? 3 : 2 );

	}

}

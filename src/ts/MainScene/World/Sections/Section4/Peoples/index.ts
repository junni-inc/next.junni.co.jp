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
	private styleIndex: number = 0.0;

	constructor( renderer: THREE.WebGLRenderer, num: number, parentUniforms: ORE.Uniforms, avoidRoot: THREE.Object3D ) {

		let commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			deltaTime: {
				value: 1
			},
			uModelPosition: {
				value: null
			},
			uCursorPos: {
				value: new THREE.Vector3( 999, 999 )
			}
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		commonUniforms.uVisibility = animator.add( {
			name: 'peopleVisibility',
			initValue: 0,
			easing: ORE.Easings.linear,
		} );

		commonUniforms.uJump = animator.add( {
			name: 'peopleAscension',
			initValue: 0,
			easing: ORE.Easings.linear,
		} );

		/*-------------------------------
			CreateTrails
		-------------------------------*/

		// let size = 0.8;
		// let size = 0.7;
		// let size = 0.7;
		let size = 1.3;

		let originGeo = new THREE.PlaneGeometry( size, size );
		originGeo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeTranslation( 0.0, size / 2, 0.0 ) );
		originGeo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeScale( 1.0 * 0.5, 1.0, 1.0 ) );

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
			tex: window.gManager.assetManager.getTex( 'human' ),
			noiseTex: window.gManager.assetManager.getTex( 'noise' ),
			uPeopleStyle: window.gManager.animator.add( {
				name: 'peopleStyle',
				initValue: [ 1, 0, 0, 0 ],
			} )
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
		this.commonUniforms.uModelPosition.value = this.position;
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

		let avoidList:{
			position: THREE.Vector3,
			scale: THREE.Vector3,
		}[] = [];

		this.avoidRoot.children.forEach( item => {

			item.visible = false;

			avoidList.push( {
				position: item.position,
				scale: item.scale,
			} );

		} );

		let gpuCommonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			uAvoid: {
				value: avoidList
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
			fragmentShader: comVelocity.replace( /AVOID_COUNT/g, avoidList.length.toString() ),
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

		/*-------------------------------
			Cursor
		-------------------------------*/

		window.gManager.eRay.addEventListener( 'hover/CommonGround', ( e ) => {

			let intersection = e.intersection as THREE.Intersection;
			let p = intersection.point;

			this.commonUniforms.uCursorPos.value.copy( this.worldToLocal( new THREE.Vector3( p.x, p.y, p.z ) ) );

		} );

	}

	private createInitialPositionData() {

    	let dataArray: number[] = [];

    	for ( let i = 0; i < this.num; i ++ ) {

			for ( let j = 0; j < this.num; j ++ ) {

				let r = Math.random() * Math.PI * 2.0;

				let radius = 0.0 + Math.random() * 18.0;

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

		if ( ! this.visible ) return;

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

	private visibility: boolean = false;
	private ascension: boolean = false;

	public switchVisibility( visible: boolean, duration: number ) {

		if ( this.visibility == visible ) return;

		this.animator.animate( 'peopleVisibility', visible ? 1 : 0, duration );

		this.visibility = visible;


	}

	public switchAscension( ascension: boolean, duration: number ) {

		if ( this.ascension == ascension ) return;

		this.animator.animate( 'peopleAscension', ascension ? 1 : 0, duration );
		this.ascension = ascension;

	}

	public jump() {

		let styleArray = [ 0, 0, 0, 0 ];
		this.styleIndex = ( this.styleIndex + 1 ) % styleArray.length;
		styleArray[ this.styleIndex ] = 1.0;

		this.animator.animate( 'peopleStyle', styleArray, 0.2 );

	}

	public updateCursor( pos: THREE.Vector3 ) {

		this.commonUniforms.cursorPos.value.copy( pos );

	}

}

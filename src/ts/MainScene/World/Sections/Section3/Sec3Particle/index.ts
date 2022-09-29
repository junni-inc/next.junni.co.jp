import * as THREE from 'three';
import * as ORE from 'ore-three';

import particlesVert from './shaders/sec3Particle.vs';
import particlesFrag from './shaders/sec3Particle.fs';

export class Sec3Particle extends THREE.Mesh {

	private animator: ORE.Animator;
	public commonUniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		let num = 100;
		let range = new THREE.Vector3( 7.0, 8.0, 7.0 );

		let offsetPosArray: number[] = [];
		let numArray: number[] = [];

		for ( let i = 0; i < num; i ++ ) {

			offsetPosArray.push(
				Math.random() * range.x,
				Math.random() * range.y,
				Math.random() * range.z,
			);

			numArray.push( i, Math.random() * 0.95 + 0.05 );

		}

		let size = 0.2;
		let originGeo = new THREE.PlaneBufferGeometry( size, size );

		let geo = new THREE.InstancedBufferGeometry();
		geo.setAttribute( 'position', originGeo.getAttribute( 'position' ) );
		geo.setAttribute( 'uv', originGeo.getAttribute( 'uv' ) );
		geo.setIndex( originGeo.getIndex() );

		geo.setAttribute( 'offsetPos', new THREE.InstancedBufferAttribute( new Float32Array( offsetPosArray ), 3 ) );
		geo.setAttribute( 'num', new THREE.InstancedBufferAttribute( new Float32Array( numArray ), 2 ) );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			range: {
				value: range
			},
			uTex: window.gManager.assetManager.getTex( 'sec3Particle' )
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		uni.uVisibility = animator.add( {
			name: 'sec3ParticleVisibility',
			initValue: 0,
			easing: ORE.Easings.easeOutCubic
		} );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: particlesVert,
			fragmentShader: particlesFrag,
			uniforms: uni,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		} );

		super( geo, mat );

		this.renderOrder = 999;

		this.animator = animator;

		this.commonUniforms = uni;
		this.frustumCulled = false;

	}

	public update( deltaTime: number ) {

		this.commonUniforms.time.value += deltaTime * ( this.animator.get<number>( 'particleTimeScale' ) || 1.0 );

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.visible = true;

		this.animator.animate( 'sec3ParticleVisibility', visible ? 1 : 0, 1, () => {

			if ( ! visible ) this.visible = false;

		} );

	}

}

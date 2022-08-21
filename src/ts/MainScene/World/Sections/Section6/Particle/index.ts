import * as THREE from 'three';
import * as ORE from 'ore-three';

import particlesVert from './shaders/particle.vs';
import particlesFrag from './shaders/particle.fs';

export class Particle extends THREE.Points {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms?: ORE.Uniforms ) {

		let num = 300;
		let range = new THREE.Vector3( 30.0, 10, 10 );

		let offsetPosArray: number[] = [];
		let numArray: number[] = [];

		for ( let i = 0; i < num; i ++ ) {

			offsetPosArray.push(
				Math.random() * range.x,
				Math.random() * range.y,
				Math.random() * range.z,
			);

			numArray.push( i );

		}

		let geo = new THREE.BufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( offsetPosArray ), 3 ) );
		geo.setAttribute( 'num', new THREE.BufferAttribute( new Float32Array( numArray ), 1 ) );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			range: {
				value: range
			},
			particleSize: {
				value: 0.1
			}
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		uni.uVisibility = animator.add( {
			name: 'sec6ParticleVisibility',
			initValue: 0,
		} );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: particlesVert,
			fragmentShader: particlesFrag,
			uniforms: uni,
			transparent: true,
			blending: THREE.AdditiveBlending,
		} );

		super( geo, mat );

		this.animator = animator;

		this.commonUniforms = uni;

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.commonUniforms.particleSize.value = layerInfo.size.canvasSize.y / 200;

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.visible = true;

		this.animator.animate( 'sec6ParticleVisibility', visible ? 1 : 0, 1, () => {

			if ( ! visible ) this.visible = false;

		} );

	}

}

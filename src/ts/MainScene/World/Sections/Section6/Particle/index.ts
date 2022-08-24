import * as THREE from 'three';
import * as ORE from 'ore-three';

import particlesVert from './shaders/particle.vs';
import particlesFrag from './shaders/particle.fs';

export class Particle extends THREE.Points {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms?: ORE.Uniforms ) {

		let num = 300;
		let range = new THREE.Vector3( 30.0, 20, 20 );

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
			},
			time: {
				value: 0
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

		animator.add( {
			name: 'particleTimeScale',
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

	public update( deltaTime: number ) {

		this.commonUniforms.time.value += deltaTime * ( this.animator.get<number>( 'particleTimeScale' ) || 1.0 );

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

	private boosting: boolean = false;

	public boost() {

		if ( this.boosting ) return;

		this.boosting = true;

		this.animator.setEasing( 'particleTimeScale', ORE.Easings.easeOutCubic );

		this.animator.animate( 'cameraFovOffset', 40, 1 );
		this.animator.animate( 'cameraShake', 0.15, 0.8 );
		this.animator.animate( 'cameraShakeTimeScale', 8, 0.8 );

		this.animator.animate( 'particleTimeScale', 10, 2, () => {

			this.boostCancel();

		} );

	}

	public boostCancel() {

		if ( ! this.boosting ) return;

		this.boosting = false;

		this.animator.setEasing( 'particleTimeScale', ORE.Easings.easeOutCubic );
		this.animator.animate( 'cameraFovOffset', 0, 4 );
		this.animator.animate( 'cameraShake', 0, 2 );
		this.animator.animate( 'cameraShakeTimeScale', 2, 4 );

		this.animator.animate( 'particleTimeScale', 1, 4 );

	}

}

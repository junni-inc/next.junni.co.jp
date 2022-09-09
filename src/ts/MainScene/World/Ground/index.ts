import * as THREE from 'three';
import * as ORE from 'ore-three';
import { PowerReflectionMesh } from 'power-mesh';

import groundFrag from './shaders/ground.fs';

export class Ground extends PowerReflectionMesh {

	private animator: ORE.Animator;

	constructor( mesh: THREE.Mesh, parentUniforms: ORE.Uniforms ) {

		/*-------------------------------
			Animator
		-------------------------------*/

		let animator = window.gManager.animator;

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uIllustTex: window.gManager.assetManager.getTex( 'groundIllust' ),
			uGridTex: window.gManager.assetManager.getTex( 'groundGrid' ),
			uRandomTex: window.gManager.assetManager.getTex( 'random' ),
			uNoiseTex: window.gManager.assetManager.getTex( 'noise' ),
		} );

		uni.uColor = animator.add( {
			name: 'groundColor',
			initValue: new THREE.Vector3( 0.0, 0.0, 0.0 ),
			easing: ORE.Easings.easeOutCubic
		} );

		uni.uVisibleIllust = animator.add( {
			name: 'groundIllustVisibility',
			initValue: 0,
			easing: ORE.Easings.linear
		} );

		uni.uVisibleGrid = animator.add( {
			name: 'groundGridVisibility',
			initValue: 0,
		} );

		uni.uReflection = animator.add( {
			name: 'groundReflection',
			initValue: 0,
			easing: ORE.Easings.easeOutCubic
		} );

		uni.uVisibility = animator.add( {
			name: 'groundVisibility',
			initValue: 1.0,
		} );

		super( mesh, {
			uniforms: uni,
			fragmentShader: groundFrag,
			transparent: true,
		}, true );

		mesh.position.y = this.position.y;
		this.resize( new THREE.Vector2( 1024, 1024 ) );

		this.animator = animator;
		this.receiveShadow = true;
		this.renderOrder = 0;

		window.gManager.eRay.touchableObjects.push( this );

		// @ts-ignore
		this.isSkinnedMesh = false;

	}

	private timer: number | null = null;

	public changeSection( sectionIndex: number ) {

		let reflection = 0.0;
		let color = new THREE.Vector3();
		let visible = false;
		let illustVisibility = false;

		if ( sectionIndex == 2.0 ) {

			reflection = 1;

		}

		if ( sectionIndex == 3.0 ) {

			color.setScalar( 0.95 );
			illustVisibility = true;

		}

		if ( sectionIndex >= 2.0 && sectionIndex <= 3.0 ) {

			visible = true;

		}

		if ( visible ) this.visible = true;

		// material

		this.animator.animate( 'groundReflection', reflection );
		this.animator.animate( 'groundColor', color );

		// illust

		this.animator.animate( 'groundGridVisibility', illustVisibility ? 1 : 0, 1.5 );

		if ( this.timer ) {

			window.clearTimeout( this.timer );

		}

		this.timer = window.setTimeout( () => {

			this.animator.animate( 'groundIllustVisibility', illustVisibility ? 1 : 0, illustVisibility ? 2 : 1 );

			this.timer = null;

		}, illustVisibility ? 500 : 0 );

		// visibility

		this.animator.animate( 'groundVisibility', visible ? 1 : 0, 1, () => {

			this.visible = visible;

		} );

	}

}

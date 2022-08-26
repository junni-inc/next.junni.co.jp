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
		} );

		uni.uColor = animator.add( {
			name: 'groundColor',
			initValue: new THREE.Vector3( 0.0, 0.0, 0.0 ),
			easing: ORE.Easings.easeOutCubic
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

		this.resize( new THREE.Vector2( 1024, 1024 ) );

		this.animator = animator;
		this.receiveShadow = true;
		this.renderOrder = 0;

	}

	public changeSection( sectionIndex: number ) {

		let reflection = 0.0;
		let color = new THREE.Vector3();
		let visible = false;

		if ( sectionIndex == 2.0 ) {

			reflection = 1;

		}

		if ( sectionIndex == 3.0 ) {

			color.set( 1.0, 1.0, 1.0 );

		}

		if ( sectionIndex >= 2.0 && sectionIndex <= 3.0 ) {

			visible = true;

		}

		if ( visible ) this.visible = true;

		this.animator.animate( 'groundReflection', reflection );
		this.animator.animate( 'groundColor', color );
		this.animator.animate( 'groundVisibility', visible ? 1 : 0, 1, () => {

			this.visible = visible;

		} );

	}

}

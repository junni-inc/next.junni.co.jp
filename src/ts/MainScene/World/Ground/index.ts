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

		super( mesh, {
			uniforms: uni,
			fragmentShader: groundFrag,
		}, true );

		this.resize( new THREE.Vector2( 1024, 1024 ) );

		this.animator = animator;
		this.receiveShadow = true;

	}

	public changeSection( sectionIndex: number ) {

		let reflection = 0.0;
		let color = new THREE.Vector3();

		if ( sectionIndex == 2.0 ) {

			reflection = 1;

		}


		if ( sectionIndex == 3.0 ) {

			color.set( 1.0, 1.0, 1.0 );

		}

		this.animator.animate( 'groundReflection', reflection );
		this.animator.animate( 'groundColor', color );

	}

}

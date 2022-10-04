import * as THREE from 'three';
import * as ORE from 'ore-three';

import roadVert from './shaders/road.vs';
import roadFrag from './shaders/road.fs';

export class Road extends THREE.Mesh {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		let size = new THREE.Vector2( 100.0, 4.0 );

		let geo = new THREE.PlaneGeometry( size.x, size.y, 50.0, 1.0 );
		geo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeRotationX( - Math.PI / 2.0 ) );
		geo.getAttribute( 'position' ).applyMatrix4( new THREE.Matrix4().makeTranslation( - size.x / 2.5, - 3.0, 0.0 ) );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let animator = window.gManager.animator;

		uni.uVisibility = animator.add( {
			name: 'roadVisibility',
			initValue: 0,
		} );

		let mat = new THREE.ShaderMaterial( {
			fragmentShader: roadFrag,
			vertexShader: roadVert,
			uniforms: uni,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		} );

		super( geo, mat, );

		this.animator = animator;
		this.commonUniforms = uni;

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.visible = true;

		this.animator.animate( 'roadVisibility', visible ? 1 : 0.0, 1.0, () => {

			if ( ! visible ) this.visible = false;

		} );

	}

}

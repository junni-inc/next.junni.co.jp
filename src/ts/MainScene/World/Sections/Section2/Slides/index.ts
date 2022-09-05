import * as THREE from 'three';
import * as ORE from 'ore-three';

import slideVert from './shaders/slide.vs';
import slideFrag from './shaders/slide.fs';
import { ViewingState } from '../../Section';

export class Slides {

	private animator: ORE.Animator;

	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'sec2SlidesVisibility',
			initValue: 0,
		} );

		this.commonUniforms.uSlide = this.animator.add( {
			name: 'sec2SlidesSlide',
			initValue: 0,
		} );

		this.root = root;

		let originGeo = new THREE.PlaneBufferGeometry( 30.0, 1.0, );

		let offsetPosArray = [];
		let rndArray = [];

		let num = 30;

		for ( let i = 0; i < num; i ++ ) {

			offsetPosArray.push( 0.0, ( i - num / 2 ) * 0.9, 0.0 );
			rndArray.push( Math.random() );
			rndArray.push( Math.random() );

		}

		let geo = new THREE.InstancedBufferGeometry();
		geo.setAttribute( 'position', originGeo.getAttribute( 'position' ) );
		geo.setAttribute( 'uv', originGeo.getAttribute( 'uv' ) );
		geo.setAttribute( 'normal', originGeo.getAttribute( 'normal' ) );
		geo.setAttribute( 'offsetPos', new THREE.InstancedBufferAttribute( new Float32Array( offsetPosArray ), 3 ) );
		geo.setAttribute( 'rnd', new THREE.InstancedBufferAttribute( new Float32Array( rndArray ), 2 ) );
		geo.setIndex( originGeo.getIndex() );

		let mat = new THREE.ShaderMaterial( {
			fragmentShader: slideFrag,
			vertexShader: slideVert,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				tex: window.gManager.assetManager.getTex( 'sec2BGText' ),
				speed: {
					value: Math.random() * 0.5 + 0.5,
				}
			} ),
			transparent: true,
		} );

		let mesh = new THREE.Mesh( geo, mat );
		this.root.add( mesh );

	}

	public switchVisibility( viewing: ViewingState ) {

		let visible = viewing == 'viewing';

		if ( visible ) this.root.visible = true;

		let slide = 1.0;
		if ( viewing == 'viewing' ) slide = 0.0;
		if ( viewing == 'passed' ) slide = - 1.0;

		this.animator.animate( 'sec2SlidesSlide', slide, 1 );
		this.animator.animate( 'sec2SlidesVisibility', visible ? 1 : 0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

}

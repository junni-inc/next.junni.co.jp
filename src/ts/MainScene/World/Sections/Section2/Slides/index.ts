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

		this.root.children.forEach( item => {

			let mesh = item as THREE.Mesh;

			let mat = ( mesh.material as THREE.MeshStandardMaterial );

			let tex = mat.map;

			if ( tex ) {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;

			}

			mesh.material = new THREE.ShaderMaterial( {
				fragmentShader: slideFrag,
				vertexShader: slideVert,
				uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
					tex: {
						value: tex
					},
					speed: {
						value: Math.random() * 0.5 + 0.5
					}
				} ),
				transparent: true,
			} );

			mesh.renderOrder = 1;

		} );

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

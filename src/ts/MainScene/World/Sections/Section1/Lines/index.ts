import * as THREE from 'three';
import * as ORE from 'ore-three';

import lineVert from './shaders/line.vs';
import lineFrag from './shaders/line.fs';
import { ViewingState } from '../../Section';

export class Lines {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {

		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'sec1LineVisibility',
			initValue: 0,
			// easing: ORE.Easings.linear
		} );


		this.root.children.forEach( ( obj, index ) => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				let rot = mesh.rotation.clone();
				mesh.rotation.set( 0, 0, 0 );
				let len = new THREE.Box3().setFromObject( mesh ).getSize( new THREE.Vector3() );
				mesh.rotation.copy( rot );


				mesh.material = new THREE.ShaderMaterial( {
					vertexShader: lineVert,
					fragmentShader: lineFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						num: {
							value: index / this.root.children.length
						},
						len: {
							value: len.y
						}
					} ),
					transparent: true,
				} );

			}

		} );

	}

	public switchVisibility( viewing: ViewingState ) {

		let visible = viewing == 'viewing';

		if ( visible ) this.root.visible = true;

		let v = 0.0;

		let current = this.animator.get<number>( 'sec1LineVisibility' ) || 0;

		if ( viewing == 'viewing' ) {

			let f = Math.ceil( current );
			v = f + ( f + 1 ) % 2;

			if ( v == 0.0 ) v ++;

		}

		if ( viewing == 'passed' ) {

			let f = Math.ceil( current );
			v = f + f % 2;

		}

		this.animator.animate( 'sec1LineVisibility', v, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

}

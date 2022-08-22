import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Cross } from './Cross';

export class Crosses {

	private animator: ORE.Animator;

	private root: THREE.Object3D;
	private commonUniforms: ORE.Uniforms;
	private crossList: Cross[] = [];

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );


		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'sec1CrossesVisibility',
			initValue: 0,
			easing: ORE.Easings.linear
		} );



		root.children.forEach( ( item, i ) => {

			let origin = item as THREE.Mesh;

			let cross = new Cross( origin, this.commonUniforms );

			setTimeout( () => {

				cross.rotate();

			}, 500 * i );

			this.crossList.push( cross );

			cross.position.copy( origin.position );
			cross.rotation.copy( origin.rotation );
			cross.scale.copy( origin.scale );

			if ( origin.parent ) {

				origin.parent.add( cross );
				origin.visible = false;

			}

		} );

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'sec1CrossesVisibility', visible ? 1 : 0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

}

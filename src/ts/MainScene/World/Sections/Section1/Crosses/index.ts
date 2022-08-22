import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Cross } from './Cross';

export class Crosses {

	private root: THREE.Object3D;
	private commonUniforms: ORE.Uniforms;
	private crossList: Cross[] = [];

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
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

}

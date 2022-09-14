import * as THREE from 'three';
import * as ORE from 'ore-three';
import EventEmitter from 'wolfy87-eventemitter';
import { Comrade } from './Comrade';

export class Comrades extends EventEmitter {

	private commonUniforms: ORE.Uniforms;
	public root: THREE.Object3D;
	private origin: THREE.SkinnedMesh;
	private comradeList: Comrade[] = [];

	constructor( root: THREE.Object3D, origin: THREE.SkinnedMesh, animations: THREE.AnimationClip[], parentUniforms: ORE.Uniforms ) {

		super();

		this.root = root;
		this.origin = origin;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.root.children.forEach( ( item, index ) => {

			let comrade = new Comrade( item, this.origin, animations, this.commonUniforms, ( index ) % 6 );

			this.comradeList.push( comrade );

		} );

		this.origin.visible = false;

	}

	public update( deltaTime: number ) {

		for ( let i = 0; i < this.comradeList.length; i ++ ) {

			this.comradeList[ i ].update( deltaTime );

		}

	}

	public switchVisibility( visible: boolean ) {

		this.comradeList.forEach( item => {

			item.switchVisibility( visible );

		} );

	}

}

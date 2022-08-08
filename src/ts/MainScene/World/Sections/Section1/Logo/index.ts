import * as ORE from 'ore-three';
import * as THREE from 'three';

import { LogoPart } from './LogoPart';

export class Logo {

	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;
	private meshList: LogoPart[] = [];

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {} );

		this.root.traverse( obj => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				let part = new LogoPart( mesh, this.commonUniforms );
				this.meshList.push( part );

			}

		} );

	}

	public update( deltaTime: number ) {

		this.meshList.forEach( item => {

			item.update( deltaTime );

		} );

	}

	public hover( args: ORE.TouchEventArgs, camera: THREE.PerspectiveCamera ) {

		this.meshList.forEach( item => {

			item.hover( args, camera );

		} );

	}

}

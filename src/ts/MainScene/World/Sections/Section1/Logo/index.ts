import * as ORE from 'ore-three';
import * as THREE from 'three';

import { LogoPart } from './LogoPart';

export class Logo {

	private animator: ORE.Animator;

	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;
	private meshList: LogoPart[] = [];

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'sec1LogoVisibility',
			initValue: 0,
			easing: ORE.Easings.linear
		} );

		this.root.children.forEach( ( obj, index ) => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				let part = new LogoPart( mesh, index / this.root.children.length, this.commonUniforms );
				this.meshList.push( part );

			}

		} );

	}

	public update( deltaTime: number ) {

		if ( ! this.root.visible ) return;

		this.meshList.forEach( item => {

			item.update( deltaTime );

		} );

	}

	public hover( args: ORE.TouchEventArgs, camera: THREE.PerspectiveCamera ) {

		this.meshList.forEach( item => {

			item.hover( args, camera );

		} );

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'sec1LogoVisibility', visible ? 1 : 0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

}

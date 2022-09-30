import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Transparent } from './Transparent';

export class Transparents {

	private root: THREE.Object3D;

	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;

	private meshList: Transparent[] = [];
	private layoutController: ORE.LayoutController[] = [];

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'transparentVisibility',
			initValue: 0,
		} );

		this.root.children.forEach( item => {

			this.meshList.push( new Transparent( item, this.commonUniforms ) );

		} );

		this.layoutController.push( new ORE.LayoutController( this.meshList.find( item => item.root.name == 'Cube' )!.root, {
			position: new THREE.Vector3( 1.7, 1.3, 0.0 ),
			scale: 1.0,
		} ) );

		this.layoutController.push( new ORE.LayoutController( this.meshList.find( item => item.root.name == 'Torus' )!.root, {
			position: new THREE.Vector3( - 1.5, - 1.0, 0.0 ),
			scale: 1.2
		} ) );

		this.layoutController.push( new ORE.LayoutController( this.meshList.find( item => item.root.name == 'Cylinder' )!.root, {
			position: new THREE.Vector3( - 1.8, - 1.5, 0.0 ),
			scale: 1.5
		} ) );

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( 'transparentVisibility', visible ? 1.0 : 0.0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

	public update( deltaTime: number ) {

		for ( let i = 0; i < this.meshList.length; i ++ ) {

			let obj = this.meshList[ i ];
			obj.update( deltaTime );

		}

	}

	public hover( args: ORE.TouchEventArgs, camera: THREE.PerspectiveCamera ) {

		this.meshList.forEach( item => {

			item.hover( args, camera );

		} );

	}

	public resize( info: ORE.LayerInfo ) {

		this.layoutController.forEach( item => {

			item.updateTransform( info.size.portraitWeight );

		} );

	}

}

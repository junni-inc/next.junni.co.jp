import * as THREE from 'three';
import * as ORE from 'ore-three';

import textVert from './shaders/introText.vs';
import textFrag from './shaders/introText.fs';

export class IntroText {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;
	private root: THREE.Object3D;
	private text: string;
	private elm?: HTMLElement;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms, text: string, elm?: HTMLElement ) {

		this.root = root;
		this.text = text;
		this.elm = elm;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'introTextVisibility' + this.root.uuid,
			initValue: 0,
		} );

		/*-------------------------------
			Material
		-------------------------------*/

		this.root.children.forEach( item => {

			let mesh = item as THREE.Mesh;

			if ( mesh.isMesh ) {

				let baseMaterial = mesh.material as THREE.MeshStandardMaterial;

				let map = baseMaterial.map;

				if ( map ) {

					map.magFilter = THREE.LinearFilter;
					map.minFilter = THREE.LinearFilter;

				}

				mesh.material = new THREE.ShaderMaterial( {
					vertexShader: textVert,
					fragmentShader: textFrag,
					uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
						tex: {
							value: map
						}
					} ),
					transparent: true
				} );

			}

		} );

		this.setVisible( false );

	}

	public async start( unRemovable?: boolean ) {

		setTimeout( () => {

			window.subtitles.show( this.text, 1, 2.0 );

		}, 500 );

		await this.swithVisibility( true );

		await new Promise( ( r ) => {

			setTimeout( () => {

				r( null );

			}, 2000 );

		} );

		if ( ! unRemovable ) {

			await this.swithVisibility( false );

		} else {

			if ( this.elm ) {

				this.elm.setAttribute( 'data-visible', "false" );

			}

		}

	}

	public async swithVisibility( visible: boolean ) {

		if ( visible ) this.setVisible( true );

		if ( this.elm ) {

			this.elm.setAttribute( 'data-visible', visible ? 'true' : 'false' );

		}

		return this.animator.animate( 'introTextVisibility' + this.root.uuid, visible ? 1 : 0, 1, () => {

			if ( ! visible ) this.setVisible( false );

		} );

	}

	private enable: boolean = false;
	private visible: boolean = true;

	public setEnable( enable: boolean ) {

		this.enable = enable;

		this.checkObjectVisible();

	}

	public setVisible( visible: boolean ) {

		this.visible = visible;

		this.checkObjectVisible();

	}

	private checkObjectVisible() {

		if ( this.enable && this.visible ) {

			this.root.visible = true;

		} else {

			this.root.visible = false;

		}

	}

}

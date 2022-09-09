import * as THREE from 'three';
import * as ORE from 'ore-three';

import { MSDFMesh } from './MSDFMesh';

type TextOrigin = 'left' | 'center' | 'right';

export class MSDFText extends THREE.Object3D {

	private commonUniforms: ORE.Uniforms;
	private meshList: MSDFMesh[] = [];
	private totalTextMeshWidth: number = 0.0;

	constructor( parentUniforms?: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.meshList = [];

	}

	public async setText( text: string ) {

		/*-------------------------------
			Create MSDF Mesh
		-------------------------------*/

		let [ fontData, texture ] = await this.load( 'gumball' );
		let offset = 0;

		text.split( '' ).forEach( ( char ) => {

			if ( char != '_' ) {

				let textMesh = new MSDFMesh( char, fontData, texture, 10.0, this.commonUniforms );

				let size = textMesh.size.x;

				// if ( char == "N" ) {

				// 	size *= 0.72;

				// }

				// if ( char == "I" ) {

				// 	size *= 1.2;

				// }

				offset += size / 2;

				textMesh.position.x = offset;

				this.meshList.push( textMesh );

				offset += size / 2;

				this.add( textMesh );

			} else {

				offset += 0.08;

			}

		} );

		this.totalTextMeshWidth = offset;

	}

	private async load( fontName: string ) {

		let xhr = new XMLHttpRequest();
		xhr.open( 'GET', './assets/fonts/' + fontName + '.json' );

		let prmFontData = new Promise<any>( resolve => {

			xhr.onload = () => {

				let response = JSON.parse( xhr.response );

				resolve( response );

			};

			xhr.send();

		} );

		let loader = new THREE.TextureLoader();
		let prmTexture = new Promise<THREE.Texture>( ( resolve ) => {

			loader.load( './assets/fonts/' + fontName + '.png', tex => {

				resolve( tex );

			} );

		} );

		return Promise.all( [ prmFontData, prmTexture ] );

	}

}

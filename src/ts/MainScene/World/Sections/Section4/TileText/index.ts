import * as THREE from 'three';
import * as ORE from 'ore-three';
import { TileTextMesh } from './TileTextMesh';

export type TileTextInfo = {
	tile: THREE.Vector2,
	charList: string;
}

export class TileText extends THREE.Object3D {

	private commonUniforms: ORE.Uniforms;
	private meshList: TileTextMesh[] = [];
	private totalTextMeshWidth: number = 0.0;

	constructor( parentUniforms?: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.meshList = [];

	}

	public async setText( text: string ) {

		this.meshList.forEach( ( textMesh, index ) => {

			setTimeout( () => {

				textMesh.dispose();

			}, 100 * index );

		} );

		this.meshList.length = 0;

		/*-------------------------------
			Create MSDF Mesh
		-------------------------------*/

		let [ fontData, texture ] = await this.load( 'gumball' );

		text.split( '' ).forEach( ( char, index ) => {

			if ( char != '_' ) {

				let textMesh = new TileTextMesh( char, fontData, texture, 1.0, this.commonUniforms );
				this.add( textMesh );
				this.meshList.push( textMesh );
				this.totalTextMeshWidth += textMesh.size.x;

				setTimeout( () => {

					textMesh.show();

				}, 70 * index );

			}

		} );

		let offset = 0;

		this.meshList.forEach( textMesh => {

			let size = textMesh.size.x;

			offset += size / 2;

			textMesh.position.x = offset;// - this.totalTextMeshWidth / 2;

			offset += size / 2;

		} );

	}

	private async load( fontName: string ) {

		let prmFontData = new Promise<any>( resolve => {

			resolve( {
				tile: new THREE.Vector2( 8, 8 ),
				charList: "abcdefghijklmnopqrstuvwxyz"
			} );

		} );

		let loader = new THREE.TextureLoader();
		let prmTexture = new Promise<THREE.Texture>( ( resolve ) => {

			loader.load( './assets/fonts/' + fontName + '.png', tex => {

				tex.magFilter = THREE.NearestFilter;
				tex.minFilter = THREE.NearestFilter;
				resolve( tex );

			} );

		} );

		return Promise.all( [ prmFontData, prmTexture ] );

	}

}

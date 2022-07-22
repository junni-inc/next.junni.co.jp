import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VideoTextureLoader } from './VideoTextureLoader';

export declare interface AssetManagerTexture {
	value: any;
	videoTexLoader?: VideoTextureLoader;
}

export declare interface AssetManagerAssetData {
	name: string;
	path: string;
	type: 'gltf' | 'tex' | 'videoTex';
	subImgPath?: string;
	timing?: 'pre' | 'must' | 'sub';
	onLoad?: ( value: any ) => void
}
export declare interface AssetManagerParams {
	assets: AssetManagerAssetData[];
}
export class AssetManager extends THREE.EventDispatcher {

	private textures: {[key:string]: AssetManagerTexture };
	private gltfs: {[key:string]: GLTF }

	private preLoadManager: THREE.LoadingManager;
	private mustLoadManager: THREE.LoadingManager;
	private subLoadManager: THREE.LoadingManager;

	constructor( ) {

		super();

		this.textures = {};
		this.gltfs = {};


		this.preLoadManager = new THREE.LoadingManager( undefined, ( url, loaded, total ) => {

			this.processEvent( 'processPreAssets', loaded, total );

		} );

		this.mustLoadManager = new THREE.LoadingManager( undefined, ( url, loaded, total ) => {

			this.processEvent( 'processMustAssets', loaded, total );

		} );

		this.subLoadManager = new THREE.LoadingManager( undefined, ( url, loaded, total ) => {

			this.processEvent( 'processSubAssets', loaded, total );

		} );

	}

	public async load( params: AssetManagerParams ) {

		params.assets.forEach( item => {

			if ( item.type == 'tex' || item.type == 'videoTex' ) {

				this.textures[ item.name ] = { value: null };

			}

		} );

		await this.loadAssets( params.assets.filter( item => item.timing == 'pre' ), this.preLoadManager );
		this.dispatchEvent( { type: 'loadPreAssets' } );

		await this.loadAssets( params.assets.filter( item => item.timing == 'must' || item.timing == undefined ), this.mustLoadManager );
		this.dispatchEvent( { type: 'loadMustAssets' } );

		await this.loadAssets( params.assets.filter( item => item.timing == 'sub' ), this.subLoadManager );
		this.dispatchEvent( { type: 'loadSubAssets' } );

	}

	private loadAssets( assets: AssetManagerAssetData[], manager: THREE.LoadingManager ) {

		let tex = assets.filter( item => item.type == 'tex' );
		let videoTex = assets.filter( item => item.type == 'videoTex' );
		let gltf = assets.filter( item => item.type == 'gltf' );

		/*-------------------------------
			Load Texture
		-------------------------------*/

		let texLoader = new THREE.TextureLoader( manager );

		tex.forEach( item => {

			texLoader.load( item.path, ( t ) => {

				this.textures[ item.name ].value = t;

				if ( item.onLoad ) {

					item.onLoad( t );

				}

			} );

		} );

		/*-------------------------------
			Load Video Texture
		-------------------------------*/

		videoTex.forEach( item => {

			let loader = new VideoTextureLoader( item.path, item.subImgPath );

			loader.addEventListener( 'load', ( e ) => {

				this.textures[ item.name ].value = e.tex;

				if ( item.onLoad ) {

					item.onLoad( e.tex );

				}

			} );

		} );

		/*-------------------------------
			Load glTF
		-------------------------------*/

		let gltfLoader = new GLTFLoader( manager );

		gltf.forEach( item => {

			gltfLoader.load( item.path, ( gltf ) => {

				this.gltfs[ item.name ] = gltf;

				if ( item.onLoad ) {

					item.onLoad( gltf );

				}

			} );

		} );

		/*-------------------------------
			Loading Finish
		-------------------------------*/

		let promise = new Promise( ( resolve ) => {

			manager.onLoad = () => {

				resolve( null );

			};

			if ( tex.length == 0 && gltf.length == 0 ) {

				setTimeout( () => {

					manager.onLoad();

				}, 0 );

			}

		} );

		return promise;

	}

	private processEvent( type: string, loaded: number, total: number ) {

		this.dispatchEvent( { type: type, value: loaded / total } );

	}

	public getTex( name: string ): AssetManagerTexture {

		let texture = this.textures[ name ];

		if ( ! texture ) {

			console.warn( 'texture: ' + name + ' is not exist.' );

			this.textures[ name ] = { value: null };

		}

		return this.textures[ name ];

	}

	public getGltf( name: string ): GLTF | undefined {

		let gltf = this.gltfs[ name ];

		if ( ! gltf ) {

			console.warn( 'gltf: ' + name + ' is not exist.' );

		}

		return gltf;

	}

}

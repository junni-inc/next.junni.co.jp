import * as THREE from 'three';
import * as ORE from 'ore-three';

export class VideoTextureLoader extends THREE.EventDispatcher {

	private url: string;
	private subImgURL?: string;
	private loaded: boolean;

	private videoElm: HTMLVideoElement;

	constructor( url: string, imgURL?: string ) {

		super();

		this.url = url;
		this.subImgURL = imgURL;
		this.loaded = false;

		/*-------------------------------
			Load
		-------------------------------*/

		this.videoElm = document.createElement( 'video' ) as HTMLVideoElement;
		this.videoElm.muted = true;
		this.videoElm.autoplay = true;
		this.videoElm.setAttribute( 'playsinline', '' );

		this.videoElm.oncanplay = this.onVideoLoaded.bind( this );
		this.videoElm.oncanplaythrough = this.onVideoLoaded.bind( this );

		this.videoElm.src = this.url + '?v=' + Math.floor( Math.random() * 10000 ).toString();

		this.videoElm.onstalled = ( e ) => {

			this.createImageTexture();

		};

		this.videoElm.load();

	}


	private onVideoLoaded() {

		if ( this.loaded ) return;
		this.loaded = true;

		this.videoElm.play();

		let tex = new THREE.VideoTexture( this.videoElm );
		tex.image.width = tex.image.videoWidth;
		tex.image.height = tex.image.videoHeight;
		tex.wrapS = THREE.ClampToEdgeWrapping;
		tex.wrapT = THREE.ClampToEdgeWrapping;
		tex.needsUpdate = true;

		this.dispatchEvent( {
			type: 'load',
			tex: tex
		} );

		let duration = ( this.videoElm.duration - 0.5 );

		tex.onUpdate = () => {

			// repeat

			if ( this.videoElm.currentTime >= duration ) {

				this.videoElm.currentTime = 0;
				this.videoElm.play();

			}

		};

		document.addEventListener( 'visibilitychange', () => {

			setTimeout( () => {

				this.videoElm.play();

			}, 500 );

		} );

	}

	public createImageTexture() {

		if ( this.subImgURL ) {

			let loader = new THREE.TextureLoader();
			loader.crossOrigin = 'use-credentials';

			loader.load( this.subImgURL, ( tex ) => {

				this.dispatchEvent( {
					type: 'load',
					texture: tex
				} );

			} );

		}

	}

	public switchPlay( play: boolean ) {

		if ( play ) {

			this.videoElm.play();

		} else {

			this.videoElm.pause();

		}

	}

}

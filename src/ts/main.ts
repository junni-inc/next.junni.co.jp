import * as ORE from 'ore-three';
import { MainScene } from './MainScene';

import { GlobalManager } from './MainScene/GlobalManager';
import { AssetManager } from './MainScene/GlobalManager/AssetManager';
import { Subtitles } from './MainScene/Subtitle';
import { CameraController } from './MainScene/CameraController';

declare global {
	interface Window {
		gManager: GlobalManager;
		assetManager: AssetManager;
		subtitles: Subtitles;
		cameraController: CameraController;
		isIE: boolean;
		isSP: boolean;
		mainScene: MainScene;
	}
}


class APP {

	private canvas: HTMLCanvasElement | null;
	private controller: ORE.Controller;

	constructor() {

		/*------------------------
			checkUA
		------------------------*/
		var ua = navigator.userAgent;
		window.isSP = ( ua.indexOf( 'iPhone' ) > 0 || ua.indexOf( 'iPod' ) > 0 || ua.indexOf( 'Android' ) > 0 && ua.indexOf( 'Mobile' ) > 0 || ua.indexOf( 'iPad' ) > 0 || ua.indexOf( 'Android' ) > 0 || ua.indexOf( 'macintosh' ) > 0 );
		window.isSP = window.isSP || navigator.platform == "iPad" || ( navigator.platform == "MacIntel" && navigator.userAgent.indexOf( "Safari" ) != - 1 && navigator.userAgent.indexOf( "Chrome" ) == - 1 && ( navigator as any ).standalone !== undefined );

		/*------------------------
			init ORE
		------------------------*/
		this.canvas = document.querySelector( "#canvas" );

		let wrap: HTMLElement | null = null;

		if ( this.canvas ) {

			wrap = this.canvas.parentElement;

		}

		this.controller = new ORE.Controller();
		this.controller.addLayer( new MainScene( {
			name: 'Main',
			canvas: this.canvas || undefined,
			pixelRatio: Math.max( 1.0, window.devicePixelRatio * 0.5 ),
			wrapperElement: wrap
		} ), );

	}

}

window.addEventListener( 'load', ()=>{

	let app = new APP();

} );

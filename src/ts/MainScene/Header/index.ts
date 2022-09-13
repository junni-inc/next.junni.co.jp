import * as THREE from 'three';
import * as ORE from 'ore-three';

export class Header {

	private elm: HTMLElement;
	private logoElm: HTMLElement;

	constructor() {

		this.elm = document.querySelector( '.header' )!;
		this.logoElm = this.elm.querySelector( '.header-logo' )!;

		this.switchLogoVisibility( false );

	}

	public switchLogoVisibility( visible: boolean ) {

		this.logoElm.setAttribute( 'data-visible', visible ? 'true' : 'false' );

	}

}

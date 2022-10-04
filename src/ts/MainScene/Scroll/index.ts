import * as THREE from 'three';
import EventEmitter from 'wolfy87-eventemitter';

export class Scroll extends EventEmitter {

	private elm: HTMLElement;
	private buttonElm: HTMLButtonElement;

	constructor() {

		super();

		this.elm = document.querySelector( '.scroll' )!;

		this.buttonElm = this.elm.querySelector( '.scroll-btn' ) as HTMLButtonElement;

		this.buttonElm.addEventListener( 'click', () => {

			this.emitEvent( 'click' );

		} );

	}

	public switchVisible( visible: boolean ) {

		this.elm.setAttribute( 'data-visible', visible ? 'true' : 'false' );

	}

}

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

		let fillCircle = this.elm.querySelector( '.scroll-fillCircle' ) as HTMLElement;

		this.buttonElm.addEventListener( 'mousemove', ( e ) => {

			let bound = this.buttonElm.getBoundingClientRect();

			let x = e.clientX - bound.left;
			let y = e.clientY - bound.top;

			fillCircle.style.left = x + 'px';
			fillCircle.style.top = y + 'px';


		} );

	}

	public switchVisible( visible: boolean ) {

		this.elm.setAttribute( 'data-visible', visible ? 'true' : 'false' );

	}

}

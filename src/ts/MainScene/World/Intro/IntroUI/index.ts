import EventEmitter from "wolfy87-eventemitter";

export class IntroUI extends EventEmitter {

	// private elm: HTMLElement;

	// skip
	private skipElm: HTMLElement;
	private skipBakuElm: HTMLElement;
	private skiptTxtElm: HTMLElement;

	constructor() {

		super();

		// this.elm = document.querySelector( '.intro' )!;

		// skip
		this.skipElm = document.querySelector( '.intro-skip' )!;
		this.skipBakuElm = this.skipElm.querySelector( '.intro-skip-baku' )!;
		this.skiptTxtElm = this.skipElm.querySelector( '.intro-skip-txt' )!;
		this.skiptTxtElm.setAttribute( 'data-skipTxt', 'skip' );

		this.skipElm.addEventListener( 'click', () => {

			this.skiptTxtElm.setAttribute( 'data-skipTxt', 'ok' );

			setTimeout( () => {

				this.switchSkipVisibility( false );

			}, 200 );

			setTimeout( () => {

				this.emitEvent( 'skip' );

			}, 1000 );

		} );

	}

	public switchSkipVisibility( visible: boolean ) {

		this.skipElm.setAttribute( 'data-skipVisible', visible ? 'true' : 'false' );

	}

}

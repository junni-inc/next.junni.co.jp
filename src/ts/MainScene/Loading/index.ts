export class Loading {

	private elm: HTMLElement;
	private logoElm: HTMLElement;

	constructor() {

		this.elm = document.querySelector( '.loading' )!;
		this.logoElm = document.querySelector( '.loading-logo' )!;

		this.switchVisibility( true );
		this.switchLogoVisibility( false );

	}

	public switchVisibility( visible: boolean ) {

		this.elm.setAttribute( 'data-visible', visible ? 'true' : 'false' );

	}

	public switchLogoVisibility( visible: boolean ) {

		this.logoElm.setAttribute( 'data-visible', visible ? 'true' : 'false' );

	}

}

export class Outro {

	private elm: HTMLElement;

	private textElmWrapList: HTMLElement[];

	constructor( ) {

		this.elm = document.querySelector( '.section5-content' ) as HTMLElement;
		this.textElmWrapList = Array.from( this.elm.querySelectorAll( '.section5-text-wrap' ) );

		let textInnerList = Array.from( this.elm.querySelectorAll( '.section5-text-inner' ) );

		textInnerList.forEach( item => {

			let str = item.innerHTML;
			item.innerHTML = '';

			str.split( "" ).forEach( char => {

				item.innerHTML += '<span>' + char + '</span>';

			} );

		} );

	}

	private timeoutList: number[] = [];

	public switchVisibility( visible: boolean ) {

		let waitSum = 0.0;

		this.timeoutList.forEach( item => {

			window.clearTimeout( item );

		} );

		if ( visible ) {

			for ( let i = 0; i < this.textElmWrapList.length; i ++ ) {

				let elm = this.textElmWrapList[ i ];

				let itemList = Array.from( elm.querySelectorAll( '.section5-text' ) );

				this.timeoutList.push( window.setTimeout( () => {

					for ( let j = 0; j < itemList.length; j ++ ) {

						let item = itemList[ j ];

						this.timeoutList.push( window.setTimeout( () => {

							item.setAttribute( 'data-visible5line', 'true' );

						}, 200 * j ) );

					}

				}, waitSum ) );

				waitSum += itemList.length * 200 + 400;

			}

		} else {

			let items = Array.from( this.elm.querySelectorAll( '.section5-text' ) );

			items.forEach( item => {

				item.setAttribute( 'data-visible5line', "false" );

			} );

		}

	}



}

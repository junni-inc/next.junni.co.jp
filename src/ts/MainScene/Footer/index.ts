import EventEmitter from "wolfy87-eventemitter";

export class Footer extends EventEmitter {

	private elm: HTMLElement;
	private copyElm: HTMLElement;

	private timelineElm: HTMLElement;
	private timelineItemElmList: HTMLElement[] = [];

	constructor() {

		super( );

		this.elm = document.querySelector( '.footer' )!;
		this.copyElm = this.elm.querySelector( '.footer-copyright' )!;

		/*-------------------------------
			Timeline
		-------------------------------*/

		this.timelineElm = this.elm.querySelector( '.footer-timeline' )!;

		this.timelineItemElmList = Array.from( this.timelineElm.querySelectorAll( '.footer-timeline-item' ) );
		this.timelineItemElmList.forEach( elm=> {

			elm.addEventListener( 'click', ( e ) => {

				let elm = e.target as HTMLElement;
				let sectionNum = Number( elm.getAttribute( 'data-section' ) );

				if ( sectionNum == sectionNum ) {

					this.emitEvent( 'clickTimeline', [ sectionNum ] );

				}

			} );

		} );


		/*-------------------------------
			Init
		-------------------------------*/

		this.switchCopyVisibility( false );
		this.switchTimelineVisibility( false );

	}

	public switchCopyVisibility( visible: boolean ) {

		this.copyElm.setAttribute( 'data-visible', visible ? 'true' : 'false' );

	}

	public switchTimelineVisibility( visible: boolean ) {

		this.timelineElm.setAttribute( 'data-visible', visible ? 'true' : 'false' );

	}

	public changeTimelineSection( section: number ) {

		this.timelineItemElmList.forEach( elm => {

			let sectionNum = Number( elm.getAttribute( 'data-section' ) );

			let state = 'ready';

			if ( sectionNum == section ) state = 'viewing';
			if ( sectionNum < section ) state = 'passed';

			elm.setAttribute( 'data-state', state );

		} );


	}

}

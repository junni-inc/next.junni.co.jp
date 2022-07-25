import * as ORE from 'ore-three';
import EventEmitter from 'wolfy87-eventemitter';

export class Scroller extends EventEmitter {

	public enable: boolean = true;
	public value: number = 0;

	private showingContentPos: number = 0;

	private selectingContentPos: number = 0;
	private touchStartContentPos: number = 0;
	private moveVelocity: number = 0;

	public currentContent: number = - 1;
	private contentNum: number = 0;

	private animator: ORE.Animator;
	private wheelStop: boolean = false;
	private isAnimating: boolean = false;

	private isTouching: boolean = false;
	private touchStartPos: number = 0;
	public touchMove: number = 0;
	public touchMoveDiff: number = 0.0;

	constructor() {

		super();

		this.reset();

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = new ORE.Animator();
		this.animator.add( {
			name: 'contentSelectorValue',
			initValue: 0,
			easing: ORE.Easings.easeInOutCubic
		} );

	}

	public changeSectionNum( contentNum: number ) {

		this.contentNum = contentNum;
		this.reset();

	}

	public setCurrentContent( contentNum: number ) {

		this.value = contentNum;
		this.currentContent = contentNum;

	}

	private reset() {

		this.value = 0;
		this.showingContentPos = 0;
		this.selectingContentPos = 0;
		this.touchStartContentPos = 0;
		this.moveVelocity = 0;
		this.currentContent = - 1;
		this.wheelStop = false;
		this.isAnimating = false;
		this.isTouching = false;
		this.touchStartPos = 0;
		this.touchMove = 0;

	}

	public update( deltaTime: number ) {

		this.animator.update( deltaTime );

		let selectingMem = this.selectingContentPos;

		if ( this.isAnimating ) {

			this.value = this.animator.get<number>( 'contentSelectorValue' ) || 0;

			this.selectingContentPos = Math.round( this.value );

		} else if ( this.isTouching ) {

			this.value = this.touchStartPos + this.touchMove;

		} else {

			this.value += this.moveVelocity;

			this.calcVelocity( deltaTime );

		}

		this.checkCurrentContent();

		if ( this.selectingContentPos != selectingMem ) {

			let selectingContent = 0;

			selectingContent = this.selectingContentPos % ( this.contentNum - 1.0 );

			if ( selectingContent < 0 ) {

				selectingContent = selectingContent + this.contentNum - 1.0;

			}

			this.emitEvent( 'changeSelectingContent', [ selectingContent, selectingMem < this.selectingContentPos ] );

		}

	}

	private calcVelocity( deltaTime: number ) {

		if ( this.selectingContentPos == this.touchStartContentPos ) {

			let diff = this.touchMoveDiff;

			if ( Math.abs( diff ) > 0.1 ) {

				this.selectingContentPos += Math.sign( diff );
				this.selectingContentPos = Math.max( 0.0, Math.min( 1.0, this.selectingContentPos ) );
				this.touchMoveDiff = 0.0;

			}

		}

		let diff = this.selectingContentPos - this.value;

		this.moveVelocity += diff * deltaTime * 0.3;
		this.moveVelocity *= 0.85;

		this.touchMoveDiff *= 0.95;

	}

	private checkCurrentContent() {

		let nearest = Math.round( this.value );

		if ( nearest != this.currentContent ) {

			this.currentContent = nearest;

			this.wheelStop = true;

			this.emitEvent( 'changeCurrentContent', [ this.currentContent ] );

		}

	}

	public catch() {

		if ( ! this.enable ) return;

		this.touchStartPos = this.value;
		this.touchStartContentPos = this.isAnimating ? - 1 : Math.round( this.value );

		this.touchMove = 0;

		this.isTouching = true;
		this.isAnimating = false;

		this.touchMoveDiff = 0;

	}

	public drag( delta: number ) {

		if ( ! this.enable || ! this.isTouching ) return;

		let d = delta * 0.0005;

		this.touchMove -= d;

		this.touchMoveDiff -= d * 5.0;

	}

	public release( delta: number ) {

		if ( ! this.enable || ! this.isTouching ) return;

		this.isTouching = false;

		this.moveVelocity -= delta * 0.0005;

	}

	private wheelTime: number = - 1;
	private wheelDeltaMem: number = 0;

	public addVelocity( delta: number ) {

		let currentTime = new Date().getTime();
		let deltaTime = currentTime - this.wheelTime;
		let wheelDeltaDelta = Math.abs( delta - this.wheelDeltaMem );
		this.wheelTime = currentTime;
		this.wheelDeltaMem = delta;

		if ( this.wheelStop ) {

			if ( deltaTime < 100 && wheelDeltaDelta < 0.001 ) {

				return;

			}

			this.wheelStop = false;

		}

		this.touchStartContentPos = this.isAnimating ? - 1 : Math.round( this.value );

		this.moveVelocity += delta;

		this.touchMoveDiff += delta * 4.0;

	}

	public next() {

		if ( ! this.enable ) return;

		if ( this.move( Math.round( this.value + 1.0 ) ) ) {

			this.isAnimating = false;
			this.moveVelocity += 0.005;

		}

	}

	public prev() {

		if ( ! this.enable ) return;

		if ( this.move( Math.round( this.value - 1.0 ) ) ) {

			this.isAnimating = false;
			this.moveVelocity -= 0.005;

		}

	}

	public move( value: number, onFinished?: () => void ) {

		let diff = value - ( this.currentContent % ( this.contentNum - 1.0 ) );
		let n = diff;


		if ( Math.abs( n ) > this.contentNum / 2 ) {

			n -= ( this.contentNum - 1.0 ) * Math.sign( n );

		}

		let g = this.currentContent + n;

		let duration = 1.0;
		this.touchStartContentPos = - 1;
		this.isAnimating = true;

		this.animator.setValue( 'contentSelectorValue', this.value );
		this.animator.animate( 'contentSelectorValue', g, duration, () => {

			this.isAnimating = false;
			this.moveVelocity = 0;

			if ( onFinished ) {

				onFinished();

			}

		} );

		return false;

	}

}

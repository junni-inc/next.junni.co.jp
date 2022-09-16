import * as ORE from 'ore-three';
import EventEmitter from 'wolfy87-eventemitter';

export class Scroller extends EventEmitter {

	private animator: ORE.Animator;

	private sectionNum: number = 0;

	public value: number = 0;
	private velocity: number = 0;
	private velocityVelocity: number = 0;

	private touchStartContent: number | null = null;
	public currentContent: number = 0;
	private gravitiContent: number = 0;

	// wheel

	private wheelTime: number = - 1;
	private wheelDeltaMem: number = 0;

	// touch

	private isTouching: boolean = false;
	private touchStartPos: number = 0;
	public touchMove: number = 0;
	public touchMoveDiff: number = 0;

	constructor() {

		super();

		this.reset();

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = new ORE.Animator();
		this.animator.add( {
			name: 'value',
			initValue: 0,
			easing: ORE.Easings.easeInOutCubic
		} );

	}

	public changeSectionNum( contentNum: number ) {

		this.sectionNum = contentNum;
		this.reset();

		this.emitEvent( 'changeSelectingSection', [ this.gravitiContent ] );

	}

	private reset() {

		this.value = 0;
		this.gravitiContent = 0;
		this.touchStartContent = 0;
		this.velocity = 0;
		this.currentContent = 0;
		this.isTouching = false;
		this.touchStartPos = 0;
		this.touchMove = 0;

	}

	public update( deltaTime: number ) {

		this.animator.update( deltaTime );

		let selectingMem = this.gravitiContent;

		if ( this.animator.isAnimatingVariable( 'value' ) ) {

			// auto

			this.value = this.animator.get<number>( 'value' ) || 0;

			this.gravitiContent = Math.round( this.value );

		} else if ( this.isTouching ) {

			// touch

			this.value = this.touchStartPos + this.touchMove;

		} else {

			// inertia

			if ( this.touchStartContent ) {

				if ( this.gravitiContent == this.touchStartContent ) {

					if ( Math.abs( this.touchMoveDiff ) > 0.05 ) {

						this.gravitiContent += Math.sign( this.touchMoveDiff );
						this.touchMoveDiff = 0.0;

					}

				}

				this.touchStartContent = null;

			} else {

				if ( this.velocity > 0 ) {

					this.gravitiContent = Math.round( this.value + 0.45 );

				} else {

					this.gravitiContent = Math.round( this.value - 0.45 );

				}

			}

			this.gravitiContent = Math.max( 0.0, Math.min( this.sectionNum - 1, this.gravitiContent ) );

			let gravity = this.gravitiContent - this.value;

			this.velocityVelocity += gravity * deltaTime * 0.3;
			this.velocityVelocity *= 0.86 * ( 1.0 - deltaTime * 2.0 );

			this.velocity += this.velocityVelocity * 10.0 * deltaTime;
			this.velocity *= 1.0 - deltaTime * 8.0;

			this.value += this.velocity;

		}

		// calc current content

		let nearest = Math.round( this.value );

		if ( nearest != this.currentContent ) {

			this.currentContent = nearest;

			this.velocityVelocity = 0.0;

			this.emitEvent( 'changeCurrentContent', [ this.currentContent ] );

		}

		if ( this.gravitiContent != selectingMem ) {

			this.emitEvent( 'changeSelectingSection', [ this.gravitiContent ] );

		}

	}

	/*-------------------------------
		Mouse
	-------------------------------*/

	public addVelocity( delta: number ) {

		let now = new Date().getTime();
		let wheelDeltaTime = now - this.wheelTime;

		let wheelDeltaDelta = Math.abs( delta ) - Math.abs( this.wheelDeltaMem );

		this.wheelTime = now;
		this.wheelDeltaMem = delta;

		if ( wheelDeltaTime < 100 && wheelDeltaDelta < 0.0 ) {

			return;

		}

		this.velocityVelocity += delta;

	}

	/*-------------------------------
		Mobile
	-------------------------------*/

	public catch() {

		if ( this.animator.isAnimatingVariable( 'value' ) ) return;

		this.isTouching = true;

		this.touchStartPos = this.value;
		this.touchStartContent = Math.round( this.value );

		this.touchMove = 0;
		this.touchMoveDiff = 0;

	}

	public drag( delta: number ) {

		if ( ! this.isTouching ) return;

		if ( this.animator.isAnimatingVariable( 'value' ) ) return;

		let d = delta * 0.0005;

		this.touchMove -= d;
		this.touchMoveDiff -= d * 5.0;

	}

	public release( delta: number ) {

		if ( this.animator.isAnimatingVariable( 'value' ) ) return;

		if ( ! this.isTouching ) return;

		this.isTouching = false;

		this.velocity -= delta * 0.0005;


	}

	/*-------------------------------
		API
	-------------------------------*/

	public move( value: number, duration: number = 1, onFinished?: () => void ) {

		this.animator.setValue( 'value', this.value );
		this.animator.animate( 'value', value, duration, () => {

			this.velocity = 0;

			if ( onFinished ) {

				onFinished();

			}

		} );

		return false;

	}

}

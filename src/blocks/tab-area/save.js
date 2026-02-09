import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		defaultTab,
		smoothHeightTransition,
		transitionDuration,
		tabAreaId,
		gsapEnabled,
		gsapShuffleIterations,
		gsapCharDuration,
		gsapStaggerAmount,
		gsapStaggerDelay,
		gsapOnEnterDuration,
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: 'decoupled-tabs-area',
		'data-tab-area-id': tabAreaId,
		'data-default-tab': defaultTab,
		'data-smooth-height': smoothHeightTransition ? 'true' : 'false',
		'data-transition-duration': transitionDuration,
		'data-gsap-enabled': gsapEnabled ? 'true' : 'false',
		'data-gsap-shuffle-iterations': gsapShuffleIterations,
		'data-gsap-char-duration': gsapCharDuration,
		'data-gsap-stagger-amount': gsapStaggerAmount,
		'data-gsap-stagger-delay': gsapStaggerDelay,
		'data-gsap-on-enter-duration': gsapOnEnterDuration,
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}

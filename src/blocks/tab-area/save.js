import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
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
    gsapSplitChildren,
    gsapTimingMode,
    gsapSplitLines,
    gsapAnimateOnLoad,
  } = attributes;

  const blockProps = useBlockProps.save({
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
    'data-gsap-split-children': gsapSplitChildren ? 'true' : 'false',
    'data-gsap-timing-mode': gsapTimingMode,
    'data-gsap-split-lines': gsapSplitLines ? 'true' : 'false',
    'data-gsap-animate-on-load': gsapAnimateOnLoad ? 'true' : 'false',
  });

  return (
    <div {...blockProps}>
      <InnerBlocks.Content />
    </div>
  );
}

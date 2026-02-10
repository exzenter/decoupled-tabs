import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
  const { tabId, overrideTransition, transitionType, transitionDuration } =
    attributes;

  const dataAttributes = {
    'data-tab-id': tabId,
  };

  // Only add override data if transition is overridden
  if (overrideTransition && transitionType !== 'inherit') {
    dataAttributes['data-transition-type'] = transitionType;
    dataAttributes['data-transition-duration'] = transitionDuration;
  }

  const blockProps = useBlockProps.save({
    className: 'decoupled-tabs-content',
    ...dataAttributes,
    // ARIA attributes for accessibility
    role: 'tabpanel',
    id: `tab-panel-${tabId}`,
    'aria-labelledby': '', // Will be set by JavaScript on initialization
    tabIndex: -1, // Default to -1, JavaScript will set to 0 for active tab
  });

  return (
    <div {...blockProps}>
      <InnerBlocks.Content />
    </div>
  );
}

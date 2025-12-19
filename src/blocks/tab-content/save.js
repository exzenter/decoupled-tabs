import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { tabId, overrideTransition, transitionType, transitionDuration } = attributes;

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
    });

    return (
        <div {...blockProps}>
            <InnerBlocks.Content />
        </div>
    );
}

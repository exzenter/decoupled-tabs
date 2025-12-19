import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { defaultTab, transitionType, transitionDuration, tabAreaId } = attributes;

    const blockProps = useBlockProps.save({
        className: 'decoupled-tabs-area',
        'data-tab-area-id': tabAreaId,
        'data-default-tab': defaultTab,
        'data-transition-type': transitionType,
        'data-transition-duration': transitionDuration,
    });

    return (
        <div {...blockProps}>
            <InnerBlocks.Content />
        </div>
    );
}

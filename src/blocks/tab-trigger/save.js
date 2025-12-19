import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { tabTarget, tabArea, cssDefault, cssHover, cssActive, triggerId } = attributes;

    const dataAttributes = {
        'data-tab-target': tabTarget,
        'data-trigger-id': triggerId,
    };

    // Only add tab area if specified
    if (tabArea) {
        dataAttributes['data-tab-area'] = tabArea;
    }

    // Store CSS as data attributes for frontend JS to apply
    if (cssDefault) {
        dataAttributes['data-css-default'] = cssDefault;
    }
    if (cssHover) {
        dataAttributes['data-css-hover'] = cssHover;
    }
    if (cssActive) {
        dataAttributes['data-css-active'] = cssActive;
    }

    const blockProps = useBlockProps.save({
        className: 'decoupled-tabs-trigger',
        ...dataAttributes,
        role: 'button',
        tabIndex: 0,
    });

    return (
        <div {...blockProps}>
            <InnerBlocks.Content />
        </div>
    );
}

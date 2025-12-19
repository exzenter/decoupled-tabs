import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    InspectorControls,
    useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    TextareaControl,
} from '@wordpress/components';

export default function Edit({ attributes, setAttributes, clientId }) {
    const { tabTarget, tabArea, cssDefault, cssHover, cssActive, triggerId } = attributes;

    const blockProps = useBlockProps({
        className: 'decoupled-tabs-trigger-editor',
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'decoupled-tabs-trigger-content' },
        {
            templateLock: false,
            renderAppender: InnerBlocks.ButtonBlockAppender,
        }
    );

    // Generate a unique ID if not set
    if (!triggerId) {
        setAttributes({ triggerId: `trigger-${clientId.slice(0, 8)}` });
    }

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Tab Target', 'decoupled-tabs')}>
                    <TextControl
                        label={__('Target Tab ID', 'decoupled-tabs')}
                        help={__('The Tab ID to activate when this trigger is clicked.', 'decoupled-tabs')}
                        value={tabTarget}
                        onChange={(value) => setAttributes({ tabTarget: value })}
                    />
                    <TextControl
                        label={__('Tab Area ID (optional)', 'decoupled-tabs')}
                        help={__('Specify if you have multiple Tab Areas on the page.', 'decoupled-tabs')}
                        value={tabArea}
                        onChange={(value) => setAttributes({ tabArea: value })}
                    />
                </PanelBody>
                <PanelBody title={__('Custom CSS', 'decoupled-tabs')} initialOpen={false}>
                    <TextareaControl
                        label={__('Default Styles', 'decoupled-tabs')}
                        help={__('CSS properties for default state (e.g., background: #fff; padding: 10px;)', 'decoupled-tabs')}
                        value={cssDefault}
                        onChange={(value) => setAttributes({ cssDefault: value })}
                        rows={4}
                    />
                    <TextareaControl
                        label={__('Hover Styles', 'decoupled-tabs')}
                        help={__('CSS properties applied on hover', 'decoupled-tabs')}
                        value={cssHover}
                        onChange={(value) => setAttributes({ cssHover: value })}
                        rows={4}
                    />
                    <TextareaControl
                        label={__('Active Tab Styles', 'decoupled-tabs')}
                        help={__('CSS properties when this trigger\'s tab is active', 'decoupled-tabs')}
                        value={cssActive}
                        onChange={(value) => setAttributes({ cssActive: value })}
                        rows={4}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
                <div {...innerBlocksProps} />
                {!tabTarget && (
                    <div className="decoupled-tabs-trigger-notice">
                        {__('Set target tab ID in sidebar', 'decoupled-tabs')}
                    </div>
                )}
            </div>
        </>
    );
}

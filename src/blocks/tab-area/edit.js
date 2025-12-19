import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    InspectorControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    ToggleControl,
    RangeControl,
} from '@wordpress/components';

const ALLOWED_BLOCKS = ['decoupled-tabs/tab-content'];

export default function Edit({ attributes, setAttributes, clientId }) {
    const { defaultTab, smoothHeightTransition, transitionDuration, tabAreaId } = attributes;

    const blockProps = useBlockProps({
        className: 'decoupled-tabs-area-editor',
    });

    // Generate a unique ID if not set
    if (!tabAreaId) {
        setAttributes({ tabAreaId: `tab-area-${clientId.slice(0, 8)}` });
    }

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Tab Area Settings', 'decoupled-tabs')}>
                    <TextControl
                        label={__('Tab Area ID', 'decoupled-tabs')}
                        help={__('Unique identifier for this tab area. Used when you have multiple tab areas on a page.', 'decoupled-tabs')}
                        value={tabAreaId}
                        onChange={(value) => setAttributes({ tabAreaId: value })}
                    />
                    <TextControl
                        label={__('Default Active Tab ID', 'decoupled-tabs')}
                        help={__('Enter the Tab ID that should be active by default. Leave empty for the first tab.', 'decoupled-tabs')}
                        value={defaultTab}
                        onChange={(value) => setAttributes({ defaultTab: value })}
                    />
                </PanelBody>
                <PanelBody title={__('Smooth Height Transition', 'decoupled-tabs')}>
                    <ToggleControl
                        label={__('Enable Smooth Height', 'decoupled-tabs')}
                        help={__('Animate the container height when switching between tabs of different heights.', 'decoupled-tabs')}
                        checked={smoothHeightTransition}
                        onChange={(value) => setAttributes({ smoothHeightTransition: value })}
                    />
                    {smoothHeightTransition && (
                        <RangeControl
                            label={__('Duration (ms)', 'decoupled-tabs')}
                            value={transitionDuration}
                            onChange={(value) => setAttributes({ transitionDuration: value })}
                            min={0}
                            max={2000}
                            step={50}
                        />
                    )}
                </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
                <div className="decoupled-tabs-area-header">
                    <span className="decoupled-tabs-area-label">
                        {__('Tab Area', 'decoupled-tabs')}
                        {tabAreaId && <code>{tabAreaId}</code>}
                    </span>
                    <span className="decoupled-tabs-area-info">
                        {__('Add Tab Content blocks below', 'decoupled-tabs')}
                    </span>
                </div>
                <div className="decoupled-tabs-area-content">
                    <InnerBlocks
                        allowedBlocks={ALLOWED_BLOCKS}
                        template={[
                            ['decoupled-tabs/tab-content', { tabId: 'tab-1', tabLabel: 'Tab 1' }],
                            ['decoupled-tabs/tab-content', { tabId: 'tab-2', tabLabel: 'Tab 2' }],
                        ]}
                        templateLock={false}
                        renderAppender={InnerBlocks.ButtonBlockAppender}
                    />
                </div>
            </div>
        </>
    );
}

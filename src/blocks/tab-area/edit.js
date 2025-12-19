import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    InspectorControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    SelectControl,
    RangeControl,
} from '@wordpress/components';

const ALLOWED_BLOCKS = ['decoupled-tabs/tab-content'];

const TRANSITION_OPTIONS = [
    { label: __('None', 'decoupled-tabs'), value: 'none' },
    { label: __('Fade', 'decoupled-tabs'), value: 'fade' },
    { label: __('Slide Horizontal', 'decoupled-tabs'), value: 'slide-horizontal' },
    { label: __('Slide Vertical', 'decoupled-tabs'), value: 'slide-vertical' },
];

export default function Edit({ attributes, setAttributes, clientId }) {
    const { defaultTab, transitionType, transitionDuration, tabAreaId } = attributes;

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
                <PanelBody title={__('Transition Animation', 'decoupled-tabs')}>
                    <SelectControl
                        label={__('Transition Type', 'decoupled-tabs')}
                        value={transitionType}
                        options={TRANSITION_OPTIONS}
                        onChange={(value) => setAttributes({ transitionType: value })}
                    />
                    <RangeControl
                        label={__('Duration (ms)', 'decoupled-tabs')}
                        value={transitionDuration}
                        onChange={(value) => setAttributes({ transitionDuration: value })}
                        min={0}
                        max={2000}
                        step={50}
                    />
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

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
    ToggleControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

const TRANSITION_OPTIONS = [
    { label: __('Inherit from Tab Area', 'decoupled-tabs'), value: 'inherit' },
    { label: __('None', 'decoupled-tabs'), value: 'none' },
    { label: __('Fade', 'decoupled-tabs'), value: 'fade' },
    { label: __('Slide Horizontal', 'decoupled-tabs'), value: 'slide-horizontal' },
    { label: __('Slide Vertical', 'decoupled-tabs'), value: 'slide-vertical' },
];

export default function Edit({ attributes, setAttributes, clientId }) {
    const { tabId, tabLabel, overrideTransition, transitionType, transitionDuration } = attributes;
    const [isExpanded, setIsExpanded] = useState(true);

    const blockProps = useBlockProps({
        className: `decoupled-tabs-content-editor ${isExpanded ? 'is-expanded' : 'is-collapsed'}`,
    });

    // Generate a unique tab ID if not set
    if (!tabId) {
        setAttributes({ tabId: `tab-${clientId.slice(0, 8)}` });
    }

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Tab Settings', 'decoupled-tabs')}>
                    <TextControl
                        label={__('Tab ID', 'decoupled-tabs')}
                        help={__('Unique identifier for this tab. Use this ID in data-tab-target attribute on trigger elements.', 'decoupled-tabs')}
                        value={tabId}
                        onChange={(value) => setAttributes({ tabId: value.toLowerCase().replace(/\s+/g, '-') })}
                    />
                    <TextControl
                        label={__('Tab Label', 'decoupled-tabs')}
                        help={__('Display label for this tab in the editor.', 'decoupled-tabs')}
                        value={tabLabel}
                        onChange={(value) => setAttributes({ tabLabel: value })}
                    />
                </PanelBody>
                <PanelBody title={__('Transition Override', 'decoupled-tabs')} initialOpen={false}>
                    <ToggleControl
                        label={__('Override Tab Area Transition', 'decoupled-tabs')}
                        help={__('Use custom transition settings for this tab instead of inheriting from Tab Area.', 'decoupled-tabs')}
                        checked={overrideTransition}
                        onChange={(value) => setAttributes({ overrideTransition: value })}
                    />
                    {overrideTransition && (
                        <>
                            <SelectControl
                                label={__('Transition Type', 'decoupled-tabs')}
                                value={transitionType}
                                options={TRANSITION_OPTIONS.filter(opt => opt.value !== 'inherit')}
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
                        </>
                    )}
                </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
                <div
                    className="decoupled-tabs-content-header"
                    onClick={() => setIsExpanded(!isExpanded)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsExpanded(!isExpanded); }}
                >
                    <span className="decoupled-tabs-content-toggle">
                        {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="decoupled-tabs-content-label">
                        {tabLabel || __('Tab Content', 'decoupled-tabs')}
                    </span>
                    <code className="decoupled-tabs-content-id">{tabId}</code>
                    {overrideTransition && (
                        <span className="decoupled-tabs-content-override" title={__('Custom transition', 'decoupled-tabs')}>
                            ✦
                        </span>
                    )}
                </div>
                {isExpanded && (
                    <div className="decoupled-tabs-content-body">
                        <InnerBlocks
                            templateLock={false}
                            renderAppender={InnerBlocks.ButtonBlockAppender}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

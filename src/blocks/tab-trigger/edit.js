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
	ToggleControl,
} from '@wordpress/components';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		tabTarget,
		tabArea,
		isActiveOnLoad,
		triggerId,
	} = attributes;

	const blockProps = useBlockProps( {
		className: 'decoupled-tabs-trigger-editor',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	// Generate a unique ID if not set
	if ( ! triggerId ) {
		setAttributes( { triggerId: `trigger-${ clientId.slice( 0, 8 ) }` } );
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Tab Target', 'decoupled-tabs' ) }>
					<TextControl
						label={ __( 'Target Tab ID', 'decoupled-tabs' ) }
						help={ __(
							'The Tab ID to activate when this trigger is clicked.',
							'decoupled-tabs'
						) }
						value={ tabTarget }
						onChange={ ( value ) =>
							setAttributes( { tabTarget: value } )
						}
					/>
					<TextControl
						label={ __(
							'Tab Area ID (optional)',
							'decoupled-tabs'
						) }
						help={ __(
							'Specify if you have multiple Tab Areas on the page.',
							'decoupled-tabs'
						) }
						value={ tabArea }
						onChange={ ( value ) =>
							setAttributes( { tabArea: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Active on page load', 'decoupled-tabs' ) }
						help={ __(
							'Set this trigger and its tab as active when the page loads.',
							'decoupled-tabs'
						) }
						checked={ isActiveOnLoad }
						onChange={ ( value ) =>
							setAttributes( { isActiveOnLoad: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps }>
				{ ! tabTarget && (
					<div className="decoupled-tabs-trigger-notice">
						{ __(
							'Set target tab ID in sidebar',
							'decoupled-tabs'
						) }
					</div>
				) }
			</div>
		</>
	);
}

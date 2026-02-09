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
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';

const ALLOWED_BLOCKS = [ 'decoupled-tabs/tab-content' ];

export default function Edit( { attributes, setAttributes, clientId } ) {
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
	} = attributes;

	const blockProps = useBlockProps( {
		className: 'decoupled-tabs-area-editor',
	} );

	// Generate a unique ID if not set
	if ( ! tabAreaId ) {
		setAttributes( { tabAreaId: `tab-area-${ clientId.slice( 0, 8 ) }` } );
	}

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Tab Area Settings', 'decoupled-tabs' ) }
				>
					<TextControl
						label={ __( 'Tab Area ID', 'decoupled-tabs' ) }
						help={ __(
							'Unique identifier for this tab area. Used when you have multiple tab areas on a page.',
							'decoupled-tabs'
						) }
						value={ tabAreaId }
						onChange={ ( value ) =>
							setAttributes( { tabAreaId: value } )
						}
					/>
					<TextControl
						label={ __(
							'Default Active Tab ID',
							'decoupled-tabs'
						) }
						help={ __(
							'Enter the Tab ID that should be active by default. Leave empty for the first tab.',
							'decoupled-tabs'
						) }
						value={ defaultTab }
						onChange={ ( value ) =>
							setAttributes( { defaultTab: value } )
						}
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Smooth Height Transition', 'decoupled-tabs' ) }
				>
					<ToggleControl
						label={ __( 'Enable Smooth Height', 'decoupled-tabs' ) }
						help={ __(
							'Animate the container height when switching between tabs of different heights.',
							'decoupled-tabs'
						) }
						checked={ smoothHeightTransition }
						onChange={ ( value ) =>
							setAttributes( { smoothHeightTransition: value } )
						}
					/>
					{ smoothHeightTransition && (
						<RangeControl
							label={ __( 'Duration (ms)', 'decoupled-tabs' ) }
							value={ transitionDuration }
							onChange={ ( value ) =>
								setAttributes( { transitionDuration: value } )
							}
							min={ 0 }
							max={ 2000 }
							step={ 50 }
						/>
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'GSAP Animations', 'decoupled-tabs' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Enable GSAP Animations', 'decoupled-tabs' ) }
						help={ __(
							'Enable character-based animations with shuffle effects during tab transitions.',
							'decoupled-tabs'
						) }
						checked={ gsapEnabled }
						onChange={ ( value ) =>
							setAttributes( { gsapEnabled: value } )
						}
					/>
					{ gsapEnabled && (
						<>
							<RangeControl
								label={ __( 'Shuffle Iterations', 'decoupled-tabs' ) }
								help={ __(
									'Number of random character iterations before revealing final content.',
									'decoupled-tabs'
								) }
								value={ gsapShuffleIterations }
								onChange={ ( value ) =>
									setAttributes( { gsapShuffleIterations: value } )
								}
								min={ 1 }
								max={ 10 }
								step={ 1 }
							/>
							<NumberControl
								label={ __( 'Character Duration (s)', 'decoupled-tabs' ) }
								help={ __(
									'Duration per character animation in seconds.',
									'decoupled-tabs'
								) }
								value={ gsapCharDuration }
								onChange={ ( value ) =>
									setAttributes( { gsapCharDuration: parseFloat( value ) } )
								}
								min={ 0.01 }
								max={ 1 }
								step={ 0.01 }
							/>
							<NumberControl
								label={ __( 'Stagger Amount (s)', 'decoupled-tabs' ) }
								help={ __(
									'Total stagger duration across all characters in seconds.',
									'decoupled-tabs'
								) }
								value={ gsapStaggerAmount }
								onChange={ ( value ) =>
									setAttributes( { gsapStaggerAmount: parseFloat( value ) } )
								}
								min={ 0 }
								max={ 2 }
								step={ 0.05 }
							/>
							<NumberControl
								label={ __( 'Stagger Delay (s)', 'decoupled-tabs' ) }
								help={ __(
									'Delay between character animations in seconds.',
									'decoupled-tabs'
								) }
								value={ gsapStaggerDelay }
								onChange={ ( value ) =>
									setAttributes( { gsapStaggerDelay: parseFloat( value ) } )
								}
								min={ 0 }
								max={ 0.5 }
								step={ 0.01 }
							/>
							<NumberControl
								label={ __( 'OnEnter Duration (s)', 'decoupled-tabs' ) }
								help={ __(
									'Duration for fade-out animation in seconds.',
									'decoupled-tabs'
								) }
								value={ gsapOnEnterDuration }
								onChange={ ( value ) =>
									setAttributes( { gsapOnEnterDuration: parseFloat( value ) } )
								}
								min={ 0.01 }
								max={ 1 }
								step={ 0.01 }
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<div className="decoupled-tabs-area-header">
					<span className="decoupled-tabs-area-label">
						{ __( 'Tab Area', 'decoupled-tabs' ) }
						{ tabAreaId && <code>{ tabAreaId }</code> }
					</span>
					<span className="decoupled-tabs-area-info">
						{ __(
							'Add Tab Content blocks below',
							'decoupled-tabs'
						) }
					</span>
				</div>
				<div className="decoupled-tabs-area-content">
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						template={ [
							[
								'decoupled-tabs/tab-content',
								{ tabId: 'tab-1', tabLabel: 'Tab 1' },
							],
							[
								'decoupled-tabs/tab-content',
								{ tabId: 'tab-2', tabLabel: 'Tab 2' },
							],
						] }
						templateLock={ false }
						renderAppender={ InnerBlocks.ButtonBlockAppender }
					/>
				</div>
			</div>
		</>
	);
}

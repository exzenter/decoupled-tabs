import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		tabTarget,
		tabArea,
		isActiveOnLoad,
		triggerId,
	} = attributes;

	const dataAttributes = {
		'data-tab-target': tabTarget,
		'data-trigger-id': triggerId,
	};

	// Only add tab area if specified
	if ( tabArea ) {
		dataAttributes[ 'data-tab-area' ] = tabArea;
	}

	// Add active on load flag
	if ( isActiveOnLoad ) {
		dataAttributes[ 'data-active-on-load' ] = 'true';
	}

	const blockProps = useBlockProps.save( {
		className: 'decoupled-tabs-trigger',
		...dataAttributes,
		role: 'tab',
		id: `tab-trigger-${ triggerId }`,
		'aria-controls': `tab-panel-${ tabTarget }`,
		'aria-selected': isActiveOnLoad ? 'true' : 'false',
		tabIndex: 0,
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}

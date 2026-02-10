/**
 * Decoupled Tabs Frontend
 * Handles tab switching with smooth height transitions
 */

import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Register GSAP plugins
gsap.registerPlugin( SplitText );

// Make GSAP available globally for the class
window.gsap = gsap;
window.SplitText = SplitText;

( function () {
	'use strict';

	class DecoupledTabs {
		constructor() {
			this.tabAreas = new Map();
			this.init();
		}

		init() {
			// Find all tab areas
			document
				.querySelectorAll( '.decoupled-tabs-area' )
				.forEach( ( area ) => {
					this.initTabArea( area );
				} );

			// Find all tab triggers
			document
				.querySelectorAll( '[data-tab-target]' )
				.forEach( ( trigger ) => {
					this.initTrigger( trigger );
				} );

			// Setup ARIA attributes and relationships
			this.setupARIA();

			// Setup keyboard navigation for all triggers
			document
				.querySelectorAll( '[data-tab-target]' )
				.forEach( ( trigger ) => {
					this.setupKeyboardNavigation( trigger );
				} );

			// Resolve multiple active tabs with priority: hash > trigger > default > first
			this.resolveMultipleActiveTabs();

			// Handle URL hash on load (takes highest priority)
			this.handleHashChange();
			window.addEventListener( 'hashchange', () =>
				this.handleHashChange()
			);
		}

		setupARIA() {
			// Initialize ARIA relationships for all triggers and content
			const triggers = document.querySelectorAll( '[data-tab-target]' );
			const tabContents = document.querySelectorAll(
				'.decoupled-tabs-content'
			);

			// Process each trigger
			triggers.forEach( ( trigger ) => {
				const triggerId = trigger.dataset.triggerId;
				const tabTarget = trigger.dataset.tabTarget;

				// Handle missing trigger ID - auto-generate fallback
				if ( ! triggerId || ! trigger.id ) {
					const autoId = this.generateFallbackId(
						'trigger',
						trigger
					);
					trigger.id = autoId;
					trigger.dataset.triggerId = autoId.replace(
						'tab-trigger-',
						''
					);
					// eslint-disable-next-line no-console
					console.warn(
						`Decoupled Tabs: Auto-generated ID for trigger: ${ autoId }`
					);
				}

				// Ensure aria-controls is set
				if ( ! trigger.getAttribute( 'aria-controls' ) ) {
					trigger.setAttribute(
						'aria-controls',
						`tab-panel-${ tabTarget }`
					);
				}

				// Set initial aria-selected state based on active class
				const isActive = trigger.classList.contains( 'is-active' );
				trigger.setAttribute(
					'aria-selected',
					isActive ? 'true' : 'false'
				);

				// Ensure role="tab" is set
				if ( ! trigger.getAttribute( 'role' ) ) {
					trigger.setAttribute( 'role', 'tab' );
				}

				// Ensure tabindex is set
				if ( ! trigger.hasAttribute( 'tabindex' ) ) {
					trigger.setAttribute( 'tabindex', '0' );
				}
			} );

			// Process each tab content
			tabContents.forEach( ( content ) => {
				const tabId = content.dataset.tabId;

				// Handle missing tab ID - auto-generate fallback
				if ( ! tabId || ! content.id ) {
					const autoId = this.generateFallbackId( 'tab', content );
					content.id = autoId;
					content.dataset.tabId = autoId.replace( 'tab-panel-', '' );
					// eslint-disable-next-line no-console
					console.warn(
						`Decoupled Tabs: Auto-generated ID for tab content: ${ autoId }`
					);
				}

				// Find the associated trigger for this content
				const associatedTrigger = Array.from( triggers ).find(
					( trigger ) => trigger.dataset.tabTarget === tabId
				);

				// Set aria-labelledby to reference the trigger
				if ( associatedTrigger && associatedTrigger.id ) {
					content.setAttribute(
						'aria-labelledby',
						associatedTrigger.id
					);
				} else {
					// Orphaned content - no trigger references it
					// eslint-disable-next-line no-console
					console.info(
						`Decoupled Tabs: Tab content "${ tabId }" has no associated trigger.`
					);
					content.setAttribute( 'tabindex', '-1' );
				}

				// Set initial tabindex based on active state
				const isActive = content.classList.contains( 'is-active' );
				content.setAttribute( 'tabindex', isActive ? '0' : '-1' );

				// Ensure role="tabpanel" is set
				if ( ! content.getAttribute( 'role' ) ) {
					content.setAttribute( 'role', 'tabpanel' );
				}
			} );

			// Check for orphaned triggers (triggers without matching content)
			triggers.forEach( ( trigger ) => {
				const tabTarget = trigger.dataset.tabTarget;
				const hasMatchingContent = Array.from( tabContents ).some(
					( content ) => content.dataset.tabId === tabTarget
				);

				if ( ! hasMatchingContent ) {
					// eslint-disable-next-line no-console
					console.warn(
						`Decoupled Tabs: Trigger references non-existent tab: ${ tabTarget }`
					);
					trigger.classList.add( 'disabled' );
					trigger.setAttribute( 'aria-disabled', 'true' );
					// Remove click handler by cloning and replacing
					const newTrigger = trigger.cloneNode( true );
					trigger.parentNode.replaceChild( newTrigger, trigger );
				}
			} );
		}

		generateFallbackId( type, element ) {
			// Generate a unique fallback ID using timestamp and random number
			const timestamp = Date.now();
			const random = Math.floor( Math.random() * 1000 );
			const index = Array.from(
				document.querySelectorAll(
					`[data-${ type === 'trigger' ? 'trigger' : 'tab' }-id]`
				)
			).indexOf( element );
			return `tab-${
				type === 'trigger' ? 'trigger' : 'panel'
			}-auto-${ timestamp }-${ random }-${ index }`;
		}

		resolveMultipleActiveTabs() {
			// Handle multiple active tabs with priority: hash > trigger > default > first
			// Process each tab area independently
			this.tabAreas.forEach( ( tabAreaData, areaId ) => {
				const { tabs, element } = tabAreaData;

				// Find all tabs marked as active
				const activeTabs = tabs.filter( ( tab ) =>
					tab.classList.contains( 'is-active' )
				);

				if ( activeTabs.length > 1 ) {
					// eslint-disable-next-line no-console
					console.warn(
						`Decoupled Tabs: Multiple active tabs detected in area "${ areaId }". Resolving with priority: hash > trigger > default > first.`
					);

					let selectedTab = null;

					// Priority 1: URL hash
					const hash = window.location.hash.slice( 1 );
					if ( hash ) {
						selectedTab = tabs.find(
							( tab ) => tab.dataset.tabId === hash
						);
					}

					// Priority 2: Active trigger (data-active-on-load="true")
					if ( ! selectedTab ) {
						const activeTrigger = document.querySelector(
							`[data-tab-target][data-active-on-load="true"][data-tab-area="${ areaId }"]`
						);
						if ( activeTrigger ) {
							const targetId = activeTrigger.dataset.tabTarget;
							selectedTab = tabs.find(
								( tab ) => tab.dataset.tabId === targetId
							);
						}
					}

					// Priority 3: Default tab from tab area
					if ( ! selectedTab ) {
						const defaultTab = element.dataset.defaultTab;
						if ( defaultTab ) {
							selectedTab = tabs.find(
								( tab ) => tab.dataset.tabId === defaultTab
							);
						}
					}

					// Priority 4: First tab
					if ( ! selectedTab && tabs.length > 0 ) {
						selectedTab = tabs[ 0 ];
					}

					// Deactivate all tabs first
					tabs.forEach( ( tab ) => {
						tab.classList.remove( 'is-active' );
						tab.setAttribute( 'tabindex', '-1' );
					} );

					// Activate only the selected tab
					if ( selectedTab ) {
						selectedTab.classList.add( 'is-active' );
						selectedTab.setAttribute( 'tabindex', '0' );
						tabAreaData.currentTab = selectedTab;

						// Update trigger states
						this.updateTriggerStates(
							selectedTab.dataset.tabId,
							areaId
						);
					}
				} else if ( activeTabs.length === 0 && tabs.length > 0 ) {
					// No active tabs - activate first one
					const firstTab = tabs[ 0 ];
					firstTab.classList.add( 'is-active' );
					firstTab.setAttribute( 'tabindex', '0' );
					tabAreaData.currentTab = firstTab;
					this.updateTriggerStates( firstTab.dataset.tabId, areaId );
				}
			} );

			// Also handle triggers marked as active on load
			const activeOnLoadTriggers = document.querySelectorAll(
				'[data-tab-target][data-active-on-load="true"]'
			);
			activeOnLoadTriggers.forEach( ( trigger ) => {
				const tabId = trigger.dataset.tabTarget;
				const tabAreaId = trigger.dataset.tabArea || null;

				// Apply active state to this trigger
				trigger.classList.add( 'is-active' );
				trigger.setAttribute( 'aria-selected', 'true' );
				this.applyTriggerCSS( trigger, 'active' );

				// Switch to the associated tab (this will respect the priority resolution)
				this.switchToTab( tabId, tabAreaId, null );
			} );
		}

		getTriggersForArea( tabAreaId ) {
			// Get all triggers for a specific tab area
			// If tabAreaId is null, get all triggers without a specific area assignment
			const allTriggers = Array.from(
				document.querySelectorAll( '[data-tab-target]' )
			);

			if ( ! tabAreaId ) {
				// Return triggers that don't specify a tab area
				return allTriggers.filter(
					( trigger ) => ! trigger.dataset.tabArea
				);
			}

			// Return triggers that target this specific area
			return allTriggers.filter(
				( trigger ) => trigger.dataset.tabArea === tabAreaId
			);
		}

		setupKeyboardNavigation( trigger ) {
			// Setup keyboard navigation for a single trigger
			trigger.addEventListener( 'keydown', ( e ) => {
				const tabAreaId = trigger.dataset.tabArea || null;

				// If this trigger is disabled, ignore keyboard events
				if (
					trigger.classList.contains( 'disabled' ) ||
					trigger.getAttribute( 'aria-disabled' ) === 'true'
				) {
					return;
				}
				const triggers = this.getTriggersForArea( tabAreaId );
				const currentIndex = triggers.indexOf( trigger );
				let targetTrigger = null;

				switch ( e.key ) {
					case 'ArrowRight':
						// Move to next trigger, wrap around to first
						e.preventDefault();
						targetTrigger =
							triggers[ ( currentIndex + 1 ) % triggers.length ];
						break;

					case 'ArrowLeft':
						// Move to previous trigger, wrap around to last
						e.preventDefault();
						targetTrigger =
							triggers[
								( currentIndex - 1 + triggers.length ) %
									triggers.length
							];
						break;

					case 'Home':
						// Move to first trigger
						e.preventDefault();
						targetTrigger = triggers[ 0 ];
						break;

					case 'End':
						// Move to last trigger
						e.preventDefault();
						targetTrigger = triggers[ triggers.length - 1 ];
						break;

					case 'Enter':
					case ' ':
						// Activate the current tab
						e.preventDefault();
						const targetId = trigger.dataset.tabTarget;
						const targetTabArea = trigger.dataset.tabArea;
						this.switchToTab( targetId, targetTabArea, trigger );
						return;
				}

				// If we have a target trigger, focus it and activate its tab
				if ( targetTrigger ) {
					targetTrigger.focus();
					const targetId = targetTrigger.dataset.tabTarget;
					const targetTabArea = targetTrigger.dataset.tabArea;
					this.switchToTab( targetId, targetTabArea, targetTrigger );
				}
			} );
		}

		handleActiveOnLoadTriggers() {
			const activeOnLoadTriggers = document.querySelectorAll(
				'[data-tab-target][data-active-on-load="true"]'
			);
			activeOnLoadTriggers.forEach( ( trigger ) => {
				const tabId = trigger.dataset.tabTarget;
				const tabAreaId = trigger.dataset.tabArea || null;

				// Immediately apply active state to this trigger
				trigger.classList.add( 'is-active' );
				trigger.setAttribute( 'aria-selected', 'true' );
				this.applyTriggerCSS( trigger, 'active' );

				// Switch to the associated tab
				this.switchToTab( tabId, tabAreaId, null );
			} );
		}

		initTabArea( area ) {
			const areaId = area.dataset.tabAreaId;
			const defaultTab = area.dataset.defaultTab;
			const smoothHeight = area.dataset.smoothHeight === 'true';
			const transitionDuration =
				parseInt( area.dataset.transitionDuration, 10 ) || 300;

			const tabs = Array.from(
				area.querySelectorAll( '.decoupled-tabs-content' )
			);

			// Read GSAP configuration from data attributes
			// Note: We don't check GSAP availability here - we'll check at animation time
			// This allows GSAP to load asynchronously without blocking initialization
			const gsapEnabled = area.dataset.gsapEnabled === 'true';
			const gsapSplitChildren = area.dataset.gsapSplitChildren !== 'false'; // Default true
			const gsapSplitLines = area.dataset.gsapSplitLines === 'true'; // Default false
			const gsapAnimateOnLoad = area.dataset.gsapAnimateOnLoad === 'true'; // Default false
			const gsapTimingMode = area.dataset.gsapTimingMode || 'same-duration';

			// Parse and validate GSAP configuration parameters
			// Clamp values to valid ranges with fallback to defaults
			const gsapConfig = {
				shuffleIterations: Math.max(
					1,
					Math.min(
						10,
						parseInt( area.dataset.gsapShuffleIterations, 10 ) || 2
					)
				),
				charDuration: Math.max(
					0.01,
					Math.min(
						1,
						parseFloat( area.dataset.gsapCharDuration ) || 0.02
					)
				),
				staggerAmount: Math.max(
					0,
					Math.min(
						2,
						parseFloat( area.dataset.gsapStaggerAmount ) || 0.25
					)
				),
				staggerDelay: Math.max(
					0,
					Math.min(
						0.5,
						parseFloat( area.dataset.gsapStaggerDelay ) || 0.03
					)
				),
				onEnterDuration: Math.max(
					0.01,
					Math.min(
						1,
						parseFloat( area.dataset.gsapOnEnterDuration ) || 0.02
					)
				),
				splitChildren: gsapSplitChildren,
				splitLines: gsapSplitLines,
				timingMode: gsapTimingMode,
			};

			this.tabAreas.set( areaId, {
				element: area,
				tabs,
				smoothHeight,
				transitionDuration,
				currentTab: null,
				isTransitioning: false,
				gsapEnabled,
				gsapAnimateOnLoad,
				gsapConfig,
			} );

			// Set initial active tab
			let activeTab = null;
			if ( defaultTab ) {
				activeTab = tabs.find(
					( tab ) => tab.dataset.tabId === defaultTab
				);
			}
			if ( ! activeTab && tabs.length > 0 ) {
				activeTab = tabs[ 0 ];
			}

			if ( activeTab ) {
				// Get the tab area data to check animate on load setting
				const tabAreaData = this.tabAreas.get( areaId );
				const shouldAnimate = tabAreaData && tabAreaData.gsapEnabled && tabAreaData.gsapAnimateOnLoad;
				
				// eslint-disable-next-line no-console
				console.log( '[DEBUG] initTabArea - setting initial active tab:', {
					areaId,
					activeTabId: activeTab.dataset.tabId,
					gsapEnabled: tabAreaData.gsapEnabled,
					gsapAnimateOnLoad: tabAreaData.gsapAnimateOnLoad,
					shouldAnimate,
					immediateMode: ! shouldAnimate,
				} );
				
				// If animate on load is enabled, don't use immediate mode
				this.activateTab( activeTab, ! shouldAnimate, tabAreaData );
			}
		}

		initTrigger( trigger ) {
			// Apply custom default CSS
			this.applyTriggerCSS( trigger, 'default' );

			trigger.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				const targetId = trigger.dataset.tabTarget;
				const targetTabArea = trigger.dataset.tabArea; // Optional: specify which tab area

				this.switchToTab( targetId, targetTabArea, trigger );
			} );

			// Add tabindex for keyboard accessibility if not present
			if ( ! trigger.hasAttribute( 'tabindex' ) ) {
				trigger.setAttribute( 'tabindex', '0' );
			}

			// Hover events for custom CSS
			trigger.addEventListener( 'mouseenter', () => {
				if ( ! trigger.classList.contains( 'is-active' ) ) {
					this.applyTriggerCSS( trigger, 'hover' );
				}
			} );

			trigger.addEventListener( 'mouseleave', () => {
				if ( ! trigger.classList.contains( 'is-active' ) ) {
					this.applyTriggerCSS( trigger, 'default' );
				}
			} );
		}

		applyTriggerCSS( trigger, state ) {
			const cssDefault = trigger.dataset.cssDefault || '';
			const cssHover = trigger.dataset.cssHover || '';
			const cssActive = trigger.dataset.cssActive || '';

			// Clear inline styles first (to allow proper state management)
			this.clearTriggerInlineStyles( trigger );

			let cssToApply = '';
			switch ( state ) {
				case 'hover':
					cssToApply = cssHover || cssDefault;
					break;
				case 'active':
					cssToApply = cssActive || cssDefault;
					break;
				default:
					cssToApply = cssDefault;
			}

			if ( cssToApply ) {
				this.applyInlineStyles( trigger, cssToApply );
			}
		}

		applyInlineStyles( element, cssString ) {
			// Parse CSS string like "background: red; padding: 10px;" and apply
			const declarations = cssString
				.split( ';' )
				.filter( ( d ) => d.trim() );
			declarations.forEach( ( declaration ) => {
				const [ property, value ] = declaration
					.split( ':' )
					.map( ( s ) => s.trim() );
				if ( property && value ) {
					// Convert CSS property to camelCase for style object
					const camelProperty = property.replace(
						/-([a-z])/g,
						( g ) => g[ 1 ].toUpperCase()
					);
					element.style[ camelProperty ] = value;
				}
			} );
		}

		clearTriggerInlineStyles( trigger ) {
			// Collect all CSS properties from default, hover, and active states
			const allCss = [
				trigger.dataset.cssDefault || '',
				trigger.dataset.cssHover || '',
				trigger.dataset.cssActive || '',
			].join( ';' );

			const cssProps = allCss
				.split( ';' )
				.filter( ( d ) => d.includes( ':' ) )
				.map( ( d ) => d.split( ':' )[ 0 ].trim() );

			// Remove duplicates and clear those styles
			[ ...new Set( cssProps ) ].forEach( ( prop ) => {
				if ( prop ) {
					const camelProperty = prop.replace( /-([a-z])/g, ( g ) =>
						g[ 1 ].toUpperCase()
					);
					trigger.style[ camelProperty ] = '';
				}
			} );
		}

		switchToTab( tabId, tabAreaId = null, trigger = null ) {
			// Find the target tab
			let targetTab = null;
			let tabArea = null;
			let foundAreaId = tabAreaId;

			if ( tabAreaId ) {
				// Look in specific tab area
				tabArea = this.tabAreas.get( tabAreaId );
				if ( tabArea ) {
					targetTab = tabArea.tabs.find(
						( tab ) => tab.dataset.tabId === tabId
					);
				}
			} else {
				// Search all tab areas
				for ( const [ areaId, area ] of this.tabAreas ) {
					const found = area.tabs.find(
						( tab ) => tab.dataset.tabId === tabId
					);
					if ( found ) {
						targetTab = found;
						tabArea = area;
						foundAreaId = areaId;
						break;
					}
				}
			}

			if ( ! targetTab || ! tabArea ) {
				// eslint-disable-next-line no-console
				console.warn(
					`Decoupled Tabs: Tab with ID "${ tabId }" not found.`
				);
				return;
			}

			if ( tabArea.isTransitioning ) {
				return; // Prevent rapid switching during transition
			}

			// Update trigger active states - pass the found area ID
			this.updateTriggerStates( tabId, foundAreaId );

			// Perform the switch
			this.activateTab( targetTab, false, tabArea );

			// Update URL hash
			if ( trigger ) {
				window.history.replaceState( null, '', `#${ tabId }` );
			}
		}

		activateTab( tab, immediate = false, tabAreaData = null ) {
			// Find the tab area if not provided
			if ( ! tabAreaData ) {
				const area = tab.closest( '.decoupled-tabs-area' );
				const areaId = area?.dataset.tabAreaId;
				tabAreaData = this.tabAreas.get( areaId );
			}

			if ( ! tabAreaData ) {
				return;
			}

			const {
				element,
				tabs,
				currentTab,
				smoothHeight,
				transitionDuration,
				gsapEnabled,
			} = tabAreaData;
			const duration = immediate ? 0 : transitionDuration;

			// eslint-disable-next-line no-console
			console.log( '[DEBUG] activateTab called:', {
				tabId: tab.dataset.tabId,
				immediate,
				gsapEnabled,
				currentTab: currentTab?.dataset.tabId || 'none',
				gsapAnimateOnLoad: tabAreaData.gsapAnimateOnLoad,
			} );

			if ( currentTab === tab ) {
				return; // Already active
			}

			// Handle rapid tab switching: kill any in-progress animations
			if ( tabAreaData.isTransitioning && gsapEnabled ) {
				// Kill animations on all tabs in this area to prevent queue buildup
				tabs.forEach( ( t ) => {
					if ( t.currentTween ) {
						t.currentTween.kill();
						t.currentTween = null;
					}
					this.resetElement( t );
				} );
			}

			// Mark as transitioning
			tabAreaData.isTransitioning = true;

			// Get the tab area ID for updating trigger states
			const areaId = element.dataset.tabAreaId;
			const activeTabId = tab.dataset.tabId;

			// Update ARIA states on triggers when tab changes
			this.updateTriggerStates( activeTabId, areaId );

			// Check if GSAP animations should be executed
			// Verify GSAP availability at animation time (not initialization time)
			const gsapAvailable =
				typeof gsap !== 'undefined' &&
				typeof SplitText !== 'undefined';

			// eslint-disable-next-line no-console
			console.log( '[DEBUG] Animation decision:', {
				gsapEnabled,
				gsapAvailable,
				immediate,
				smoothHeight,
				hasCurrentTab: !! currentTab,
			} );

			if ( gsapEnabled && ! gsapAvailable && ! immediate ) {
				// Log warning only once per tab area
				if ( ! tabAreaData.gsapWarningLogged ) {
					// eslint-disable-next-line no-console
					console.warn(
						'Decoupled Tabs: GSAP or SplitText not available, falling back to standard transitions'
					);
					tabAreaData.gsapWarningLogged = true;
				}
			}

			if (
				gsapEnabled &&
				gsapAvailable &&
				! immediate
			) {
				// eslint-disable-next-line no-console
				console.log( '[DEBUG] Using GSAP animation path' );
				if ( currentTab ) {
					// Normal tab switch with both fade out and reveal
					this.executeGSAPTransition( currentTab, tab, tabAreaData );
				} else {
					// Initial load with animate on load enabled - only play reveal animation
					this.executeInitialGSAPAnimation( tab, tabAreaData );
				}
			} else if ( smoothHeight && ! immediate && currentTab ) {
				// eslint-disable-next-line no-console
				console.log( '[DEBUG] Using smooth height transition path' );
				// Smooth height transition
				this.animateHeightTransition(
					element,
					currentTab,
					tab,
					duration,
					tabs,
					tabAreaData
				);
			} else {
				// eslint-disable-next-line no-console
				console.log( '[DEBUG] Using instant switch path - resetting all tabs' );
				// Instant switch - rely on CSS classes for visibility
				// Ensure text is in normal state (not split) for immediate display
				tabs.forEach( ( t ) => {
					// eslint-disable-next-line no-console
					console.log( '[DEBUG] Processing tab:', {
						tabId: t.dataset.tabId,
						isActiveTab: t === tab,
						hasTextSplitter: !! t.textSplitter,
						hasTextSplitters: !! ( t.textSplitters && t.textSplitters.length ),
					} );
					
					if ( t !== tab ) {
						t.classList.remove( 'is-active' );
						t.setAttribute( 'tabindex', '-1' ); // Remove from tab order
					}
					// Reset any split text to ensure proper display
					this.resetElement( t );
				} );

				tab.classList.add( 'is-active' );
				tab.setAttribute( 'tabindex', '0' ); // Add to tab order

				// eslint-disable-next-line no-console
				console.log( '[DEBUG] Tab activated, checking final state:', {
					tabId: tab.dataset.tabId,
					innerHTML: tab.innerHTML.substring( 0, 200 ),
					hasTextSplitter: !! tab.textSplitter,
					hasTextSplitters: !! ( tab.textSplitters && tab.textSplitters.length ),
				} );

				tabAreaData.currentTab = tab;
				tabAreaData.isTransitioning = false;
			}
		}

		animateHeightTransition(
			areaElement,
			fromTab,
			toTab,
			duration,
			allTabs,
			tabAreaData
		) {
			// Get current height
			const startHeight = areaElement.offsetHeight;

			// Temporarily set position static on target tab to measure its height accurately
			const originalPosition = toTab.style.position;
			toTab.style.position = 'static';

			// Hide all tabs except the target, then measure target height
			allTabs.forEach( ( t ) => {
				if ( t !== toTab ) {
					t.classList.remove( 'is-active' );
					t.setAttribute( 'tabindex', '-1' ); // Remove from tab order
				}
			} );

			// Show target tab to measure its height
			toTab.classList.add( 'is-active' );
			toTab.setAttribute( 'tabindex', '0' ); // Add to tab order

			// Measure target height
			const endHeight = areaElement.offsetHeight;

			// Restore original position
			toTab.style.position = originalPosition;

			// Set starting height explicitly
			areaElement.style.height = `${ startHeight }px`;
			areaElement.style.overflow = 'hidden';
			areaElement.style.transition = `height ${ duration }ms ease-in-out`;

			// Force reflow
			void areaElement.offsetHeight;

			// Animate to target height
			areaElement.style.height = `${ endHeight }px`;

			// Update current tab reference
			tabAreaData.currentTab = toTab;

			// Clean up after transition
			const cleanup = () => {
				areaElement.style.height = '';
				areaElement.style.overflow = '';
				areaElement.style.transition = '';
				tabAreaData.isTransitioning = false;
				areaElement.removeEventListener( 'transitionend', cleanup );
			};

			areaElement.addEventListener( 'transitionend', cleanup );

			// Fallback cleanup in case transitionend doesn't fire
			setTimeout( () => {
				if ( tabAreaData.isTransitioning ) {
					cleanup();
				}
			}, duration + 50 );
		}

		updateTriggerStates( activeTabId, tabAreaId = null ) {
			document
				.querySelectorAll( '[data-tab-target]' )
				.forEach( ( trigger ) => {
					const triggerTabArea = trigger.dataset.tabArea;
					const triggerTabId = trigger.dataset.tabTarget;

					// If tab area is specified, only update triggers for that area
					if (
						tabAreaId &&
						triggerTabArea &&
						triggerTabArea !== tabAreaId
					) {
						return;
					}

					if ( triggerTabId === activeTabId ) {
						trigger.classList.add( 'is-active' );
						trigger.setAttribute( 'aria-selected', 'true' );
						// Apply active CSS
						this.applyTriggerCSS( trigger, 'active' );
					} else {
						trigger.classList.remove( 'is-active' );
						trigger.setAttribute( 'aria-selected', 'false' );
						// Apply default CSS
						this.applyTriggerCSS( trigger, 'default' );
					}
				} );
		}

		handleHashChange() {
			const hash = window.location.hash.slice( 1 );
			if ( hash ) {
				this.switchToTab( hash );
			}
		}

		/**
		 * Execute initial GSAP animation on page load
		 * Only plays the reveal (onLeave) animation, not the fade out
		 * @param {HTMLElement} tab - The tab content element to animate
		 * @param {Object} tabAreaData - Tab area configuration data
		 */
		executeInitialGSAPAnimation( tab, tabAreaData ) {
			const { gsapConfig, tabs } = tabAreaData;

			// Ensure clean state
			if ( tab.currentTween ) {
				tab.currentTween.kill();
				tab.currentTween = null;
			}
			this.resetElement( tab );

			// Make the tab visible
			tab.classList.add( 'is-active' );
			tab.setAttribute( 'tabindex', '0' );

			// Execute only the reveal animation
			const onLeaveSuccess = this.gsapOnLeave( tab, gsapConfig, () => {
				// Animation complete
				tabAreaData.currentTab = tab;
				tabAreaData.isTransitioning = false;
			} );

			// If animation failed, fall back to standard display
			if ( ! onLeaveSuccess ) {
				tabs.forEach( ( t ) => {
					if ( t !== tab ) {
						t.classList.remove( 'is-active' );
						t.setAttribute( 'tabindex', '-1' );
					}
				} );
				tabAreaData.currentTab = tab;
				tabAreaData.isTransitioning = false;
			}
		}

		/**
		 * Execute GSAP animation sequence for tab transition
		 * Orchestrates onEnter (fade out) and onLeave (shuffle reveal) animations
		 * @param {HTMLElement} fromTab - The outgoing tab content element
		 * @param {HTMLElement} toTab - The incoming tab content element
		 * @param {Object} tabAreaData - Tab area configuration data
		 */
		executeGSAPTransition( fromTab, toTab, tabAreaData ) {
			const { gsapConfig, tabs } = tabAreaData;

			// Ensure clean state before starting new animations
			// Kill any existing animations and reset both tabs
			if ( fromTab.currentTween ) {
				fromTab.currentTween.kill();
				fromTab.currentTween = null;
			}
			if ( toTab.currentTween ) {
				toTab.currentTween.kill();
				toTab.currentTween = null;
			}
			this.resetElement( fromTab );
			this.resetElement( toTab );

			// Keep the incoming tab hidden (display: none) until animation starts
			// This prevents layout shift during the fade-out of the old tab
			toTab.setAttribute( 'tabindex', '0' );

			// Execute onEnter animation on outgoing tab
			const onEnterSuccess = this.gsapOnEnter( fromTab, gsapConfig, () => {
				// onEnter complete, hide the outgoing tab
				fromTab.classList.remove( 'is-active' );
				fromTab.setAttribute( 'tabindex', '-1' );

				// Now make the incoming tab visible and execute onLeave animation
				toTab.classList.add( 'is-active' );
				
				// Now execute onLeave animation on incoming tab
				const onLeaveSuccess = this.gsapOnLeave( toTab, gsapConfig, () => {
					// Both animations complete, now complete the tab switch
					this.completeTabSwitch( fromTab, toTab, tabs, tabAreaData );
				} );

				// If onLeave failed, fall back to standard tab switch
				if ( ! onLeaveSuccess ) {
					this.standardTabSwitch( fromTab, toTab, tabs, tabAreaData );
				}
			} );

			// If onEnter failed, fall back to standard tab switch immediately
			if ( ! onEnterSuccess ) {
				this.standardTabSwitch( fromTab, toTab, tabs, tabAreaData );
			}
		}

		/**
		 * Complete the tab switch by updating visibility classes
		 * Optionally applies smooth height transition if enabled
		 * @param {HTMLElement} fromTab - The outgoing tab content element
		 * @param {HTMLElement} toTab - The incoming tab content element
		 * @param {Array} tabs - All tab content elements in the area
		 * @param {Object} tabAreaData - Tab area configuration data
		 */
		completeTabSwitch( fromTab, toTab, tabs, tabAreaData ) {
			const { smoothHeight, transitionDuration, element } = tabAreaData;

			// Check if smooth height transition should be applied
			// Smooth height works independently of GSAP text animations
			if ( smoothHeight ) {
				// Apply smooth height transition along with tab switch
				this.animateHeightTransition(
					element,
					fromTab,
					toTab,
					transitionDuration,
					tabs,
					tabAreaData
				);
			} else {
				// Instant switch - rely on CSS classes for visibility
				tabs.forEach( ( t ) => {
					if ( t !== toTab ) {
						t.classList.remove( 'is-active' );
						t.setAttribute( 'tabindex', '-1' );
					}
				} );

				toTab.classList.add( 'is-active' );
				toTab.setAttribute( 'tabindex', '0' );

				// Update current tab reference
				tabAreaData.currentTab = toTab;

				// Mark transition as complete
				tabAreaData.isTransitioning = false;
			}
		}

		/**
		 * Perform standard tab switch without animations
		 * Used as fallback when GSAP animations fail or are unavailable
		 * @param {HTMLElement} fromTab - The outgoing tab content element
		 * @param {HTMLElement} toTab - The incoming tab content element
		 * @param {Array} tabs - All tab content elements in the area
		 * @param {Object} tabAreaData - Tab area configuration data
		 */
		standardTabSwitch( fromTab, toTab, tabs, tabAreaData ) {
			// Clean up any partial animation state
			if ( fromTab ) {
				this.resetElement( fromTab );
			}
			if ( toTab ) {
				this.resetElement( toTab );
			}

			// Complete the tab switch immediately
			this.completeTabSwitch( fromTab, toTab, tabs, tabAreaData );
		}

		/**
		 * Generate a random letter for shuffle animation
		 * @return {string} A random uppercase or lowercase letter
		 */
		getRandomChar() {
			const letters =
				'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
			return letters.charAt(
				Math.floor( Math.random() * letters.length )
			);
		}

		/**
		 * Reset element animation state and clean up GSAP properties
		 * @param {HTMLElement} target - The element to reset
		 */
		resetElement( target ) {
			// eslint-disable-next-line no-console
			console.log( '[DEBUG] resetElement called:', {
				tabId: target.dataset?.tabId,
				hasTextSplitter: !! target.textSplitter,
				hasTextSplitters: !! ( target.textSplitters && target.textSplitters.length ),
				textSplittersCount: target.textSplitters?.length || 0,
				hasBeenAnimated: !! target.hasBeenAnimated,
			} );

			let hadSplitters = false;

			// Clean up text splitter if it exists
			if ( target.textSplitter ) {
				// eslint-disable-next-line no-console
				console.log( '[DEBUG] Reverting single textSplitter' );
				target.textSplitter.revert();
				target.textSplitter = null;
				hadSplitters = true;
			}

			// Clean up multiple text splitters if they exist
			if ( target.textSplitters && Array.isArray( target.textSplitters ) && target.textSplitters.length > 0 ) {
				// eslint-disable-next-line no-console
				console.log( '[DEBUG] Reverting multiple textSplitters:', target.textSplitters.length );
				target.textSplitters.forEach( ( splitter, index ) => {
					if ( splitter ) {
						// eslint-disable-next-line no-console
						console.log( '[DEBUG] Reverting splitter', index );
						splitter.revert();
					}
				} );
				target.textSplitters = [];
				hadSplitters = true;
			}

			// Only clear GSAP properties if this element has actually been animated
			// This prevents clearing CSS on elements that were never touched by GSAP
			if ( typeof gsap !== 'undefined' && ( hadSplitters || target.hasBeenAnimated ) ) {
				// eslint-disable-next-line no-console
				console.log( '[DEBUG] Clearing GSAP properties (element was animated)' );
				gsap.set( target, { clearProps: 'all' } );
				target.hasBeenAnimated = false;
			} else {
				// eslint-disable-next-line no-console
				console.log( '[DEBUG] Skipping GSAP clearProps (element was never animated)' );
			}

			// eslint-disable-next-line no-console
			console.log( '[DEBUG] resetElement complete, checking innerHTML:', {
				innerHTML: target.innerHTML.substring( 0, 200 ),
			} );
		}

		/**
		 * Apply proper CSS to character divs for natural text wrapping
		 * @param {HTMLElement} element - The parent element
		 * @param {Object} splitter - The SplitText instance
		 * @param {Object} config - Animation configuration
		 */
		applyCharWrappingStyles( element, splitter, config ) {
			if ( config.splitLines && splitter.lines ) {
				// With line splitting, make lines display as blocks
				splitter.lines.forEach( ( line ) => {
					gsap.set( line, { display: 'block' } );
				} );
			} else if ( splitter.chars ) {
				// Without line splitting, ensure chars wrap naturally like text
				// Set parent to allow normal text wrapping
				gsap.set( element, { 
					whiteSpace: 'normal',
					wordWrap: 'break-word'
				} );
				// Set chars to display inline (not inline-block) for natural wrapping
				splitter.chars.forEach( ( char ) => {
					gsap.set( char, { 
						display: 'inline',
						whiteSpace: 'normal'
					} );
				} );
			}
		}

		/**
		 * Execute onEnter animation (fade out) on outgoing tab content
		 * Splits text into characters and animates them to opacity 0 with stagger from end
		 * Each child element animates independently based on config
		 * @param {HTMLElement} target - The tab content element to animate
		 * @param {Object} config - GSAP animation configuration
		 * @param {Function} onComplete - Callback to execute when animation completes
		 * @return {boolean} True if animation started successfully, false if it failed
		 */
		gsapOnEnter( target, config, onComplete ) {
			// Check for valid tab content before animating
			if ( ! target || ! target.textContent || ! target.textContent.trim() ) {
				// eslint-disable-next-line no-console
				console.warn(
					'Decoupled Tabs: Invalid tab content for GSAP animation, falling back to standard tab switch'
				);
				return false;
			}

			// Kill existing animation if present
			if ( target.currentTween ) {
				target.currentTween.kill();
			}

			// Reset element state
			this.resetElement( target );

			try {
				// Determine elements to animate based on splitChildren setting
				let elementsToAnimate = [ target ];
				if ( config.splitChildren ) {
					const childElements = Array.from( target.children ).filter(
						( child ) => child.textContent && child.textContent.trim()
					);
					if ( childElements.length > 0 ) {
						elementsToAnimate = childElements;
					}
				}

				// Store all text splitters for cleanup
				if ( ! target.textSplitters ) {
					target.textSplitters = [];
				}

				// Create a timeline to coordinate all element animations
				const tl = gsap.timeline( {
					onComplete: () => {
						// Clear animation reference
						target.currentTween = null;
						// Call completion callback
						onComplete();
					},
				} );

				// Animate each element independently - all starting at the same time
				elementsToAnimate.forEach( ( element ) => {
					// Determine split type based on config
					let splitType = 'chars';
					if ( config.splitLines ) {
						splitType = 'lines,chars';
					}

					// Create SplitText for this specific element
					const splitter = new SplitText( element, { 
						type: splitType,
						linesClass: 'split-line'
					} );
					target.textSplitters.push( splitter );

					// Apply proper wrapping styles
					this.applyCharWrappingStyles( element, splitter, config );

					// When splitLines is enabled, animate each line independently
					// Otherwise animate all characters together
					if ( config.splitLines && splitter.lines && splitter.lines.length > 0 ) {
						// Animate each line independently
						splitter.lines.forEach( ( line, lineIndex ) => {
							// Get characters within this line
							// When splitting by 'lines,chars', chars are direct children of the line
							const lineChars = splitter.chars.filter( char => line.contains( char ) );
							
							if ( lineChars.length === 0 ) {
								return;
							}

							// Animate this line's characters
							tl.to(
								lineChars,
								{
									duration: config.onEnterDuration,
									ease: 'none',
									autoAlpha: 0,
									stagger: {
										amount: config.staggerAmount,
										from: 'end',
									},
								},
								0 // All lines start at time 0
							);
						} );
					} else {
						// No line splitting - animate all chars together
						const chars = splitter.chars;

						if ( ! chars || chars.length === 0 ) {
							return;
						}

						tl.to(
							chars,
							{
								duration: config.onEnterDuration,
								ease: 'none',
								autoAlpha: 0,
								stagger: {
									amount: config.staggerAmount,
									from: 'end',
								},
							},
							0
						);
					}
				} );

				// Store timeline reference
				target.currentTween = tl;

				// Mark element as having been animated by GSAP
				target.hasBeenAnimated = true;

				return true;
			} catch ( error ) {
				// Log errors for debugging
				// eslint-disable-next-line no-console
				console.error( 'Decoupled Tabs: Text splitting failed, falling back to standard tab switch', error );
				// Clean up partial animation state
				this.resetElement( target );
				return false;
			}
		}

		/**
		 * Execute onLeave animation (shuffle and reveal) on incoming tab content
		 * Shuffles characters through random letters before revealing original content
		 * Each child element animates independently with its own character stagger
		 * @param {HTMLElement} target - The tab content element to animate
		 * @param {Object} config - GSAP animation configuration
		 * @param {Function} onComplete - Callback to execute when animation completes
		 * @return {boolean} True if animation started successfully, false if it failed
		 */
		gsapOnLeave( target, config, onComplete ) {
			// eslint-disable-next-line no-console
			console.log( '[DEBUG] gsapOnLeave called:', {
				tabId: target.dataset?.tabId,
				hasContent: !! ( target.textContent && target.textContent.trim() ),
				splitChildren: config.splitChildren,
				splitLines: config.splitLines,
			} );

			// Check for valid tab content before animating
			if ( ! target || ! target.textContent || ! target.textContent.trim() ) {
				// eslint-disable-next-line no-console
				console.warn(
					'Decoupled Tabs: Invalid tab content for GSAP animation, falling back to standard tab switch'
				);
				return false;
			}

			// Kill existing animation if present
			if ( target.currentTween ) {
				target.currentTween.kill();
			}

			// Reset element state before starting new animation
			this.resetElement( target );

			try {
				// Determine elements to animate based on splitChildren setting
				let elementsToAnimate = [ target ];
				if ( config.splitChildren ) {
					const childElements = Array.from( target.children ).filter(
						( child ) => child.textContent && child.textContent.trim()
					);
					if ( childElements.length > 0 ) {
						elementsToAnimate = childElements;
					}
				}

				// Create GSAP timeline for shuffle effect
				const tl = gsap.timeline( {
					onComplete: () => {
						// Clear animation reference
						target.currentTween = null;
						// Call completion callback
						onComplete();
					},
				} );

				// Store all text splitters for cleanup
				if ( ! target.textSplitters ) {
					target.textSplitters = [];
				}

				// Animate each element independently - all starting at the same time
				elementsToAnimate.forEach( ( element ) => {
					// Determine split type based on config
					let splitType = 'chars';
					if ( config.splitLines ) {
						splitType = 'lines,chars';
					}

					// Create SplitText for this specific element
					const splitter = new SplitText( element, { 
						type: splitType,
						linesClass: 'split-line'
					} );
					target.textSplitters.push( splitter );

					// Apply proper wrapping styles
					this.applyCharWrappingStyles( element, splitter, config );

					// When splitLines is enabled, animate each line independently
					// Otherwise animate all characters together
					if ( config.splitLines && splitter.lines && splitter.lines.length > 0 ) {
						// Animate each line independently
						splitter.lines.forEach( ( line, lineIndex ) => {
							// Get characters within this line
							// When splitting by 'lines,chars', chars are direct children of the line
							const lineChars = splitter.chars.filter( char => line.contains( char ) );
							
							if ( lineChars.length === 0 ) {
								return;
							}

							// Set all characters to opacity 0 initially
							gsap.set( lineChars, { autoAlpha: 0 } );

							// Calculate timing based on mode
							let charDelay, charDuration;
							if ( config.timingMode === 'same-speed' ) {
								charDelay = config.staggerDelay;
								charDuration = config.charDuration;
							} else {
								const totalChars = lineChars.length;
								const totalDuration = config.staggerAmount;
								charDelay = totalDuration / totalChars;
								charDuration = charDelay / ( config.shuffleIterations + 1 );
							}

							// Animate each character with shuffle effect
							lineChars.forEach( ( char, charIndex ) => {
								const originalChar = char.innerHTML;
								const charStartTime = charIndex * charDelay;

								// Shuffle iterations
								for ( let i = 0; i < config.shuffleIterations; i++ ) {
									tl.to(
										char,
										{
											duration: charDuration,
											textContent: this.getRandomChar(),
											autoAlpha: 1,
											ease: 'none',
										},
										charStartTime + i * charDuration
									);
								}

								// Restore original character
								tl.to(
									char,
									{
										duration: charDuration,
										textContent: originalChar,
										autoAlpha: 1,
										ease: 'none',
									},
									charStartTime + config.shuffleIterations * charDuration
								);
							} );
						} );
					} else {
						// No line splitting - animate all chars together
						const chars = splitter.chars;

						if ( ! chars || chars.length === 0 ) {
							return;
						}

						// Set all characters to opacity 0 initially
						gsap.set( chars, { autoAlpha: 0 } );

						// Calculate timing based on mode
						let charDelay, charDuration;
						if ( config.timingMode === 'same-speed' ) {
							charDelay = config.staggerDelay;
							charDuration = config.charDuration;
						} else {
							const totalChars = chars.length;
							const totalDuration = config.staggerAmount;
							charDelay = totalDuration / totalChars;
							charDuration = charDelay / ( config.shuffleIterations + 1 );
						}

						// Animate each character with shuffle effect
						chars.forEach( ( char, charIndex ) => {
							const originalChar = char.innerHTML;
							const charStartTime = charIndex * charDelay;

							// Shuffle iterations
							for ( let i = 0; i < config.shuffleIterations; i++ ) {
								tl.to(
									char,
									{
										duration: charDuration,
										textContent: this.getRandomChar(),
										autoAlpha: 1,
										ease: 'none',
									},
									charStartTime + i * charDuration
								);
							}

							// Restore original character
							tl.to(
								char,
								{
									duration: charDuration,
									textContent: originalChar,
									autoAlpha: 1,
									ease: 'none',
								},
								charStartTime + config.shuffleIterations * charDuration
							);
						} );
					}
				} );

				// Store timeline reference on element
				target.currentTween = tl;

				// Mark element as having been animated by GSAP
				target.hasBeenAnimated = true;

				return true;
			} catch ( error ) {
				// Log errors for debugging
				// eslint-disable-next-line no-console
				console.error(
					'Decoupled Tabs: Animation creation failed, falling back to standard tab switch',
					error
				);
				// Clean up partial animation state
				this.resetElement( target );
				return false;
			}
		}
	}

	// Initialize when DOM is ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener(
			'DOMContentLoaded',
			() => new DecoupledTabs()
		);
	} else {
		new DecoupledTabs();
	}
} )();

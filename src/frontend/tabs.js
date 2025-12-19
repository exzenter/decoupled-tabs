/**
 * Decoupled Tabs Frontend
 * Handles tab switching with transition animations
 */

(function () {
    'use strict';

    class DecoupledTabs {
        constructor() {
            this.tabAreas = new Map();
            this.init();
        }

        init() {
            // Find all tab areas
            document.querySelectorAll('.decoupled-tabs-area').forEach((area) => {
                this.initTabArea(area);
            });

            // Find all tab triggers
            document.querySelectorAll('[data-tab-target]').forEach((trigger) => {
                this.initTrigger(trigger);
            });

            // Handle triggers marked as active on load (takes priority over tab area default)
            this.handleActiveOnLoadTriggers();

            // Handle URL hash on load (takes highest priority)
            this.handleHashChange();
            window.addEventListener('hashchange', () => this.handleHashChange());
        }

        handleActiveOnLoadTriggers() {
            const activeOnLoadTriggers = document.querySelectorAll('[data-tab-target][data-active-on-load="true"]');
            activeOnLoadTriggers.forEach((trigger) => {
                const tabId = trigger.dataset.tabTarget;
                const tabAreaId = trigger.dataset.tabArea || null;

                // Immediately apply active state to this trigger
                trigger.classList.add('is-active');
                trigger.setAttribute('aria-selected', 'true');
                this.applyTriggerCSS(trigger, 'active');

                // Switch to the associated tab
                this.switchToTab(tabId, tabAreaId, null);
            });
        }

        initTabArea(area) {
            const areaId = area.dataset.tabAreaId;
            const defaultTab = area.dataset.defaultTab;
            const transitionType = area.dataset.transitionType || 'fade';
            const transitionDuration = parseInt(area.dataset.transitionDuration, 10) || 300;

            const tabs = Array.from(area.querySelectorAll('.decoupled-tabs-content'));

            this.tabAreas.set(areaId, {
                element: area,
                tabs,
                transitionType,
                transitionDuration,
                currentTab: null,
                isTransitioning: false,
            });

            // Set initial active tab
            let activeTab = null;
            if (defaultTab) {
                activeTab = tabs.find((tab) => tab.dataset.tabId === defaultTab);
            }
            if (!activeTab && tabs.length > 0) {
                activeTab = tabs[0];
            }

            if (activeTab) {
                this.activateTab(activeTab, true);
            }
        }

        initTrigger(trigger) {
            // Apply custom default CSS
            this.applyTriggerCSS(trigger, 'default');

            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = trigger.dataset.tabTarget;
                const targetTabArea = trigger.dataset.tabArea; // Optional: specify which tab area

                this.switchToTab(targetId, targetTabArea, trigger);
            });

            // Add keyboard accessibility
            if (!trigger.hasAttribute('tabindex')) {
                trigger.setAttribute('tabindex', '0');
            }
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    trigger.click();
                }
            });

            // Hover events for custom CSS
            trigger.addEventListener('mouseenter', () => {
                if (!trigger.classList.contains('is-active')) {
                    this.applyTriggerCSS(trigger, 'hover');
                }
            });

            trigger.addEventListener('mouseleave', () => {
                if (!trigger.classList.contains('is-active')) {
                    this.applyTriggerCSS(trigger, 'default');
                }
            });
        }

        applyTriggerCSS(trigger, state) {
            const cssDefault = trigger.dataset.cssDefault || '';
            const cssHover = trigger.dataset.cssHover || '';
            const cssActive = trigger.dataset.cssActive || '';

            // Clear inline styles first (to allow proper state management)
            this.clearTriggerInlineStyles(trigger);

            let cssToApply = '';
            switch (state) {
                case 'hover':
                    cssToApply = cssHover || cssDefault;
                    break;
                case 'active':
                    cssToApply = cssActive || cssDefault;
                    break;
                default:
                    cssToApply = cssDefault;
            }

            if (cssToApply) {
                this.applyInlineStyles(trigger, cssToApply);
            }
        }

        applyInlineStyles(element, cssString) {
            // Parse CSS string like "background: red; padding: 10px;" and apply
            const declarations = cssString.split(';').filter(d => d.trim());
            declarations.forEach(declaration => {
                const [property, value] = declaration.split(':').map(s => s.trim());
                if (property && value) {
                    // Convert CSS property to camelCase for style object
                    const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    element.style[camelProperty] = value;
                }
            });
        }

        clearTriggerInlineStyles(trigger) {
            // Collect all CSS properties from default, hover, and active states
            const allCss = [
                trigger.dataset.cssDefault || '',
                trigger.dataset.cssHover || '',
                trigger.dataset.cssActive || ''
            ].join(';');

            const cssProps = allCss.split(';')
                .filter(d => d.includes(':'))
                .map(d => d.split(':')[0].trim());

            // Remove duplicates and clear those styles
            [...new Set(cssProps)].forEach(prop => {
                if (prop) {
                    const camelProperty = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    trigger.style[camelProperty] = '';
                }
            });
        }

        switchToTab(tabId, tabAreaId = null, trigger = null) {
            // Find the target tab
            let targetTab = null;
            let tabArea = null;
            let foundAreaId = tabAreaId;

            if (tabAreaId) {
                // Look in specific tab area
                tabArea = this.tabAreas.get(tabAreaId);
                if (tabArea) {
                    targetTab = tabArea.tabs.find((tab) => tab.dataset.tabId === tabId);
                }
            } else {
                // Search all tab areas
                for (const [areaId, area] of this.tabAreas) {
                    const found = area.tabs.find((tab) => tab.dataset.tabId === tabId);
                    if (found) {
                        targetTab = found;
                        tabArea = area;
                        foundAreaId = areaId;
                        break;
                    }
                }
            }

            if (!targetTab || !tabArea) {
                console.warn(`Decoupled Tabs: Tab with ID "${tabId}" not found.`);
                return;
            }

            if (tabArea.isTransitioning) {
                return; // Prevent rapid switching during transition
            }

            // Update trigger active states - pass the found area ID
            this.updateTriggerStates(tabId, foundAreaId);

            // Perform the switch
            this.activateTab(targetTab, false, tabArea);

            // Update URL hash
            if (trigger) {
                history.replaceState(null, '', `#${tabId}`);
            }
        }

        activateTab(tab, immediate = false, tabAreaData = null) {
            // Find the tab area if not provided
            if (!tabAreaData) {
                const area = tab.closest('.decoupled-tabs-area');
                const areaId = area?.dataset.tabAreaId;
                tabAreaData = this.tabAreas.get(areaId);
            }

            if (!tabAreaData) {
                return;
            }

            const { tabs, currentTab, transitionType, transitionDuration } = tabAreaData;

            // Check for tab-specific transition override
            const tabTransitionType = tab.dataset.transitionType || transitionType;
            const tabTransitionDuration = tab.dataset.transitionDuration
                ? parseInt(tab.dataset.transitionDuration, 10)
                : transitionDuration;

            const duration = immediate ? 0 : tabTransitionDuration;

            if (currentTab === tab) {
                return; // Already active
            }

            // Mark as transitioning
            tabAreaData.isTransitioning = true;

            // Hide all other tabs
            tabs.forEach((t) => {
                if (t !== tab) {
                    this.hideTab(t, duration, tabTransitionType, t === currentTab);
                }
            });

            // Show the target tab
            this.showTab(tab, duration, tabTransitionType);

            // Update current tab reference
            tabAreaData.currentTab = tab;

            // Reset transitioning state after animation
            setTimeout(() => {
                tabAreaData.isTransitioning = false;
                // Clean up transitioning classes
                tabs.forEach((t) => {
                    t.classList.remove('is-transitioning', 'is-exiting');
                });
            }, duration);
        }

        showTab(tab, duration, transitionType) {
            // Set transition duration
            tab.style.transitionDuration = `${duration}ms`;

            // Add active class
            tab.classList.add('is-active');

            // Handle different transition types
            if (transitionType === 'none' || duration === 0) {
                tab.style.transitionDuration = '0ms';
            } else if (transitionType === 'fade') {
                tab.classList.add('is-transitioning');
                // Trigger reflow for transition
                void tab.offsetHeight;
            } else if (transitionType === 'slide-horizontal' || transitionType === 'slide-vertical') {
                tab.classList.add('is-transitioning');
                // Trigger reflow
                void tab.offsetHeight;
            }

            // Set ARIA attributes
            tab.setAttribute('aria-hidden', 'false');
        }

        hideTab(tab, duration, transitionType, isCurrentTab = false) {
            // Set transition duration
            tab.style.transitionDuration = `${duration}ms`;

            if (isCurrentTab && transitionType !== 'none' && duration > 0) {
                // Add exiting animation for current tab
                tab.classList.add('is-exiting', 'is-transitioning');

                // Remove after transition
                setTimeout(() => {
                    tab.classList.remove('is-active', 'is-exiting', 'is-transitioning');
                }, duration);
            } else {
                tab.classList.remove('is-active');
            }

            // Set ARIA attributes
            tab.setAttribute('aria-hidden', 'true');
        }

        updateTriggerStates(activeTabId, tabAreaId = null) {
            document.querySelectorAll('[data-tab-target]').forEach((trigger) => {
                const triggerTabArea = trigger.dataset.tabArea;
                const triggerTabId = trigger.dataset.tabTarget;

                // If tab area is specified, only update triggers for that area
                if (tabAreaId && triggerTabArea && triggerTabArea !== tabAreaId) {
                    return;
                }

                if (triggerTabId === activeTabId) {
                    trigger.classList.add('is-active');
                    trigger.setAttribute('aria-selected', 'true');
                    // Apply active CSS
                    this.applyTriggerCSS(trigger, 'active');
                } else {
                    trigger.classList.remove('is-active');
                    trigger.setAttribute('aria-selected', 'false');
                    // Apply default CSS
                    this.applyTriggerCSS(trigger, 'default');
                }
            });
        }

        handleHashChange() {
            const hash = window.location.hash.slice(1);
            if (hash) {
                this.switchToTab(hash);
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new DecoupledTabs());
    } else {
        new DecoupledTabs();
    }
})();

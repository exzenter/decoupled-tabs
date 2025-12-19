/**
 * Decoupled Tabs Frontend
 * Handles tab switching with smooth height transitions
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
            const smoothHeight = area.dataset.smoothHeight === 'true';
            const transitionDuration = parseInt(area.dataset.transitionDuration, 10) || 300;

            const tabs = Array.from(area.querySelectorAll('.decoupled-tabs-content'));

            this.tabAreas.set(areaId, {
                element: area,
                tabs,
                smoothHeight,
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

            const { element, tabs, currentTab, smoothHeight, transitionDuration } = tabAreaData;
            const duration = immediate ? 0 : transitionDuration;

            if (currentTab === tab) {
                return; // Already active
            }

            // Mark as transitioning
            tabAreaData.isTransitioning = true;

            if (smoothHeight && !immediate && currentTab) {
                // Smooth height transition
                this.animateHeightTransition(element, currentTab, tab, duration, tabs, tabAreaData);
            } else {
                // Instant switch
                tabs.forEach((t) => {
                    if (t !== tab) {
                        t.classList.remove('is-active');
                        t.setAttribute('aria-hidden', 'true');
                    }
                });

                tab.classList.add('is-active');
                tab.setAttribute('aria-hidden', 'false');

                tabAreaData.currentTab = tab;
                tabAreaData.isTransitioning = false;
            }
        }

        animateHeightTransition(areaElement, fromTab, toTab, duration, allTabs, tabAreaData) {
            // Get current height
            const startHeight = areaElement.offsetHeight;

            // Hide all tabs except the target, then measure target height
            allTabs.forEach((t) => {
                if (t !== toTab) {
                    t.classList.remove('is-active');
                    t.setAttribute('aria-hidden', 'true');
                }
            });

            // Show target tab to measure its height
            toTab.classList.add('is-active');
            toTab.setAttribute('aria-hidden', 'false');

            // Measure target height
            const endHeight = areaElement.offsetHeight;

            // Set starting height explicitly
            areaElement.style.height = `${startHeight}px`;
            areaElement.style.overflow = 'hidden';
            areaElement.style.transition = `height ${duration}ms ease-in-out`;

            // Force reflow
            void areaElement.offsetHeight;

            // Animate to target height
            areaElement.style.height = `${endHeight}px`;

            // Update current tab reference
            tabAreaData.currentTab = toTab;

            // Clean up after transition
            const cleanup = () => {
                areaElement.style.height = '';
                areaElement.style.overflow = '';
                areaElement.style.transition = '';
                tabAreaData.isTransitioning = false;
                areaElement.removeEventListener('transitionend', cleanup);
            };

            areaElement.addEventListener('transitionend', cleanup);

            // Fallback cleanup in case transitionend doesn't fire
            setTimeout(() => {
                if (tabAreaData.isTransitioning) {
                    cleanup();
                }
            }, duration + 50);
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

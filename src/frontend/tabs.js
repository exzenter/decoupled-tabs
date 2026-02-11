/**
 * Decoupled Tabs Frontend
 * Handles tab switching with smooth height transitions
 */

import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Register GSAP plugins
gsap.registerPlugin(SplitText);

// Make GSAP available globally for the class
window.gsap = gsap;
window.SplitText = SplitText;

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

      // Setup ARIA attributes and relationships
      this.setupARIA();

      // Setup keyboard navigation for all triggers
      document.querySelectorAll('[data-tab-target]').forEach((trigger) => {
        this.setupKeyboardNavigation(trigger);
      });

      // Resolve multiple active tabs with priority: hash > trigger > default > first
      this.resolveMultipleActiveTabs();

      // Handle URL hash on load (takes highest priority)
      this.handleHashChange();
      window.addEventListener('hashchange', () => this.handleHashChange());
    }

    setupARIA() {
      // Initialize ARIA relationships for all triggers and content
      const triggers = document.querySelectorAll('[data-tab-target]');
      const tabContents = document.querySelectorAll('.decoupled-tabs-content');

      // Process each trigger
      triggers.forEach((trigger) => {
        const triggerId = trigger.dataset.triggerId;
        const tabTarget = trigger.dataset.tabTarget;

        // Handle missing trigger ID - auto-generate fallback
        if (!triggerId || !trigger.id) {
          const autoId = this.generateFallbackId('trigger', trigger);
          trigger.id = autoId;
          trigger.dataset.triggerId = autoId.replace('tab-trigger-', '');
          // eslint-disable-next-line no-console
          console.warn(
            `Decoupled Tabs: Auto-generated ID for trigger: ${autoId}`,
          );
        }

        // Ensure aria-controls is set
        if (!trigger.getAttribute('aria-controls')) {
          trigger.setAttribute('aria-controls', `tab-panel-${tabTarget}`);
        }

        // Set initial aria-selected state based on active class
        const isActive = trigger.classList.contains('is-active');
        trigger.setAttribute('aria-selected', isActive ? 'true' : 'false');

        // Ensure role="tab" is set
        if (!trigger.getAttribute('role')) {
          trigger.setAttribute('role', 'tab');
        }

        // Ensure tabindex is set
        if (!trigger.hasAttribute('tabindex')) {
          trigger.setAttribute('tabindex', '0');
        }
      });

      // Process each tab content
      tabContents.forEach((content) => {
        const tabId = content.dataset.tabId;

        // Handle missing tab ID - auto-generate fallback
        if (!tabId || !content.id) {
          const autoId = this.generateFallbackId('tab', content);
          content.id = autoId;
          content.dataset.tabId = autoId.replace('tab-panel-', '');
          // eslint-disable-next-line no-console
          console.warn(
            `Decoupled Tabs: Auto-generated ID for tab content: ${autoId}`,
          );
        }

        // Find the associated trigger for this content
        const associatedTrigger = Array.from(triggers).find(
          (trigger) => trigger.dataset.tabTarget === tabId,
        );

        // Set aria-labelledby to reference the trigger
        if (associatedTrigger && associatedTrigger.id) {
          content.setAttribute('aria-labelledby', associatedTrigger.id);
        } else {
          // Orphaned content - no trigger references it
          // eslint-disable-next-line no-console
          console.info(
            `Decoupled Tabs: Tab content "${tabId}" has no associated trigger.`,
          );
          content.setAttribute('tabindex', '-1');
        }

        // Set initial tabindex based on active state
        const isActive = content.classList.contains('is-active');
        content.setAttribute('tabindex', isActive ? '0' : '-1');

        // Ensure role="tabpanel" is set
        if (!content.getAttribute('role')) {
          content.setAttribute('role', 'tabpanel');
        }
      });

      // Check for orphaned triggers (triggers without matching content)
      triggers.forEach((trigger) => {
        const tabTarget = trigger.dataset.tabTarget;
        const hasMatchingContent = Array.from(tabContents).some(
          (content) => content.dataset.tabId === tabTarget,
        );

        if (!hasMatchingContent) {
          // eslint-disable-next-line no-console
          console.warn(
            `Decoupled Tabs: Trigger references non-existent tab: ${tabTarget}`,
          );
          trigger.classList.add('disabled');
          trigger.setAttribute('aria-disabled', 'true');
          // Remove click handler by cloning and replacing
          const newTrigger = trigger.cloneNode(true);
          trigger.parentNode.replaceChild(newTrigger, trigger);
        }
      });
    }

    generateFallbackId(type, element) {
      // Generate a unique fallback ID using timestamp and random number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const index = Array.from(
        document.querySelectorAll(
          `[data-${type === 'trigger' ? 'trigger' : 'tab'}-id]`,
        ),
      ).indexOf(element);
      return `tab-${
        type === 'trigger' ? 'trigger' : 'panel'
      }-auto-${timestamp}-${random}-${index}`;
    }

    resolveMultipleActiveTabs() {
      // Handle multiple active tabs with priority: hash > trigger > default > first
      // Process each tab area independently
      this.tabAreas.forEach((tabAreaData, areaId) => {
        const { tabs, element } = tabAreaData;

        // Find all tabs marked as active
        const activeTabs = tabs.filter((tab) =>
          tab.classList.contains('is-active'),
        );

        if (activeTabs.length > 1) {
          // eslint-disable-next-line no-console
          console.warn(
            `Decoupled Tabs: Multiple active tabs detected in area "${areaId}". Resolving with priority: hash > trigger > default > first.`,
          );

          let selectedTab = null;

          // Priority 1: URL hash
          const hash = window.location.hash.slice(1);
          if (hash) {
            selectedTab = tabs.find((tab) => tab.dataset.tabId === hash);
          }

          // Priority 2: Active trigger (data-active-on-load="true")
          if (!selectedTab) {
            const activeTrigger = document.querySelector(
              `[data-tab-target][data-active-on-load="true"][data-tab-area="${areaId}"]`,
            );
            if (activeTrigger) {
              const targetId = activeTrigger.dataset.tabTarget;
              selectedTab = tabs.find((tab) => tab.dataset.tabId === targetId);
            }
          }

          // Priority 3: Default tab from tab area
          if (!selectedTab) {
            const defaultTab = element.dataset.defaultTab;
            if (defaultTab) {
              selectedTab = tabs.find(
                (tab) => tab.dataset.tabId === defaultTab,
              );
            }
          }

          // Priority 4: First tab
          if (!selectedTab && tabs.length > 0) {
            selectedTab = tabs[0];
          }

          // Deactivate all tabs first
          tabs.forEach((tab) => {
            tab.classList.remove('is-active');
            tab.setAttribute('tabindex', '-1');
          });

          // Activate only the selected tab
          if (selectedTab) {
            selectedTab.classList.add('is-active');
            selectedTab.setAttribute('tabindex', '0');
            tabAreaData.currentTab = selectedTab;

            // Update trigger states
            this.updateTriggerStates(selectedTab.dataset.tabId, areaId);
          }
        } else if (activeTabs.length === 0 && tabs.length > 0) {
          // No active tabs - activate first one
          const firstTab = tabs[0];
          firstTab.classList.add('is-active');
          firstTab.setAttribute('tabindex', '0');
          tabAreaData.currentTab = firstTab;
          this.updateTriggerStates(firstTab.dataset.tabId, areaId);
        }
      });

      // Also handle triggers marked as active on load
      const activeOnLoadTriggers = document.querySelectorAll(
        '[data-tab-target][data-active-on-load="true"]',
      );
      activeOnLoadTriggers.forEach((trigger) => {
        const tabId = trigger.dataset.tabTarget;
        const tabAreaId = trigger.dataset.tabArea || null;

        // Apply active state to this trigger
        trigger.classList.add('is-active');
        trigger.setAttribute('aria-selected', 'true');
        this.applyTriggerCSS(trigger, 'active');

        // Switch to the associated tab (this will respect the priority resolution)
        this.switchToTab(tabId, tabAreaId, null);
      });
    }

    getTriggersForArea(tabAreaId) {
      // Get all triggers for a specific tab area
      // If tabAreaId is null, get all triggers without a specific area assignment
      const allTriggers = Array.from(
        document.querySelectorAll('[data-tab-target]'),
      );

      if (!tabAreaId) {
        // Return triggers that don't specify a tab area
        return allTriggers.filter((trigger) => !trigger.dataset.tabArea);
      }

      // Return triggers that target this specific area
      return allTriggers.filter(
        (trigger) => trigger.dataset.tabArea === tabAreaId,
      );
    }

    setupKeyboardNavigation(trigger) {
      // Setup keyboard navigation for a single trigger
      trigger.addEventListener('keydown', (e) => {
        const tabAreaId = trigger.dataset.tabArea || null;

        // If this trigger is disabled, ignore keyboard events
        if (
          trigger.classList.contains('disabled') ||
          trigger.getAttribute('aria-disabled') === 'true'
        ) {
          return;
        }
        const triggers = this.getTriggersForArea(tabAreaId);
        const currentIndex = triggers.indexOf(trigger);
        let targetTrigger = null;

        switch (e.key) {
          case 'ArrowRight':
            // Move to next trigger, wrap around to first
            e.preventDefault();
            targetTrigger = triggers[(currentIndex + 1) % triggers.length];
            break;

          case 'ArrowLeft':
            // Move to previous trigger, wrap around to last
            e.preventDefault();
            targetTrigger =
              triggers[(currentIndex - 1 + triggers.length) % triggers.length];
            break;

          case 'Home':
            // Move to first trigger
            e.preventDefault();
            targetTrigger = triggers[0];
            break;

          case 'End':
            // Move to last trigger
            e.preventDefault();
            targetTrigger = triggers[triggers.length - 1];
            break;

          case 'Enter':
          case ' ':
            // Activate the current tab
            e.preventDefault();
            const targetId = trigger.dataset.tabTarget;
            const targetTabArea = trigger.dataset.tabArea;
            this.switchToTab(targetId, targetTabArea, trigger);
            return;
        }

        // If we have a target trigger, focus it and activate its tab
        if (targetTrigger) {
          targetTrigger.focus();
          const targetId = targetTrigger.dataset.tabTarget;
          const targetTabArea = targetTrigger.dataset.tabArea;
          this.switchToTab(targetId, targetTabArea, targetTrigger);
        }
      });
    }

    handleActiveOnLoadTriggers() {
      const activeOnLoadTriggers = document.querySelectorAll(
        '[data-tab-target][data-active-on-load="true"]',
      );
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
      const transitionDuration =
        parseInt(area.dataset.transitionDuration, 10) || 300;

      const tabs = Array.from(area.querySelectorAll('.decoupled-tabs-content'));

      // Read GSAP configuration from data attributes
      // Note: We don't check GSAP availability here - we'll check at animation time
      // This allows GSAP to load asynchronously without blocking initialization
      const gsapEnabled = area.dataset.gsapEnabled === 'true';

      // Parse and validate GSAP configuration parameters
      // Clamp values to valid ranges with fallback to defaults
      const gsapConfig = {
        shuffleIterations: Math.max(
          1,
          Math.min(10, parseInt(area.dataset.gsapShuffleIterations, 10) || 2),
        ),
        charDuration: Math.max(
          0.01,
          Math.min(1, parseFloat(area.dataset.gsapCharDuration) || 0.02),
        ),
        staggerAmount: Math.max(
          0,
          Math.min(2, parseFloat(area.dataset.gsapStaggerAmount) || 0.25),
        ),
        staggerDelay: Math.max(
          0,
          Math.min(0.5, parseFloat(area.dataset.gsapStaggerDelay) || 0.03),
        ),
        onEnterDuration: Math.max(
          0.01,
          Math.min(1, parseFloat(area.dataset.gsapOnEnterDuration) || 0.02),
        ),
        splitChildren: area.dataset.gsapSplitChildren === 'true',
        splitLines: area.dataset.gsapSplitLines === 'true',
      };

      // Debug: Log GSAP configuration
      // eslint-disable-next-line no-console
      console.log('[initTabArea] GSAP Config:', {
        areaId,
        gsapEnabled,
        splitChildren: gsapConfig.splitChildren,
        splitLines: gsapConfig.splitLines,
        dataAttributes: {
          gsapSplitChildren: area.dataset.gsapSplitChildren,
          gsapSplitLines: area.dataset.gsapSplitLines,
        },
      });

      this.tabAreas.set(areaId, {
        element: area,
        tabs,
        smoothHeight,
        transitionDuration,
        currentTab: null,
        isTransitioning: false,
        gsapEnabled,
        gsapConfig,
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
        const groupId = trigger.dataset.groupId; // Optional: group ID for connected triggers

        // Handle group logic: deactivate other triggers in the same group
        if (groupId) {
          this.deactivateGroupTriggers(groupId, trigger);
        }

        this.switchToTab(targetId, targetTabArea, trigger);
      });

      // Add tabindex for keyboard accessibility if not present
      if (!trigger.hasAttribute('tabindex')) {
        trigger.setAttribute('tabindex', '0');
      }

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

    /**
     * Deactivate all triggers in the same group except the current one
     * @param {string} groupId - The group ID to target
     * @param {HTMLElement} currentTrigger - The trigger that was just activated
     */
    deactivateGroupTriggers(groupId, currentTrigger) {
      // Find all triggers with the same group ID
      const groupTriggers = document.querySelectorAll(
        `[data-group-id="${groupId}"]`,
      );

      groupTriggers.forEach((trigger) => {
        if (trigger !== currentTrigger) {
          // Remove active state
          trigger.classList.remove('is-active');
          trigger.setAttribute('aria-selected', 'false');
          this.applyTriggerCSS(trigger, 'default');
        }
      });
    }

    applyInlineStyles(element, cssString) {
      // Parse CSS string like "background: red; padding: 10px;" and apply
      const declarations = cssString.split(';').filter((d) => d.trim());
      declarations.forEach((declaration) => {
        const [property, value] = declaration.split(':').map((s) => s.trim());
        if (property && value) {
          // Convert CSS property to camelCase for style object
          const camelProperty = property.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase(),
          );
          element.style[camelProperty] = value;
        }
      });
    }

    clearTriggerInlineStyles(trigger) {
      // Collect all CSS properties from default, hover, and active states
      const allCss = [
        trigger.dataset.cssDefault || '',
        trigger.dataset.cssHover || '',
        trigger.dataset.cssActive || '',
      ].join(';');

      const cssProps = allCss
        .split(';')
        .filter((d) => d.includes(':'))
        .map((d) => d.split(':')[0].trim());

      // Remove duplicates and clear those styles
      [...new Set(cssProps)].forEach((prop) => {
        if (prop) {
          const camelProperty = prop.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase(),
          );
          trigger.style[camelProperty] = '';
        }
      });
    }

    switchToTab(tabId, tabAreaId = null, trigger = null) {
      // If no specific tab area is provided, target all tabs with the same ID
      if (!tabAreaId) {
        // Find all tabs with matching ID across all tab areas
        const matchingTabs = [];
        for (const [areaId, area] of this.tabAreas) {
          const found = area.tabs.find((tab) => tab.dataset.tabId === tabId);
          if (found) {
            matchingTabs.push({ tab: found, area, areaId });
          }
        }

        if (matchingTabs.length === 0) {
          // eslint-disable-next-line no-console
          console.warn(`Decoupled Tabs: Tab with ID "${tabId}" not found.`);
          return;
        }

        // Switch all matching tabs simultaneously
        // Allow interruption - animations will be killed and restarted in activateTab
        matchingTabs.forEach(({ tab, area, areaId }) => {
          this.activateTab(tab, false, area);
        });

        // Update trigger states for all areas (pass null to update all)
        this.updateTriggerStates(tabId, null);

        // Update URL hash
        if (trigger) {
          window.history.replaceState(null, '', `#${tabId}`);
        }

        return;
      }

      // Original behavior: target specific tab area
      let targetTab = null;
      let tabArea = null;

      // Look in specific tab area
      tabArea = this.tabAreas.get(tabAreaId);
      if (tabArea) {
        targetTab = tabArea.tabs.find((tab) => tab.dataset.tabId === tabId);
      }

      if (!targetTab || !tabArea) {
        // eslint-disable-next-line no-console
        console.warn(
          `Decoupled Tabs: Tab with ID "${tabId}" not found in area "${tabAreaId}".`,
        );
        return;
      }

      // Allow interruption - animations will be killed and restarted in activateTab
      // This ensures all tabs stay in sync when controlled by the same trigger

      // Update trigger active states - pass the specific area ID
      this.updateTriggerStates(tabId, tabAreaId);

      // Perform the switch
      this.activateTab(targetTab, false, tabArea);

      // Update URL hash
      if (trigger) {
        window.history.replaceState(null, '', `#${tabId}`);
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

      const {
        element,
        tabs,
        currentTab,
        smoothHeight,
        transitionDuration,
        gsapEnabled,
      } = tabAreaData;
      const duration = immediate ? 0 : transitionDuration;

      if (currentTab === tab) {
        return; // Already active
      }

      // CRITICAL: Update currentTab AND targetTabId IMMEDIATELY to prevent race conditions
      // targetTabId is used in animation callbacks to detect if target changed
      tabAreaData.currentTab = tab;
      tabAreaData.targetTabId = tab.dataset.tabId;

      // Handle rapid tab switching: kill any in-progress animations
      if (tabAreaData.isTransitioning && gsapEnabled) {
        // Kill animations on all tabs in this area to prevent queue buildup
        tabs.forEach((t) => {
          if (t.currentTween) {
            t.currentTween.kill();
            t.currentTween = null;
          }
          this.resetElement(t);
        });
      }

      // Mark as transitioning
      tabAreaData.isTransitioning = true;

      // Get the tab area ID for updating trigger states
      const areaId = element.dataset.tabAreaId;
      const activeTabId = tab.dataset.tabId;

      // Update ARIA states on triggers when tab changes
      this.updateTriggerStates(activeTabId, areaId);

      // Check if GSAP animations should be executed
      // Verify GSAP availability at animation time (not initialization time)
      const gsapAvailable =
        typeof gsap !== 'undefined' && typeof SplitText !== 'undefined';

      if (gsapEnabled && !gsapAvailable && !immediate) {
        // Log warning only once per tab area
        if (!tabAreaData.gsapWarningLogged) {
          // eslint-disable-next-line no-console
          console.warn(
            'Decoupled Tabs: GSAP or SplitText not available, falling back to standard transitions',
          );
          tabAreaData.gsapWarningLogged = true;
        }
      }

      if (gsapEnabled && gsapAvailable && !immediate && currentTab) {
        // Execute GSAP transition
        this.executeGSAPTransition(currentTab, tab, tabAreaData);
      } else if (smoothHeight && !immediate && currentTab) {
        // Smooth height transition
        this.animateHeightTransition(
          element,
          currentTab,
          tab,
          duration,
          tabs,
          tabAreaData,
        );
      } else {
        // Instant switch - rely on CSS classes for visibility
        tabs.forEach((t) => {
          if (t !== tab) {
            t.classList.remove('is-active');
            t.setAttribute('tabindex', '-1'); // Remove from tab order
          }
        });

        tab.classList.add('is-active');
        tab.setAttribute('tabindex', '0'); // Add to tab order

        tabAreaData.isTransitioning = false;
      }
    }

    animateHeightTransition(
      areaElement,
      fromTab,
      toTab,
      duration,
      allTabs,
      tabAreaData,
    ) {
      // Get current height
      const startHeight = areaElement.offsetHeight;

      // Temporarily set position static on target tab to measure its height accurately
      const originalPosition = toTab.style.position;
      toTab.style.position = 'static';

      // Hide all tabs except the target, then measure target height
      allTabs.forEach((t) => {
        if (t !== toTab) {
          t.classList.remove('is-active');
          t.setAttribute('tabindex', '-1'); // Remove from tab order
        }
      });

      // Show target tab to measure its height
      toTab.classList.add('is-active');
      toTab.setAttribute('tabindex', '0'); // Add to tab order

      // Measure target height
      const endHeight = areaElement.offsetHeight;

      // Restore original position
      toTab.style.position = originalPosition;

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

    /**
     * Apply smooth height transition using pre-measured heights
     * Used during GSAP animations to animate height simultaneously
     * @param {HTMLElement} areaElement - The tab area container
     * @param {number} startHeight - Starting height in pixels
     * @param {number} endHeight - Target height in pixels
     * @param {number} duration - Transition duration in milliseconds
     */
    applySmoothHeightTransition(areaElement, startHeight, endHeight, duration) {
      // Set starting height explicitly
      areaElement.style.height = `${startHeight}px`;
      areaElement.style.overflow = 'hidden';
      areaElement.style.transition = `height ${duration}ms ease-in-out`;

      // Force reflow
      void areaElement.offsetHeight;

      // Animate to target height
      areaElement.style.height = `${endHeight}px`;

      // Clean up after transition
      const cleanup = () => {
        areaElement.style.height = '';
        areaElement.style.overflow = '';
        areaElement.style.transition = '';
        areaElement.removeEventListener('transitionend', cleanup);
      };

      areaElement.addEventListener('transitionend', cleanup);

      // Fallback cleanup in case transitionend doesn't fire
      setTimeout(() => {
        cleanup();
      }, duration + 50);
    }

    updateTriggerStates(activeTabId, tabAreaId = null) {
      document.querySelectorAll('[data-tab-target]').forEach((trigger) => {
        const triggerTabArea = trigger.dataset.tabArea;
        const triggerTabId = trigger.dataset.tabTarget;
        const groupId = trigger.dataset.groupId;

        // If tabAreaId is null, update all triggers targeting this tab ID
        // regardless of their tab area assignment
        if (tabAreaId === null) {
          // Update triggers that match the tab ID
          if (triggerTabId === activeTabId) {
            trigger.classList.add('is-active');
            trigger.setAttribute('aria-selected', 'true');
            this.applyTriggerCSS(trigger, 'active');

            // If this trigger has a group ID, deactivate other triggers in the group
            if (groupId) {
              this.deactivateGroupTriggers(groupId, trigger);
            }
          } else {
            trigger.classList.remove('is-active');
            trigger.setAttribute('aria-selected', 'false');
            this.applyTriggerCSS(trigger, 'default');
          }
          return;
        }

        // If tab area is specified, only update triggers for that area
        if (triggerTabArea && triggerTabArea !== tabAreaId) {
          return;
        }

        if (triggerTabId === activeTabId) {
          trigger.classList.add('is-active');
          trigger.setAttribute('aria-selected', 'true');
          // Apply active CSS
          this.applyTriggerCSS(trigger, 'active');

          // If this trigger has a group ID, deactivate other triggers in the group
          if (groupId) {
            this.deactivateGroupTriggers(groupId, trigger);
          }
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

    /**
     * Execute GSAP animation sequence for tab transition
     * Orchestrates onEnter (fade out) and onLeave (shuffle reveal) animations
     * Handles interruption by skipping fade-out if fromTab is already hidden
     * Uses targetTabId to detect if target changed during animation
     * @param {HTMLElement} fromTab - The outgoing tab content element
     * @param {HTMLElement} toTab - The incoming tab content element
     * @param {Object} tabAreaData - Tab area configuration data
     */
    executeGSAPTransition(fromTab, toTab, tabAreaData) {
      const { gsapConfig, tabs, smoothHeight, transitionDuration, element } =
        tabAreaData;

      // Capture the target tab ID at the start of this animation
      const targetTabId = toTab.dataset.tabId;

      // Check if fromTab is already hidden (was being animated out)
      // If so, we're interrupting an animation and should skip straight to showing new content
      const fromTabIsHidden = !fromTab.classList.contains('is-active');

      // Measure heights BEFORE resetting elements if smooth height is enabled
      let startHeight, endHeight;
      if (smoothHeight) {
        // Get current height (might be mid-transition)
        startHeight = element.offsetHeight;

        // Temporarily show toTab to measure its height
        const fromTabDisplay = fromTab.style.display;
        const toTabDisplay = toTab.style.display;

        fromTab.style.display = 'none';
        toTab.style.display = 'block';
        toTab.classList.add('is-active');

        endHeight = element.offsetHeight;

        // Restore original states
        fromTab.style.display = fromTabDisplay;
        toTab.style.display = toTabDisplay;
        toTab.classList.remove('is-active');
      }

      // Ensure clean state before starting new animations
      // Kill any existing animations and reset both tabs
      if (fromTab.currentTween) {
        fromTab.currentTween.kill();
        fromTab.currentTween = null;
      }
      if (toTab.currentTween) {
        toTab.currentTween.kill();
        toTab.currentTween = null;
      }
      this.resetElement(fromTab);
      this.resetElement(toTab);

      // If we're interrupting (fromTab already hidden), skip fade-out and go straight to fade-in
      if (fromTabIsHidden) {
        // Immediately hide the old tab
        fromTab.classList.remove('is-active');
        fromTab.setAttribute('tabindex', '-1');

        // Show the new tab
        toTab.classList.add('is-active');
        toTab.setAttribute('tabindex', '0');

        // Apply smooth height transition if enabled
        if (smoothHeight && startHeight && endHeight) {
          this.applySmoothHeightTransition(
            element,
            startHeight,
            endHeight,
            transitionDuration,
          );
        }

        // Execute only the onLeave animation (fade-in/shuffle) on the new tab
        const onLeaveSuccess = this.gsapOnLeave(toTab, gsapConfig, () => {
          // Check if target changed during animation - if so, abort this callback
          if (tabAreaData.targetTabId !== targetTabId) {
            return;
          }
          // Animation complete
          this.completeTabSwitch(fromTab, toTab, tabs, tabAreaData, true);
        });

        // If onLeave failed, fall back to standard tab switch
        if (!onLeaveSuccess) {
          this.standardTabSwitch(fromTab, toTab, tabs, tabAreaData);
        }

        return;
      }

      // Normal flow: fromTab is visible, do full two-phase animation
      toTab.setAttribute('tabindex', '0');

      // Execute onEnter animation on outgoing tab
      const onEnterSuccess = this.gsapOnEnter(fromTab, gsapConfig, () => {
        // Check if target changed during animation - if so, abort this callback
        if (tabAreaData.targetTabId !== targetTabId) {
          return;
        }

        // onEnter complete, hide the outgoing tab
        fromTab.classList.remove('is-active');
        fromTab.setAttribute('tabindex', '-1');

        // Now make the incoming tab visible
        toTab.classList.add('is-active');

        // Apply smooth height transition if enabled using pre-measured heights
        if (smoothHeight && startHeight && endHeight) {
          this.applySmoothHeightTransition(
            element,
            startHeight,
            endHeight,
            transitionDuration,
          );
        }

        // Now execute onLeave animation on incoming tab
        const onLeaveSuccess = this.gsapOnLeave(toTab, gsapConfig, () => {
          // Check if target changed during animation - if so, abort this callback
          if (tabAreaData.targetTabId !== targetTabId) {
            return;
          }
          // Both animations complete, now complete the tab switch
          this.completeTabSwitch(fromTab, toTab, tabs, tabAreaData, true);
        });

        // If onLeave failed, fall back to standard tab switch
        if (!onLeaveSuccess) {
          this.standardTabSwitch(fromTab, toTab, tabs, tabAreaData);
        }
      });

      // If onEnter failed, fall back to standard tab switch immediately
      if (!onEnterSuccess) {
        this.standardTabSwitch(fromTab, toTab, tabs, tabAreaData);
      }
    }

    /**
     * Complete the tab switch by updating visibility classes
     * Optionally applies smooth height transition if enabled
     * NOTE: When called after GSAP animations, tabs are already visible,
     * so we skip the height animation (it was handled during GSAP transition)
     * NOTE: currentTab is already updated in activateTab, so we don't update it here
     * @param {HTMLElement} fromTab - The outgoing tab content element
     * @param {HTMLElement} toTab - The incoming tab content element
     * @param {Array} tabs - All tab content elements in the area
     * @param {Object} tabAreaData - Tab area configuration data
     * @param {boolean} skipHeightTransition - Skip height animation (used after GSAP)
     */
    completeTabSwitch(
      fromTab,
      toTab,
      tabs,
      tabAreaData,
      skipHeightTransition = false,
    ) {
      const { smoothHeight, transitionDuration, element } = tabAreaData;

      // Check if smooth height transition should be applied
      // Skip if called after GSAP animations (tabs already visible)
      if (smoothHeight && !skipHeightTransition) {
        // Apply smooth height transition along with tab switch
        this.animateHeightTransition(
          element,
          fromTab,
          toTab,
          transitionDuration,
          tabs,
          tabAreaData,
        );
      } else {
        // Instant switch - rely on CSS classes for visibility
        tabs.forEach((t) => {
          if (t !== toTab) {
            t.classList.remove('is-active');
            t.setAttribute('tabindex', '-1');
          }
        });

        toTab.classList.add('is-active');
        toTab.setAttribute('tabindex', '0');

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
    standardTabSwitch(fromTab, toTab, tabs, tabAreaData) {
      // Clean up any partial animation state
      if (fromTab) {
        this.resetElement(fromTab);
      }
      if (toTab) {
        this.resetElement(toTab);
      }

      // Complete the tab switch immediately
      this.completeTabSwitch(fromTab, toTab, tabs, tabAreaData);
    }

    /**
     * Generate a random letter for shuffle animation
     * @return {string} A random uppercase or lowercase letter
     */
    getRandomChar() {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      return letters.charAt(Math.floor(Math.random() * letters.length));
    }

    /**
     * Reset element animation state and clean up GSAP properties
     * @param {HTMLElement} target - The element to reset
     */
    resetElement(target) {
      // Clean up text splitter if it exists
      if (target.textSplitter) {
        target.textSplitter.revert();
        target.textSplitter = null;
      }

      // Restore properties that were modified during animation
      if (target.style.whiteSpace === 'nowrap') {
        target.style.whiteSpace = '';
      }
      if (target.style.overflow === 'hidden') {
        target.style.overflow = '';
      }
      // Reset fixed height that was set during animation
      if (target.style.height && target.style.height.endsWith('px')) {
        target.style.height = '';
      }

      // Restore child element heights that were locked during animation
      Array.from(target.children).forEach((child) => {
        if (child.style.height && child.style.height.endsWith('px')) {
          child.style.height = '';
        }
        if (child.style.overflow === 'hidden') {
          child.style.overflow = '';
        }
        if (child.style.whiteSpace === 'nowrap') {
          child.style.whiteSpace = '';
        }
      });

      // Clear all GSAP properties if GSAP is available
      if (typeof gsap !== 'undefined') {
        gsap.set(target, { clearProps: 'all' });
      }
    }

    /**
     * Execute onEnter animation (fade out) on outgoing tab content
     * Splits text into characters and animates them to opacity 0 with stagger from end
     * @param {HTMLElement} target - The tab content element to animate
     * @param {Object} config - GSAP animation configuration
     * @param {Function} onComplete - Callback to execute when animation completes
     * @return {boolean} True if animation started successfully, false if it failed
     */
    gsapOnEnter(target, config, onComplete) {
      // Check for valid tab content before animating
      if (!target || !target.textContent || !target.textContent.trim()) {
        // eslint-disable-next-line no-console
        console.warn(
          'Decoupled Tabs: Invalid tab content for GSAP animation, falling back to standard tab switch',
        );
        return false;
      }

      // Kill existing animation if present
      if (target.currentTween) {
        target.currentTween.kill();
      }

      // Reset element state
      this.resetElement(target);

      try {
        // Determine split type based on configuration
        let splitType = 'chars';
        if (config.splitLines) {
          splitType = 'chars,lines';
        }

        // eslint-disable-next-line no-console
        console.log('[gsapOnEnter] Config:', {
          splitChildren: config.splitChildren,
          splitLines: config.splitLines,
          splitType,
          targetChildren: target.children.length,
        });

        // Wrap text splitting in try-catch
        // If splitChildren is enabled, split each child element separately
        if (config.splitChildren) {
          // Get direct children of the target
          const children = Array.from(target.children);

          // eslint-disable-next-line no-console
          console.log('[gsapOnEnter] Splitting children:', children.length);

          if (children.length === 0) {
            // No children, split the target itself
            target.textSplitter = new SplitText(target, { type: splitType });
          } else {
            // Split each child element
            target.textSplitter = new SplitText(children, { type: splitType });
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('[gsapOnEnter] Splitting entire target as one block');
          // Split the entire target as one block
          target.textSplitter = new SplitText(target, { type: splitType });
        }

        // Animate characters to opacity 0 with stagger from end
        const chars = target.textSplitter.chars;
        const lines = target.textSplitter.lines || [];

        // eslint-disable-next-line no-console
        console.log(
          '[gsapOnEnter] Chars:',
          chars.length,
          'Lines:',
          lines.length,
        );

        // If splitLines is enabled and we have lines, animate each line independently
        if (config.splitLines && lines.length > 0) {
          // eslint-disable-next-line no-console
          console.log('[gsapOnEnter] Animating lines independently (fade out)');

          // Create a timeline to coordinate all line animations
          const tl = gsap.timeline({
            onComplete: () => {
              // Clear animation reference
              target.currentTween = null;
              // Call completion callback
              onComplete();
            },
          });

          // Animate each line - all lines start at the same time (position 0)
          lines.forEach((line) => {
            // Get all characters in this line
            const lineChars = Array.from(
              line.querySelectorAll('[style*="display: inline-block"]'),
            );

            // Animate characters in this line with stagger from end
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
              0, // All lines start at position 0 (simultaneously)
            );
          });

          target.currentTween = tl;
        } else {
          // Standard animation: all characters in sequence
          target.currentTween = gsap.to(chars, {
            duration: config.onEnterDuration,
            ease: 'none',
            autoAlpha: 0,
            stagger: {
              amount: config.staggerAmount,
              from: 'end',
            },
            onComplete: () => {
              // Clear animation reference
              target.currentTween = null;
              // Call completion callback
              onComplete();
            },
          });
        }

        return true;
      } catch (error) {
        // Log errors for debugging
        // eslint-disable-next-line no-console
        console.error(
          'Decoupled Tabs: Text splitting failed, falling back to standard tab switch',
          error,
        );
        // Clean up partial animation state
        this.resetElement(target);
        return false;
      }
    }

    /**
     * Execute onLeave animation (shuffle and reveal) on incoming tab content
     * Shuffles characters through random letters before revealing original content
     * @param {HTMLElement} target - The tab content element to animate
     * @param {Object} config - GSAP animation configuration
     * @param {Function} onComplete - Callback to execute when animation completes
     * @return {boolean} True if animation started successfully, false if it failed
     */
    gsapOnLeave(target, config, onComplete) {
      // eslint-disable-next-line no-console
      console.log('[gsapOnLeave] Starting animation', { target, config });

      // Check for valid tab content before animating
      if (!target || !target.textContent || !target.textContent.trim()) {
        // eslint-disable-next-line no-console
        console.warn(
          'Decoupled Tabs: Invalid tab content for GSAP animation, falling back to standard tab switch',
        );
        return false;
      }

      // Kill existing animation if present
      if (target.currentTween) {
        // eslint-disable-next-line no-console
        console.log('[gsapOnLeave] Killing existing tween');
        target.currentTween.kill();
      }

      // Reset element state before starting new animation
      this.resetElement(target);

      try {
        // Determine split type based on configuration
        let splitType = 'chars';
        if (config.splitLines) {
          splitType = 'chars,lines';
        }

        // eslint-disable-next-line no-console
        console.log('[gsapOnLeave] Config:', {
          splitChildren: config.splitChildren,
          splitLines: config.splitLines,
          splitType,
          targetChildren: target.children.length,
        });

        // Create new SplitText instance for the incoming tab
        // eslint-disable-next-line no-console
        console.log('[gsapOnLeave] Creating SplitText for target');

        // CRITICAL: Measure and store child heights BEFORE SplitText modifies the DOM
        // SplitText wraps text in divs which changes layout, especially with splitLines enabled
        // Use getBoundingClientRect for precise sub-pixel measurements
        const childHeights = new Map();
        Array.from(target.children).forEach((child) => {
          // getBoundingClientRect gives precise fractional heights (e.g., 118.125px)
          // offsetHeight rounds to integers which causes visual jumps
          childHeights.set(child, child.getBoundingClientRect().height);
        });

        // If splitChildren is enabled, split each child element separately
        if (config.splitChildren) {
          // Get direct children of the target
          const children = Array.from(target.children);

          // eslint-disable-next-line no-console
          console.log('[gsapOnLeave] Splitting children:', children.length);

          if (children.length === 0) {
            // No children, split the target itself
            target.textSplitter = new SplitText(target, { type: splitType });
          } else {
            // Split each child element
            target.textSplitter = new SplitText(children, { type: splitType });
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('[gsapOnLeave] Splitting entire target as one block');
          // Split the entire target as one block
          target.textSplitter = new SplitText(target, { type: splitType });
        }

        // Get the character array from the text splitter
        const chars = target.textSplitter.chars;
        const lines = target.textSplitter.lines || [];

        // eslint-disable-next-line no-console
        console.log(
          '[gsapOnLeave] SplitText created, chars:',
          chars.length,
          'lines:',
          lines.length,
        );

        // Validate that we have characters to animate
        if (!chars || chars.length === 0) {
          // eslint-disable-next-line no-console
          console.warn(
            'Decoupled Tabs: No characters available for animation, falling back to standard tab switch',
          );
          return false;
        }

        // Now lock child heights using the pre-measured values to prevent layout shifts
        // This prevents flickering when SplitText wraps lines and characters in divs
        const originalHeight = target.style.height;
        const childOriginalStyles = new Map();
        Array.from(target.children).forEach((child) => {
          const storedHeight = childHeights.get(child);
          if (storedHeight && !child.style.height) {
            // Store original styles for restoration
            childOriginalStyles.set(child, {
              height: child.style.height,
              overflow: child.style.overflow,
              whiteSpace: child.style.whiteSpace,
            });
            // Lock height and prevent wrapping
            child.style.height = `${storedHeight}px`;
            child.style.overflow = 'hidden';
            child.style.whiteSpace = 'nowrap';
          }
        });

        // Set all characters to opacity 0 initially
        gsap.set(chars, { autoAlpha: 0 });

        // If splitLines is enabled, also lock line div heights and prevent wrapping
        // SplitText creates line wrapper divs that can cause layout shifts
        // Use getBoundingClientRect for precise sub-pixel measurements
        if (config.splitLines && lines.length > 0) {
          lines.forEach((line) => {
            // Use getBoundingClientRect for fractional precision
            const lineHeight = line.getBoundingClientRect().height;
            line.style.height = `${lineHeight}px`;
            line.style.overflow = 'hidden';
            line.style.whiteSpace = 'nowrap';
          });
        }

        // Prevent line breaks and height jumps during scramble animation
        // Random characters can be wider than original content, causing unwanted wrapping
        // overflow: hidden prevents the overflowing text from affecting container height
        const originalWhiteSpace = target.style.whiteSpace;
        const originalOverflow = target.style.overflow;
        target.style.whiteSpace = 'nowrap';
        target.style.overflow = 'hidden';

        // Create GSAP timeline for shuffle effect
        const tl = gsap.timeline({
          onComplete: () => {
            // eslint-disable-next-line no-console
            console.log('[gsapOnLeave] Timeline complete');

            // CRITICAL: Revert SplitText FIRST to restore original DOM structure
            // This removes all wrapper divs and returns text to its natural state
            if (target.textSplitter) {
              target.textSplitter.revert();
              target.textSplitter = null;
            }

            // Use requestAnimationFrame to restore styles AFTER browser completes reflow
            // This prevents the visual jump by ensuring DOM is fully settled
            requestAnimationFrame(() => {
              // Restore original styles after DOM is back to normal
              target.style.whiteSpace = originalWhiteSpace;
              target.style.overflow = originalOverflow;
              target.style.height = originalHeight;

              // Restore child styles
              Array.from(target.children).forEach((child) => {
                const originalStyles = childOriginalStyles.get(child);
                if (originalStyles) {
                  child.style.height = originalStyles.height;
                  child.style.overflow = originalStyles.overflow;
                  child.style.whiteSpace = originalStyles.whiteSpace;
                }
              });

              // Clear animation reference
              target.currentTween = null;
              // Call completion callback
              onComplete();
            });
          },
        });

        // eslint-disable-next-line no-console
        console.log('[gsapOnLeave] Building timeline with config:', config);

        // If splitLines is enabled and we have lines, animate each line independently
        if (config.splitLines && lines.length > 0) {
          // eslint-disable-next-line no-console
          console.log('[gsapOnLeave] Animating lines independently');

          // Animate each line - all lines start at the same time (position 0)
          lines.forEach((line) => {
            // Get all characters in this line
            const lineChars = Array.from(
              line.querySelectorAll('[style*="display: inline-block"]'),
            );

            // Animate each character in this line with stagger
            lineChars.forEach((char, charIndex) => {
              // Store the original character content
              const originalChar = char.innerHTML;

              // Calculate the start time for this character within its line
              const charStartTime = charIndex * config.staggerDelay;

              // Create shuffle iterations - replace with random letters N times
              for (let i = 0; i < config.shuffleIterations; i++) {
                tl.to(
                  char,
                  {
                    duration: config.charDuration,
                    textContent: this.getRandomChar(),
                    autoAlpha: 1,
                    ease: 'none',
                  },
                  charStartTime + i * config.charDuration,
                );
              }

              // Restore original character content and animate to opacity 1
              tl.to(
                char,
                {
                  duration: config.charDuration,
                  textContent: originalChar,
                  autoAlpha: 1,
                  ease: 'none',
                },
                charStartTime + config.shuffleIterations * config.charDuration,
              );
            });
          });
        } else {
          // Standard animation: all characters in sequence
          // Animate each character with shuffle effect
          chars.forEach((char, index) => {
            // Store the original character content
            const originalChar = char.innerHTML;

            // Calculate the start time for this character's animation sequence
            const charStartTime = index * config.staggerDelay;

            // Create shuffle iterations - replace with random letters N times
            for (let i = 0; i < config.shuffleIterations; i++) {
              tl.to(
                char,
                {
                  duration: config.charDuration,
                  textContent: this.getRandomChar(),
                  autoAlpha: 1,
                  ease: 'none',
                },
                charStartTime + i * config.charDuration,
              );
            }

            // Restore original character content and animate to opacity 1
            tl.to(
              char,
              {
                duration: config.charDuration,
                textContent: originalChar,
                autoAlpha: 1,
                ease: 'none',
              },
              charStartTime + config.shuffleIterations * config.charDuration,
            );
          });
        }

        // eslint-disable-next-line no-console
        console.log('[gsapOnLeave] Timeline built, duration:', tl.duration());

        // Store timeline reference on element
        target.currentTween = tl;

        return true;
      } catch (error) {
        // Log errors for debugging
        // eslint-disable-next-line no-console
        console.error(
          'Decoupled Tabs: Animation creation failed, falling back to standard tab switch',
          error,
        );
        // Clean up partial animation state
        this.resetElement(target);
        return false;
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

# Implementation Plan

- [x] 1. Add GSAP library loading via CDN





  - Modify `decoupled-tabs.php` to enqueue GSAP core and TextSplitter from CDN
  - Ensure scripts load only on pages with tab blocks
  - Set correct dependency order (GSAP core → TextSplitter → tabs frontend script)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 1.1 Write unit tests for script enqueuing
  - Test GSAP core script is enqueued with correct URL
  - Test TextSplitter script is enqueued with GSAP dependency
  - Test scripts only load on pages with tab blocks
  - Test script load order is correct
  - _Requirements: 1.1, 1.2, 1.3, 1.4_


- [x] 2. Add GSAP animation attributes to Tab Area block




  - Update `src/blocks/tab-area/block.json` with new attributes
  - Add `gsapEnabled` boolean attribute (default: false)
  - Add `gsapShuffleIterations` number attribute (default: 2)
  - Add `gsapCharDuration` number attribute (default: 0.02)
  - Add `gsapStaggerAmount` number attribute (default: 0.25)
  - Add `gsapStaggerDelay` number attribute (default: 0.03)
  - Add `gsapOnEnterDuration` number attribute (default: 0.02)
  - _Requirements: 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 2.1 Write property test for block attribute persistence
  - **Property 1: Block attribute persistence**
  - **Validates: Requirements 2.4**
  - Generate random valid animation configurations
  - Save and load block, verify attributes persist
  - _Requirements: 2.4_

- [x] 3. Add GSAP animation controls to block editor UI





  - Update `src/blocks/tab-area/edit.js` with new inspector controls
  - Add PanelBody for "GSAP Animations"
  - Add ToggleControl for enabling GSAP animations
  - Add conditional rendering of animation parameter controls
  - Add RangeControl for shuffle iterations (min: 1, max: 10)
  - Add NumberControl for char duration (min: 0.01, max: 1, step: 0.01)
  - Add NumberControl for stagger amount (min: 0, max: 2, step: 0.05)
  - Add NumberControl for stagger delay (min: 0, max: 0.5, step: 0.01)
  - Add NumberControl for onEnter duration (min: 0.01, max: 1, step: 0.01)
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.1 Write unit tests for block editor UI
  - Test toggle control renders
  - Test animation controls appear when toggle enabled
  - Test animation controls hide when toggle disabled
  - Test default values for all parameters
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.2 Write property test for animation parameter reactivity
  - **Property 2: Animation parameter reactivity**
  - **Validates: Requirements 3.6**
  - Generate random parameter values
  - Update parameters, verify attributes update immediately
  - _Requirements: 3.6_

- [x] 4. Output GSAP settings as data attributes





  - Update `src/blocks/tab-area/save.js` to output data attributes
  - Add `data-gsap-enabled` attribute
  - Add `data-gsap-shuffle-iterations` attribute
  - Add `data-gsap-char-duration` attribute
  - Add `data-gsap-stagger-amount` attribute
  - Add `data-gsap-stagger-delay` attribute
  - Add `data-gsap-on-enter-duration` attribute
  - _Requirements: 6.1_

- [ ]* 4.1 Write unit tests for data attribute output
  - Test all data attributes are correctly output
  - Test attributes match block attribute values
  - Test attributes are properly formatted
  - _Requirements: 6.1_

- [x] 5. Implement GSAP configuration parsing in frontend





  - Update `initTabArea()` method in `src/frontend/tabs.js`
  - Read `data-gsap-enabled` attribute
  - Parse all GSAP configuration data attributes
  - Validate and clamp numeric values to valid ranges
  - Store configuration in tabAreaData object
  - _Requirements: 6.1_

- [ ]* 5.1 Write unit tests for configuration parsing
  - Test configuration is correctly parsed from data attributes
  - Test invalid values are clamped to valid ranges
  - Test fallback to defaults when attributes missing
  - _Requirements: 6.1_

- [ ]* 5.2 Write property test for configuration-based execution
  - **Property 10: Configuration-based execution**
  - **Validates: Requirements 6.1, 6.2, 6.3**
  - Generate random tab areas with GSAP enabled/disabled
  - Verify GSAP code executes only when enabled
  - _Requirements: 6.1, 6.2, 6.3_


- [x] 6. Implement animation helper methods




  - Add `getRandomChar()` method to generate random letters
  - Add `resetElement()` method to clean up animation state
  - Implement text splitter cleanup
  - Implement GSAP clearProps
  - _Requirements: 4.6, 4.9_

- [ ]* 6.1 Write unit tests for helper methods
  - Test getRandomChar returns valid letters
  - Test resetElement cleans up text splitter
  - Test resetElement clears GSAP properties
  - _Requirements: 4.6, 4.9_

- [x] 7. Implement onEnter animation (fade out)





  - Add `gsapOnEnter()` method to DecoupledTabs class
  - Kill existing animation if present
  - Reset element state
  - Split text into characters using SplitText
  - Animate characters to opacity 0 with stagger from end
  - Store animation reference on element
  - Call completion callback when done
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 7.1 Write property test for text splitting and character animation
  - **Property 4: Text splitting and character animation**
  - **Validates: Requirements 4.2, 4.3**
  - Generate random text content
  - Execute onEnter animation
  - Verify text split and opacity 0 with stagger
  - _Requirements: 4.2, 4.3_

- [x] 8. Implement onLeave animation (shuffle and reveal)





  - Add `gsapOnLeave()` method to DecoupledTabs class
  - Kill existing animation if present
  - Create GSAP timeline for shuffle effect
  - For each character, create shuffle iterations
  - Replace character with random letters N times
  - Restore original character content
  - Animate characters to opacity 1
  - Apply stagger delay between characters
  - Store timeline reference on element
  - Call completion callback when done
  - _Requirements: 4.5, 4.6, 4.7, 4.8_

- [ ]* 8.1 Write property test for shuffle iteration count
  - **Property 6: Shuffle iteration count**
  - **Validates: Requirements 4.6**
  - Generate random iteration counts
  - Execute shuffle effect
  - Verify actual iterations match configuration
  - _Requirements: 4.6_

- [ ]* 8.2 Write property test for shuffle round-trip consistency
  - **Property 5: Shuffle round-trip consistency**
  - **Validates: Requirements 4.7**
  - Generate random text content
  - Execute complete shuffle animation
  - Verify final text matches original exactly
  - _Requirements: 4.7_

- [ ]* 8.3 Write property test for character visibility restoration
  - **Property 7: Character visibility restoration**
  - **Validates: Requirements 4.8**
  - Generate random text content
  - Execute onLeave animation
  - Verify all characters reach opacity 1
  - _Requirements: 4.8_



- [x] 9. Implement animation sequence orchestration



  - Add `executeGSAPTransition()` method to DecoupledTabs class
  - Execute onEnter animation on outgoing tab
  - Wait for onEnter completion
  - Execute onLeave animation on incoming tab
  - Wait for onLeave completion
  - Complete tab switch (update visibility classes)
  - _Requirements: 4.1, 4.4, 6.4_

- [ ]* 9.1 Write property test for animation sequence execution
  - **Property 3: Animation sequence execution**
  - **Validates: Requirements 4.1, 4.4, 6.4**
  - Generate random tab pairs
  - Trigger tab switch with GSAP enabled
  - Verify onEnter → onLeave → visibility update order
  - _Requirements: 4.1, 4.4, 6.4_

- [x] 10. Integrate GSAP animations into tab switching logic









  - Update `activateTab()` method in `src/frontend/tabs.js`
  - Check if GSAP is enabled for tab area
  - If enabled and not immediate, call executeGSAPTransition()
  - If disabled or immediate, use standard tab switch
  - Maintain compatibility with smooth height transitions
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ]* 10.1 Write property test for smooth height compatibility
  - **Property 11: Smooth height compatibility**
  - **Validates: Requirements 6.5**
  - Generate tab areas with both features enabled
  - Execute tab switches
  - Verify both animations complete without conflicts
  - _Requirements: 6.5_


- [x] 11. Implement animation interruption handling








  - Ensure `currentTween.kill()` is called before new animations
  - Ensure `resetElement()` is called before new animations
  - Prevent animation queue buildup
  - Handle rapid tab switching gracefully
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 11.1 Write property test for animation interruption handling
  - **Property 9: Animation interruption handling**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  - Generate random tab switch sequences
  - Interrupt animations at random points
  - Verify clean interruption and restart
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 11.2 Write property test for animation cleanup
  - **Property 8: Animation cleanup**
  - **Validates: Requirements 4.9**
  - Generate random tab transitions
  - Execute complete animation
  - Verify no memory leaks (no tween/timeline references)
  - _Requirements: 4.9_


- [x] 12. Add error handling for GSAP availability



  - Check for `window.gsap` and `window.SplitText` availability
  - Fall back to standard tab switching if GSAP unavailable
  - Log warning to console for debugging
  - Do not break tab functionality
  - _Requirements: 6.3_

- [ ]* 12.1 Write unit tests for error handling
  - Test graceful fallback when GSAP unavailable
  - Test error handling for text splitting failures
  - Test handling of empty or missing tab content
  - Test cleanup after animation errors
  - _Requirements: 6.3_




- [x] 13. Add error handling for invalid content


  - Wrap text splitting in try-catch
  - Check for valid tab content before animating
  - Fall back to standard tab switch on errors
  - Log errors for debugging
  - Clean up partial animation state
  - _Requirements: 4.2_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Test complete feature end-to-end
  - Create test page with tab area block
  - Enable GSAP animations
  - Configure animation parameters
  - Test tab switching with animations
  - Test rapid tab switching
  - Test with smooth height transitions enabled
  - Test with GSAP disabled
  - Verify no console errors
  - _Requirements: All_

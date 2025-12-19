<?php
/**
 * Plugin Name: Decoupled Tabs
 * Description: A Gutenberg block for decoupled tabbed content - any block can trigger tab switching
 * Version: 1.0.0
 * Author: 
 * License: GPL-2.0-or-later
 * Text Domain: decoupled-tabs
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'DECOUPLED_TABS_VERSION', '1.0.0' );
define( 'DECOUPLED_TABS_PATH', plugin_dir_path( __FILE__ ) );
define( 'DECOUPLED_TABS_URL', plugin_dir_url( __FILE__ ) );

/**
 * Register blocks
 */
function decoupled_tabs_register_blocks() {
	// Register Tab Area block
	register_block_type( DECOUPLED_TABS_PATH . 'build/blocks/tab-area' );
	
	// Register Tab Content block
	register_block_type( DECOUPLED_TABS_PATH . 'build/blocks/tab-content' );
	
	// Register Tab Trigger block
	register_block_type( DECOUPLED_TABS_PATH . 'build/blocks/tab-trigger' );
}
add_action( 'init', 'decoupled_tabs_register_blocks' );

/**
 * Enqueue frontend scripts
 */
function decoupled_tabs_enqueue_frontend_scripts() {
	if ( is_admin() ) {
		return;
	}
	
	// Only enqueue if we have tab blocks on the page
	if ( has_block( 'decoupled-tabs/tab-area' ) ) {
		$asset_file = include( DECOUPLED_TABS_PATH . 'build/frontend/tabs.asset.php' );
		
		wp_enqueue_script(
			'decoupled-tabs-frontend',
			DECOUPLED_TABS_URL . 'build/frontend/tabs.js',
			$asset_file['dependencies'] ?? array(),
			$asset_file['version'] ?? DECOUPLED_TABS_VERSION,
			true
		);
	}
}
add_action( 'wp_enqueue_scripts', 'decoupled_tabs_enqueue_frontend_scripts' );

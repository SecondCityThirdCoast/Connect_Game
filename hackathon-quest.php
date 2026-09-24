<?php
/**
 * Plugin Name: Hackathon Quest
 * Description: A Zelda-style browser game. Add the shortcode [hackathon_quest] to any page or post.
 * Version:     0.1.0
 * Author:      Hackathon Team
 * License:     GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

// Cache-busting version: changes whenever any game file changes.
function hackathon_quest_version() {
    $latest = 0;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(__DIR__ . '/game', FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) {
        $latest = max($latest, $file->getMTime());
    }
    return (string) $latest;
}

function hackathon_quest_shortcode() {
    $ver = hackathon_quest_version();
    wp_enqueue_style('hackathon-quest-font', 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap', array(), null);
    // loader.js reads its own ?ver= and appends it to every game script it loads.
    wp_enqueue_script('hackathon-quest', plugins_url('game/loader.js', __FILE__), array(), $ver, true);
    return '<div id="game-root"></div>';
}
add_shortcode('hackathon_quest', 'hackathon_quest_shortcode');

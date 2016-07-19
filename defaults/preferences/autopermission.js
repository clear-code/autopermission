/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
	cookie      : cookies
	fullscreen  : HTML5 DOM fullscreen API
	geo         : HTML5 geolocation API
	image       : images
	indexedDB   : offline storage
	install     : installation of XPI (addons)
	offline-app : HTML5 offline API (storage, etc.)
	password    : password manager
	popup       : popup blocker
	push        : Web Push notifications

	0 = unknown
	1 = allow
	2 = deny
*/

/*
	pre-defined site specific permissions
*/
// pref("extensions.autopermission.sites.www.example.com", "popup=1, geo=2, install=2");
// pref("extensions.autopermission.sites.test-item", "test.example.com: popup=1, geo=2, install=2");


/*
	security policy style permissions (plan)
*/
// pref("extensions.autopermission.policy.trusted.sites", "www.example.com,www.example.jp");
// pref("extensions.autopermission.policy.trusted.cookie", 1);
// pref("extensions.autopermission.policy.trusted.fullscreen", 1);
// pref("extensions.autopermission.policy.trusted.geo", 1);
// pref("extensions.autopermission.policy.trusted.image", 1);
// pref("extensions.autopermission.policy.trusted.indexedDB", 1);
// pref("extensions.autopermission.policy.trusted.install", 1);
// pref("extensions.autopermission.policy.trusted.offline-app", 1);
// pref("extensions.autopermission.policy.trusted.password", 1);
// pref("extensions.autopermission.policy.trusted.popup", 1);
// pref("extensions.autopermission.policy.trusted.push", 1);
// // CAPS compatible configuration (to be converted to CAPS configurations)
// pref("extensions.autopermission.policy.trusted.javascript", 1);
// pref("extensions.autopermission.policy.trusted.localfilelinks", 1);


pref("extensions.autopermission.debug", false);

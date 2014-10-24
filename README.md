# How to use

Define a preference for websites, like:

    pref("extensions.autopermission.sites.<domain>", "<type1>=<value1>, <type2>=<value2>, ...");
    pref("extensions.autopermission.sites.<key>", "<domain>: <type1>=<value1>, <type2>=<value2>, ...");

For example:

    pref("extensions.autopermission.sites.www.example.com", "popup=1, geo=2, install=2");
    pref("extensions.autopermission.sites.test-item", "test.example.com: popup=1, geo=2, install=2");

To confirm permissions are correctly applied, see about:permissions.

Available types are:

 * `password`: Allow to save passwords to the password manager.
 * `geo`: Allow to access to the geolication API.
 * `cookie`: Allow to store Cookie.
 * `popup`: Allow to open popup windows (ads, etc.)
 * `indexedDB`: Allow to use offline storages.
 * `fullscreen`: Allow to activate DOM fullscreen.
 * `image`: Allow to load image files.
 * `install`: Allow to install addons.
 * `offline-app`: Allow to use offline-cache for web applications.

Available vlaues are:

 * `0`: Unknown. (clear the stored value and follow to the default preference)
 * `1`: Allow all.
 * `2`: Deny all.

For Cookies, there are more choices:

 * `0`: Unknown. (clear the stored value and follow to the default preference)
 * `1`: Allow all cookies permanently.
 * `2`: Deny all cookies permanently.
 * `8`: Allow all cookies only for the current session.
 * `9`: Allow first party cookies permanently, and deny all others.
 * `10`: Allow first party cookies permanently, and allow third party cookeis also permanently only when they are already accepted.

This is mainly designed for corporate-use.


# Usecase for MCD

You can control permissions like a security policy, with MCD.
For example:

    var PERM_DEFAULT = 0;
    var PERM_ALLOW   = 1;
    var PERM_DENY    = 2;
    
    // list of trusted sites
    pref("extensions.autopermission.policy.trusted.sites", "mozilla.com,mozilla.org");

    // permissions for trusted sites
    pref("extensions.autopermission.policy.trusted.cookie",         PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.fullscreen",     PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.geo",            PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.image",          PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.indexedDB",      PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.install",        PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.offline-app",    PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.password",       PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.popup",          PERM_ALLOW);
    
    // special permissions for trusted sites, based on Firefox's capability settings
    // allow/deny to run scripts in the site
    pref("extensions.autopermission.policy.trusted.javascript",     PERM_ALLOW);
    // allow/deny links to locak files
    pref("extensions.autopermission.policy.trusted.localfilelinks", PERM_ALLOW);

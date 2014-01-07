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

 * `0`: unknown (clear the stored value)
 * `1`: allow
 * `2`: deny

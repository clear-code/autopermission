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

This is mainly designed for corporate-use.


# Usecase for MCD

You can control permissions like a security policy, with MCD.
For example:

    var TRUSTED_HOSTS = [
      "mozilla.com",
      "mozilla.org"
    ];
    
    var PERM_DEFAULT = 0;
    var PERM_ALLOW   = 1;
    var PERM_DENY    = 2;
    
    var TRUSTED_HOST_PERMISSIONS = {
      "cookie":      PERM_DEFAULT,
      "fullscreen":  PERM_DEFAULT,
      "geo":         PERM_DEFAULT,
      "image":       PERM_DEFAULT,
      "indexedDB":   PERM_DEFAULT,
      "install":     PERM_DEFAULT,
      "offline-app": PERM_DEFAULT,
      "password":    PERM_DEFAULT,
      "popup":       PERM_ALLOW
    };
    
    //=======================================================================
    // Apply permissions from definitions
    //=======================================================================
    TRUSTED_HOST_PERMISSIONS = Object.keys(TRUSTED_HOST_PERMISSIONS).map(function(aKey) {
      return aKey + "=" + TRUSTED_HOST_PERMISSIONS[aKey];
    }).join(", ");
    TRUSTED_HOSTS.forEach(function(aSite) {
      pref("extensions.autopermission.sites." + aSite, aSite + ": " + TRUSTED_HOST_PERMISSIONS);
    });

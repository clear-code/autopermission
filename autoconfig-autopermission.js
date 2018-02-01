{// Permissions Auto Registerer, for Firefox 52/Thunderbird 52 and later
  const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
  const { Services } = Cu.import('resource://gre/modules/Services.jsm', {});
  const PermissionManager = Cc['@mozilla.org/permissionmanager;1']
                            .getService(Ci.nsIPermissionManager);
  const SITES_PREFIX = 'extensions.autopermission.sites.';
  const LAST_VALUE_SUFFIX = '.lastValue';

  const PERM_DEFAULT = 0;
  const PERM_ALLOW   = 1;
  const PERM_DENY    = 2;

  const permissions = {};
  const policies = {};

  const log = (aMessage) => {
    Services.console.logStringMessage(`[autopermission] ${aMessage}`);
  };

  const getDescendantPrefs = (aRoot) => {
    return Services.prefs.getChildList(aRoot, {}).sort();
  };

  const loadPolicies = () => {
    log('loadPolicies');
    const prefix = 'extensions.autopermission.policy.';
    for (let sitePref of getDescendantPrefs(prefix)) {
      const matched = sitePref.match(/^(.+\.)sites$/)
      if (!matched)
        return;
      try {
        const sites = getPref(sitePref, '').split(/[,\|\s]+/);

        const policyPrefix = matched[1];
        const policyName = policyPrefix.substring(prefix.length, policyPrefix.length - 1);
        log(`policy detected: ${policyName}`);
        const policy = {};
        const permissions = getChildPrefs(policyPrefix).map(aPref => {
            if (/\.sites$/.test(aPref))
              return null;
            const name = aPref.substring(policyPrefix.length);
            const value = getPref(aPref);
            switch (name) {
              case 'javascript':
                policy['javascript.enabled'] = translatePermissionToPolicyValue(value);
                return null;

              case 'localfilelinks':
                policy['checkloaduri.enabled'] = translatePermissionToPolicyValue(value);
                return null;

              default:
                return `${name}=${value}`;
            }
          })
          .filter(aValue => Boolean(aValue))
          .sort()
          .join(', ');

        for (let site of sites) {
          permissions[aOrigin] = permissions;
        }

        if (Object.keys(policy).length > 0) {
          policy.sites = sites.join(' ');
          policies[policyName] = policy;
          log(` => CAPS: ${uneval(policy)}`);
        }
      }
      catch(e) {
        log(`${sitePref}\n${e}`);
      }
    }
  };

  const translatePermissionToPolicyValue =  (aValue) => {
    if (aValue == PERM_ALLOW)
      return 'allAccess';
    else
      return 'noAccess';
  };

  const loadPermissions = () => {
    log('loadPermissions');
    for (let pref of getDescendantPrefs(SITES_PREFIX)) {
      if (/\.lastValue$/.test(pref))
        continue;
      try {
        const value = getPref(pref);
        if (typeof value != 'string')
          continue;
        const parsedPermission = parsePermission(value);
        const origin = parsedPermission.origin || pref.replace(SITES_PREFIX, '');
        log('permission detected: '+origin);

        permissions[origin] = parsedPermission.permission;
      }
      catch(e) {
        log(pref+'\n'+e);
      }
    }
  };

  const parsePermission = (aValue) => {
    let origin;
    if (aValue.indexOf(':') > 0) {
      aValue = aValue.replace(/^\s*((?:https?:\/\/)?[^:\s]+(?::\d+)?)\s*:\s*/, '');
      origin = RegExp.$1;
    }
    return { permission: aValue, origin };
  };

  const applyAllPermissions = (aPermissions) => {
    log('applyAllPermissions');
    for (let origin of Object.keys(aPermissions)) {
      const value = aPermissions[origin];
      const prefKey = SITES_PREFIX + origin;
      const lastValueKey = prefKey + LAST_VALUE_SUFFIX;
      try {
        if (getPref(lastValueKey) == value) {
          log(`skip already applied permissions for ${origin}`);
          continue;
        }
        log(`apply permissions for ${origin}: ${value}`);
        applyPermissions(origin, value);
        pref(lastValueKey, String(value));
      }
      catch(e) {
        log(`${origin} / ${value}\n${e}`);
      }
    }
  };

  const UCS2ToUTF8 = (aString) => {
    return unescape(encodeURIComponent(aString));
  }

  const applyPermissions = (aOrigin, aPermissions) => {
    if (!/^https?:\/\//.test(aOrigin)) {
      applyPermissions(`http://${aOrigin}`, aPermissions);
      applyPermissions(`https://${aOrigin}`, aPermissions);
      return;
    }

    const host = aOrigin.replace(/^https?\:\/\/|:\d+$/g, '');
    const uri = Services.io.newURI(aOrigin, null, null);
    for (let permissionWithType of aPermissions.split(/\s*[,\|]\s*/)) {
      let [type, permission] = permissionWithType.replace(/^\s+|\s+$/g, '').split(/\s*=\s*/);
      try {
        permission = parseInt(permission);
        if (permission === 0) {
          PermissionManager.remove(uri, type);
        }
        else {
          const current = PermissionManager.testPermission(uri, type);
          if (current != permission)
            PermissionManager.remove(uri, type);
          if (permission)
            PermissionManager.add(uri, type, permission);
        }
      }
      catch(e) {
        log(`${aOrigin} ${type}=${permission}\n${e}`);
      }
    }
  };

  const applyAllPolicies = () => {
    log('applyAllPolicies');

    const names = Object.keys(policies);
    for (let policyName of names) {
      const prefix = `capability.policy.${policyName}.`;
      const policy = policies[policyName];
      try {
        for (let key of Object.keys(policy)) {
          pref(prefix + key, String(policy[key]));
        }
        log(`policy ${policyName}: applied`);
      }
      catch(e) {
        log(`${policyName} ${uneval(policy)}\n${e}`);
      }
    }

    let oldNames;
    try {
      oldNames = getPref('capability.policy.policynames');
      if (!oldNames)
        throw new Error('no existing policy');
      log(`existing policy names: ${oldNames}`);
      oldNames = oldNames.split(' ').sort();
    }
    catch(e) {
      log(String(e));
      oldNames = [];
    }

    let newNames = {};
    for (let name of oldNames.concat(names)) {
      newNames[name] = true;
    }
    newNames = Object.keys(newNames).sort().join(' ');
    if (newNames != oldNames.join(' ')) {
      log(`updating capability.policy.policynames: => ${newNames}`);
      pref('capability.policy.policynames', String(newNames));
    }
  };

  const observer = {
    observe(aSubject, aTopic, aData) {
      Services.obs.removeObserver(observer, 'profile-do-change');
      Services.obs.removeObserver(observer, 'profile-after-change');
      loadPolicies();
      loadPermissions();
      applyAllPermissions(permissions);
      applyAllPolicies();
    }
  };
  Services.obs.addObserver(observer, 'profile-do-change', false);
  Services.obs.addObserver(observer, 'profile-after-change', false);
}

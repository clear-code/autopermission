/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const DEBUG = false;

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

const kCID  = Components.ID('{4048ba30-96a2-11de-8a39-0800200c9a66}');
const kID   = '@clear-code.com/autopermission/startup;1';
const kNAME = "AutoPermissionStartupService";

const ObserverService = Cc['@mozilla.org/observer-service;1']
		.getService(Ci.nsIObserverService);

const Pref = Cc['@mozilla.org/preferences;1']
		.getService(Ci.nsIPrefBranch)

const IOService = Cc['@mozilla.org/network/io-service;1']
		.getService(Ci.nsIIOService)

const PermissionManager = Cc['@mozilla.org/permissionmanager;1']
		.getService(Ci.nsIPermissionManager)

const ConsoleService = Cc['@mozilla.org/consoleservice;1']
		.getService(Ci.nsIConsoleService)

const SITES_PREFIX = 'extensions.autopermission.sites.';
const LAST_VALUE_SUFFIX = '.lastValue';

const PERM_DEFAULT = 0;
const PERM_ALLOW   = 1;
const PERM_DENY    = 2;

function mydump()
{
	var str = Array.slice(arguments).join('\n');
    ConsoleService.logStringMessage('[autopermission] ' + str);
	if (!DEBUG)
	  return;
	if (str.charAt(str.length-1) != '\n')
	  str += '\n';
	dump(str);
}

function UTF8ToUCS2(aString) {
  return decodeURIComponent(escape(aString));
}
function UCS2ToUTF8(aString) {
  return unescape(encodeURIComponent(aString));
}

function AutoPermissionStartupService() {
	this.permissions = {};
	this.policies = {};
}
AutoPermissionStartupService.prototype = {

	observe : function(aSubject, aTopic, aData)
	{
		switch (aTopic)
		{
			case 'app-startup':
				ObserverService.addObserver(this, 'profile-do-change', false);
				return;

			case 'profile-do-change':
				ObserverService.removeObserver(this, 'profile-do-change');
			case 'profile-after-change':
				this.init();
				return;
		}
	},

	init : function()
	{
		this.loadPolicies();
		this.loadPermissions();
		this.applyAllPermissions(this.permissions);
		this.applyAllPolicies();
	},

	loadPolicies : function()
	{
		mydump('loadPolicies');
		var prefix = 'extensions.autopermission.policy.';
		Pref.getChildList(prefix, {}).forEach(function(aSitesPref) {
			var matched = aSitesPref.match(/^(.+\.)sites$/)
			if (!matched)
				return;
			try {
				var sites = Pref.getCharPref(aSitesPref);
				sites = UTF8ToUCS2(sites).split(/[,\|\s]+/);

				var policyPrefix = matched[1];
				var policyName = policyPrefix.substring(prefix.length, policyPrefix.length - 1);
				mydump('policy detected: '+policyName);
				var policy = {};
				var permissions = Pref.getChildList(policyPrefix, {}).map(function(aPref) {
						if (/\.sites$/.test(aPref))
							return null;
						let name = aPref.substring(policyPrefix.length);
								let value = Pref.getIntPref(aPref);
						switch (name)
						{
							case 'javascript':
								policy['javascript.enabled'] = this.translatePermissionToPolicyValue(value);
								return null;

							case 'localfilelinks':
								policy['checkloaduri.enabled'] = this.translatePermissionToPolicyValue(value);
								return null;

							default:
								return name + '=' + value;
						}
					}, this)
					.filter(function(aValue) {
						return Boolean(aValue);
					})
					.sort()
					.join(', ');

				sites.forEach(function(aHost) {
					this.permissions[aHost] = permissions;
				}, this);

				if (Object.keys(policy).length > 0) {
					policy.sites = sites.join(' ');
					this.policies[policyName] = policy;
					mydump(' => CAPS: '+uneval(policy));
				}
			}
			catch(e) {
				mydump(aSitesPref+'\n'+e);
			}
		}, this);
	},
	translatePermissionToPolicyValue : function(aValue)
	{
		if (aValue == PERM_ALLOW)
			return 'allAccess';

		return 'noAccess';
	},

	loadPermissions : function()
	{
		mydump('loadPermissions');
		Pref.getChildList(SITES_PREFIX, {}).forEach(function(aPref) {
			if (/\.lastValue$/.test(aPref))
				return;
			try {
				if (Pref.getPrefType(aPref) != Pref.PREF_STRING)
					return;

				let value = Pref.getCharPref(aPref);
				value = UTF8ToUCS2(value);

				let parsedPermission = this.parsePermission(value);
				let host = parsedPermission.host || aPref.replace(SITES_PREFIX, '');
				mydump('permission detected: '+host);

				this.permissions[host] = parsedPermission.permission;
			}
			catch(e) {
				mydump(aPref+'\n'+e);
			}
		}, this);
	},

	parsePermission : function(aValue) {
		let host;
		if (aValue.indexOf(':') > 0) {
			aValue = aValue.replace(/^\s*([^:\s]+)\s*:\s*/, '');
			host = RegExp.$1;
		}
		return {permission: aValue, host: host};
	},

	applyAllPermissions : function(aPermissions)
	{
		mydump('applyAllPermissions');
		Object.keys(aPermissions).forEach(function(aHost) {
			try {
				var value = aPermissions[aHost];

				var prefKey = SITES_PREFIX + aHost;
				var lastValueKey = prefKey + LAST_VALUE_SUFFIX;
				if (
					Pref.getPrefType(lastValueKey) == Pref.PREF_STRING &&
					UTF8ToUCS2(Pref.getCharPref(lastValueKey)) == value
					) {
					mydump('skip already applied permissions for '+aHost);
					return;
				}

				mydump('apply permissions for '+aHost+': '+value);

				let lastValue = value;
				this.applyPermissions(aHost, value);
				Pref.setCharPref(lastValueKey, UCS2ToUTF8(lastValue));
			}
			catch(e) {
				mydump(aHost+' / '+value+'\n'+e);
			}
		}, this);
	},

	applyPermissions : function(aHost, aPermissions)
	{
		var UTF8Host = UCS2ToUTF8(aHost);
		aPermissions.split(/\s*[,\|]\s*/).forEach(function(aPermission) {
			let type, permission;
			[type, permission] = aPermission.replace(/^\s+|\s+$/g, '').split(/\s*=\s*/);
			try {
				permission = parseInt(permission);
				let uri = IOService.newURI('http://'+aHost, null, null);
				if (permission === 0) {
					PermissionManager.remove(UTF8Host, type);
				}
				else {
					let current = PermissionManager.testPermission(uri, type);
					if (current != permission)
						PermissionManager.remove(UTF8Host, type);
					if (permission)
						PermissionManager.add(uri, type, permission);
				}
			}
			catch(e) {
				mydump(aHost+' '+type+'='+permission+'\n'+e);
			}
		});
	},

	applyAllPolicies : function()
	{
		mydump('applyAllPolicies');

		var names = Object.keys(this.policies);
		names.forEach(function(aPolicyName) {
			var prefix = 'capability.policy.' + aPolicyName + '.';
			var policy = this.policies[aPolicyName];
			try {
				Object.keys(policy).forEach(function(aKey) {
					var value = policy[aKey];
					Pref.setCharPref(prefix + aKey, UCS2ToUTF8(value));
				}, this);
				mydump('policy '+aPolicyName+': applied');
			}
			catch(e) {
				mydump(aPolicyName+' '+uneval(policy)+'\n'+e);
			}
		}, this);

		var oldNames = [];
		try {
			oldNames = Pref.getCharPref('capability.policy.policynames');
			oldNames = UTF8ToUCS2(oldNames);
			mydump('existing policy names: '+oldNames);
			oldNames = oldNames.split(' ');
		}
		catch(e) {
			mydump('no existing policy');
		}

		var newNames = {};
		oldNames.concat(names).forEach(function(aName) {
			newNames[aName] = true;
		});
		newNames = Object.keys(newNames).join(' ');
		if (newNames != oldNames.join(' ')) {
			mydump('updating capability.policy.policynames: => '+newNames);
			Pref.setCharPref('capability.policy.policynames', UCS2ToUTF8(newNames));
		}
	},


	classID : kCID,
	contractID : kID,
	classDescription : kNAME,
	QueryInterface : XPCOMUtils.generateQI([Ci.nsIObserver]),
	_xpcom_categories : [
		{ category : 'app-startup', service : true }
	]

};

if (XPCOMUtils.generateNSGetFactory)
	var NSGetFactory = XPCOMUtils.generateNSGetFactory([AutoPermissionStartupService]);
else
	var NSGetModule = XPCOMUtils.generateNSGetModule([AutoPermissionStartupService]);

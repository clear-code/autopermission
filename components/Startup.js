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

const SITES_PREFIX = 'extensions.autopermission.sites.';
const LAST_VALUE_SUFFIX = '.lastValue';

function mydump()
{
	if (!DEBUG) return;
	var str = Array.slice(arguments).join('\n');
	if (str.charAt(str.length-1) != '\n') str += '\n';
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
		this.load();
		this.applyAll();
	},

	load : function()
	{
		Pref.getChildList(SITES_PREFIX, {}).forEach(function(aPref) {
			if (/\.lastValue$/.test(aPref))
				return;
			try {
				if (Pref.getPrefType(aPref) != Pref.PREF_STRING)
					return;

				let value = Pref.getCharPref(aPref);
				value = UTF8ToUCS2(value);

				let host;
				if (value.indexOf(':') > 0) {
					value = value.replace(/^\s*([^:\s]+)\s*:\s*/, '');
					host = RegExp.$1;
				}
				else {
					host = aPref.replace(prefix, '');
				}

				this.permissions[host] = value;
			}
			catch(e) {
				mydump(aPref+'\n'+e);
			}
		}, this);
	},

	applyAll : function()
	{
		Object.keys(this.permissions).forEach(function(aHost) {
			var value = this.permissions[aHost];

			var prefKey = SITES_PREFIX + aHost;
			var lastValueKey = prefKey + LAST_VALUE_SUFFIX;
			if (
				Pref.getPrefType(lastValueKey) == Pref.PREF_STRING &&
				UTF8ToUCS2(Pref.getCharPref(lastValueKey)) == value
				)
				return;

			let lastValue = value;
			this.applyPermissions(aHost, value);
			Pref.setCharPref(lastValueKey, UCS2ToUTF8(lastValue));
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

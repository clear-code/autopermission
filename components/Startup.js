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

function mydump()
{
	if (!DEBUG) return;
	var str = Array.slice(arguments).join('\n');
	if (str.charAt(str.length-1) != '\n') str += '\n';
	dump(str);
}
 
function AutoPermissionStartupService() { 
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
		this.applyAllPermissions();
	},

	applyAllPermissions : function()
	{
		const prefix = 'extensions.autopermission.sites.';
		Pref.getChildList(prefix, {}).forEach(function(aPref) {
			try {
				if (Pref.getPrefType(aPref) != Pref.PREF_STRING)
					return;

				let value = Pref.getCharPref(aPref);
				value = unescape(encodeURIComponent(value));

				let host;
				if (value.indexOf(':') > 0) {
					value = value.replace(/^\s*([^:\s]+)\s*:\s*/, '');
					host = RegExp.$1;
				}
				else {
					host = aPref.replace(prefix, '');
				}

				var lastModified = aPref+'.last';
				var now = Date.now();
				if (
					Pref.getPrefType(lastModified) != Pref.PREF_INT || // not applyed yet, or "override".
					Pref.getIntPref(lastModified) >= now // if it is a date in the future, then it means "should be overridden".
					) {
					this.applyPermissions(host, value);
					// only if the date is not saved yet, save it. if it have a special value "override" (string), then do nothing.
					if (Pref.getPrefType(lastModified) == Pref.PREF_INVALID)
						Pref.setIntPref(lastModified, now);
				}
			}
			catch(e) {
				mydump(aPref+'\n'+e);
			}
		}, this);
	},

	applyPermissions : function(aHost, aPermissions)
	{
		var UTF8Host = unescape(encodeURIComponent(aHost));
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

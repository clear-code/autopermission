const DEBUG = false;

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

const kCID  = Components.ID('{4048ba30-96a2-11de-8a39-0800200c9a66}'); 
const kID   = '@clear-code.com/autopermission/startup;1';
const kNAME = "Permissions Auto Registerer Startup Service";

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

				this.applyPermissions(host, value);
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
				let uri = IOService.newURI('http://'+aHost, null, null);
				if (PermissionManager.testPermission(uri, type)) {
					PermissionManager.remove(UTF8Host, type);
				}
				PermissionManager.add(uri, type, parseInt(permission));
			}
			catch(e) {
				mydump(aHost+' '+type+'='+permission+'\n'+e);
			}
		});
	},

  
	QueryInterface : XPCOMUtils.generateQI([Ci.nsIObserver]),
	_xpcom_categories : [
		{ category : 'app-startup', service : true }
	]
 
}; 

function NSGetModule(aCompMgr, aFileSpec)
{
	return XPCOMUtils.generateModule([AutoPermissionStartupService]);
}


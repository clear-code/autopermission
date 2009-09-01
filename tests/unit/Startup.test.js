var startupModule;

var prefix = 'extensions.autopermission.sites.';
var sites = [
		{ host   : 'comma-only.example.com',
		  value  : '  popup=1,geo =1,install= 2,image = 1 ' },
		{ host   : 'comma-and-space.example.com',
		  value  : '  popup=1, geo=1 ,install=2 , image = 1 ' },
		{ host   : 'pipe-only.example.com',
		  value  : '  popup=1, geo=1 ,install=2 , image = 1 ' },
		{ host   : 'pipe-and-space.example.com',
		  value  : '  popup=1| geo =1 |install= 2 | image = 1 ' },
		{ host   : 'pipe-and-comma.example.com',
		  value  : '  popup=1, geo =1 |install= 2 , image = 1 ' },
		{ host   : 'host-in-value1.example.com',
		  key    : prefix + 'host-in-value1',
		  value  : ' host-in-value1.example.com: popup=1, geo =1 |install= 2 , image = 1 ' },
		{ host   : 'host-in-value2.example.com',
		  key    : prefix + 'host-in-value2',
		  value  : 'host-in-value2.example.com : popup=1, geo =1 |install= 2 , image = 1 ' }
	];
var permissions = {
		popup   : 1,
		geo     : 1,
		install : 2,
		image   : 1
	};

sites.forEach(function(aSite) {
	if (!aSite.key)
		aSite.key = prefix + aSite.host;
	aSite.permission = aSite.value.replace(/^[^:]+:/, '');
});

function clearPermissions(aHost)
{
	let uri = utils.makeURIFromSpec('http://'+aHost);
	let UTF8Host = utils.UCS2ToUTF8(aHost);
	for (let i in permissions)
	{
		if (PermissionManager.testPermission(uri, i))
			PermissionManager.remove(UTF8Host, i);
	}
}


function setUp()
{
	Pref.getChildList(prefix, {}).forEach(function(aPref) {
		utils.clearPref(aPref);
	}, this);

	sites.forEach(function(aSite) {
		utils.setPref(aSite.key, aSite.value);
		clearPermissions(aSite.host);
	});

	var namespace = {};
	utils.include('../../components/Startup.js', namespace);
	startupModule = new namespace.AutoPermissionStartupService();
}

function tearDown()
{
	sites.forEach(function(aSite) {
		clearPermissions(aSite.host);
	});
}


function test_applyPermissions()
{
	sites.forEach(function(aSite) {
		startupModule.applyPermissions(aSite.host, aSite.permission);

		let uri = utils.makeURIFromSpec('http://'+aSite.host);
		for (let i in permissions)
		{
			Assert.equals(permissions[i], PermissionManager.testPermission(uri, i));
		}
	});
}

function test_applyAllPermissions()
{
	startupModule.applyAllPermissions();

	sites.forEach(function(aSite) {
		let uri = utils.makeURIFromSpec('http://'+aSite.host);
		for (let i in permissions)
		{
			Assert.equals(permissions[i], PermissionManager.testPermission(uri, i));
		}
	});
}


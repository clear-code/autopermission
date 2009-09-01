var startupModule;

function setUp()
{
	const prefix = 'extensions.autopermission.sites.';
	Pref.getChildList(prefix, {}).forEach(function(aPref) {
		utils.clearPref(aPref);
	}, this);

	utils.setPref(prefix+'comma-only.example.com', '  popup=1,geo =1,install= 2,image = 1 ');
	utils.setPref(prefix+'comma-and-space.example.com', '  popup=1, geo=1 ,install=2 , image = 1 ');
	utils.setPref(prefix+'pipe-only.example.com', '  popup=1, geo=1 ,install=2 , image = 1 ');
	utils.setPref(prefix+'pipe-and-space.example.com', '  popup=1| geo =1 |install= 2 | image = 1 ');
	utils.setPref(prefix+'pipe-and-comma.example.com', '  popup=1, geo =1 |install= 2 , image = 1 ');
	utils.setPref(prefix+'domain-in-value1', ' domain-in-value1.example.com: popup=1, geo =1 |install= 2 , image = 1 ');
	utils.setPref(prefix+'domain-in-value1', 'domain-in-value1.example.com : popup=1, geo =1 |install= 2 , image = 1 ');

	var namespace = {};
	utils.include('../../components/Startup.js', namespace);
	startupModule = new namespace.AutoPermissionStartupService();
}

function tearDown()
{
}




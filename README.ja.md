# 使い方

Webサイト用の設定を以下の形式で定義します。

    pref("extensions.autopermission.sites.<domain>", "<type1>=<value1>, <type2>=<value2>, ...");
    pref("extensions.autopermission.sites.<key>", "<domain>: <type1>=<value1>, <type2>=<value2>, ...");

例：

    pref("extensions.autopermission.sites.www.example.com", "popup=1, geo=2, install=2");
    pref("extensions.autopermission.sites.test-item", "test.example.com: popup=1, geo=2, install=2");

設定が正しく適用されているかどうかを確認するには、about:permissionsを参照して下さい。

利用可能な設定の種類は以下の通りです。

 * `password`: パスワードをパスワードマネージャに保存する事を許可します。
 * `geo`: 位置情報APIへのアクセスを許可します。
 * `cookie`: Cookieの保存を許可します。
 * `popup`: 広告などのポップアップウィンドウを開く事を許可します。
 * `indexedDB`: オフラインストレージの利用を許可します。
 * `fullscreen`: DOMフルスクリーンの利用を許可します。
 * `image`: 画像の読み込みを許可します。
 * `install`: アドオンのインストールを許可します。
 * `offline-app`: Webアプリケーションのオフラインキャッシュの利用を許可します。

指定可能な値は以下の通りです。

 * `0`: 不明（保存された値を消去する）
 * `1`: 許可
 * `2`: 禁止

Cookieの保存の許可については、さらに他の値も指定できます。すべての値の意味は以下の通りです。

 * `0`: 不明（保存された値を消去する）
 * `1`: すべてのCookieを永続的に許可
 * `2`: すべてのCookieを永続的に禁止
 * `8`: すべてのCookieをセッション中のみ許可
 * `9`: ファーストパーティCookieのみ永続的に許可
 * `10`: ファーストパーティCookieのみ永続的に許可するが、既にサードパーティCookieが保存されていた場合はそのサードパーティCookieも永続的に許可

このアドオンは主に法人利用を想定して開発されています。


# MCDでの使用例

MCDと組み合わせて利用する場合、以下のようにすると、セキュリティポリシー設定と似た形での運用が可能となります。

    // 信頼済みサイトの一覧
    var TRUSTED_HOSTS = [
      "mozilla.com",
      "mozilla.org"
    ];
    
    var PERM_DEFAULT = 0;
    var PERM_ALLOW   = 1;
    var PERM_DENY    = 2;
    
    // 信頼済みサイトに与える権限
    var TRUSTED_HOST_PERMISSIONS = {
      "cookie":      PERM_DEFAULT, // Cookieの保存の可否
      "fullscreen":  PERM_DEFAULT, // DOMフルスクリーンの利用の可否
      "geo":         PERM_DEFAULT, // 位置情報APIへのアクセスの可否
      "image":       PERM_DEFAULT, // 画像の読み込みの可否
      "indexedDB":   PERM_DEFAULT, // オフラインストレージの利用の可否
      "install":     PERM_DEFAULT, // アドオンのインストールの可否
      "offline-app": PERM_DEFAULT, // Webアプリケーションのオフラインキャッシュの利用の可否
      "password":    PERM_DEFAULT, // パスワードマネージャの利用の可否
      "popup":       PERM_ALLOW    // 広告などのポップアップウィンドウを開く事の可否
    };
    
    //=======================================================================
    // 信頼済みサイト用の設定を適用する処理
    //=======================================================================
    TRUSTED_HOST_PERMISSIONS = Object.keys(TRUSTED_HOST_PERMISSIONS).map(function(aKey) {
      return aKey + "=" + TRUSTED_HOST_PERMISSIONS[aKey];
    }).join(", ");
    TRUSTED_HOSTS.forEach(function(aSite) {
      pref("extensions.autopermission.sites." + aSite, aSite + ": " + TRUSTED_HOST_PERMISSIONS);
    });

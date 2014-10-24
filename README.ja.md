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
 * `camera`: カメラの利用を許可します。
 * `microphone`: マイクの利用を許可します。

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

    var PERM_DEFAULT = 0;
    var PERM_ALLOW   = 1;
    var PERM_DENY    = 2;
    
    // 信頼済みサイトの一覧
    pref("extensions.autopermission.policy.trusted.sites", "mozilla.com,mozilla.org");

    // 信頼済みサイトに与える権限
    pref("extensions.autopermission.policy.trusted.camera",         PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.cookie",         PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.fullscreen",     PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.geo",            PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.image",          PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.indexedDB",      PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.install",        PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.microphone",     PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.offline-app",    PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.password",       PERM_ALLOW);
    pref("extensions.autopermission.policy.trusted.popup",          PERM_ALLOW);
    
    // Firefox本体のポリシー機能との連携
    // JavaScriptの実行の可否
    pref("extensions.autopermission.policy.trusted.javascript",     PERM_ALLOW);
    // ローカルファイルへのリンクの可否
    pref("extensions.autopermission.policy.trusted.localfilelinks", PERM_ALLOW);

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

このアドオンは主に法人利用を想定して開発されています。

# ROOM 0からの脱出 — 透明な箱

ゆるくてかわいいキャラクターと白い実験室を探索する、短編ブラウザ脱出ゲームです。

[GitHub Pagesで遊ぶ](https://ainamakeneko.github.io/exitgame/) ・ [最新版をZIPでダウンロード](https://github.com/ainamakeneko/exitgame/archive/refs/heads/main.zip)

![ゲーム画面](assets/room-center.webp)

## 内容

- 窓側・正面・扉側の3方向を見回して探索
- 窓の開閉で変化する仕掛け
- 天井パネル、数字のメモ、4桁の金庫
- 植物・光・電池・空気を題材にした謎解き
- キャラクターのランダムな台詞と12種類のしぐさ
- 効果音と朝の喫茶店風BGM
- スマートフォン対応（横向き推奨）
- 誤答ペナルティなし

原作小説：<https://tales.note.com/ai_neko_namake/wg2aeh5gcycx9/episodes/evy08qtp1tkrz>

## ローカルで遊ぶ

ZIPを展開し、`index.html` をブラウザで開いてください。

音声が再生されない場合は、展開したフォルダーで簡易サーバーを起動します。

```bash
python -m http.server 8000
```

その後、ブラウザで <http://localhost:8000> を開きます。

## ファイル構成

```text
index.html          ゲーム画面
game.js             ゲーム進行・仕掛け・音声制御
styles.css          レイアウトと演出
assets/             キャラクター・背景・BGM
tools/              BGM生成用スクリプト
ASSET_LICENSE.md    素材と物語の利用条件
LICENSE             ソースコードのMITライセンス
```

## ライセンス

プログラム部分は [MIT License](LICENSE) です。

ただし、物語、台詞、キャラクター、画像、音楽、効果音などの創作素材はMITライセンスの対象外です。詳しくは [ASSET_LICENSE.md](ASSET_LICENSE.md) を確認してください。

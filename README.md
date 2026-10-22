# cardwire-gnomeext

GNOME Shell top bar indicator showing the cardwire dGPU power state
(`cardwire gpu --power 1`). Text only, no dropdown, OS default font.

## Install

```bash
cp -r cardwire-dgpu@local ~/.local/share/gnome-shell/extensions/
gnome-extensions enable cardwire-dgpu@local
```

Waylandでは再ログイン後に反映される。ログ確認:

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

## Uninstall

```bash
gnome-extensions disable cardwire-dgpu@local
rm -rf ~/.local/share/gnome-shell/extensions/cardwire-dgpu@local
```

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

const GPU_ID = '1';
const POLL_SECONDS = 2;

class DgpuIndicator extends PanelMenu.Button {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        // dontCreateMenu=true: no dropdown, text only
        super(0.0, 'cardwire-dgpu', true);
        this._updating = false;
        this._alive = true;
        this._timer = 0;
        this._label = new St.Label({
            text: '…',
            y_align: Clutter.ActorAlign.CENTER,
            y_expand: true,
        });
        this.add_child(this._label);
    }

    start() {
        this._update();
        this._timer = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            POLL_SECONDS,
            () => {
                this._update();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    stop() {
        this._alive = false;
        if (this._timer !== 0) {
            GLib.source_remove(this._timer);
            this._timer = 0;
        }
    }

    _set(text) {
        if (this._alive)
            this._label.set_text(text);
    }

    _update() {
        if (this._updating || !this._alive)
            return;
        this._updating = true;
        let proc;
        try {
            proc = Gio.Subprocess.new(
                ['cardwire', 'gpu', '--power', GPU_ID],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );
        } catch {
            this._updating = false;
            this._set('?');
            return;
        }
        proc.communicate_utf8_async(null, null, (p, res) => {
            try {
                const [, stdout] = p.communicate_utf8_finish(res);
                if (p.get_exit_status() === 0 && stdout && stdout.trim())
                    this._set(stdout.trim());
                else
                    this._set('?');
            } catch {
                this._set('?');
            } finally {
                this._updating = false;
            }
        });
    }
}

export default class CardwireDgpuExtension extends Extension {
    enable() {
        this._indicator = new DgpuIndicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
        this._indicator.start();
    }

    disable() {
        if (this._indicator) {
            this._indicator.stop();
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}

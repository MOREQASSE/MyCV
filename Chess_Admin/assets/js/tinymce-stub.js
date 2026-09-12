/* Portfolio-demo stub: stands in for the TinyMCE cloud editor (which needs a
   private API key). Exposes the same surface the admin pages call so rich-text
   areas degrade to plain textareas with zero console errors. */
(function () {
    'use strict';
    var editors = {};
    function fakeEditor(id) {
        return {
            id: id,
            save: function () {
                var ta = document.getElementById(id);
                if (ta) this._content = ta.value;
            },
            getContent: function () {
                var ta = document.getElementById(id);
                return ta ? ta.value : (this._content || '');
            },
            setContent: function (html) {
                var ta = document.getElementById(id);
                if (ta) ta.value = html;
                this._content = html;
            },
            on: function () {},
            _content: ''
        };
    }
    window.tinymce = {
        init: function (opts) {
            try {
                var sel = (opts && opts.selector) || '';
                document.querySelectorAll(sel).forEach(function (ta) {
                    if (ta && ta.id && !editors[ta.id]) editors[ta.id] = fakeEditor(ta.id);
                });
            } catch (e) {}
        },
        get: function (id) {
            if (!editors[id]) {
                var ta = document.getElementById(id);
                if (!ta) return null;
                editors[id] = fakeEditor(id);
            }
            return editors[id];
        },
        triggerSave: function () {
            Object.keys(editors).forEach(function (id) { editors[id].save(); });
        }
    };
})();

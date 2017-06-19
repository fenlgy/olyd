/* ==============================================================================
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * FEN 修改于 2016.8.12 可以被requirejs 加载
 */
;(function (factory) {
    if (typeof exports == "object" && typeof module == "object")
    // CommonJS
        factory(require("jquery"));
    else if (typeof define == "function" && define.amd)
    // AMD
        define(["jquery"], factory);
    else
    // 全局模式
        factory(jQuery);
})(function ($) {
    var strToJson = function (str){
        var json = (new Function("return " + str))();
        return json;
    }

    $.fn.spinner = function (para) {
        return this.each(function () {
            var defaults = {value:1, min:0}

            var customOpts = $(this).attr('spinner-opts');
            var opts = customOpts ? strToJson(customOpts) : {};

            var options = $.extend({},defaults, opts,para)
            var keyCodes = {up:38, down:40}
            var container = $('<div class="nui-spinner"></div>')
            // container.addClass('nui-spinner')
            var textField = $(this).addClass('value nui-spinner-input').attr('maxlength', '2').val(options.value)
                .bind('keyup paste change', function (e) {
                    var field = $(this)
                    if (e.keyCode == keyCodes.up) changeValue(1)
                    else if (e.keyCode == keyCodes.down) changeValue(-1)
                    else if (getValue(field) != container.data('lastValidValue')) validateAndTrigger(field)
                })
            textField.wrap(container)

            var increaseButton = $('<button type="button" class="increase nui-spinner-btn">+</button>').click(function () { changeValue(1) })
            var decreaseButton = $('<button type="button" class="decrease nui-spinner-btn">-</button>').click(function () { changeValue(-1) })

            validate(textField)
            container.data('lastValidValue', options.value)
            textField.before(decreaseButton)
            textField.after(increaseButton)

            function changeValue(delta) {
                var mun = getValue() + delta;
                textField.val(mun)
                validateAndTrigger(textField)
            }

            function validateAndTrigger(field) {
                clearTimeout(container.data('timeout'))
                var value = validate(field)
                if (!isInvalid(value)) {
                    textField.trigger('update', [field, value])
                    if(options.changeValue){
                        options.changeValue(value);
                    }
                }
            }

            function validate(field) {
                var value = getValue()
                if (value <= options.min) decreaseButton.attr('disabled', 'disabled')
                else decreaseButton.removeAttr('disabled')
                if(options.hasOwnProperty("max") ){
                    if (value >= options.max) increaseButton.attr('disabled', 'disabled')
                    else increaseButton.removeAttr('disabled')
                }
                field.toggleClass('invalid', isInvalid(value)).toggleClass('passive', value === 0)

                if (isInvalid(value)) {
                    var timeout = setTimeout(function () {
                        textField.val(container.data('lastValidValue'))
                        validate(field)
                    }, 500)
                    container.data('timeout', timeout)
                } else {
                    container.data('lastValidValue', value)
                }
                return value
            }

            function isInvalid(value) {
                if(options.hasOwnProperty("max") ){
                    return isNaN(+value) || value < options.min || value > options.max;
                } else{
                    return isNaN(+value) || value < options.min;
                }
            }

            function getValue(field) {
                field = field || textField;
                return parseInt(field.val() || 0, 10)
            }
        })
    }

    $(function () {
        $("input[oly-widget = 'spinner']").spinner();
    });
})
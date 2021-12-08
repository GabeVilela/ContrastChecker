$(window).on("load", function () {
    const LXRGB = [0.2126, 0.7152, 0.0722];
    const CID = ["bg", "fg", "hl", "ac"];
    var rls = [0.0, 0.0, 0.0, 0.0];

    /**
     * Takes a input with values in Hexadecimal (including #)
     * and returns a RGB array
     * @param {String} input_id Element ID, as it is in HTML
     * @return {Array} Array with Red, Green and Blue values
    */
    function getInput(input_id) {
        let v = $("#" + input_id).val().substring(1);
        var r = _translateToDec(v.substring(0, 2).toUpperCase());
        var g = _translateToDec(v.substring(2, 4).toUpperCase());
        var b = _translateToDec(v.substring(4, 6).toUpperCase());
        return [r, g, b];
    }

    function calculateRL(input_color) {
        let rgb = getInput("cp_" + CID[input_color]);
        let v = rl_math(rgb);
        rls[input_color] = v;
        $("span.rl." + CID[input_color]).text(v.toFixed(4) + "% R.L.");
        return v;
    }

    function _translateToDec(hex) {
        var a = hex.substring(0, 1);
        var b = hex.substring(1, 2);
        if (a == "0") {
            return _translateSingle(b);
        }
        else {
            var result = 0;
            switch (_translateSingle(a)) {
                case 1: result = 16; break;
                case 2: result = 32; break;
                case 3: result = 48; break;
                case 4: result = 64; break;
                case 5: result = 80; break;
                case 6: result = 96; break;
                case 7: result = 112; break;
                case 8: result = 128; break;
                case 9: result = 144; break;
                case 10: result = 160; break;
                case 11: result = 176; break;
                case 12: result = 192; break;
                case 13: result = 208; break;
                case 14: result = 224; break;
                case 15: result = 240; break;
                default: result = 0; break;
            }
            return result + _translateSingle(b);
        }
    }

    function _translateSingle(hex_digit) {
        switch (hex_digit) {
            case "A": return 10;
            case "B": return 11;
            case "C": return 12;
            case "D": return 13;
            case "E": return 14;
            case "F": return 15;
            default: return Number(hex_digit);
        }
    }


    function rl_math(rgb) {
        let lrgb = [0, 0, 0];
        let result = 0.0;
        for (let i = 0; i < 3; i++) {
            let v = rgb[i] / 255;
            if (v <= 0.03928) {
                lrgb[i] = v / 12.92;
            }
            else {
                let a = v + 0.055;
                let b = a / 1.055;
                lrgb[i] = ((v + 0.055) / 1.055) ** 2.4;
            }
        }
        for (let i = 0; i < 3; i++) {
            result += (LXRGB[i] * lrgb[i]);
        }
        return result;
    }

    function updateInputs(input) {
        if (input[1] == 0) {
            $("#hex_" + CID[input[0]]).val($("#cp_" + CID[input[0]]).val().substring(1));
        }
        else {
            $("#cp_" + CID[input[0]]).val("#" + $("#hex_" + CID[input[0]]).val());
        }
    }

    function calculateContrast(ids) {
        let rl = [calculateRL(ids[0]), calculateRL(ids[1])];
        let result = (rl[0] > rl[1]) ? (rl[0] + 0.05) / (rl[1] + 0.05) : (rl[1] + 0.05) / (rl[0] + 0.05);
        let DOMid = "";
        switch (ids[0]) {
            case 0:
                switch (ids[1]) {
                    case 1: DOMid = "r_bg_fg"; break;
                    case 2: DOMid = "r_bg_hl"; break;
                    case 3: DOMid = "r_bg_ac"; break;
                    default: break;
                }
                break;
            case 1: DOMid = "r_fg_hl"; break;
            case 2: DOMid = "r_hl_ac"; break;
            default: break;
        }
        $("#" + DOMid).text(result.toFixed(2) + ":1" + checkWCAG(result));
    }

    function checkWCAG(contrastRatio) {
        let s = " - ";
        if (contrastRatio >= 7) {
            return s + "AAA";
        }
        else if (contrastRatio >= 4.5) {
            return s + "AAA Partial & AA";
        }
        else if (contrastRatio >= 3.1) {
            return s + "AA Partial";
        }
        else {
            return "";
        }
    }

    function setBGColor(colorId) {
        let value = $("#cp_" + CID[colorId]).val();
        $("#cg_" + CID[colorId]).css("background-color", value);
        if (rls[colorId] > 0.3) {
            $("#t_" + CID[colorId]).attr("style", "--color: #000000");
        }
        else {
            $("#t_" + CID[colorId]).attr("style", "--color: #FFFFFF");
        }
        $("body").attr("style", getBodyColors());
    }

    function getBodyColors() {
        let result = "";
        for (let i = 0; i < CID.length; i++) {
            result += "--color_" + CID[i] + ": " + $("#cp_" + CID[i]).val() + "; ";
        }
        return result;
    }

    function updateLock(colorId) {
        let og = $("#ogc_" + CID[colorId]).val();
        let n = $("#nm_" + CID[colorId]).val();
        if (Number(n) != 0) {
            _togglerInputs(colorId, true);
            if (og == "") {
                $("#ogc_" + CID[colorId]).val($("#cp_" + CID[colorId]).val());
            }
            updateShadeTint(colorId);
        }
        else {
            _togglerInputs(colorId, false);
            if (og != "") {
                $("#cp_" + CID[colorId]).val(og);
            }
            $("#ogc_" + CID[colorId]).val("");
            updateInputs([colorId, 0]);
        }
        update([colorId, 0]);
    }

    function _togglerInputs(colorId, areDisabled) {
        $("#hex_" + CID[colorId]).prop("disabled", areDisabled);
        $("#cp_" + CID[colorId]).prop("disabled", areDisabled);
    }

    function _mathShade(baseRGB, value) {
        let newRGB = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            newRGB[i] = Math.round(baseRGB[i] * value);
        }
        return newRGB;
    }

    function _mathTint(baseRGB, value) {
        let newRGB = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            newRGB[i] = Math.round(baseRGB[i] + ((255 - baseRGB[i]) * value));
        }
        return newRGB;
    }

    function translateToHex(rgb) {
        let result = "#";
        for (let i = 0; i < 3; i++) {
            let d = rgb[i];
            let v = rgb[i].toString(16);
            if (d < 16) {
                v = "0" + v;
            }
            result += v;
        }
        return result;
    }

    function updateShadeTint(colorId) {
        let n = $("#nm_" + CID[colorId]).val() / 100;
        let baseRGB = getInput("ogc_" + CID[colorId]);
        if (n != 0) {
            let value = [0, 0, 0];
            if (n < 0) {
                // Turn darker
                value = _mathShade(baseRGB, 1 + n);
            }
            else {
                // Turn lighter
                value = _mathTint(baseRGB, n);
            }
            $("#cp_" + CID[colorId]).val(translateToHex(value));
        }
    }


    function update(input) {
        updateInputs(input);
        let script = [];
        switch (input[0]) {
            case 0: script = [1, 2, 3]; break;
            case 1: script = [0, 2]; break;
            case 2: script = [0, 1, 3]; break;
            case 3: script = [0, 2]; break;
            default: break;
        }
        for (let i = 0; i < script.length; i++) {
            if (input[0] > script[i]) {
                calculateContrast([script[i], input[0]]);
            }
            else {
                calculateContrast([input[0], script[i]]);
            }
        }
        setBGColor(input[0]);
    }

    update([0, 0]);
    update([1, 0]);
    update([2, 0]);
    update([3, 0]);

    $("#cp_bg").on("input", function () {
        update([0, 0]);
    });
    $("#hex_bg").on("input", function () {
        update([0, 1]);
    });
    $("#nm_bg").on("input", function () {
        updateLock(0);
    })


    $("#cp_fg").on("input", function () {
        update([1, 0]);
    });
    $("#hex_fg").on("input", function () {
        update([1, 1]);
    });
    $("#nm_fg").on("input", function () {
        updateLock(1);
    })


    $("#cp_hl").on("input", function () {
        update([2, 0]);
    });
    $("#hex_hl").on("input", function () {
        update([2, 1]);
    });
    $("#nm_hl").on("input", function () {
        updateLock(2);
    })


    $("#cp_ac").on("input", function () {
        update([3, 0]);
    });
    $("#hex_ac").on("input", function () {
        update([3, 1]);
    });
    $("#nm_ac").on("input", function () {
        updateLock(3);
    })
});
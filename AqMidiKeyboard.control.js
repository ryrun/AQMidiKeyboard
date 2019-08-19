loadAPI(6);
host.defineController("Generic", "AQ Midi Keyboard", "1.0", "797E74F0-C29F-11E9-BB97-0800200C9A66");
host.defineMidiPorts(1, 0);

transpose = 0;
multinote = 0;
transposeArr = [];

function init() {
    prefs = host.getPreferences();
    allChannels = host.getMidiInPort(0);
    notes = allChannels.createNoteInput("Midi Notes", "8?????", "9?????", "D?????", "E?????", "A?????");
    notes.setShouldConsumeEvents(false);
    allChannels.setMidiCallback(onMidi);

    //Transpose settings
    var transposeSetting = prefs.getEnumSetting("Tranpose notes (white keys)", "Settings",
        [
            "-7   D minor / F major",
            "-6   D# minor / F# major",
            "-5   E minor / G major",
            "-4   F minor / G# major",
            "-3   F# minor / A major",
            "-2   G minor / A# major",
            "-1   G# minor / B major",
            "None A minor / C major",
            "+1   A# minor / C# major",
            "+2   B minor / D major",
            "+3   C minor / D# major",
            "+4   C# minor / E major",
            "+5   D minor / F major",
            "+6   D# minor / F# major",
            "+7   E minor / G major"
        ], "None A minor / C major");
    transposeSetting.addValueObserver(function (value) {
        var newtranspose = null;
        value = value.split(' ')[0];
        if (value === "None") {
            //default no transpose
            newtranspose = 0;
        } else {
            //split transpose from string
            newtranspose = parseInt(value);
        }
        //
        if (newtranspose !== transpose) {
            transpose = newtranspose;
        }
        genKeyTranslationTable();
        notes.setKeyTranslationTable(transposeArr);
    });

    // Multi Note settings
    var multinoteSetting = prefs.getEnumSetting("Multinote mode", "Settings",
        [
            "None (Default)",
            "+3   Minor third",
            "+4   Major third",
            "+5   Perfect fourth",
            "+7   Perfect fifth",
            "+12  Octave",
            "+16  Oldschool xD"
        ], "None (Default)");
    multinoteSetting.addValueObserver(function (value) {
        var newmultinote = null;
        value = value.split(' ')[0];
        if (value === "None") {
            //default no transpose
            newmultinote = 0;
        } else {
            //split transpose from string
            newmultinote = parseInt(value);
        }
        //
        if (newmultinote !== multinote) {
            multinote = newmultinote;
        }
    });

    //set default translationtable
    genKeyTranslationTable();
    notes.setKeyTranslationTable(transposeArr);
}

//gen translation table
function genKeyTranslationTable() {
    for (var i = 0; i < 128; i++) {
        if (transpose > 0) {
            transposeArr[i] = Math.min(127, i + transpose);
        } else {
            transposeArr[i] = Math.max(0, i + transpose);
        }
    }
}

function onMidi(status, data1, data2) {
    //just process not on / offs, only when multinote is enabled
    if (multinote > 0) {
        new_data1 = data1 + transpose + multinote;
        if (new_data1 >= 0 && new_data1 <= 127 - (transpose + 7) && (status === 144 || status === 128)) {
            printMidi(status, data1, data2);
            notes.sendRawMidiEvent(status, new_data1, data2);
        }
    }
}
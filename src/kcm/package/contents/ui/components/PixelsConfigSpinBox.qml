// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick
import QtQuick.Controls as QQC2
import QtQuick.Layouts
import org.kde.kirigami as Kirigami

ConfigSpinBox {
    textFromValue: (value, _locale) => {
        return `${Number(value).toLocaleString(locale, 'f', 0)} px`;
    }
    valueFromText: (text, locale) => {
        return Number.fromLocaleString(locale, text.replace(" px", ""));
    }
    // Pixels are always positive
    from: 0
    to: 512
    editable: true
}

// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick
import QtQuick.Controls as QQC2
import org.kde.kcmutils as KCM
import org.kde.kirigami as Kirigami

QQC2.SpinBox {
    id: root

    /**
     * Name for the config option to represent
     */
    property string settingName: ""
    property int decimals: 2
    property real realValue: value / 100

    // Implicit dimensions are set to break binding loop
    implicitWidth: Kirigami.Units.gridUnit * 5
    implicitHeight: Kirigami.Units.gridUnit * 1.75
    from: 5
    to: 300
    stepSize: 5
    editable: true
    // IDK why, but this is needed to make the SpinBox work
    Component.onCompleted: () => {
        root.value = kcm.config[settingName] * 100;
    }
    value: kcm.config[settingName] * 100
    onValueModified: kcm.config[settingName] = realValue
    textFromValue: (value, locale) => {
        return Number(value / 100).toLocaleString(locale, 'f', root.decimals);
    }
    valueFromText: (text, locale) => {
        return Number.fromLocaleString(locale, text) * 100;
    }

    validator: DoubleValidator {
        bottom: Math.min(root.from, root.to)
        top: Math.max(root.from, root.to)
    }

}

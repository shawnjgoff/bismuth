// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick
import QtQuick.Controls as QQC2
import org.kde.kcmutils as KCM

QQC2.CheckBox {
    id: root

    /**
     * Name for the config option to represent
     */
    property string settingName

    checked: kcm.config[settingName]
    onClicked: kcm.config[settingName] = checked

    KCM.SettingStateBinding {
        configObject: kcm.config
        settingName: root.settingName
    }

}

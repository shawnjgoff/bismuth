// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick
import QtQuick.Controls as QQC2
import org.kde.kcmutils as KCM

QQC2.TextField {
    id: root

    /**
     * Name for the config option to represent
     */
    property string settingName

    text: kcm.config[settingName]
    onEditingFinished: kcm.config[settingName] = text

    KCM.SettingStateBinding {
        configObject: kcm.config
        settingName: root.settingName
    }

}

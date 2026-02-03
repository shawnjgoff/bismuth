// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import "./components" as BIC
import "./views" as BIView
import QtQuick
import QtQuick.Controls as QQC2
import QtQuick.Layouts
import org.kde.kcmutils as KCM
import org.kde.kirigami as Kirigami

Kirigami.FormLayout {
    id: behaviorTab

    Item {
        Kirigami.FormData.isSection: true
        Kirigami.FormData.label: i18n("General")
    }

    BIC.ConfigCheckBox {
        settingName: "bismuthEnabled"
        text: i18n("Enable window tiling")
    }

    Item {
        Kirigami.FormData.isSection: true
        Kirigami.FormData.label: i18n("Layouts")
    }

    BIC.ConfigCheckBox {
        Kirigami.FormData.label: i18n("Separate layouts for each:")
        text: i18n("Activity")
        settingName: "layoutPerActivity"
    }

    BIC.ConfigCheckBox {
        text: i18n("Virtual Desktop")
        settingName: "layoutPerDesktop"
    }

    QQC2.Button {
        id: configureLayoutsButton

        icon.name: "document-edit"
        text: i18n("Customize Layouts...")
        onClicked: kcm.push("./views/Layouts.qml")
    }

    Item {
        Kirigami.FormData.isSection: true
        Kirigami.FormData.label: i18n("Windows")
    }

    BIC.ConfigCheckBox {
        text: i18n("Maximize sole window")
        settingName: "maximizeSoleTile"
    }

    BIC.ConfigCheckBox {
        text: i18n("Untile windows by dragging")
        settingName: "untileByDragging"
    }

    BIC.ConfigCheckBox {
        text: i18n("Floating windows always on top")
        settingName: "keepFloatAbove"
    }

    QQC2.ButtonGroup {
        id: windowSpawnPositionGroup
    }

    QQC2.RadioButton {
        Kirigami.FormData.label: i18n("Spawn windows at:")
        text: i18n("Master area")
        QQC2.ButtonGroup.group: windowSpawnPositionGroup
        checked: kcm.config.newWindowAsMaster
        onClicked: kcm.config.newWindowAsMaster = checked

        KCM.SettingStateBinding {
            configObject: kcm.config
            settingName: "newWindowAsMaster"
        }

    }

    QQC2.RadioButton {
        text: i18n("The layout's end")
        QQC2.ButtonGroup.group: windowSpawnPositionGroup
        checked: !kcm.config.newWindowAsMaster
        onClicked: kcm.config.newWindowAsMaster = !checked

        KCM.SettingStateBinding {
            configObject: kcm.config
            settingName: "newWindowAsMaster"
        }

    }

    QQC2.Button {
        id: windowRules

        icon.name: "document-edit"
        text: i18n("Window Rules...")
        onClicked: kcm.push("./views/WindowRules.qml")
    }

    Item {
        Kirigami.FormData.isSection: true
        Kirigami.FormData.label: i18n("Restrictions")
    }

    BIC.ConfigCheckBox {
        id: restrictWidth

        text: i18n("Restrict window width")
        settingName: "limitTileWidth"
    }

    BIC.RatioConfigSpinBox {
        Kirigami.FormData.label: i18n("Window Width/Screen Height ratio:")
        settingName: "limitTileWidthRatio"

        // For some reason we cannot pass a custom property to
        // extraEnabledConditions, so we have to define it here.
        // It is also a reason why RatioConfigSpinBox uses
        // QQC2.SpinBox instead of ConfigSPinBox component
        KCM.SettingStateBinding {
            configObject: kcm.config
            settingName: "limitTileWidthRatio"
            extraEnabledConditions: restrictWidth.checked
        }

    }

    BIC.ConfigCheckBox {
        text: i18n("Prevent window minimization")
        settingName: "preventMinimize"
    }

    BIC.ConfigCheckBox {
        text: i18n("Prevent window from protruding from its screen")
        settingName: "preventProtrusion"
    }

    QQC2.Button {
        id: workspaceRules

        icon.name: "document-edit"
        text: i18n("Workspace Rules...")
        onClicked: kcm.push("./views/WorkspaceRules.qml")
    }

}

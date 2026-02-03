// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import "../components" as BIC
import QtQuick
import QtQuick.Controls as QQC2
import QtQuick.Layouts
import org.kde.kcmutils as KCM
import org.kde.kirigami as Kirigami

Kirigami.Page {
    id: root

    title: "Window Rules"

    Kirigami.FormLayout {
        anchors.fill: parent

        Item {
            Kirigami.FormData.isSection: true
            Kirigami.FormData.label: i18n("Ignore Windows")
        }

        BIC.ConfigTextField {
            Kirigami.FormData.label: "With classes:"
            placeholderText: "Classes (comma separated)"
            settingName: "ignoreClass"
            implicitWidth: Kirigami.Units.gridUnit * 20
        }

        BIC.ConfigTextField {
            Kirigami.FormData.label: "With titles:"
            placeholderText: "Titles (comma separated)"
            settingName: "ignoreTitle"
        }

        BIC.ConfigTextField {
            Kirigami.FormData.label: "With roles:"
            placeholderText: "Roles (comma separated)"
            settingName: "ignoreRole"
        }

        Item {
            Kirigami.FormData.isSection: true
            Kirigami.FormData.label: i18n("Float Windows")
        }

        BIC.ConfigTextField {
            Kirigami.FormData.label: "With classes:"
            placeholderText: "Classes (comma separated)"
            settingName: "floatingClass"
        }

        BIC.ConfigTextField {
            Kirigami.FormData.label: "With titles:"
            placeholderText: "Titles (comma separated)"
            settingName: "floatingTitle"
        }

        BIC.ConfigCheckBox {
            text: "With utility roles"
            settingName: "floatUtility"
        }

    }

}

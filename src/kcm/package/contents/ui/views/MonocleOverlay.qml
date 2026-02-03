// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import "../components" as BIC
import QtQuick
import QtQuick.Controls as QQC2
import QtQuick.Layouts
import org.kde.kcmutils as KCM
import org.kde.kirigami as Kirigami

Kirigami.OverlaySheet {
    id: monocleOverlay

    Kirigami.FormLayout {
        BIC.ConfigCheckBox {
            text: i18n("Fully maximize windows (no borders, no gaps)")
            settingName: "monocleMaximize"
        }

        BIC.ConfigCheckBox {
            text: i18n("Minimize unfocused windows")
            settingName: "monocleMinimizeRest"
        }

    }

    header: Kirigami.Heading {
        text: i18nc("@title:window", "Monocle Layout Settings")
    }

}

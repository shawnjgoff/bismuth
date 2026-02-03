// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick
import QtQuick.Layouts
import org.kde.kwin
import org.kde.plasma.components as PC3
import org.kde.plasma.core as PlasmaCore
import org.kde.kirigami as Kirigami

PlasmaCore.Dialog {
    id: popupDialog

    property rect screenGeometry

    function show(text, icon, hint) {
        // Abort any previous timers
        hideTimer.stop();
        // Update current screen information
        this.screenGeometry = workspace.clientArea(KWin.FullScreenArea, workspace.activeScreen, workspace.currentDesktop);
        // Set the icon and text
        messageText.text = text;
        messageIcon.source = icon || "bismuth"; // Fallback to the default icon when undefined
        messageHint.text = hint || ""; // Fallback to the empty string when undefined
        // Show the popup
        this.visible = true;
        // Start popup hide timer
        hideTimer.interval = 3000;
        hideTimer.start();
    }

    // Dialog type for OSD notifications
    type: PlasmaCore.Dialog.OnScreenDisplay
    // Window flags: popup that stays on top (uses 'flags' in Plasma 6, not 'windowFlags')
    flags: Qt.Popup | Qt.WindowStaysOnTopHint
    // Floating location for free positioning
    location: PlasmaCore.Types.Floating
    // Don't accept input - click through
    outputOnly: true

    // Spawn popup a little bit lower than the center of the screen for consistency
    x: (screenGeometry.x + screenGeometry.width / 2) - width / 2
    y: (screenGeometry.y + screenGeometry.height * 2 / 3) - height / 2
    visible: false

    mainItem: RowLayout {
        id: main

        // Make popup size consistent with the other Plasma OSD (e.g. PulseAudio one)
        Layout.minimumWidth: Math.max(messageText.implicitWidth, Kirigami.Units.gridUnit * 15)
        Layout.minimumHeight: Kirigami.Units.gridUnit * 1.35

        Kirigami.Icon {
            id: messageIcon

            Layout.leftMargin: Kirigami.Units.smallSpacing
            Layout.preferredWidth: Kirigami.Units.iconSizes.medium
            Layout.preferredHeight: Kirigami.Units.iconSizes.medium
            Layout.alignment: Qt.AlignVCenter
        }

        PC3.Label {
            id: messageText

            Layout.fillWidth: true
            Layout.alignment: Qt.AlignHCenter
            // This font size matches the one from Pulse Audio OSD for consistency
            font.pointSize: Kirigami.Theme.defaultFont.pointSize * 1.2
            horizontalAlignment: Text.AlignHCenter
        }

        PC3.Label {
            id: messageHint

            Layout.preferredWidth: widestHintSize.width
            Layout.rightMargin: Kirigami.Units.smallSpacing * 2
            Layout.alignment: Qt.AlignHCenter
            // This font size matches the one from Pulse Audio OSD for consistency
            font.pointSize: Kirigami.Theme.defaultFont.pointSize * 1.2
            horizontalAlignment: Text.AlignHCenter
        }

        // Get the width of a two-digit number so we can size the hint
        // to the maximum width to avoid the main text moving around
        TextMetrics {
            id: widestHintSize

            text: i18n("10")
            font: messageHint.font
        }

        // Hides the popup when triggered
        Timer {
            id: hideTimer

            repeat: false
            onTriggered: {
                popupDialog.visible = false;
            }
        }

    }

}

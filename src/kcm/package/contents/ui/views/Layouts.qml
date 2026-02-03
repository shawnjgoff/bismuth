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

    title: "Window Layouts"

    ListModel {
        id: layoutsModel

        ListElement {
            name: "Tile"
            settingName: "enableTileLayout"
        }

        ListElement {
            name: "Monocle"
            settingName: "enableMonocleLayout"
            editable: true
        }

        ListElement {
            name: "Three Column"
            settingName: "enableThreeColumnLayout"
        }

        ListElement {
            name: "Spiral"
            settingName: "enableSpiralLayout"
        }

        ListElement {
            name: "Spread"
            settingName: "enableSpreadLayout"
        }

        ListElement {
            name: "Stair"
            settingName: "enableStairLayout"
        }

        ListElement {
            name: "Quarter"
            settingName: "enableQuarterLayout"
        }

        ListElement {
            name: "Floating"
            settingName: "enableFloatingLayout"
        }

    }

    KCM.ScrollView {
        anchors.fill: parent

        view: ListView {
            model: layoutsModel

            delegate: Kirigami.SwipeListItem {
                actions: [
                    Kirigami.Action {
                        id: editLayout

                        enabled: model.editable && layoutCheckBox.checked
                        visible: model.editable
                        icon.name: "edit-rename"
                        tooltip: i18nc("@info:tooltip", "Edit Layout")
                        onTriggered: () => {
                            monocleSheet.open();
                        }
                    }
                ]

                contentItem: RowLayout {
                    RowLayout {
                        BIC.ConfigCheckBox {
                            id: layoutCheckBox

                            settingName: model.settingName
                        }

                        QQC2.Label {
                            text: `${model.name} Layout`
                        }

                    }

                }

            }

        }

    }

    MonocleOverlay {
        id: monocleSheet

        parent: root // Without this, overlay does not work
    }

}

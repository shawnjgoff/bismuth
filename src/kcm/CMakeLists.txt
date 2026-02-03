# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

cmake_minimum_required(VERSION 3.16)

project(bismuth-kcm)

add_library(kcm_bismuth MODULE)

qt_add_dbus_interface(kwin_dbus_srcs org.kde.KWin.xml kwin_interface)

target_sources(kcm_bismuth PRIVATE bismuth.cpp ${kwin_dbus_srcs})

target_link_libraries(
  kcm_bismuth
  PRIVATE Qt6::Core
          Qt6::DBus
          KF6::CoreAddons
          KF6::I18n
          KF6::KCMUtilsQuick
          KF6::ConfigCore
          KF6::ConfigGui)

kconfig_add_kcfg_files(kcm_bismuth GENERATE_MOC "bismuth_config.kcfgc")

# Install the KCM plugin
install(TARGETS kcm_bismuth
        DESTINATION ${KDE_INSTALL_PLUGINDIR}/plasma/kcms/systemsettings)

# Install KCM metadata and QML package
install(FILES metadata.json
        DESTINATION ${KDE_INSTALL_PLUGINDIR}/plasma/kcms/systemsettings)
install(DIRECTORY package/contents
        DESTINATION ${KDE_INSTALL_DATADIR}/kpackage/kcms/kcm_bismuth)
install(FILES package/metadata.json
        DESTINATION ${KDE_INSTALL_DATADIR}/kpackage/kcms/kcm_bismuth)

add_subdirectory(icons)

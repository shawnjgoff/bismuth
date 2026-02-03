#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

# Note: Requires Plasma 6. For Plasma 5, use the v3.1.4 tag.

set -e

echo "⛓️ Installing system dependencies..."

if [ -f /etc/os-release ]; then
  . /etc/os-release

  case $ID in

    "ubuntu" | "pop" | "debian" | "neon" )
      sudo apt-get install -y \
        g++ cmake ninja-build extra-cmake-modules libkf6kirigami-dev \
        libkf6config-dev libkf6configwidgets-dev libkf6coreaddons-dev \
        libkf6declarative-dev libkf6i18n-dev libkf6kcmutils-dev \
        libkf6globalaccel-dev libkdecoration2-dev libqt6svg6-dev \
        qml6-module-qtquick* qt6-base-dev \
        qt6-declarative-dev
      ;;

    "fedora")
      sudo dnf install -y \
        kf6-kconfigwidgets-devel qt6-qtbase-devel qt6-qtbase-private-devel \
        qt6-qtdeclarative-devel qt6-qtsvg-devel \
        cmake ninja-build extra-cmake-modules \
        kf6-kcmutils-devel kf6-ki18n-devel kf6-kdeclarative-devel \
        kdecoration-devel kf6-kglobalaccel-devel
      ;;

    "opensuse-tumbleweed" | "opensuse-leap")
      sudo zypper --non-interactive install --recommends -t pattern devel_qt6 devel_C_C++
      sudo zypper --non-interactive in -y \
        ninja extra-cmake-modules kf6-kconfig-devel kf6-kcmutils-devel kf6-kdeclarative-devel \
        kf6-ki18n-devel libkdecoration2-devel kf6-kglobalaccel-devel
      ;;

    "arch" | "manjaro")
      sudo pacman -S --noconfirm --needed \
        gcc cmake ninja extra-cmake-modules kdecoration
      ;;

    "void")
      sudo xbps-install gcc git nodejs cmake ninja extra-cmake-modules \
        kf6-kconfig-devel kf6-kconfigwidgets-devel kf6-ki18n-devel kf6-kcoreaddons-devel \
        kf6-kdeclarative-devel kf6-kcmutils-devel qt6-svg-devel qt6-declarative-devel \
        gettext-devel kf6-knotifications-devel \
        kf6-kpackage-devel kf6-kservice-devel kf6-kiconthemes-devel kf6-kdoctools-devel \
        kf6-kauth-devel kf6-kcrash-devel kf6-kjobwidgets-devel kf6-solid-devel kf6-kio-devel \
        kf6-kwallet-devel kf6-ktextwidgets-devel kf6-kglobalaccel-devel \
        kf6-kxmlgui-devel kf6-kbookmarks-devel \
        kdecoration-devel
      ;;

    *)
      echo "⚠ Your distribution is $PRETTY_NAME, but you have to install system dependencies manually."
      ;;
  esac
else
  echo "⚠ Cannot detect your distribution. You have to install system dependencies manually."
fi

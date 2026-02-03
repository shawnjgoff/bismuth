# SPDX-FileCopyrightText: 2025 Basil
# SPDX-License-Identifier: MIT

Name:           bismuth
Version:        4.0.0
Release:        1%{?dist}
Summary:        KDE Plasma extension that lets you tile your windows automatically

License:        MIT AND BSD-3-Clause AND LGPL-3.0-or-later AND CC-BY-4.0
URL:            https://bismuth-forge.github.io/bismuth
Source:         https://github.com/Bismuth-Forge/bismuth/archive/v%{version}/%{name}-%{version}.tar.gz

BuildRequires:  cmake
BuildRequires:  ninja-build
BuildRequires:  extra-cmake-modules
BuildRequires:  gcc-c++
BuildRequires:  nodejs
BuildRequires:  npm

# KDE Frameworks 6
BuildRequires:  cmake(KF6CoreAddons)
BuildRequires:  cmake(KF6ConfigWidgets)
BuildRequires:  cmake(KF6GlobalAccel)
BuildRequires:  cmake(KF6KCMUtils)
BuildRequires:  cmake(KF6I18n)
BuildRequires:  cmake(KF6Config)
BuildRequires:  cmake(KF6ColorScheme)
BuildRequires:  cmake(KF6WidgetsAddons)
BuildRequires:  cmake(KDecoration3)

# Qt 6
BuildRequires:  cmake(Qt6Svg)
BuildRequires:  cmake(Qt6Core)
BuildRequires:  cmake(Qt6DBus)
BuildRequires:  qt6-qtbase-private-devel
BuildRequires:  qt6-qtdeclarative-devel

Requires:       kwin
Requires:       hicolor-icon-theme

%global _description %{expand:
KDE Plasma 6 extension, that lets you tile your windows automatically and manage
them via keyboard, just like in classical tiling window managers.

This is the Plasma 6 port of Bismuth.}

%description %_description

%prep
%autosetup

%build
# Install npm dependencies for TypeScript build
npm install --ignore-scripts

%cmake_kf6 -G Ninja
%cmake_build

%install
%cmake_install

%files
%license LICENSES/MIT.txt
%doc README.md CHANGELOG.md CONTRIBUTING.md

# Core QML plugin
%dir %{_libdir}/qt6/qml/org
%dir %{_libdir}/qt6/qml/org/kde
%dir %{_libdir}/qt6/qml/org/kde/%{name}
%dir %{_libdir}/qt6/qml/org/kde/%{name}/core
%{_libdir}/qt6/qml/org/kde/%{name}/core/lib%{name}_core.so
%{_libdir}/qt6/qml/org/kde/%{name}/core/qmldir

# KCM plugin
%{_libdir}/qt6/plugins/plasma/kcms/systemsettings/kcm_%{name}.so
%{_libdir}/qt6/plugins/plasma/kcms/systemsettings/metadata.json

# KDecoration plugin
%dir %{_libdir}/qt6/plugins/org.kde.kdecoration3
%{_libdir}/qt6/plugins/org.kde.kdecoration3/%{name}_kdecoration.so

# Data files
%{_datadir}/config.kcfg/%{name}_config.kcfg
%{_datadir}/kconf_update/%{name}*
%{_datadir}/qlogging-categories6/%{name}.categories
%{_datadir}/kpackage/kcms/kcm_%{name}/
%{_datadir}/kwin/scripts/%{name}/
%{_datadir}/icons/hicolor/*/status/%{name}-*.svg
%{_datadir}/icons/hicolor/*/categories/%{name}-*.svg
%{_datadir}/icons/hicolor/scalable/apps/%{name}.svg

%changelog
* Sun Feb 02 2025 Basil <basil@localhost> - 4.0.0-1
- Port to Plasma 6 / KDE Frameworks 6 / Qt 6
- Update KDecoration API from v2 to v3
- Update daemon reference from kded5 to kded6
- Add i18n wrappers for internationalization
- Modernize QML APIs (iconName -> icon.name)
- Upgrade TypeScript to 5.x

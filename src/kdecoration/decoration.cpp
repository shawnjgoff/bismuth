// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "decoration.hpp"

#include <QPainter>

#include <KConfigGroup>
#include <KDecoration3/DecoratedWindow>
#include <KDecoration3/DecorationSettings>
#include <KPluginFactory>
#include <KSharedConfig>

K_PLUGIN_FACTORY_WITH_JSON(BismuthDecorationFactory, "metadata.json",
                           registerPlugin<Bismuth::Decoration>();)

namespace Bismuth {
Decoration::Decoration(QObject *parent, const QVariantList &args)
    : KDecoration3::Decoration(parent, args) {}

bool Decoration::init() {
  m_kdeglobalsWatcher =
      KConfigWatcher::create(KSharedConfig::openConfig("kdeglobals"));

  setBorderSizes();
  connectEvents();
  updateColors();

  return true;
}

void Decoration::paint(QPainter *painter, const QRectF &repaintRegion) {
  if (!painter) {
    return;
  }

  paintBorders(*painter);
}

void Decoration::paintBorders(QPainter &p) {
  auto *window = this->window();
  auto windowRect = rect();

  p.save();
  p.setPen(Qt::NoPen);

  if (window->isActive()) {
    p.setBrush(m_activeColor);
  } else {
    p.setBrush(m_inactiveColor);
  }

  p.drawRect(windowRect);
  p.restore();
}

void Decoration::updateColors() {
  auto colorsConfig = KSharedConfig::openConfig("kdeglobals");
  auto group = colorsConfig->group("Colors:Window");
  m_activeColor = group.readEntry("DecorationFocus", QColor(255, 0, 0));
  m_inactiveColor = group.readEntry("BackgroundNormal", QColor(0, 0, 0));
}

void Decoration::setBorderSizes() {
  const auto *window = this->window();

  const int left =
      (settings()->borderSize() == KDecoration3::BorderSize::NoSides)
          ? 0
          : borderSize();
  const int top = borderSize();
  const int right =
      (settings()->borderSize() == KDecoration3::BorderSize::NoSides)
          ? 0
          : borderSize();
  const int bottom = borderSize();

  setBorders(QMargins(left, top, right, bottom));
}

void Decoration::connectEvents() {
  auto *windowPtr = this->window();
  auto *settingsPtr = settings().get();

  // No idea why regular connection does not work
  connect(windowPtr, &KDecoration3::DecoratedWindow::activeChanged, this,
          [this](bool value) { this->update(); });
  connect(settingsPtr, &KDecoration3::DecorationSettings::borderSizeChanged,
          this, &Decoration::setBorderSizes);

  connect(m_kdeglobalsWatcher.data(), &KConfigWatcher::configChanged, this,
          [this](const KConfigGroup &group, const QByteArrayList &names) {
            if (group.name() == QStringLiteral("General")) {
              if (names.contains(QByteArrayLiteral("ColorScheme")) ||
                  names.contains(QByteArrayLiteral("AccentColor"))) {
                updateColors();
                this->update();
              }
            }
          });
}

int Decoration::borderSize() const {
  const int baseSize = settings()->smallSpacing();
  switch (settings()->borderSize()) {
  case KDecoration3::BorderSize::Oversized:
    return baseSize * 10;
  case KDecoration3::BorderSize::VeryHuge:
    return baseSize * 6;
  case KDecoration3::BorderSize::Huge:
    return baseSize * 5;
  case KDecoration3::BorderSize::VeryLarge:
    return baseSize * 4;
  case KDecoration3::BorderSize::NoSides:
  case KDecoration3::BorderSize::Normal:
    return baseSize * 2;
  case KDecoration3::BorderSize::Large:
    return baseSize * 3;
  case KDecoration3::BorderSize::None:
    return 0;
  case KDecoration3::BorderSize::Tiny:
  default:
    return baseSize;
  }
}

} // namespace Bismuth

#include "decoration.moc"

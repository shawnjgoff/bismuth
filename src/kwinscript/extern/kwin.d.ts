// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

// KWin 6.0 Scripting API Types for Plasma 6
// API Reference: https://develop.kde.org/docs/plasma/kwin/api/

declare namespace KWin {
  /**
   * Represents a KWin Output (screen) in Plasma 6.
   * Replaces the numeric screen index from KWin 5.
   */
  interface Output {
    readonly name: string;
    readonly geometry: QRectF;
  }

  /**
   * Represents a KWin VirtualDesktop in Plasma 6.
   */
  interface VirtualDesktop {
    readonly id: string;
    readonly name: string;
    readonly x11DesktopNumber: number;
  }

  /**
   * Wrapper for all available KWin API from various places.
   */
  interface Api {
    workspace: KWin.WorkspaceWrapper;
    options: KWin.Options;
    KWin: KWin.KWin;
  }

  /**
   * Global KWin object providing configuration and shortcut registration.
   */
  interface KWin {
    /**
     * Read a configuration value from the script's config.
     */
    readConfig(key: string, defaultValue?: any): any;

    /**
     * Register a global shortcut for the script.
     */
    registerShortcut(
      title: string,
      text: string,
      keySequence: string,
      callback: any
    ): boolean;

    /**
     * ClientAreaOption enum values for clientArea() calls.
     */
    PlacementArea: number;
    FullScreenArea: number;
  }

  /**
   * The main workspace wrapper providing access to windows, screens, and desktops.
   */
  interface WorkspaceWrapper {
    /* read-only properties */
    readonly activeScreen: Output;
    readonly currentActivity: string;
    readonly screens: Output[];
    readonly desktops: VirtualDesktop[];

    /* read-write properties */
    activeWindow: KWin.Window;
    currentDesktop: VirtualDesktop;

    /* signals - only those actually used by Bismuth */
    windowAdded: QSignal;
    windowRemoved: QSignal;
    windowMaximizeSet: QSignal;
    windowMinimized: QSignal;
    windowUnminimized: QSignal;
    currentActivityChanged: QSignal;
    currentDesktopChanged: QSignal;

    /* methods */
    windowList(): Window[];
    clientArea(option: number, output: Output, desktop: VirtualDesktop): QRectF;
  }

  /**
   * KWin options/configuration interface.
   */
  interface Options {
    configChanged: QSignal;
  }

  /**
   * Represents a KWin Window (formerly called Client in KWin 5).
   * This is the main window interface in Plasma 6.
   */
  interface Window {
    /* read-only properties */

    /**
     * The output (screen) the window is on.
     */
    readonly output: Output;

    /**
     * Whether the window is currently active (has focus).
     */
    readonly active: boolean;

    /**
     * Window caption (the text in the titlebar).
     */
    readonly caption: string;

    /**
     * Maximum allowed size for the window.
     */
    readonly maxSize: QSize;

    /**
     * Minimum allowed size for the window.
     */
    readonly minSize: QSize;

    /**
     * Whether the window is modal.
     */
    readonly modal: boolean;

    /**
     * Whether the window is currently being moved by the user.
     */
    readonly move: boolean;

    /**
     * Whether the window is currently being resized by the user.
     */
    readonly resize: boolean;

    /**
     * Whether the window is resizable.
     */
    readonly resizeable: boolean;

    /**
     * Whether this is a special window type (desktop, dock, splash, etc.)
     * that shouldn't be managed normally.
     */
    readonly specialWindow: boolean;

    /**
     * Whether the window is transient (a sub-window of another window).
     */
    readonly transient: boolean;

    /**
     * Whether the window is a dialog.
     */
    readonly dialog: boolean;

    /**
     * Whether the window is a splash screen.
     */
    readonly splash: boolean;

    /**
     * Whether the window is a utility window (tool window).
     */
    readonly utility: boolean;

    /**
     * The window's resource class (application identifier).
     */
    readonly resourceClass: QByteArray;

    /**
     * The window's resource name.
     */
    readonly resourceName: QByteArray;

    /**
     * The window's role property.
     */
    readonly windowRole: QByteArray;

    /**
     * Unique window ID in KWin.
     */
    readonly windowId: number;

    /**
     * Activities the window is on. Empty array means on all activities.
     */
    readonly activities: string[];

    /* read-write properties */

    /**
     * The desktops this window is on. Empty array means on all desktops.
     */
    desktops: VirtualDesktop[];

    /**
     * Whether the window is fullscreen.
     */
    fullScreen: boolean;

    /**
     * The window's frame geometry (position and size excluding shadows).
     */
    frameGeometry: QRectF;

    /**
     * Whether the window should stay above other windows.
     */
    keepAbove: boolean;

    /**
     * Whether the window should stay below other windows.
     */
    keepBelow: boolean;

    /**
     * Whether the window is minimized.
     */
    minimized: boolean;

    /**
     * Whether the window has no border/decoration.
     */
    noBorder: boolean;

    /**
     * Whether the window is on all desktops.
     */
    onAllDesktops: boolean;

    /**
     * Whether the window is shaded (rolled up to just the titlebar).
     */
    shade: boolean;

    /* signals - only those actually used by Bismuth */

    /**
     * Emitted when the window's active state changes.
     */
    activeChanged: QSignal;

    /**
     * Emitted when the window's frame geometry changes.
     */
    frameGeometryChanged: QSignal;

    /**
     * Emitted when the window starts or stops being moved/resized.
     */
    moveResizedChanged: QSignal;

    /**
     * Emitted when the window's output (screen) changes.
     */
    outputChanged: QSignal;

    /**
     * Emitted when the window's activities change.
     */
    activitiesChanged: QSignal;

    /**
     * Emitted when the window's desktops change.
     */
    desktopsChanged: QSignal;

    /**
     * Emitted when the window's shade state changes.
     */
    shadeChanged: QSignal;
  }

  /**
   * Backwards compatibility alias - Client is now Window in Plasma 6.
   */
  type Client = Window;
}

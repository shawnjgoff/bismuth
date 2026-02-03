// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { DriverSurface } from "./surface";
import { DriverSurfaceImpl } from "./surface";
import { DriverWindowImpl } from "./window";

import { Controller } from "../controller";

import { EngineWindow, EngineWindowImpl } from "../engine/window";

import { WindowState } from "../engine/window";

import { Config } from "../config";
import { Log } from "../util/log";
import { TSProxy } from "../extern/proxy";

/**
 * Provides convenient interface to KWin functions.
 * Hides all the bad and ugly things current KWin has.
 */
export interface Driver {
  /**
   * All the surfaces/screens currently possess by the KWin
   */
  readonly screens: DriverSurface[];

  /**
   * Surface (screen) of the current window
   */
  currentSurface: DriverSurface;

  /**
   * Currently active (i.e. focused) window
   */
  currentWindow: EngineWindow | null;

  /**
   * Show a popup notification in the center of the screen.
   * @param text the main text of the notification.
   * @param icon an optional name of the icon to display in the pop-up.
   * @param hint an optional string displayed beside the main text.
   */
  showNotification(text: string, icon?: string, hint?: string): void;

  /**
   * Bind script to the various KWin events
   */
  bindEvents(): void;

  /**
   * Manage the windows, that were active before script loading
   */
  manageWindows(): void;

  /**
   * Destroy all callbacks and other non-GC resources
   */
  drop(): void;
}

export class DriverImpl implements Driver {
  public get currentSurface(): DriverSurface {
    // In Plasma 6, activeScreen returns Output object
    const screens = this.kwinApi.workspace.screens;
    const activeScreen = this.kwinApi.workspace.activeScreen;
    const screenIndex = screens.findIndex((s) => s.name === activeScreen.name);

    return new DriverSurfaceImpl(
      screenIndex >= 0 ? screenIndex : 0,
      activeScreen,
      this.kwinApi.workspace.currentActivity,
      this.kwinApi.workspace.currentDesktop,
      this.qml.activityInfo,
      this.config,
      this.kwinApi
    );
  }

  public set currentSurface(value: DriverSurface) {
    const kwinSurface = value as DriverSurfaceImpl;

    /* NOTE: only supports switching desktops */
    // TODO: focusing window on other screen?
    // TODO: find a way to change activity

    if (this.kwinApi.workspace.currentDesktop.id !== kwinSurface.desktop.id) {
      this.kwinApi.workspace.currentDesktop = kwinSurface.desktop;
    }
  }

  public get currentWindow(): EngineWindow | null {
    // In Plasma 6, activeClient is renamed to activeWindow
    const client = this.kwinApi.workspace.activeWindow;
    return client ? this.windowMap.get(client) : null;
  }

  public set currentWindow(window: EngineWindow | null) {
    if (window !== null) {
      // In Plasma 6, activeClient is renamed to activeWindow
      this.kwinApi.workspace.activeWindow = (
        window.window as DriverWindowImpl
      ).client;
    }
  }

  public get screens(): DriverSurface[] {
    const screensArr = [];
    const screens = this.kwinApi.workspace.screens;
    for (let screenIndex = 0; screenIndex < screens.length; screenIndex++) {
      screensArr.push(
        new DriverSurfaceImpl(
          screenIndex,
          screens[screenIndex],
          this.kwinApi.workspace.currentActivity,
          this.kwinApi.workspace.currentDesktop,
          this.qml.activityInfo,
          this.config,
          this.kwinApi
        )
      );
    }
    return screensArr;
  }

  private controller: Controller;
  private windowMap: WrapperMap<KWin.Client, EngineWindow>;
  private entered: boolean;

  private qml: Bismuth.Qml.Main;
  private kwinApi: KWin.Api;

  private registeredConnections: SignalCallbackPair[];

  /**
   * @param qmlObjects objects from QML gui. Required for the interaction with QML, as we cannot access globals.
   * @param kwinApi KWin scripting API. Required for interaction with KWin, as we cannot access globals.
   * @param config Bismuth configuration. If none is provided, the configuration is read from KConfig (in most cases from config file).
   */
  constructor(
    qmlObjects: Bismuth.Qml.Main,
    kwinApi: KWin.Api,
    controller: Controller,
    private config: Config,
    private log: Log,
    private proxy: TSProxy
  ) {
    this.registeredConnections = [];

    // TODO: find a better way to to this
    if (this.config.preventMinimize && this.config.monocleMinimizeRest) {
      log.log("preventMinimize is disabled because of monocleMinimizeRest");
      this.config.preventMinimize = false;
    }

    this.controller = controller;
    this.windowMap = new WrapperMap(
      (client: KWin.Client) => DriverWindowImpl.generateID(client),
      (client: KWin.Client) =>
        new EngineWindowImpl(
          new DriverWindowImpl(client, this.qml, this.config, this.kwinApi),
          this.config,
          this.log
        )
    );
    this.entered = false;
    this.qml = qmlObjects;
    this.kwinApi = kwinApi;
  }

  public bindEvents(): void {
    const onClientAdded = (client: KWin.Client): void => {
      this.log.log(`Client added: ${client}`);

      const window = this.windowMap.add(client);
      this.controller.onWindowAdded(window);
      if (window.state === WindowState.Unmanaged) {
        this.log.log(
          `Window becomes unmanaged and gets removed :( The client was ${client}`
        );
        this.windowMap.remove(client);
      } else {
        this.log.log(`Client is ok, can manage. Bind events now...`);
        this.bindWindowEvents(window, client);
      }
    };

    const onClientRemoved = (client: KWin.Client): void => {
      const window = this.windowMap.get(client);
      if (window) {
        this.controller.onWindowRemoved(window);
        this.windowMap.remove(client);
      }
    };

    const onClientMaximizeSet = (
      client: KWin.Client,
      h: boolean,
      v: boolean
    ): void => {
      const maximized = h === true && v === true;
      const window = this.windowMap.get(client);
      if (window) {
        (window.window as DriverWindowImpl).maximized = maximized;
        this.controller.onWindowMaximizeChanged(window, maximized);
      }
    };

    const onClientMinimized = (client: KWin.Client): void => {
      if (this.config.preventMinimize) {
        client.minimized = false;
        this.kwinApi.workspace.activeWindow = client;
      } else {
        this.controller.onWindowChanged(
          this.windowMap.get(client),
          "minimized"
        );
      }
    };

    const onClientUnminimized = (client: KWin.Client): void =>
      this.controller.onWindowChanged(
        this.windowMap.get(client),
        "unminimized"
      );

    this.connect(this.kwinApi.workspace.currentActivityChanged, () =>
      this.controller.onCurrentSurfaceChanged()
    );

    this.connect(this.kwinApi.workspace.currentDesktopChanged, () =>
      this.controller.onCurrentSurfaceChanged()
    );

    // In Plasma 6, signals are renamed from client* to window*
    this.connect(this.kwinApi.workspace.windowAdded, onClientAdded);
    this.connect(this.kwinApi.workspace.windowRemoved, onClientRemoved);
    this.connect(this.kwinApi.workspace.windowMaximizeSet, onClientMaximizeSet);
    this.connect(this.kwinApi.workspace.windowMinimized, onClientMinimized);
    this.connect(this.kwinApi.workspace.windowUnminimized, onClientUnminimized);
  }

  public manageWindows(): void {
    // In Plasma 6, clientList() is renamed to windowList()
    const clients = this.kwinApi.workspace.windowList();
    // TODO: provide interface for using the "for of" cycle
    for (let i = 0; i < clients.length; i++) {
      this.manageWindow(clients[i]);
    }
  }

  /**
   * Manage window with the particular KWin clientship
   * @param client window client object specified by KWin
   */
  private manageWindow(client: KWin.Client): void {
    // Add window to our window map
    const window = this.windowMap.add(client);

    if (window.shouldIgnore) {
      this.windowMap.remove(client);
      return;
    }

    this.bindWindowEvents(window, client);

    this.controller.manageWindow(window);
  }

  public showNotification(text: string, icon?: string, hint?: string): void {
    this.qml.popupDialog.show(text, icon, hint);
  }

  public drop(): void {
    this.log.log(`Dropping all registered callbacks... Goodbye.`);
    for (const pair of this.registeredConnections) {
      try {
        pair.signal.disconnect(pair.callback);
      } catch (e: any) {
        // Error is thrown, when the object is already deleted,
        // ignore it then and delete other callbacks
        this.log.log(`Callback was already deleted. Ignoring it.`);
      }
    }
  }

  /**
   * Binds callback to the signal with re-entry prevention.
   * Also keeps track of all connections, so that they con be
   * destroyed at script termination via Driver#drop.
   */
  private connect(signal: QSignal, handler: (..._: any[]) => void): void {
    const unboundCallback = (...args: any[]): void => {
      this.enter(() => handler.apply(this, args));
    };

    const pair = {
      signal: signal,
      callback: unboundCallback,
    };

    this.registeredConnections.push(pair);

    signal.connect(pair.callback);
  }

  /**
   * Run the given function in a protected(?) context to prevent nested event
   * handling.
   *
   * KWin emits signals as soon as window states are changed, even when
   * those states are modified by the script. This causes multiple re-entry
   * during event handling, resulting in performance degradation and harder
   * debugging.
   */
  private enter(callback: () => void): void {
    if (this.entered) {
      return;
    }

    this.entered = true;
    try {
      callback();
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      this.log.log(`Oops! ${e.name}: ${e.message}. `);
    } finally {
      this.entered = false;
    }
  }

  private bindWindowEvents(window: EngineWindow, client: KWin.Client): void {
    let moving = false;
    let resizing = false;

    this.connect(client.moveResizedChanged, () => {
      this.log.log([
        "moveResizedChanged",
        { window, move: client.move, resize: client.resize },
      ]);
      if (moving !== client.move) {
        moving = client.move;
        if (moving) {
          this.controller.onWindowMoveStart(window);
        } else {
          this.controller.onWindowMoveOver(window);
        }
      }
      if (resizing !== client.resize) {
        resizing = client.resize;
        if (resizing) {
          this.controller.onWindowResizeStart(window);
        } else {
          this.controller.onWindowResizeOver(window);
        }
      }
    });

    this.connect(client.frameGeometryChanged, () => {
      if (moving) {
        this.controller.onWindowMove(window);
      } else if (resizing) {
        this.controller.onWindowResize(window);
      } else {
        if (!window.actualGeometry.equals(window.geometry)) {
          this.controller.onWindowGeometryChanged(window);
        }
      }
    });

    this.connect(client.activeChanged, () => {
      if (client.active) {
        this.controller.onWindowFocused(window);
      }
    });

    // In Plasma 6, screenChanged is renamed to outputChanged
    this.connect(client.outputChanged, () => {
      this.controller.onWindowScreenChanged(window);
    });

    this.connect(client.activitiesChanged, () =>
      this.controller.onWindowChanged(
        window,
        "activity=" + client.activities.join(",")
      )
    );

    // In Plasma 6, desktopChanged is renamed to desktopsChanged
    this.connect(client.desktopsChanged, () =>
      this.controller.onWindowChanged(window, `desktops changed`)
    );

    this.connect(client.shadeChanged, () => {
      this.controller.onWindowShadeChanged(window);
    });
  }
}

interface SignalCallbackPair {
  signal: QSignal;
  callback: (...args: any[]) => void;
}

/**
 * Wrapper map type.
 */
class WrapperMap<F, T> {
  private items: { [key: string]: T };

  constructor(
    public readonly hasher: (item: F) => string,
    public readonly wrapper: (item: F) => T
  ) {
    this.items = {};
  }

  public add(item: F): T {
    const key = this.hasher(item);

    if (this.items[key] !== undefined) {
      throw "WrapperMap: the key [" + key + "] already exists!";
    }

    const wrapped = this.wrapper(item);
    this.items[key] = wrapped;
    return wrapped;
  }

  public get(item: F): T | null {
    const key = this.hasher(item);
    return this.items[key] || null;
  }

  public getByKey(key: string): T | null {
    return this.items[key] || null;
  }

  public remove(item: F): boolean {
    const key = this.hasher(item);
    return delete this.items[key];
  }
}

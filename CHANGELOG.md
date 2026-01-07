# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [2.4.0](#240---2025-12-23)
- [2.3.0](#230---2025-12-12)
- [2.2.1](#221---2025-11-25)
- [2.2.0](#220---2025-11-24)
- [2.1.1](#211---2025-11-19)
- [2.1.0](#210---2025-10-28)
- [2.0.1](#201---2025-09-29)
- [2.0.0](#200---2025-09-20)
- [1.5.0](#150---2024-10-09)
- [1.4.1](#141---2024-08-13)
- [1.4.0](#140---2024-07-24)
- [1.3.0](#130---2024-03-21)
- [1.2.0](#120---2024-03-15)
- [1.1.0](#110---2024-02-28)
- [1.0.0](#100---2023-12-17)
- [0.9.0](#090---2023-12-11)
- [0.8.1](#081---2023-12-08)
- [0.8.0](#080---2023-11-28)
- [0.7.0](#070---2023-11-24)
- [0.6.0](#060---2023-11-15)

## [Unreleased][]
### Added
- Data: new setting to control the refresh rate for automatic data changes. This ensures smooth selection track changes and playlist operations while dynamic filters based on selection are in use. Panel is no longer updated on every track change but only with the last one after consecutive fast changes within the debounce time window.
- Data: new settings to adjust data deduplication by TF. Multiple default presets are available along the possibility to add your custom TF expressions. There is also support for X,Y,Z-Axis entries setting their own deduplication expressions, but currently unused in default presets (such settings can be added via custom entries though).
- UI: added background y-axis margin setting. It only applies when cropping is set to none. While using any other mode, it stretches the image instead. This setting can be directly changed using the mouse wheel + CTRL + ALT + SHIFT too. Note in all my scripts UI elements can be resized using the mouse wheel + CTRL + ALT. And background settings are always accessed also pressing SHIFT.
- UI: added background art mode cycling when using the mouse wheel + SHIFT. It will only cycle between art actually present for current track, omitting not found ones.
- UI: added new background setting for art crop: center (default), bottom, top.
- UI: added new background setting for art zoom, similar to the effect at Library-Tree-SMP (in that case is based on blur level).
- UI: added new background art mode 'Folder' which allows to display any image from a given folder path, like 'thumbs.js' SMP/JSplitter sample. Along this mode, added new cycle settings and file sorting (by name or date) to control how images are chosen. Images within folder can be cycled using the mouse wheel + SHIFT too. Note background settings are always accessed pressing SHIFT.
- UI: added new background setting to prefer placement of dark colors at the outer edge of the panel in bigradient color mode.
- UI: added new background setting for art reflection effects. Only available when crop setting is set to none.
- UI: added new background setting for basic art manipulation.
### Changed
- UI: reworked background submenu.
- UI: 'Folder' and 'Path' art modes on background now support TF expressions.
- UI: improvements on dynamic colors handling related to background color identification (mixing the art, color settings, etc.).
- UI: changed color for processing popup overlay.
- Code cleanup and performance improvements if panel is disabled or during startup.
- Code cleanup and performance improvements for background code. In particular when art has been set to be invisible for exclusive art colors processing or set to none.
### Removed
### Fixed
- UI: panel no longer shows "no data" message while popup overlay is enabled (usually while processing new data).
- UI: mouse cursor being shown as hand when over left/right buttons even if they were not shown.

## [2.4.0] - 2025-12-23
### Added
- UI: added new setting to background to skip following selection if follow now playing is active.
- UI: added new setting to background when using art to apply a special circular blur effect instead of an homogeneous blur.
### Changed
- UI: changed default background settings for a more cohesive experience along [Library-Tree-SMP](https://github.com/regorxxx/Library-Tree-SMP/), Biography and dark mode.
- UI: improvements on dynamic colors handling in some extreme cases with main and secondary colors being almost equal.
- UI: improvements to dynamic colors handling for background and server-color sources. Added warning when trying to activate both at the same time.
### Removed
### Fixed
- UI: fixed color-server not replying when third party panels asked for color scheme.

## [2.3.0] - 2025-12-12
### Added
- Data: is now possible to create 3D charts with the Y-axis 'Listens (range)' option, along any X-axis and Z-axis TF (except a case mentioned below). It should calculate the playcounts for the given time range for each Z-group. Previously it simply displayed no data in these cases.
- Data: new menu entry to set custom TF expressions for data aggregation.
- Drag n' drop: added drag n' drop support, which allows to send selection to the chart to draw statistics for these tracks (replacing any previously set source). Additionally, there is a new source mode called 'Manual' which only reacts to drag n' drop or tracks sent by other panels. Note drag n' dropping any track when any other source is set will -temporarily- replace the current source (until it gets updated by any other condition), but once tracks have been dropped you can continue adding new ones (pressing Ctrl.) or replace the previous ones (default).
- External integration:  added external integration via window.NotifyOthers(callback, arg) with other scripts. Window arg property should be an array with desired target panel names. All panels execute the action if it is not provided, otherwise only the matching panels. Chart arg follows the same behaviour for for panel with multiple charts (by Title). Note panel notifications only work within the same JS host component (i.e. no SMP <-> JSplitter). Currently available callbacks (name -> arg): [new]
	* 'Timeline-SMP: add tracks'				-> { window?: string[], chart?: string[], bAdd?: boolean, handleList: FbMetadbHandleList }, like drag n' drop, to temporarily set the source to given tracks. bAdd indicates whether to add or replace previous tracks. Note this source change is never saved between panel reloads.
	* 'Timeline-SMP: refresh data'				-> { window?: string[], chart?: string[] }, Equivalent to 'Settings/Force data refresh'
	* 'Timeline-SMP: set data by entry name'	-> { window?: string[], chart?: string[], xEntry?: string, yEntry?: string, zEntry?: string }, Equivalent to 'Settings/Set *-Axis Data'. Match by name. Changes to multiple axis are done by setting their respective names in a single call. Note this change is always saved between panel reloads.
	* 'Timeline-SMP: set data aggregation'		-> { window?: string[], chart?: string[], groupBy: {y?: string, yKey?: string }, bSaveProperties?: boolean }, Equivalent to 'Settings/Aggregate by'. 
	* 'Timeline-SMP: set data time range'		-> { window?: string[], chart?: string[], timeRange: { timePeriod?: number, timeKey?: string }, bSaveProperties?: boolean }, Equivalent to 'Settings/Time range'. Check getTimeRange() at timeline.js file (main.js within package).
	* 'Timeline-SMP: set data filter by name'	-> { window?: string[], chart?: string[], filterEntry: string, bSaveProperties?: boolean }, Equivalent to 'Settings/Data filtering'. Match by name. 
	* 'Timeline-SMP: set data source'			-> { window?: string[], chart?: string[], dataSource: { sourceType?: string, sourceArg?: string[]|FbMetadbHandleList, bRemoveDuplicates?: boolean }, bSaveProperties?: boolean }, Sets data source. sourceType can be any of 'library'|'activePlaylist'|'playingPlaylist'|'playlist'|'handleList'. When using 'playlist' as source, sourceArg must be an array of playlist names; for 'handleList', provide a FbMetadbHandleList. 
	* 'Timeline-SMP: set data'					-> { window?: string[], chart?: string[], entry: object, bSaveProperties?: boolean }, Completely sets chart data with custom variables, check chart.setData() at timeline.js file (main.js within package).
	* 'Timeline-SMP: set chart type'			-> { window?: string[], chart?: string[], type: string, bSaveProperties?: boolean }, Equivalent to 'Display Settings/Chart type'. Check _chartGraphType at main\statistics\statistics_xxx.js for valid types. Currently: 'timeline'|'bars'|'bars-horizontal'|'lines'|'lines-hq'|'fill'|'scatter'|'doughnut'|'pie'.
	* 'Timeline-SMP: set chart sorting'			-> { window?: string[], chart?: string[], sort: {x?: string, y?: string, z?: string, my?: string, mz?:string}, bSaveProperties?: boolean }, Equivalent to 'Display Settings/Sorting'. Check on_notify_data at timeline.js file (main.js within package) for valid strings. For ex. 'natural'.
	* 'Timeline-SMP: set chart slice'			-> { window?: string[], chart?: string[], slice: [number, number], bSaveProperties?: boolean }, Equivalent to 'Display Settings/Show (X-Axis)'. Set 2 numbers for x-axis limits.
	* 'Timeline-SMP: set chart filter'			-> { window?: string[], chart?: string[], filter?: Function|string, mFilter?: boolean, bSaveProperties?: boolean }, Equivalent to 'Display Settings/Filter (*-Axis)'. The Y-Axis filter (bound to 'filter' variable) can be a function or a stringified function, which will be evaluated at runtime. For ex. "function (p) {return p.y > 5;}".
	* 'Timeline-SMP: set chart settings'		-> { window?: string[], chart?: string[], settings: object, bSaveProperties?: boolean }, Completely sets chart UI with custom variables, check .changeConfig() at main\statistics\statistics_xxx.js.
	* bSaveProperties controls whether the new setting is saved between panel reloads or not.
### Changed
- Data: Z-axis is now disabled when using the Y-axis 'Listens (range)' option along special X-axis keys (day, week, month, ...), since no data can be currently calculated in such mode for 3D charts. Previously it simply displayed no data.
- Data: filter (Y-axis) settings are now saved and restored between sessions. This is done by serializing the actual filter function as a string within the properties panel, so it's technically possible to edit it and add more complex logic. Don't ask for support/info about it, since only the default 'Greater than', 'Lower than', ... options are supported.
- UI: 'Set *-axis data' submenus now show the custom TF expression used, if any, at 'By Tf...' entry.
- UI: better adjustments of X-Axis labels in case there is not enough width to fit them all.
### Removed
### Fixed
- JSplitter: fixed compatibility bug with JSplitter (any version) due to improper constructor used on JS Host as reported [here](https://github.com/regorxxx/Infinity-Tools-SMP/pull/6) and [here](https://hydrogenaudio.org/index.php/topic,126743.msg1073615.html#msg1073615).
- Data: fixed secondary settings not being applied when using built-in query filters based on selection.
- UI: fixed dynamic colors external integration in some cases due to a typo.

## [2.2.1] - 2025-11-25
### Added
### Changed
### Removed
### Fixed
- Statistics: minor fixes.

## [2.2.0] - 2025-11-24
### Added
- UI: UI elements are now resizable using Alt + Ctrl + Mouse wheel, depending on the mouse position (over points, margins or buttons).
### Changed
### Removed
### Fixed
- UI: Fixed crash on Y-axis settings change. See [Issue 1](https://github.com/regorxxx/Timeline-SMP/issues/1).

## [2.1.1] - 2025-11-19
### Added
### Changed
- Helpers: updated helpers.
### Removed
### Fixed
- UI: fixed handling of non string labels in some cases.

## [2.1.0] - 2025-10-28
### Added
- UI: added fallback text when no data is available, along a tip to force data refresh.
- UI: added Double L. Click mouse shortcut to force data refresh (only when empty).
### Changed
- Configuration: global support for %fb2k_component_path%, %fb2k_profile_path% and %fb2k_path% in any input asking for paths.
- Configuration: improved handling of user definition files found at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\' in case they got corrupted. The corrupted file will be backed up at the same folder and a new one created. Popups will warn about it, no longer requiring user actions. See [here](https://hydrogenaudio.org/index.php/topic,120978.msg1071225.html#msg1071225).
### Removed
### Fixed
- UI: fixed animation while processing data if mouse was over the panel (it ran faster than it should be).

## [2.0.1] - 2025-09-29
### Added
### Changed
- UI: color extraction from background art is now done before blur is applied. Done after blur returned gray tones in so many unintended cases.
### Removed
- Installation: fonts are no longer bundled at '_resources' folder, but found at: https://github.com/regorxxx/foobar2000-assets/tree/main/Fonts
### Fixed
- Auto-update: fix error including a file when enabling auto-updates if it was previously disabled.

## [2.0.0] - 2025-09-20
### Added
- Installation: new panel menu, accessed through 'Ctrl + Win + R. Click' (which works globally on any script and panel, at any position), used to export/import panel settings and any other associated data. These entries may be used to fully backup the panel data, help when moving between different JS components (JSplitter <-> SMP) or even foobar2000 installations, without needing to manually backup the panel properties or other external files (like .json, track's analysis data, etc.).
- UI: new menu entry to share current UI settings across all available Timeline panels within foobar2000. It can be found at the display settings button menu (and also at the panel menu, see above). Every other panel will be highlighted and show a popup asking to import or ignore the new settings.
- Presets: added new presets for Axis TF and data filtering. In particular some related to displaying listens by specific time ranges and to show histograms by day, month, etc. Restore defaults to see them.
- Data: added support for [foo_playcount_2003](https://marc2k3.github.io/component/playcount-2003/) tags to check if a source needs to be auto-updated. i.e. '%2003_LAST_PLAYED%', '%2003_PLAYCOUNT%','%2003_LAST_PLAYED_AGO%' and '%2003_LAST_PLAYED_AGO2%'.
- Data: added support for [Dynamic Queries](https://github.com/regorxxx/Playlist-Tools-SMP) at data filtering. Charts can now be created dynamically according to the current selection/now playing item, for ex. to show distribution of rating for selected artist only, etc. New settings have been added to 'Auto-update dynamic queries' submenu to tweak the behavior. Data updating follows a algorithm to avoid unnecessary re-calculations, i.e. if the new track is the same than the previous one or it would produce the same query, data is not refreshed; thus charts using dynamic queries and displaying data which also changes on playback will not be immediately refreshed (for performance reasons). There is also an additional setting to evaluate the query on multiple selection.
- Data: new setting to avoid data loading on startup. This may be used to calculate data and display the chart only on demand. Previously there was an option to force a data update, but it was available only after loading it at least once. Thus charts associated to the entire library were always calculated at least once at startup, which may had been undesirable.
- Data: added setting to change how the Z-groups are sorted within the group (independently from the global data).
- Data: added setting to filter Z-groups points to either show all or non-zero values (on Y axis).
- Data: added setting to switch duplicates removal. In general it will be desirable to have it enabled, but in case the X-Axis is set to track Albums, it may remove tracks present in multiple albums distorting the statistics. In such cases it's recommendable to disable it.
- Data: added setting to aggregate Y-values per desired tag, so they are not counted multiple times. For ex. when displaying number of tracks at Y-axis, data may be aggregated by album so all tracks from same album only count as 1. This lets you display how many different items of any kind are present along X-axis values. i.e. artists per date, genres per decade, etc. Axis titles will be adjusted accordingly when using this setting or ask via input box for a proper title. Note this setting is only available when Y-axis is set to display a fixed number per track.
- UI: added dynamic colors support based on track's artwork. It follows the background cover mode settings and must be enabled on 'Color palette' submenu. Note the axis and labels follow a different setting in their own submenu (option added on previous versions).
- UI: new 'fill' chart type.
- UI: new 'horizontal-bars' chart type.
- UI: settings button tooltip now shows 'Shift + Win + R. Click' shortcut to open SMP/JSpliter panel menu (which works globally on any script and panel, at any position).
- UI: settings button tooltip now shows 'Double Click' shortcut to force data update (see above).
- UI: scrolling cursor is displayed when scrolling using mouse + dragging.
- UI: added horizontal (x) scrolling using the mouse wheel (for mouses with horizontal moves).
- UI: X-Axis shown values at display menu now allows any custom value.
- UI: Y-Axis filter at display menu now allows any custom value for 'greater than'/'lower than' filters.
- UI: option to filter data between 2 custom values on Y-Axis at display menu.
- UI: custom option for Z-Axis groups setting at display menu.
- UI: exposed grid settings.
- UI: exposed background gradient focus setting, i.e. where the center color will be at its highest intensity.
- UI: cut X-labels to 25 chars for non timeline charts.
- UI: exposed color settings via window.NotifyOthers() method for themes/multi-panel support. You may pass a color scheme -size 6 recommended- (output from GetColourScheme()) at 'Colors: set color scheme' (applies to all compatible panels) or 'Timeline: set color scheme' (applies only to this script), which will set appropriate colors following panel's color logic; alternatively you may set direct color settings at 'Timeline: set colors' which needs an array of 3 colors or an object {background, left, right}. Panel has also independent settings to listen to colors from other panels or sending colors (as a color-server) to others. Additionally, local color processing from art may be disabled (in case colors are meant to be set only by server). See [this](https://github.com/regorxxx/Not-A-Waveform-Seekbar-SMP/issues/4) and [this](https://hydrogenaudio.org/index.php/topic,120980.msg1069107.html#msg1069107).
- Debug: added multiple debug logging settings to 'Other settings' menu.
- Readme: readme is shown as popup on first installation and available at the settings menu.
- Configuration: external files like world map database references are now exposed as a panel property.
### Changed
- Installation: added popup warnings when scripts are installed outside foobar2000 profile folder. These checks can be tweaked at globSettings.json.
- Installation: script may now be installed at any path within the foobar profile folder, no longer limited to '[FOOBAR PROFILE FOLDER]\scripts\SMP\xxx-scripts\' folder. Obviously it may still be installed at such place, which may be preferred if updating an older version.
- Installation: multiple improvements to path handling for portable and non-portable installations. By default scripts will always try to use only relative paths to the profile folder, so scripts will work without any change when exporting the profile to any other installation. This change obviously doesn't apply to already existing installations unless restoring defaults.
- [JSplitter (SMP)](https://foobar2000.ru/forum/viewtopic.php?t=6378&start=360) support for locked playlists.
- Statistics: general improvements and optimizations of point statistics. Now also show the total number of tracks before deduplication.
- Data: source filters are now also applied to playlist creation when clicking on points.
- Data: sorting routines have been changed and now multiple sorting is allowed (by every axis).
- Data: added multi-value handling for ALBUM ARTIST tags on queries (for playlist creation and statistics).
- Data: added the minimum value to the list of suggested values to Y-axis filter.
- UI: unified script updates settings across all my scripts, look for 'Updates' submenu.
- UI: improved contrast between X-axis label backgrounds and text, using WCAG contrast ratio now. Previously it just inverted the label color to B&W.
- UI: minor adjustments to X-axis title position.
- UI: Y-axis title position will now be adjusted according to data labels position in pie and doughnut charts to avoid overlapping.
- UI: point menu now allows to select any point along the same Y-Z plane while using lines, scatter or fill charts. Previously it only worked on the point from the first serie (and that's why the other chart types exist though, to properly display multi-dimensional charts).
- UI: tooltip now shows all points along the same Y-Z plane while using lines, scatter or fill charts. See comment above.
- UI: axis legend is now shown at tooltip and point statistics popup.
- UI: X-axis labels are now shown even when not all labels can be displayed, omitting some of the values. This ensures that charts displaying numbers at the axis at least show the initial and some middle values. This applies for bars, lines, scatter, fill and timeline charts.
- UI: minor adjustments to buttons tooltips.
- UI: multiple menu entries at 'Display settings' have been renamed for clarity's sake.
- UI: multiple menu entries at 'Main settings' have been renamed for clarity's sake.
- UI: chart title now skips the Window name (panel) if it's an UUID.
- UI: left scrolling button position is now adjusted following Y-Axis display (except for doughnut and pie charts).
- UI: scrolling buttons are now shown only when the chart is not showing all data (no zoom).
- UI: bars, fill and lines chart types fallback to 'scatter' if the serie drawn contains a single point, previously nothing was drawn.
- UI: scroll buttons are now only shown if the chart can be scrolled in such direction.
- UI: tooltip now shows the scrolling mouse shortcut (if scrolling is possible).
- UI: buttons are now smoothly hidden when panel is not on focus. Transparency may be adjusted from 0 to 255 only at properties ('Chart options|buttons|alpha').
- UI: changed default margins on new installations.
- UI: buttons are now smoothly hidden when panel is not on focus. Transparency may be adjusted from 0 to 255 by setting buttons.alpha, timer to hide them by setting buttons.timer.
- Readme: added FAQ section.
- Helpers: updated helpers.
- Helpers: general code cleanup on menus internal code. Please report any bug on extra separators or menu entries not working as expected.
### Removed
### Fixed
- Statistics: point statistics not working for 2D charts.
- Statistics: Crash showing point stats on 3D graphs in some cases.
- Data: 'Values shown' option was not applied for async data unless panel was reloaded.
- Data: 'Force data update' option did not properly apply the current chart settings.
- Data: minor error on decades X-axis preset.
- Data: workaround to some tag values having numbers with commas, they are no longer considered a multi-value tag to be split. For ex. 10,000 Maniacs is not split int o [10, 000 Maniacs].
- Data: active playlist source not being updated when removing/adding tracks in some cases.
- Data: applying a filter to Y-axis after zooming resulted in some cases on an invalid range after changing the setting due to current range no longer having any data to shown. Now the data range is reset in these cases.
- UI: zoom button showing '-' instead of '+' if there was no data drawn.
- UI: minor highlighting errors on 'lines' chart type.
- UI: color palette 'colorblind safe' setting was not saved properly between sessions.
- UI: color palette 'colorblind safe' setting was not applied properly to filter the available schemes on the menu.
- UI: '&' being displayed as '_' on tooltips.
- UI: fixed minor UI background highlighting glitch when mouse was over a button but also over a point.
- UI: fixed wrong highlighting for scatter charts. It was smaller by a few px in some cases on both axis.
- UI: fixed X-axis first and last labels background not being properly adjusted in some cases for 'bars', 'lines' and 'scatter' charts.
- UI: minor x-position fix on timeline and bars charts.
- UI: fixed Y-axis title overlap in some cases.
- UI: wrong position on second background gradient using bigradient mode.
- UI: fixed possible crash on pie and doughnut charts when polygons tend to a line or point.
- UI: fixed left/right scrolling buttons position not being adjusted when changing the chart type (and only refreshed on panel restart).
- UI: adjusted right scrolling button position to not overlap with other buttons.
- UI: adjusted Z-labels in 3D timeline charts.
- UI: multiple fixes to axis, ticks and grids positions.
- UI: workaround for DPI checking under multiple OSes, specially for Wine (Unix).
- Fixed some misspelled terms on UI and variables (which also lead to some minor bugs).

## [1.5.0] - 2024-10-09
### Added
### Changed
- UI: axis TF entries can now be cloned or updated with current settings.
- [JSplitter (SMP)](https://foobar2000.ru/forum/viewtopic.php?t=6378&start=360) support and ES2021 compatibility.
- Helpers: in case saving a file throws an error due to long paths (+255 chars) a warning popup will be shown.
- Helpers: updated helpers.
### Removed
### Fixed

## [1.4.1] - 2024-08-13
### Added
### Changed
- Helpers: updated helpers.
### Removed
### Fixed
- Crash opening the point menu on libraries not fully tagged.

## [1.4.0] - 2024-04-24
### Added
- Presets: added 'BPM (range)' preset to X axis.
- UI: added album art caching for panel background whenever selecting/playing track changes but belongs to the same album. It checks for same album name and parent directory. 
### Changed
- Data: Z-axis can now be disabled, thus allowing to create standard charts for general statistics purposes (for ex. # Tracks per BPM).
- Data: better handling of async data (and switching between sync and async data).
- Data: better handling of complex TF expressions and empty values.
- Helpers: improved performance of duplicates removal in multiple places.
### Removed
### Fixed
- Configuration: .json files at 'foobar2000\js_data\presets\global' not being saved with the calculated properties based on user values from other files.
## [1.3.0] - 2024-03-21
### Added
### Changed
- Helpers: updated helpers.
### Removed
### Fixed

## [1.2.0] - 2024-03-15
### Added
- Configuration: expanded user configurable file at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json' with a new setting for panel repaint debugging purpose. Disabled by default.
- Configuration: expanded user configurable file at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json' with a new setting to check OS features on every panel startup. Enabled by default. This has been the default behavior since OS' features check was implemented, but it can now be disabled to improve init performance a bit, specially at foobar2000 startup (since it seems to hang in some cases when running it on slow HDDs or systems).
- Configuration: expanded user configurable file at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json' with a new setting for console logging to file. Disabled by default. Now this is a change from the previous behavior, where console was always logged to 'console.log' file at the [FOOBAR PROFILE FOLDER]. It can now be switched, but since it's probably not useful for most users is disabled by default.
### Changed
- Helpers: updated helpers.
### Removed
### Fixed

## [1.1.0] - 2024-02-28
### Added
- UI: added setting to center X-label ticks on 'timeline' chart type.
- Configuration: added COMPOSER to the list of global tags.
- Configuration: added LOCALE LAST.FM to the list of global tags.
- Configuration: added integrity checks to global user settings files, found at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\[...].json'. In particular queries are now check to ensure they are valid and will throw a popup at init otherwise. Other settings are check to ensure they contain valid values too.
- Configuration: expanded user configurable file at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json' with a new setting to output to console profiling logs at script init. They work globally. Disabled by default.
### Changed
- Data: all default tags, queries and TF entries now use the settings found at '.\foobar2000\js_data\presets\global\' files. Reset defaults to update entries.
- Data: enhanced sources data auto-update to only run during playback when needed. For ex. when the axis TF or filter contains tags associated to changes during playback, like %PLAY_COUNT%. It can also be set to never update during playback or to always update using ("*") as tag.
- Data: sorting is now set by default to 'natural|x' when changing from distributions to standard graphs.
- UI: added alt. labels for scatter and line charts. It just adds a background.
- UI: optimized repainting to use less resources.
- Helpers: updated helpers.
- Console: improved log file formatting on windows text editors which parse new lines only with CR+LF instead of LF.
- Code cleanup.
### Removed
### Fixed
- Data: fixed some cases where playlists sources were not updated during playback.
- Data: fixed improper handling of multi-value tags in some cases.
- Data: fixed crash using data filters.
- Data: fixed logging about sorting being set while using distributions.
- Data: fixed crash when setting data source to specific playlist(s) by name.
- UI: fix zoom while using normal distribution.
- UI: data offset to the right while using normal distribution in some cases.
- UI: fix alt. labels when using bars charts. Now behave similar to timeline chart, but being displayed on the vertical axis.
- Minor fixes.


## [1.0.0] - 2023-12-17
### Added
- UI: added color names to background color settings.are now deduplicated before processing statistics (for ex. having 2 versions of the same album will not introduce any more biases).
### Changed
- UI: optimized repainting to use less resources.
- Helpers: updated helpers.
### Removed
### Fixed

## [0.9.0] - 2023-12-11
### Added
- Data: tracks' source can now be set to library, current playlist, playing playlist or specific playlist(s) by name. When using playlists sources (any type), data can be refreshed on real time when adding/removing tracks or switching playlists. Library source is never automatically updated.
- Data: new menu entry to force a data update of the selected source.
- Data: tracks are now deduplicated before processing statistics (for ex. having 2 versions of the same album will not introduce any more biases).
### Changed
- UI: when changing the TF of any axis, the axis name is now suggested without '%' and capitalized (instead of the raw tag).
- UI: when changing the TF of any axis, the current expression is shown.
- Data: max slice range applied when changing data (previously Infinity). Set to 50 by default.
### Removed
### Fixed
- Data: incorrect number handling on Y axis in some cases when using synchronous calculation.

## [0.8.1] - 2023-12-08
### Added
### Changed
### Removed
### Fixed
- Crash opening menu when palettes have been set to not use only colorblind schemes.

## [0.8.0] - 2023-11-28
### Added
- UI: added setting to disable tooltip on all scripts. Found at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json', by changing 'bTooltip'. By default tooltip is always shown. This setting will never be exposed within foobar, only at this file.
### Changed
- Helpers: updated helpers.
- Improved error messages about features not working related to OS checks (at startup) with tips and warnings.
### Removed
### Fixed

## [0.7.0] - 2023-11-24
### Added
- Data: Y-axis is now configurable and can be set to count any TF expression per track (previously it just counted the num of tracks for the given X/Z point). For ex. it can be set to count listens per track ('%PLAY_COUNT%'), all 5 rated tracks ('$ifequal(%RATING%,5,1$not(0),0)'), etc.
- Data: Y-axis can be adjusted proportionally per total counter of tracks per serie. This setting is provided along the TF expression used (so you can set entries to display total and proportional values).
- Data: data can be filtered by query. For example 'ALL' to display all tracks or queries like '%LAST_PLAYED% DURING LAST 4 WEEKS'.
- Statistics: expanded point statistics with percentages.
- UI: number of points shown per X-value is now configurable at 'Display settings\Chart type'.
- UI: added transparency to all chart types (previously only on 'Timeline' type).
### Changed
- UI: data TF entries now have a check to show the one currently being used.
- UI: improved input menu entries with hints. For ex. transparency input menu entries now have a hint about which value is opaque and which transparent.
- Helpers: updated helpers.
- Console: reduced max log file size to 1 MB.
### Removed
### Fixed
- UI: extra column on color palette's schemes submenu.


## [0.6.0] - 2023-11-15
### Added
- First release.
### Changed
### Removed
### Fixed

[Unreleased]: ../../compare/v2.4.0...HEAD
[2.4.0]: ../../compare/v2.3.0...v2.4.0
[2.3.0]: ../../compare/v2.2.1...v2.3.0
[2.2.1]: ../../compare/v2.2.0...v2.2.1
[2.2.0]: ../../compare/v2.1.1...v2.3.0
[2.2.0]: ../../compare/v2.1.1...v2.2.0
[2.1.1]: ../../compare/v2.1.0...v2.1.1
[2.1.0]: ../../compare/v2.0.1...v2.1.0
[2.0.1]: ../../compare/v2.0.0...v2.0.1
[2.0.0]: ../../compare/v1.5.0...v2.0.0
[1.5.0]: ../../compare/v1.4.1...v1.5.0
[1.4.1]: ../../compare/v1.4.0...v1.4.1
[1.4.0]: ../../compare/v1.3.0...v1.4.0
[1.3.0]: ../../compare/v1.2.0...v1.3.0
[1.2.0]: ../../compare/v1.1.0...v1.2.0
[1.1.0]: ../../compare/v1.0.0...v1.1.0
[1.0.0]: ../../compare/v0.9.0...v1.0.0
[0.9.0]: ../../compare/v0.8.1...v0.9.0
[0.8.1]: ../../compare/v0.8.0...v0.8.1
[0.8.0]: ../../compare/v0.7.0...v0.8.0
[0.7.0]: ../../compare/v0.6.0...v0.7.0
[0.6.0]: ../../compare/9ecd88d...v0.6.0
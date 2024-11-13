# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
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
- Data: added support for [foo_playcount_2003](https://marc2k3.github.io/component/playcount-2003/) tags to check if a source needs to be auto-updated. i.e. '%2003_LAST_PLAYED%', '%2003_PLAYCOUNT%','%2003_LAST_PLAYED_AGO%' and '%2003_LAST_PLAYED_AGO2%'.
- Data: added support for [Dynamic Queries](https://github.com/regorxxx/Playlist-Tools-SMP) at data filtering. Charts can now be created dynamically according to the current selection/now playing item, for ex. to show distribution of rating for selected artist only, etc. New settings have been added to 'Auto-update dynamic queries' submenu to tweak the behavior. Data updating follows a algorithm to avoid unnecessary re-calculations, i.e. if the new track is the same than the previous one or it would produce the same query, data is not refreshed; thus charts using dynamic queries and displaying data which also changes on playback will not be immediately refreshed (for performance reasons).
- Data: new setting to avoid data loading on startup. This may be used to calculate data and display the chart only on demand. Previously there was an option to force a data update, but it was available only after loading it at least once. Thus charts associated to the entire library were always calculated at least once at startup, which may had been undesirable.
- UI: 'fill' chart type.
- UI: settings button tooltip now shows 'Shift + Win + R. Click' shortcut to open SMP/JSpliter panel menu (which works globally on any script and panel, at any position).
- UI: settings button tooltip now shows 'Double Click' shortcut to force data update (see above).
- UI: scrolling cursor is displayed when scrolling using mouse + dragging.
- UI: added horizontal (x) scrolling using the mouse wheel (for mouses with horizontal moves).
- UI: X-Axis shown values at display menu now allows any custom value.
- UI: Y-Axis filter at display menu now allows any custom value for 'greater than'/'lower than' filters.
- UI: option to filter data between 2 custom values on Y-Axis at display menu.
- UI: custom option for Z-Axis groups setting at display menu.
- Debug: added multiple debug logging settings to 'Other settings' menu.
- Readme: readme is shown as popup on first installation and available at the settings menu.
### Changed
- [JSplitter (SMP)](https://foobar2000.ru/forum/viewtopic.php?t=6378&start=360) support for locked playlists.
- Statistics: general improvements and optimizations of point statistics. Now also show the total number of tracks before deduplication.
- Data: source filters are now also applied to playlist creation when clicking on points.
- UI: point menu now allows to select any point along the same Y-Z plane while using lines, scatter or fill charts. Previously it only worked on the point from the first serie (and that's why the other chart types exist though, to properly display multi-dimensional charts).
- UI: tooltip now shows all points along the same Y-Z plane while using lines, scatter or fill charts. See comment above.
- UI: axis legend is now shown at tooltip and point statistics popup.
- UI: X-axis keys are now shown even when not all keys can be displayed, omitting some of the values. This ensures that charts displaying numbers at the axis at least show the initial and some middle values. This applies for bars, lines, scatter, fill and timeline charts.
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
- Readme: added FAQ section.
- Helpers: updated helpers.
### Removed
### Fixed
- Statistics: point statistics not working for 2D charts.
- Data: 'Values shown' option was not applied for async data unless panel was reloaded.
- Data: 'Force data update' option did not properly apply the current chart settings.
- UI: zoom button showing '-' instead of '+' if there was no data drawn.
- UI: minor highlighting errors on 'lines' chart type.
- UI: color palette 'colorblind safe' setting was not saved properly between sessions.
- UI: '&' being displayed as '_' on tooltips.
- UI: fixed last label background not being properly adjusted in some cases for bars, lines, fill and scatter charts.
- UI: fixed minor UI background highlighting glitch when mouse was over a button but also over a point.

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

[Unreleased]: https://github.com/regorxxx/World-Map-SMP/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/regorxxx/World-Map-SMP/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/regorxxx/World-Map-SMP/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/regorxxx/World-Map-SMP/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/regorxxx/World-Map-SMP/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/regorxxx/World-Map-SMP/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/regorxxx/World-Map-SMP/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/regorxxx/World-Map-SMP/compare/9ecd88d...v0.6.0
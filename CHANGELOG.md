# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [1.4.0](#140---2023-07-24)
- [1.3.0](#130---2023-03-21)
- [1.2.0](#120---2023-03-15)
- [1.1.0](#110---2023-02-28)
- [1.0.0](#100---2023-12-17)
- [0.9.0](#090---2023-12-11)
- [0.8.1](#081---2023-12-08)
- [0.8.0](#080---2023-11-28)
- [0.7.0](#070---2023-11-24)
- [0.6.0](#060---2023-11-15)

## [Unreleased][]
### Added
### Changed
- Helpers: updated helpers.
### Removed
### Fixed
- Crash opening the point menu on libraries not fully tagged.

## [1.4.0] - 2023-07-24
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
## [1.3.0] - 2023-03-21
### Added
### Changed
- Helpers: updated helpers.
### Removed
### Fixed

## [1.2.0] - 2023-03-15
### Added
- Configuration: expanded user configurable file at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json' with a new setting for panel repaint debugging purpose. Disabled by default.
- Configuration: expanded user configurable file at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json' with a new setting to check OS features on every panel startup. Enabled by default. This has been the default behavior since OS' features check was implemented, but it can now be disabled to improve init performance a bit, specially at foobar2000 startup (since it seems to hang in some cases when running it on slow HDDs or systems).
- Configuration: expanded user configurable file at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json' with a new setting for console logging to file. Disabled by default. Now this is a change from the previous behavior, where console was always logged to 'console.log' file at the [FOOBAR PROFILE FOLDER]. It can now be switched, but since it's probably not useful for most users is disabled by default.
### Changed
- Helpers: updated helpers.
### Removed
### Fixed

## [1.1.0] - 2023-02-28
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

[Unreleased]: https://github.com/regorxxx/World-Map-SMP/compare/v1.4.0...HEAD
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
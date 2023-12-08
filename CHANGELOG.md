# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [0.8.1](#081---2023-12-08)
- [0.8.0](#080---2023-11-28)
- [0.7.0](#070---2023-11-24)
- [0.6.0](#060---2023-11-15)

## [Unreleased][]
### Added
### Changed
### Removed
### Fixed

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

[Unreleased]: https://github.com/regorxxx/World-Map-SMP/compare/v0.8.1...HEAD
[0.8.1]: https://github.com/regorxxx/World-Map-SMP/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/regorxxx/World-Map-SMP/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/regorxxx/World-Map-SMP/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/regorxxx/World-Map-SMP/compare/9ecd88d...v0.6.0
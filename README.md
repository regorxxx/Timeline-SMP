# Timeline-SMP
[![version][version_badge]][changelog]
[![CodeFactor][codefactor_badge]](https://www.codefactor.io/repository/github/regorxxx/Timeline-SMP/overview/main)
[![CodacyBadge][codacy_badge]](https://www.codacy.com/gh/regorxxx/Timeline-SMP/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=regorxxx/Timeline-SMP&amp;utm_campaign=Badge_Grade)
![GitHub](https://img.shields.io/github/license/regorxxx/Timeline-SMP)  
A [foobar2000](https://www.foobar2000.org/) interactive Timeline 
[Spider Monkey Panel](https://theqwertiest.github.io/foo_spider_monkey_panel/)/[JSplitter](https://foobar2000.ru/forum/viewtopic.php?t=6378) of your library. 
Configurable by Title Format, lets you generate playlists based on selection. Based on [Statistics-Framework-SMP](https://regorxxx.github.io/foobar2000-Framework-SMP.github.io/scripts/statistics-framework-smp/)

![tl_ui](https://github.com/regorxxx/Timeline-SMP/assets/83307074/aad0ffe8-578d-4b97-8ef5-a393a5cb5057)

## Features
- Statistics fully configurable:
	- Set data per axis with [Title Format](https://wiki.hydrogenaud.io/index.php?title=Foobar2000:Title_Formatting_Reference).
	- 3 Axis available.
	- Allows to aggregate data in groups, calculate proportional values per group (for ex. average rating/album), ...
 	- Configurable sources: library, active/now playing playist, selectable playlists (by name).
   	- Filtering with queries.
	- Highly configurable chart and data manipulation.
- Asynchronous data calculations (UI is not blocked).
- Point statistics.
- Scroll with buttons and mouse dragging.
- Zoom with mouse wheel and button.
- Configurable background (cover, colors, gradient, ...).
	- Color palettes and schemes from [colorbrewer](https://colorbrewer2.org).
	- Colorblind friendly.
- Tool-tip shows multiple info about the point selected.
- AutoPlaylist and Playlist creation on click over a point.
- Fully Wine - Unix - non IE SOs compatible.
- Automatically check for updates (configurable).

![tl](https://github.com/regorxxx/Timeline-SMP/assets/83307074/f7c3f202-9462-4726-a6f8-50c4710495c7)

## Also integrates
 1. [Statistics-Framework-SMP](https://github.com/regorxxx/Statistics-Framework-SMP): An open source framework to display charts on foobar2000.

## Requirements (only one host component required)
 1. [Spider Monkey Panel or JSplitter](../../wiki/SMP-vs-JSplitter-notes): JavaScript host component required to install this. Available in x86 and x64.
 2. [Required fonts](https://github.com/regorxxx/foobar2000-assets/tree/main/Fonts): FontAwesome, Segoe UI, Arial Unicode MS

## Installation
See [Wiki](../../wiki/Installation) or the [_INSTALLATION (txt)](../main/_INSTALLATION.txt).
Not properly following the installation instructions will result in scripts not working as intended. Please don't report errors before checking this.

## Support
 1. [Issues tracker](../../issues).
 2. [Hydrogenaudio forum](https://hydrogenaud.io/index.php/topic,125040.0.html).
 3. [Wiki](../../wiki).

## Nightly releases
Automatic package [built from GitHub](https://nightly.link/regorxxx/Timeline-SMP/workflows/build/main/file.zip) (using the latest commit). Unzip 'file.zip' downloaded and load the '*-package.zip' inside as package within your JS host component.

[changelog]: CHANGELOG.md
[version_badge]: https://img.shields.io/github/release/regorxxx/Timeline-SMP.svg
[codacy_badge]: https://api.codacy.com/project/badge/Grade/e04be28637dd40d99fae7bd92f740677
[codefactor_badge]: https://www.codefactor.io/repository/github/regorxxx/Timeline-SMP/badge/main

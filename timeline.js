'use strict';
//16/01/26

if (!window.ScriptInfo.PackageId) { window.DefineScript('Timeline-SMP', { author: 'regorxxx', version: '2.5.0', features: { drag_n_drop: true, grab_focus: true } }); }

include('helpers\\helpers_xxx.js');
/* global globTags:readable, globQuery:readable, globProfiler:readable, folders:readable, VK_CONTROL:readable, clone:readable, VK_ALT:readable, dropEffect:readable, MK_CONTROL:readable, VK_SHIFT:readable */
include('helpers\\helpers_xxx_file.js');
/* global _open:readable, utf8:readable, _save:readable, _foldPath:readable */
include('helpers\\helpers_xxx_flags.js');
/* global VK_LWIN:readable, dropMask:readable */
include('helpers\\helpers_xxx_prototypes_smp.js');
/* global extendGR:readable, debounce:readable, isInt:readable */
include('main\\statistics\\statistics_xxx.js');
/* global _chart:readable */
include('main\\statistics\\statistics_xxx_menu.js');
/* global createStatisticsMenu:readable, _menu:readable */
include('main\\timeline\\timeline_helpers.js');
/* global  _gdiFont:readable, MK_LBUTTON:readable, deepAssign:readable, RGB:readable, isJSON:readable, _scale:readable, isString:readable, isBoolean:readable, globSettings:readable, checkUpdate:readable, getDataAsync:readable, _qCond:readable, queryJoin:readable, getData:readable, getPlaylistIndexArray:readable, _t:readable, isArrayEqual:readable, queryReplaceWithCurrent:readable, isFbMetadbHandle:readable */
include('main\\timeline\\timeline_menus.js');
/* global onLbtnUpPoint:readable, onDblLbtnPoint:readable, onLbtnUpSettings:readable, createBackgroundMenu:readable, Chroma:readable, onRbtnUpImportSettings:readable, WshShell:readable, popup:readable, Input:readable */
include('main\\window\\window_xxx_background.js');
/* global _background:readable */
include('main\\window\\window_xxx_dynamic_colors.js');
/* global dynamicColors:readable */
include('helpers\\helpers_xxx_properties.js');
/* global setProperties:readable, getPropertiesPairs:readable, overwriteProperties:readable, checkJsonProperties:readable */

globProfiler.Print('helpers');

let properties = {
	background: ['Background options', JSON.stringify(_background.defaults()), { func: isJSON, forceDefaults: true }],
	chart: ['Chart options', JSON.stringify(deepAssign()(
		(new _chart).exportConfig(),
		{
			graph: { type: 'timeline', multi: true, borderWidth: _scale(1), pointAlpha: Math.round(60 * 255 / 100) },
			dataManipulation: { sort: { x: 'natural', y: null, z: null, my: 'reverse num', mz: null }, group: 3, filter: null, slice: [0, Infinity], distribution: null },
			background: { color: null },
			chroma: { scheme: 'Set1' },
			margin: { left: _scale(20), right: _scale(20), top: _scale(10), bottom: _scale(15) },
			axis: {
				x: { show: true, color: RGB(50, 50, 50), width: _scale(2), ticks: 'auto', labels: true, bAltLabels: true },
				y: { show: false, color: RGB(50, 50, 50), width: _scale(2), ticks: 5, labels: true }
			},
			configuration: { bDynLabelColor: true, bDynLabelColorBW: true, bDynSeriesColor: true, bDynBgColor: false, bLoadAsyncData: true, bPopupBackground: true },
			buttons: { alpha: 25, timer: 1500 },
		}
	)), { func: isJSON, forceDefaults: true }],
	data: ['Data options', JSON.stringify({
		x: { key: 'Date', tf: _qCond(_t(globTags.date)) },
		y: { key: 'Tracks', tf: '1' },
		z: { key: 'Artist', tf: _qCond(globTags.artist) }
	}), { func: isJSON, forceDefaults: true }],
	dataQuery: ['Data query', 'ALL', { func: isString }],
	dataSource: ['Data source', JSON.stringify({ sourceType: 'library', sourceArg: null, bRemoveDuplicates: true, removeDuplicatesOptions: { checkKeys: globTags.remDupl, sortBias: globQuery.remDuplBias } }), { func: isJSON, forceDefaults: true }],
	groupBy: ['Data aggregation', JSON.stringify({
		x: null, xKey: null,
		y: null, yKey: null,
		z: null, zKey: null
	}), { func: isJSON, forceDefaults: true }],
	timeRange: ['Time range', JSON.stringify({ timePeriod: null, timeKey: null }), { func: isJSON, forceDefaults: true }],
	xEntries: ['Axis X TF entries', JSON.stringify([
		{ x: _t(globTags.date), keyX: 'Date' },
		{ x: '$div(' + _t(globTags.date) + ',10)0s', keyX: 'Decade' },
		{ x: '$year($if3(%ADDED_ENHANCED%,%ADDED%,%2003_ADDED%))', keyX: 'Added' },
		{ x: _t(globTags.bpm), keyX: 'BPM' },
		{ x: '$mul($div(' + _t(globTags.bpm) + ',10),10)s', keyX: 'BPM (tens)' },
		{ x: _t(globTags.rating), keyX: 'Rating' },
		{ name: 'sep' },
		{ x: '%ALBUM%|$if3($meta(MUSICBRAINZ_ALBUMARTISTID,0),$meta(ALBUM ARTIST,0),$meta(ARTIST,0))', keyX: 'Album' },
		{ x: globTags.artist, keyX: 'Artist' },
		{ name: 'sep' },
		{ x: _t(globTags.camelotKey), keyX: 'Camelot Key' }, // helpers_xxx_global.js
		{ x: _t(globTags.openKey), keyX: 'Open Key' },
		{ name: 'sep' },
		{ x: _t(globTags.mood), keyX: 'Mood' },
		{ x: _t(globTags.genre), keyX: 'Genre' },
		{ x: _t(globTags.style), keyX: 'Style' },
	].map((v) => { return (Object.hasOwn(v, 'name') ? v : { ...v, name: 'By ' + v.keyX }); })), { func: isJSON }],
	yEntries: ['Axis Y TF entries', JSON.stringify([ // Better use queries to filter by 0 and 1...
		{ y: '1', keyY: 'Tracks', bProportional: false },
		{ y: globTags.playCount, keyY: 'Play count', bProportional: false },
		{ y: '#LISTENS#', keyY: 'Listens (range)', bProportional: false },
		{ name: 'sep' },
		{ y: globTags.playCount, keyY: 'Avg. Listens', bProportional: true },
		{ y: globTags.isLoved, keyY: 'Avg. Loves', bProportional: true }, // requires not to output true value
		{ y: globTags.isHated, keyY: 'Avg. Hates', bProportional: true },
		{ y: globTags.rating, keyY: 'Avg. Rating', bProportional: true },
		{ name: 'sep' },
		{ y: globTags.isRatedTop, keyY: 'Rated 5/Track', bProportional: true },
		{ y: globTags.playCountRateSinceAdded, keyY: 'Listen rate (added)', bProportional: true },
		{ y: globTags.playCountRateSincePlayed, keyY: 'Listen rate (first played)', bProportional: true },
	].map((v) => { return (Object.hasOwn(v, 'name') ? v : { ...v, name: 'By ' + v.keyY }); })), { func: isJSON }],
	zEntries: ['Axis Z TF entries', JSON.stringify([
		{ z: globTags.artist, keyZ: 'Artist' },
		{ z: _t(globTags.composer), keyZ: 'Composer' },
		{ z: _t(globTags.mood), keyZ: 'Mood' },
		{ z: _t(globTags.genre), keyZ: 'Genre' },
		{ z: _t(globTags.style), keyZ: 'Style' },
		{ z: _t(globTags.rating), keyZ: 'Rating' },
	].map((v) => { return (Object.hasOwn(v, 'name') ? v : { ...v, name: 'By ' + v.keyZ }); })), { func: isJSON }],
	queryEntries: ['Query entries', JSON.stringify([
		{ query: globQuery.lastPlayedFunc.replaceAll('#QUERYEXPRESSION#', 'DURING #NOW#'), name: 'Played today' },
		{ query: globQuery.lastPlayedFunc.replaceAll('#QUERYEXPRESSION#', 'DURING #YESTERDAY#'), name: 'Played yesterday' },
		{ query: globQuery.lastPlayedFunc.replaceAll('#QUERYEXPRESSION#', 'SINCE #YEAR#-#MMONTH#-#DWEEK#'), name: 'Played this week' },
		{ query: globQuery.lastPlayedFunc.replaceAll('#QUERYEXPRESSION#', 'DURING #YEAR#-#MMONTH#'), name: 'Played this month' },
		{ query: globQuery.lastPlayedFunc.replaceAll('#QUERYEXPRESSION#', 'DURING #YEAR#'), name: 'Played this year' },
		{ query: globQuery.lastPlayedFunc.replaceAll('#QUERYEXPRESSION#', 'DURING #PREVYEAR#'), name: 'Played last year' },
		{ query: globQuery.addedFunc.replaceAll('#QUERYEXPRESSION#', 'DURING #YEAR#-#MMONTH#'), name: 'Added this month' },
		{ name: 'sep' },
		{ query: globQuery.ratingGr2, name: 'Rated ≥3 tracks' },
		{ query: globQuery.ratingTop, name: 'Rated 5 tracks' },
		{ query: globQuery.loved, name: 'Loved tracks' },
		{ query: globQuery.hated, name: 'Hated tracks' },
		{ name: 'sep' },
		{ query: '"$stricmp($directory(%path%,2),\'Various\')" MISSING AND NOT (%ALBUM ARTIST% IS various artists OR %ALBUM ARTIST% IS va) AND COMPILATION MISSING', name: 'No compilations' },
		{ query: 'NOT DESCRIPTION IS single', name: 'No singles' },
		{ query: 'NOT DESCRIPTION IS ep', name: 'No EPs' },
		{
			query: queryJoin([
				'"$stricmp($directory(%path%,2),\'Various\')" MISSING AND NOT (%ALBUM ARTIST% IS various artists OR %ALBUM ARTIST% IS va) AND COMPILATION MISSING',
				'NOT DESCRIPTION IS single',
				'NOT DESCRIPTION IS ep'
			]),
			name: 'Only albums'
		},
		{ name: 'sep' },
		{
			query: globTags.artist + ' IS #' + globTags.artistRaw + '#',
			name: 'Selected artist(s)',
			dynQueryMode: {
				onSelection: true,
				onPlayback: true,
				preferPlayback: true
			}
		},
		{
			query: globTags.genre + ' IS #' + globTags.genre + '#',
			name: 'Selected genre(s)',
			dynQueryMode: {
				onSelection: true,
				onPlayback: true,
				preferPlayback: true
			}
		},
		{
			query: globTags.style + ' IS #' + globTags.style + '#',
			name: 'Selected style(s)',
			dynQueryMode: {
				onSelection: true,
				onPlayback: true,
				preferPlayback: true
			}
		},
		{ name: 'sep' },
		{
			query: queryJoin([
				'"$stricmp($directory(%path%,2),\'Various\')" MISSING AND NOT (%ALBUM ARTIST% IS various artists OR %ALBUM ARTIST% IS va) AND COMPILATION MISSING',
				'NOT DESCRIPTION IS single',
				'NOT DESCRIPTION IS ep'
				+ globTags.artist + ' IS #' + globTags.artistRaw + '#'

			]),
			name: 'Albums by Selected artist(s)',
			dynQueryMode: {
				onSelection: true,
				onPlayback: true,
				preferPlayback: true
			}
		},
		{
			query: queryJoin([
				globQuery.fav,
				globTags.artist + ' IS #' + globTags.artistRaw + '#'
			]),
			name: 'Fav tracks by Selected artist(s)',
			dynQueryMode: {
				onSelection: true,
				onPlayback: true,
				preferPlayback: true
			}
		},
		{
			query: queryJoin([
				globQuery.fav,
				globTags.genre + ' IS #' + globTags.genre + '#'
			]),
			name: 'Fav tracks by Selected genre(s)',
			dynQueryMode: {
				onSelection: true,
				onPlayback: true,
				preferPlayback: true
			}
		},
		{
			query: queryJoin([
				globQuery.fav,
				globTags.style + ' IS #' + globTags.style + '#'
			]),
			name: 'Fav tracks by Selected style(s)',
			dynQueryMode: {
				onSelection: true,
				onPlayback: true,
				preferPlayback: true
			}
		},
		{ name: 'sep' },
		{ query: 'ALL', name: 'All' },
	]), { func: isJSON }],
	bAsync: ['Data asynchronous calculation', true, { func: isBoolean }],
	bAutoUpdateCheck: ['Automatically check updates', globSettings.bAutoUpdateCheck, { func: isBoolean }],
	bAutoData: ['Automatically update data sources', true, { func: isBoolean }],
	playingTF: ['Update data on playback by TF', JSON.stringify([
		'PLAY_COUNT',
		'LASTFM_PLAY_COUNT',
		'LAST_PLAYED_ENHANCED',
		'LAST_PLAYED',
		'2003_LAST_PLAYED',
		'2003_PLAYCOUNT',
		'2003_LAST_PLAYED_AGO',
		'2003_LAST_PLAYED_AGO2'
	]), { func: isJSON }],
	firstPopup: ['Timeline: Fired once', false, { func: isBoolean }],
	dynQueryMode: ['Update data with dynamic queries', JSON.stringify({
		onSelection: true,
		onPlayback: true,
		preferPlayback: true,
		multipleSelection: false
	}), { func: isJSON, forceDefaults: true }],
	dataRefreshRate: ['Data refresh max rate (ms)', 250, { func: isInt, range: [[0, Infinity]] }],
	filePaths: ['External database paths', JSON.stringify({
		listenBrainzArtists: _foldPath(folders.data + 'listenbrainz_artists.json'),
		searchByDistanceArtists: _foldPath(folders.data + 'searchByDistance_artists.json'),
		worldMapArtists: _foldPath(folders.data + 'worldMap.json'),
		lastfmArtists: _foldPath(folders.data + 'lastfm_artists.json')
	}), { func: isJSON, forceDefaults: true }],
	bOnNotifyColors: ['Adjust colors on panel notify', true, { func: isBoolean }],
	bNotifyColors: ['Notify colors to other panels', false, { func: isBoolean }]
};
Object.keys(properties).forEach(p => properties[p].push(properties[p][1]));
setProperties(properties, '', 0);
properties = getPropertiesPairs(properties, '', 0);
checkJsonProperties(properties);

// Helpers
const dynQueryMode = JSON.parse(properties.dynQueryMode[1]);
const getSel = () => {
	let sel = dynQueryMode.multipleSelection ? fb.GetSelections(1) : fb.GetFocusItem(true);
	if (dynQueryMode.multipleSelection && (!sel || !sel.Count)) { sel = fb.GetFocusItem(true); }
	if (dynQueryMode.onSelection) {
		if (dynQueryMode.onPlayback) {
			if (dynQueryMode.preferPlayback) { return fb.GetNowPlaying() || sel; }
			else { return sel || fb.GetNowPlaying(); }
		} else { return sel; }
	}
	else if (dynQueryMode.onPlayback) { return fb.GetNowPlaying() || sel; }
	else { return sel; }
};
const getTimeRange = (properties) => {
	const timeRange = JSON.parse(properties.timeRange[1], (key, val) => val === null ? Infinity : val);
	if (timeRange.timePeriod === Infinity) { return {}; }
	const now = new Date();
	if (['nowDay', 'nowWeek', 'nowMonth', 'nowYear'].includes(timeRange.timeKey)) {
		switch (timeRange.timeKey) {
			case 'nowDay': timeRange.timePeriod *= 1; break;
			case 'nowWeek': timeRange.timePeriod *= now.getUTCDay() + 1; break;
			case 'nowMonth': timeRange.timePeriod *= now.getUTCDate(); break;
			case 'nowYear': {
				timeRange.timePeriod *= (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
				break;
			}
		}
		timeRange.timeKey = 'Days';

	}
	timeRange.fromDate = new Date(now);
	now.setTime(now.getTime() - timeRange.timePeriod * 24 * 60 * 60 * 1000);
	timeRange.toDate = now;
	return timeRange;
};
const timePeriods = ['#DAY#', '#WEEK#', '#MONTH#', '#YEAR#'];

// Info Popup
if (!properties.firstPopup[1]) {
	properties.firstPopup[1] = true;
	overwriteProperties(properties); // Updates panel
	const readmePath = folders.xxx + 'helpers\\readme\\timeline.txt';
	const readme = _open(readmePath, utf8);
	if (readme.length) { fb.ShowPopupMessage(readme, window.ScriptInfo.Name); }
}

// Update check
if (properties.bAutoUpdateCheck[1]) {
	include('helpers\\helpers_xxx_web_update.js');
	setTimeout(checkUpdate, 120000, { bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb });
}

/*
	Panel background
*/
const background = new _background({
	...JSON.parse(properties.background[1]),
	x: 0, y: 0, w: window.Width, h: window.Height,
	callbacks: {
		change: function (config, changeArgs, callbackArgs) {
			if (callbackArgs && callbackArgs.bSaveProperties) {
				['x', 'y', 'w', 'h'].forEach((key) => delete config[key]);
				properties.background[1] = JSON.stringify(config);
				overwriteProperties(properties);
			}
		},
		artColors: (colArray, bForced) => {
			if (!bForced && !charts.some((chart) => chart.configuration.bDynSeriesColor)) { return; }
			else if (colArray) {
				const bChangeBg = charts.some((chart) => chart.configuration.bDynBgColor) && background.useColors && !background.useColorsBlend;
				const { main, sec, note } = dynamicColors(
					colArray,
					bChangeBg ? RGB(122, 122, 122) : background.getAvgPanelColor(),
					true
				);
				if (bChangeBg) {
					const gradient = [Chroma(note).saturate(2).luminance(0.005).android(), note];
					const bgColor = Chroma.scale(gradient).mode('lrgb')
						.colors(background.colorModeOptions.color.length, 'android')
						.reverse();
					background.changeConfig({ config: { colorModeOptions: { color: bgColor } }, callbackArgs: { bSaveProperties: false } });
				}
				charts.forEach((chart) => chart.callbacks.config.artColors([main, sec], bForced));
			} else {
				background.changeConfig({ config: { colorModeOptions: { color: JSON.parse(properties.background[1]).colorModeOptions.color } }, callbackArgs: { bSaveProperties: false } });
				charts.forEach((chart) => chart.callbacks.config.artColors(JSON.parse(chart.properties.chart[1]).chroma.scheme, bForced));
			}
			if (window.IsVisible) { window.Repaint(); }
		},
		artColorsNotify: (colArray, bForced = false) => {
			if (!bForced && !charts.some((chart) => chart.properties.bNotifyColors[1])) { return; }
			else if (colArray) {
				background.scheme = colArray;
				window.NotifyOthers('Colors: set color scheme', colArray);
			}
		}
	}
});

/*
	Charts
*/
const defaultConfig = deepAssign()(
	JSON.parse(properties.chart[3], (key, value) => {
		return (key === 'slice' && value ? value.map((v) => (v === null ? Infinity : v)) : value);
	}),
	JSON.parse(properties.chart[1], (key, value) => {
		return (key === 'slice' && value ? value.map((v) => (v === null ? Infinity : v)) : value);
	}),
	{
		data: [],
		x: 0, y: 0, w: 0, h: 0,
		tooltipText: function (point, series, mask) { // eslint-disable-line no-unused-vars
			return '\n' + '-'.repeat(60) + '\n(L. click to show point menu)' +
				(this.getCurrentRange() < this.getMaxRange() ? '\n(L. click dragging to scroll)' : '') +
				'\n(Use buttons to configure chart)' +
				'\n(Shift + Win + R. Click for SMP panel menu)' +
				'\n(Ctrl + Win + R. Click for script panel menu)';
		},
		configuration: { bSlicePerKey: true },
		callbacks: {
			point: {
				onLbtnUp: onLbtnUpPoint,
				onDblLbtn: onDblLbtnPoint,
			},
			settings: {
				onLbtnUp: function (x, y, mask) { onLbtnUpSettings.call(this).btn_up(x, y); }, // eslint-disable-line no-unused-vars
				onDblLbtn: function (x, y, mask) { this.setData(); }, // eslint-disable-line no-unused-vars
				tooltip: 'Main settings\n\nDouble L. Click to force data update' +
					'\n' + '-'.repeat(50) +
					'\n(Shift + Win + R. Click for SMP panel menu)' +
					'\n(Ctrl + Win + R. Click for script panel menu)'
			},
			display: {
				onLbtnUp: function (x, y, mask) { // eslint-disable-line no-unused-vars
					/** @type {_menu} */
					const menu = createStatisticsMenu.call(this);
					[menu.getMenuNameFrom('Dynamic colors', 'Axis && labels'), menu.getMenuNameFrom('Dynamic colors', 'Color palette')].forEach((menuName) => {
						menu.concatEntry([
							{
								menuName,
								entryText: 'sep',
							},
							{
								menuName,
								entryText: 'Listen to color-servers',
								func: () => {
									this.properties.bOnNotifyColors[1] = !this.properties.bOnNotifyColors[1];
									if (this.configuration.bDynSeriesColor && this.properties.bOnNotifyColors[1]) { fb.ShowPopupMessage('Warning: Dynamic colors (background art mode) and Color-server listening are enabled at the same time.\n\nThis setting may probably produce glitches since 2 color sources are being used, while one tries to override the other.\n\nIt\'s recommended to only use one of these features, unless you know what you are doing.', window.ScriptInfo.Name + ': Dynamic colors'); }
									overwriteProperties(this.properties);
									if (this.properties.bOnNotifyColors[1]) {
										window.NotifyOthers('Colors: ask color scheme', window.ScriptInfo.Name + ': set color scheme');
										window.NotifyOthers('Colors: ask color', window.ScriptInfo.Name + ': set colors');
									} else if (!properties.bDynamicColors[1]) {
										background.callbacks.artColors(void (0), true);
									}
								},
								checkFunc: () => this.properties.bOnNotifyColors[1]
							}, {
								menuName,
								entryText: 'Act as color-server',
								func: () => {
									this.properties.bNotifyColors[1] = !(this.properties.bNotifyColors[1] && background.useCoverColors);
									overwriteProperties(this.properties);
									if (this.properties.bNotifyColors[1]) {
										if (background.scheme) { window.NotifyOthers('Colors: set color scheme', background.scheme); }
										else if (!background.useCoverColors) {
											background.changeConfig({
												bRepaint: false, callbackArgs: { bSaveProperties: true },
												config: !background.useCover
													? { coverMode: background.getDefaultCoverMode(), coverModeOptions: { alpha: 0, bProcessColors: true } }
													: { coverModeOptions: { bProcessColors: true } },
											});
										}
									}
								},
								checkFunc: () => this.properties.bNotifyColors[1] && background.useCoverColors
							},
						]);
					});
					menu.btn_up(x, y, [
						'sep',
						createBackgroundMenu.call(background, { menuName: 'Background' }, void (0), { nameColors: true }),
						'sep',
						new _menu().concatEntry({
							entryText: 'Share UI settings...', func: () => {
								charts.every((chart) => chart.shareUiSettings());
							}
						})
					]);
				}
			},
			config: {
				change: function (config, changeArgs, callbackArgs) {
					if (callbackArgs && callbackArgs.bSaveProperties) {
						['x', 'y', 'w', 'h'].forEach((key) => delete config[key]);
						['x', 'y', 'z'].forEach((c) => ['key', 'tf'].forEach((key) => delete config.axis[c][key]));
						config.dataManipulation.sort = this.exportSortLabel();
						if (config.dataManipulation.filter) { config.dataManipulation.filter = this.serializeFunction(config.dataManipulation.filter); }
						this.properties.chart[1] = JSON.stringify(config);
						this.properties.data[1] = JSON.stringify(this.exportDataLabels());
						if (changeArgs.configuration && changeArgs.configuration.bDynSeriesColor) {
							background.changeConfig({ config: { coverModeOptions: { bProcessColors: true } }, callbackArgs: { bSaveProperties: true } });
						} else {
							overwriteProperties(this.properties);
						}
						if (changeArgs.configuration && (Object.hasOwn(changeArgs.configuration, 'bDynSeriesColor') || Object.hasOwn(changeArgs.configuration, 'bDynBgColor'))) {
							background.updateImageBg(true);
							if (!config.configuration.bDynSeriesColor || !(changeArgs.configuration.bDynBgColor || config.configuration.bDynBgColor)) {
								background.changeConfig({ config: { colorModeOptions: { color: JSON.parse(this.properties.background[1]).colorModeOptions.color } }, callbackArgs: { bSaveProperties: false } });
							}
						}
					}
				},
				backgroundColor: background.getAvgPanelColor,
				artColors: function (scheme, bForced) {
					if (scheme && (this.configuration.bDynSeriesColor || bForced)) { // This flag has been added at script init
						this.changeConfig({ colors: [], chroma: { scheme }, bPaint: true, callbackArgs: { bSaveProperties: false } });
					} else {
						this.changeConfig({ colors: [], chroma: { scheme: JSON.parse(this.properties.chart[1]).chroma.scheme }, bPaint: true, callbackArgs: { bSaveProperties: false } });
					}
				}
			},
		},
		buttons: { xScroll: true, settings: true, display: true, zoom: true },
		gFont: _gdiFont('Segoe UI', _scale(12))
	}
);

globProfiler.Print('settings');

const newConfig = [
	[ // Row
		{
			axis: JSON.parse(properties.data[1])
		},
	]
];
newConfig.forEach((row) => row.forEach((config) => {
	const dataSource = JSON.parse(properties.dataSource[1]);
	const filePaths = JSON.parse(properties.filePaths[1]);
	const timeRange = getTimeRange(properties);
	const groupBy = JSON.parse(properties.groupBy[1]);
	const bHasX = Object.hasOwn(config.axis.x, 'tf') && config.axis.x.tf.length;
	const bHasY = Object.hasOwn(config.axis.y, 'tf') && config.axis.y.tf.length;
	const bListens = bHasY
		? config.axis.y.tf === '#LISTENS#'
		: false;
	const bListensPerPeriod = bListens && bHasX && timePeriods.includes(config.axis.x.tf);
	const bHasZ = Object.hasOwn(config.axis.z, 'tf') && config.axis.z.tf.length && !bListensPerPeriod;
	const bAsync = properties.bAsync[1];
	if (bAsync || defaultConfig.configuration.bLoadAsyncData) {
		const func = bAsync ? getDataAsync : getData;
		config[bAsync ? 'dataAsync' : 'data'] = () => func({
			option: bHasZ
				? bListens
					? 'timeline playcount'
					: 'timeline'
				: bListensPerPeriod
					? 'playcount period'
					: bListens
						? 'playcount'
						: 'tf',
			groupBy,
			optionArg: timeRange,
			sourceType: dataSource.sourceType,
			sourceArg: dataSource.sourceArg || null,
			x: bHasX ? _qCond(config.axis.x.tf, true) : '',
			y: bHasY ? _qCond(config.axis.y.tf, true) : '',
			z: bHasZ ? _qCond(config.axis.z.tf, true) : '',
			query: queryJoin([
				properties.dataQuery[1],
				...(bListensPerPeriod
					? []
					: [
						bHasX ? config.axis.x.tf + ' PRESENT' : '',
						bHasZ ? config.axis.z.tf + ' PRESENT' : ''
					])
			], 'AND') || void (0),
			queryHandle: getSel(),
			bProportional: config.axis.y.bProportional,
			bRemoveDuplicates: dataSource.bRemoveDuplicates,
			removeDuplicatesOptions: dataSource.removeDuplicatesOptions || {},
			filePaths
		});
		if (!bAsync) { config.data = config.data(); }
	}
	if (!bHasZ) { config.graph = { multi: false }; }
}));

/*
	Automatically draw new graphs using table above
*/
const rows = newConfig.length;
const columns = newConfig[0].length;
const nCharts = Array.from({ length: rows }, (row, i) => {
	return Array.from({ length: columns }, (cell, j) => {
		const w = window.Width / columns;
		const h = window.Height / rows * (i + 1);
		const x = w * j;
		const y = window.Height / rows * i;
		const title = window.PanelName + ' - Graph ' + (1 + rows * i + j) + ' {' + newConfig[i][j].axis.x.key + ' - ' + newConfig[i][j].axis.y.key + '}';
		return new _chart({ ...defaultConfig, x, y, w, h }).changeConfig({ ...newConfig[i][j], bPaint: false, title });
	});
});
const charts = nCharts.flat(Infinity);

/*
	Helper to set data
*/
charts.forEach((/** @type {_chart} */ chart, i) => {
	chart.properties = properties;
	chart.dragDropCache = new FbMetadbHandleList();
	chart.setData = function (entry = {}) {
		const bHasX = Object.hasOwn(entry, 'x') && entry.x.length;
		const bHasY = Object.hasOwn(entry, 'y') && entry.y.length;
		const bHasTfX = Object.hasOwn(this.axis.x, 'tf') && this.axis.x.tf.length;
		const bHasTfY = Object.hasOwn(this.axis.y, 'tf') && this.axis.y.tf.length;
		const bListens = bHasY
			? entry.y === '#LISTENS#'
			: bHasTfY
				? this.axis.y.tf === '#LISTENS#'
				: false;
		const bListensPerPeriod = bListens && timePeriods.includes(bHasX ? entry.x : (bHasTfX ? this.axis.x.tf : ''));
		const bHasTfZ = Object.hasOwn(this.axis.z, 'tf') && this.axis.z.tf.length && !bListensPerPeriod;
		const bHasZ = Object.hasOwn(entry, 'z') && entry.z.length && !bListensPerPeriod;
		const dataSource = JSON.parse(this.properties.dataSource[1]);
		const sourceType = Object.hasOwn(entry, 'sourceType') ? entry.sourceType : dataSource.sourceType;
		const sourceArg = (Object.hasOwn(entry, 'sourceArg') ? entry.sourceArg : dataSource.sourceArg) || (sourceType === 'handleList' ? this.dragDropCache : null) || null;
		const dataOpts = JSON.parse(this.properties.data[1]);
		const timeRange = getTimeRange(this.properties);
		const groupBy = JSON.parse(this.properties.groupBy[1]);
		const chartConfig = JSON.parse(this.properties.chart[1], (key, value) => {
			return (key === 'slice' && value ? value.map((v) => (v === null ? Infinity : v)) : value);
		});
		const filePaths = JSON.parse(this.properties.filePaths[1]);
		const option = bHasTfZ || bHasZ
			? bListens
				? 'timeline playcount'
				: 'timeline'
			: bListensPerPeriod
				? 'playcount period'
				: bListens
					? 'playcount'
					: 'tf';
		const newConfig = {
			[this.properties.bAsync[1] ? 'dataAsync' : 'data']: (this.properties.bAsync[1] ? getDataAsync : getData)({
				option,
				groupBy: Object.hasOwn(entry, 'groupBy') ? entry.groupBy : groupBy,
				optionArg: Object.hasOwn(entry, 'optionArg') ? entry.optionArg : timeRange,
				sourceType,
				sourceArg,
				x: bHasX ? entry.x : _qCond(this.axis.x.tf || '', true),
				y: bHasY ? entry.y : _qCond(this.axis.y.tf || '', true),
				z: bHasZ ? entry.z : _qCond(this.axis.z.tf || '', true),
				query: queryJoin([
					Object.hasOwn(entry, 'query') ? entry.query : this.properties.dataQuery[1],
					...(bListensPerPeriod
						? []
						: [
							bHasTfX || bHasX ? (bHasX ? _qCond(entry.x) : this.axis.x.tf) + ' PRESENT' : '',
							bHasTfZ || bHasZ ? (bHasZ ? _qCond(entry.z) : this.axis.z.tf) + ' PRESENT' : ''
						])

				], 'AND') || void (0),
				queryHandle: getSel(),
				bProportional: bHasY ? entry.bProportional : dataOpts.y.bProportional,
				removeDuplicatesOptions: {
					...(dataSource.removeDuplicatesOptions || {}),
					...(Object.hasOwn(entry, 'removeDuplicatesOptions') ? entry.removeDuplicatesOptions : {})
				},
				filePaths
			}),
			axis: {},
			dataManipulation: chartConfig.dataManipulation
		};
		if (bHasX) { newConfig.axis.x = { key: entry.keyX, tf: _qCond(entry.x) }; }
		if (bHasY) { newConfig.axis.y = { key: entry.keyY, tf: _qCond(entry.y), bProportional: entry.bProportional }; }
		if (bHasZ) { newConfig.axis.z = { key: entry.keyZ, tf: _qCond(entry.z) }; }
		if (bHasZ || bHasTfZ) { newConfig.graph = { multi: true }; }
		else { newConfig.graph = { multi: false }; }
		const title = window.PanelName + ' - Graph ' + i + ' {' + this.axis.x.key + ' - ' + this.axis.y.key + '}';
		this.changeConfig({ ...newConfig, bPaint: true, bForceLoadData: true });
		this.changeConfig({ title, bPaint: false, callbackArgs: { bSaveProperties: true } });
	};
	chart.saveDataSettings = function (input) {
		if (Object.hasOwn(input, 'timeRange')) {
			const timeRange = JSON.parse(this.properties.timeRange[1], (key, val) => val === null ? Infinity : val);
			if (Object.hasOwn(input.timeRange, 'timePeriod')) { timeRange.timePeriod = input.timeRange.timePeriod; }
			if (Object.hasOwn(input.timeRange, 'timeKey')) { timeRange.timeKey = input.timeRange.timeKey; }
			this.properties.timeRange[1] = JSON.stringify(timeRange);
		}
		if (Object.hasOwn(input, 'query')) { this.properties.dataQuery[1] = input.query; }
		if (Object.hasOwn(input, 'dynQueryMode')) {
			for (let key in dynQueryMode) { dynQueryMode[key] = input.dynQueryMode[key] || false; }
			this.properties.dynQueryMode[1] = JSON.stringify(dynQueryMode);
		}
		if (Object.hasOwn(input, 'groupBy')) {
			chart.properties.groupBy[1] = JSON.stringify(input.groupBy);
		}
		if (Object.hasOwn(input, 'dataSource')) {
			const dataSource = JSON.parse(this.properties.dataSource[1]);
			if (Object.hasOwn(input.dataSource, 'sourceType')) { dataSource.sourceType = input.dataSource.sourceType; }
			if (Object.hasOwn(input.dataSource, 'sourceArg')) { dataSource.sourceArg = dataSource.sourceType === 'playlist' ? input.dataSource.sourceArg : null; }
			if (Object.hasOwn(input.dataSource, 'bRemoveDuplicates')) { dataSource.bRemoveDuplicates = input.dataSource.bRemoveDuplicates; }
			if (Object.hasOwn(input.dataSource, 'removeDuplicatesOptions')) { dataSource.removeDuplicatesOptions = input.dataSource.removeDuplicatesOptions; }
			this.properties.dataSource[1] = JSON.stringify(dataSource);
		}
		overwriteProperties(chart.properties);
	};
	chart.shareUiSettings = function (mode = 'popup') {
		const settings = Object.fromEntries(
			['chart', 'background', 'bOnNotifyColors', 'bNotifyColors']
				.map((key) => [key, clone(this.properties[key].slice(0, 2))])
		);
		switch (mode.toLowerCase()) {
			case 'popup': {
				const keys = ['Layout (but not data)', 'Colors', 'Background'];
				const answer = WshShell.Popup('Share current UI settings with other panels?\nSettings which will be copied:\n\n' + keys.join(', '), 0, window.ScriptInfo.Name + ': share UI settings', popup.question + popup.yes_no);
				if (answer === popup.yes) {
					window.NotifyOthers(window.ScriptInfo.Name + ': share UI settings', settings);
					return true;
				}
				return false;
			}
			case 'path': {
				const input = Input.string('file', folders.export + 'ui_settings_' + window.Name + '.json', 'File name name:', window.ScriptInfo.Name + ': export UI settings', folders.export + 'ui_settings.json', void (0), true) || (Input.isLastEqual ? Input.lastInput : null);
				if (input === null) { return null; }
				return _save(input, JSON.stringify(settings, null, '\t').replace(/\n/g, '\r\n'))
					? input
					: null;
			}
			default:
				return settings;
		}
	};
	chart.applyUiSettings = function (settings, bForce) {
		window.highlight = true;
		if (window.IsVisible) { window.Repaint(); }
		const answer = bForce
			? popup.yes
			: WshShell.Popup('Apply current settings to highlighted panel?\nCheck UI.', 0, window.FullPanelName, popup.question + popup.yes_no);
		if (answer === popup.yes) {
			const newBg = JSON.parse(String(settings.background[1]));
			['x', 'y', 'w', 'h', 'callbacks'].forEach((key) => delete newBg[key]);
			['bOnNotifyColors', 'bNotifyColors'].forEach((key) => {
				this.properties[key][1] = !!settings[key][1];
				if (Object.hasOwn(this, key)) { this[key] = this.properties[key][1]; }
			});
			const toApplyChart = { graph: {} };
			const newChart = JSON.parse(String(settings.chart[1]));
			['borderWidth', 'pointAlpha'].forEach((key) => {
				toApplyChart.graph[key] = newChart.graph[key];
			});
			if (this.graph.multi === newChart.graph.multi) {
				toApplyChart.graph.type = newChart.graph.type;
			}
			['margin', 'chroma', 'background', 'axis', 'configuration', 'buttons'].forEach((key) => {
				toApplyChart[key] = newChart[key];
			});
			['x', 'y', 'w', 'h'].forEach((key) => delete toApplyChart[key]);
			['x', 'y', 'z'].forEach((c) => ['key', 'tf'].forEach((key) => delete toApplyChart.axis[c][key]));
			this.changeConfig({ ...toApplyChart, bRepaint: true, callbackArgs: { bSaveProperties: true } });
			background.changeConfig({ config: newBg, bRepaint: false, callbackArgs: { bSaveProperties: true } });
			window.highlight = false;
			if (window.IsVisible) { window.Repaint(); }
		} else {
			window.highlight = false;
			if (window.IsVisible) { window.Repaint(); }
		}
	};
});
globProfiler.Print('charts');

let playingPlaylist = plman.PlayingPlaylist;
let activePlaylist = plman.ActivePlaylist;
let selectedHandle = getSel();
let selectedPlaylists = -1;

function refreshChartsData(plsIdx, callback, bForce = false) {
	let bRefresh = false;
	if (bForce) {
		charts.forEach((chart) => { chart.setData(); });
		bRefresh = true;
	} else {
		const dataSource = JSON.parse(properties.dataSource[1]);
		// Don't update playing playlist sources unless the filter or data TF
		// points to specific tags which are also updated during playback
		const playingTF = JSON.parse(properties.playingTF[1]).map((tag) => tag.toUpperCase());
		const needsUpdateByTf = (chart) => {
			return isArrayEqual(playingTF, ['*'])
				? true
				: playingTF.some((tag) => {
					const coords = ['x', 'y', chart.graph.multi ? 'z' : ''].filter(Boolean);
					const hasTag = (o) => o.toUpperCase().includes(tag);
					return hasTag(properties.dataQuery[1]) || coords.some((axis) => hasTag(chart.axis[axis].tf));
				});
		};
		const needsUpdateByDynQuery = () => {
			const query = properties.dataQuery[1];
			let oldQuery, newQuery;
			if (query.count('#') < 2) { return false; }
			const currSel = getSel();
			if (currSel && !selectedHandle || !currSel && selectedHandle) { return true; }
			if (selectedHandle && currSel) {
				if (isFbMetadbHandle(currSel) && isFbMetadbHandle(selectedHandle) && currSel.RawPath === selectedHandle.RawPath) { return false; }
				newQuery = queryReplaceWithCurrent(query, currSel, { bToLowerCase: true });
				oldQuery = queryReplaceWithCurrent(query, selectedHandle, { bToLowerCase: true });
			}
			if (oldQuery === newQuery) { return false; }
			selectedHandle = currSel;
			return true;
		};
		const updateCharts = (bForce, mode = '') => {
			let bRefresh = false;
			charts.forEach((chart) => {
				const bUpdate = bForce || (mode === 'tf' && needsUpdateByTf(chart)) || (mode === 'dynQuery' && needsUpdateByDynQuery());
				if (!chart.pop.isEnabled() && bUpdate) {
					chart.setData();
					bRefresh = true;
				}
			});
			return bRefresh;
		};
		const bPlaying = dataSource.sourceType === 'playingPlaylist';
		const bActive = dataSource.sourceType === 'activePlaylist' || bPlaying && !fb.IsPlaying;
		const bPlaylistChanged = ['on_playlist_items_removed', 'on_playlist_items_added'].includes(callback);
		if (bPlaylistChanged && (bActive || bPlaying)) {
			bRefresh = updateCharts(true);
		}
		if (callback === 'on_playback_new_track' && bPlaying) {
			if (playingPlaylist !== plman.PlayingPlaylist) {
				bRefresh = updateCharts(true);
			} else if (plsIdx === plman.PlayingPlaylist) {
				bRefresh = updateCharts(false, 'tf');
			}
		}
		playingPlaylist = plman.PlayingPlaylist;
		if (callback === 'on_playlist_switch' && bActive) {
			bRefresh = updateCharts(true);
		} else if (bActive && (activePlaylist !== plman.ActivePlaylist || plsIdx === plman.PlayingPlaylist)) {
			bRefresh = updateCharts(false, 'tf');
		}
		activePlaylist = plman.ActivePlaylist;
		if (dataSource.sourceType === 'playlist') {
			const idxArr = dataSource.sourceArg.reduce((acc, curr) => acc.concat(getPlaylistIndexArray(curr)), []);
			if (bPlaylistChanged && idxArr.includes(plsIdx)) {
				bRefresh = updateCharts(true);
			} else if (selectedPlaylists !== idxArr.length || idxArr.includes(plsIdx)) {
				bRefresh = updateCharts(false, 'tf');
			}
			selectedPlaylists = idxArr.length;
		}
		if (callback === 'on_selection_changed_dynQuery' || callback === 'on_item_focus_change_dynQuery') {
			if (dynQueryMode.onSelection && (!fb.IsPlaying || !dynQueryMode.onPlayback || !dynQueryMode.preferPlayback)) {
				bRefresh = updateCharts(false, 'dynQuery');
			}
		} else if (callback === 'on_playback_new_track_dynQuery' && dynQueryMode.onPlayback) {
			if (!dynQueryMode.onSelection || dynQueryMode.preferPlayback) {
				bRefresh = updateCharts(false, 'dynQuery');
			}
		}
	}
	return bRefresh;
}

/**
 * Refresh data of charts (usually for dynamic filters associated to source). It's debounced for successive calls.
 *
 * @function
 * @name refreshData
 * @kind variable
 * @param {number} plsIdx - Playlist index for source
 * @param {string} callback - Callback (name) which triggered the refresh
 * @param {boolean} bForce - Force data refresh
 * @type {boolean}
 */
const refreshData = properties.dataRefreshRate[1]
	? debounce(refreshChartsData, properties.dataRefreshRate[1])
	: refreshChartsData;

/*
	Callbacks
*/
{
	const callback = () => {
		if (background.useCover && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
			background.updateImageBg();
		}
	};
	['on_item_focus_change', 'on_selection_changed', 'on_playlists_changed', 'on_playlist_items_added', 'on_playlist_items_removed', 'on_playlist_switch'].forEach((e) => addEventListener(e, callback));

	addEventListener('on_playback_stop', (reason) => {
		if (reason !== 2) { // Invoked by user or Starting another track
			if (background.useCover && background.coverModeOptions.bNowPlaying) { background.updateImageBg(); }
		}
	});

	addEventListener('on_playback_new_track', () => {
		if (background.useCover) { background.updateImageBg(); }
	});

	addEventListener('on_colours_changed', () => {
		background.colorsChanged();
	});
}

addEventListener('on_paint', (gr) => {
	if (!window.ID) { return; }
	if (!window.Width || !window.Height) { return; }
	if (globSettings.bDebugPaint) { extendGR(gr, { Repaint: true }); }
	background.paint(gr);
	charts.forEach((chart) => { chart.paint(gr); });
	if (window.highlight) { extendGR(gr, { Highlight: true }); }
	if (window.debugPainting) { window.drawDebugRectAreas(gr); }
});

addEventListener('on_size', (width, height) => {
	if (!window.ID) { return; }
	if (!width || !height) { return; }
	background.resize({ w: width, h: height, bPaint: false });
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < columns; j++) {
			const w = width / columns;
			const h = height / rows * (i + 1);
			const x = w * j;
			const y = height / rows * i;
			nCharts[i][j].changeConfig({ x, y, w, h, bPaint: false });
		}
	}
});

addEventListener('on_mouse_move', (x, y, mask) => {
	if (!window.ID) { return; }
	background.move(x, y, mask);
	if (mask === MK_LBUTTON) {
		charts.forEach((chart) => {
			if (chart.inFocus) {
				if (!chart.isOnButton(x, y) && chart.getCurrentRange() < chart.getMaxRange()) {
					window.SetCursor(32653);
					chart.scrollX({ x, release: 0x01 /* VK_LBUTTON */, bThrottle: true });
				}
			}
		});
	} else {
		charts.some((chart) => chart.move(x, y, mask));
	}
});

addEventListener('on_mouse_leave', () => {
	charts.forEach((chart) => { chart.leave(); });
	background.leave();
});

addEventListener('on_mouse_rbtn_up', (x, y, mask) => {
	if (utils.IsKeyPressed(VK_CONTROL) && utils.IsKeyPressed(VK_LWIN)) {
		return onRbtnUpImportSettings().btn_up(x, y);
	}
	charts.some((chart) => chart.rbtnUp(x, y, mask));
	return true; // left shift + left windows key will bypass this callback and will open default context menu.
});

addEventListener('on_mouse_lbtn_up', (x, y, mask) => {
	if (!window.ID) { return; }
	charts.some((chart) => chart.lbtnUp(x, y, mask));
});

addEventListener('on_mouse_lbtn_down', (x, y, mask) => {
	if (!window.ID) { return; }
	charts.some((chart) => chart.lbtnDown(x, y, mask));
});

addEventListener('on_mouse_lbtn_dblclk', (x, y, mask) => {
	if (!window.ID) { return; }
	charts.some((chart) => chart.lbtnDblClk(x, y, mask));
});

addEventListener('on_mouse_wheel', (step) => {
	if (!window.ID) { return; }
	if (utils.IsKeyPressed(VK_CONTROL) && utils.IsKeyPressed(VK_ALT)) {
		if (utils.IsKeyPressed(VK_SHIFT)) { background.wheelResize(step, void (0), { bSaveProperties: true }); }
		else { charts.some((chart) => chart.wheelResize(step, void (0), { bSaveProperties: true })); }
	} else if (utils.IsKeyPressed(VK_SHIFT)) { background.cycleArtAsync(step); }
	else { charts.some((chart) => chart.wheel(step)); }
});

addEventListener('on_mouse_wheel_h', (step) => {
	if (!window.ID) { return; }
	charts.forEach((chart) => {
		if (chart.inFocus) {
			if (chart.getCurrentRange() < chart.getMaxRange()) {
				window.SetCursor(32653);
				chart.scrollX({ step, bThrottle: true });
			}
		}
	});
});

addEventListener('on_key_down', (vKey) => {
	if (!window.ID) { return; }
	charts.some((chart) => chart.keyDown(vKey));
});

addEventListener('on_key_up', (vKey) => {
	if (!window.ID) { return; }
	charts.some((chart) => chart.keyUp(vKey));
});

addEventListener('on_playback_new_track', () => { // To show playing now playlist indicator...
	if (!window.ID) { return; }
	if (charts.some((chart) => chart.properties.bAutoData[1])) { refreshData(plman.PlayingPlaylist, 'on_playback_new_track'); }
	if (dynQueryMode.onPlayback) { refreshData(plman.PlayingPlaylist, 'on_playback_new_track_dynQuery'); }
});

addEventListener('on_selection_changed', () => {
	if (dynQueryMode.onSelection) { refreshData(plman.ActivePlaylist, 'on_selection_changed_dynQuery'); }
});

addEventListener('on_item_focus_change', () => {
	if (dynQueryMode.onSelection) { refreshData(plman.ActivePlaylist, 'on_item_focus_change_dynQuery'); }
});

addEventListener('on_playlist_switch', () => {
	if (!window.ID) { return; }
	if (charts.some((chart) => chart.properties.bAutoData[1])) { refreshData(-1, 'on_playlist_switch'); }
});

addEventListener('on_playlists_changed', () => { // To show/hide loaded playlist indicators...
	if (!window.ID) { return; }
	if (charts.some((chart) => chart.properties.bAutoData[1])) { refreshData(-1, 'on_playlists_changed'); }
});

addEventListener('on_playlist_items_added', (idx) => { // eslint-disable-line no-unused-vars
	if (!window.ID) { return; }
	if (charts.some((chart) => chart.properties.bAutoData[1])) { refreshData(idx, 'on_playlist_items_added'); }
});

addEventListener('on_playlist_items_removed', (idx) => { // eslint-disable-line no-unused-vars
	if (!window.ID) { return; }
	if (charts.some((chart) => chart.properties.bAutoData[1])) { refreshData(idx, 'on_playlist_items_removed'); }
});

addEventListener('on_notify_data', (name, info) => {
	if (name === 'bio_imgChange' || name === 'bio_chkTrackRev' || name === 'xxx-scripts: panel name reply') { return; }
	switch (name) { // NOSONAR
		// Share panel settings
		case window.ScriptInfo.Name + ': share UI settings': {
			if (info) { charts.every((chart) => chart.applyUiSettings(clone(info))); }
			break;
		}
		// Dynamic colors
		case window.ScriptInfo.Name + ': set colors': { // Needs an array of 3 colors or an object {background, left, right}
			if (info && charts.some((chart) => chart.properties.bOnNotifyColors[1])) {
				const colors = clone(info);
				const getColor = (key) => Object.hasOwn(colors, key) ? colors.background : colors[['background', 'left', 'right'].indexOf(key)];
				const hasColor = (key) => typeof getColor(key) !== 'undefined';
				if (background.useColors && hasColor('background')) {
					background.changeConfig({ config: { colorModeOptions: { color: getColor('background') } }, callbackArgs: { bSaveProperties: false } });
				}
				if (hasColor('left') && hasColor('right')) { charts.forEach((chart) => chart.callbacks.config.artColors([getColor('left'), getColor('right')])); }
				if (window.IsVisible) { window.Repaint(); }
			}
			break;
		}
		case 'Colors: set color scheme':
		case window.ScriptInfo.Name + ': set color scheme': { // Needs an array of at least 6 colors to automatically adjust dynamic colors
			if (info && charts.some((chart) => chart.properties.bOnNotifyColors[1])) { background.callbacks.artColors(clone(info), true); }
			break;
		}
		case 'Colors: ask color scheme': {
			if (info && charts.some((chart) => chart.properties.bNotifyColors[1]) && background.scheme) {
				window.NotifyOthers(String(info), background.scheme);
			}
			break;
		}
		// External integration
		case window.ScriptInfo.Name + ': add tracks': { // { window?: string[], chart?: string[], bAdd?: boolean, handleList: FbMetadbHandleList }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (!info.handleList) { return; }
			charts.forEach((chart) => {
				if (info && info.chart && !info.chart.some((v) => v === chart.title)) { return; }
				let sourceArg = new FbMetadbHandleList(info.handleList);
				if (sourceArg && sourceArg.Count) {
					sourceArg.Sort();
					if (Object.hasOwn(info.bAdd) && info.bAdd) {
						chart.dragDropCache.RemoveAll();
						chart.dragDropCache.AddRange(sourceArg);
					} else {
						chart.dragDropCache.MakeUnion(sourceArg);
						sourceArg = chart.dragDropCache;
					}
					chart.setData({ sourceType: 'handleList', sourceArg, queryHandle: sourceArg[0] });
				}
			});
			break;
		}
		case window.ScriptInfo.Name + ': refresh data': { // { window?: string[], chart?: string[] }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			charts.forEach((chart) => {
				if (info && info.chart && !info.chart.some((v) => v === chart.title)) { return; }
				chart.setData();
			});
			break;
		}
		case window.ScriptInfo.Name + ': set data by entry name': { // { window?: string[], chart?: string[], xEntry?: string, yEntry?: string, zEntry?: string }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info) {
				charts.forEach((chart) => {
					if (info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					let entry = {};
					if (info.xEntry) {
						const entries = JSON.parse(properties.xEntries[1]);
						entry = { ...entry, ...(entries.find((entry) => entry.name === info.xEntry || {})) };
					}
					if (info.yEntry) {
						const entries = JSON.parse(properties.yEntries[1]);
						entry = { ...entry, ...(entries.find((entry) => entry.name === info.yEntry || {})) };
					}
					if (info.yEntry) {
						const entries = JSON.parse(properties.zEntries[1]);
						entry = { ...entry, ...(entries.find((entry) => entry.name === info.zEntry || {})) };
					}
					if (Object.keys(entry).length > 0) {
						chart.setData(entry);
					}
				});
			}
			break;
		}
		case window.ScriptInfo.Name + ': set data filter by name': { // { window?: string[], chart?: string[], filterEntry: string, bSaveProperties?: boolean }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info && info.filterEntry) {
				charts.forEach((chart) => {
					if (info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					const entries = JSON.parse(chart.properties.queryEntries[1]);
					const entry = entries.find((entry) => entry.name === info.filterEntry);
					if (entry) {
						if (info.bSaveProperties) { chart.saveDataSettings(entry); }
						chart.setData(entry);
					}
				});
			}
			break;
		}
		case window.ScriptInfo.Name + ': set data aggregation': { // { window?: string[], chart?: string[], groupBy: {y?: string, yKey?: string }, bSaveProperties?: boolean }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info && info.groupBy) {
				charts.forEach((chart) => {
					if (info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					const groupBy = JSON.parse(chart.properties.groupBy[1]);
					for (let key in info.groupBy) { groupBy[key] = info.groupBy[key]; }
					if (info.bSaveProperties) { chart.saveDataSettings({ groupBy }); }
					chart.changeConfig({ axis: { y: { key: groupBy.yKey } }, callbackArgs: { bSaveProperties: !!info.bSaveProperties } });
					chart.setData();
				});
			}
			break;
		}
		case window.ScriptInfo.Name + ': set data time range': { // { window?: string[], chart?: string[], timeRange: { timePeriod?: number, timeKey?: string }, bSaveProperties?: boolean }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info && info.timeRange) {
				charts.forEach((chart) => {
					if (info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					const bHasX = Object.hasOwn(chart.axis.x, 'tf') && chart.axis.x.tf.length;
					const bHasY = Object.hasOwn(chart.axis.y, 'tf') && chart.axis.y.tf.length;
					const bListens = bHasY
						? chart.axis.y.tf === '#LISTENS#'
						: false;
					const bListensPerPeriod = bListens && bHasX && timePeriods.includes(chart.axis.x.tf);
					if (!bListens && !bListensPerPeriod) { return; }
					const timeRange = {};
					if (Object.hasOwn(info.timeRange, 'timePeriod')) { timeRange.timePeriod = info.timeRange.timePeriod; }
					if (Object.hasOwn(info.timeRange, 'timeKey')) { timeRange.timeKey = info.timeRange.timeKey; }
					if (info.bSaveProperties) { chart.saveDataSettings({ timeRange }); };
					chart.setData({ optionArg: getTimeRange(chart.properties) });
				});
			}
			break;
		}
		case window.ScriptInfo.Name + ': set data source': { // { window?: string[], chart?: string[], dataSource: { sourceType?: string, sourceArg?: string[]|FbMetadbHandleList, bRemoveDuplicates?: boolean }, bSaveProperties?: boolean }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info && info.dataSource) {
				if (!['library', 'activePlaylist', 'playingPlaylist', 'playlist', 'handleList'].includes(info.sourceType)) { return; }
				charts.forEach((chart) => {
					if (info && info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					const dataSource = {};
					chart.dragDropCache.RemoveAll();
					if (Object.hasOwn(info.dataSource, 'sourceType')) { dataSource.sourceType = info.dataSource.sourceType; }
					if (Object.hasOwn(info.dataSource, 'bRemoveDuplicates')) { dataSource.bRemoveDuplicates = info.dataSource.bRemoveDuplicates; }
					if (Object.hasOwn(info.dataSource, 'removeDuplicatesOptions')) { dataSource.removeDuplicatesOptions = info.dataSource.removeDuplicatesOptions; }
					if (dataSource.sourceType === 'handleList') {
						if (Object.hasOwn(info.dataSource, 'sourceArg')) { chart.dragDropCache.AddRange(info.dataSource.sourceArg); }
						dataSource.sourceArg = chart.dragDropCache;
						dataSource.queryHandle = chart.dragDropCache[0];
					} else if (dataSource.sourceType === 'playlist') {
						dataSource.sourceArg = Object.hasOwn(info.dataSource, 'sourceArg') && Array.isArray(info.dataSource.sourceArg)
							? clone(info.dataSource.sourceArg)
							: [];
					}
					if (info.bSaveProperties) { chart.saveDataSettings({ dataSource }); }
					chart.setData(dataSource);
				});
			}
			break;
		}
		case window.ScriptInfo.Name + ': set data': { // { window?: string[], chart?: string[], entry: object, bSaveProperties?: boolean }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info && info.entry) {
				const entry = clone(info.entry);
				if (Object.hasOwn(entry, 'dataSource')) { for (let key in entry.dataSource) { entry[key] = entry.dataSource[key]; } }
				charts.forEach((chart) => {
					if (info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					if (info.bSaveProperties) { chart.saveDataSettings(entry); }
					chart.setData(entry);
				});
			}
			break;
		}
		case window.ScriptInfo.Name + ': set chart type': { // { window?: string[], chart?: string[], type: string, bSaveProperties?: boolean }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info && info.type) {
				charts.forEach((chart) => {
					if (info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					this.changeConfig({ graph: { type: info.type }, callbackArgs: { bSaveProperties: !!info.bSaveProperties } });
				});
			}
			break;
		}
		case window.ScriptInfo.Name + ': set chart sorting': { // { window?: string[], chart?: string[], sort: {x?: string, y?: string, z?: string, my?: string, mz?:string}, bSaveProperties?: boolean }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info && info.sort) {
				charts.forEach((chart) => {
					if (chart.dataManipulation.distribution !== null) { return; }
					if (info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					const sort = {};
					const allowed = {
						'*': ['natural', 'reverse'],
						y: ['natural', 'reverse', 'natural num', 'reverse num'],
						my: ['natural', 'reverse', 'natural num', 'reverse num', 'natural total', 'reverse total'],
					};
					['x', 'y', ...(this.graph.multi ? ['z', 'my', 'mz'] : [''])].filter(Boolean).forEach((axis) => {
						if (Object.hasOwn(info.sort, axis) && (allowed[axis] || allowed['*']).includes(info.sort[axis])) {
							sort[sort] = info.sort[axis];
							if (['y', 'my'].includes(axis)) {
								if (['natural', 'reverse'].includes(axis)) { sort[axis] += ' num'; }
							}
						}
					});
					this.changeConfig({ dataManipulation: { sort }, callbackArgs: { bSaveProperties: !!info.bSaveProperties } });
				});
			}
			break;
		}
		case window.ScriptInfo.Name + ': set chart slice': { // { window?: string[], chart?: string[], slice: [number, number], bSaveProperties?: boolean }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info && info.slice && Array.isArray(info.slice) && info.slice.length === 2) {
				charts.forEach((chart) => {
					if (info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					this.changeConfig({ dataManipulation: { slice: [...info.slice] }, callbackArgs: { bSaveProperties: !!info.bSaveProperties } });
				});
			}
			break;
		}
		case window.ScriptInfo.Name + ': set chart filter': { // { window?: string[], chart?: string[], filter?: Function|string, mFilter?: boolean, bSaveProperties?: boolean }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info && (Object.hasOwn(info, 'filter') || Object.hasOwn(info, 'mFilter'))) {
				charts.forEach((chart) => {
					if (info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					const dataManipulation = {};
					if (Object.hasOwn(info, 'filter')) { dataManipulation.filter = typeof info.filter === 'function' ? chart.serializeFunction(info.filter) : info.filter; }
					if (Object.hasOwn(info, 'mFilter')) { dataManipulation.mFilter = info.mFilter; }
					this.changeConfig({ dataManipulation, callbackArgs: { bSaveProperties: !!info.bSaveProperties } });
				});
			}
			break;
		}
		case window.ScriptInfo.Name + ': set chart settings': { // { window?: string[], chart?: string[], settings: object, bSaveProperties?: boolean }
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (info && info.settings) {
				charts.forEach((chart) => {
					if (info.chart && !info.chart.some((v) => v === chart.title)) { return; }
					const settings = clone(info.settings);
					if (Object.hasOwn(settings, 'dataManipulation') && Object.hasOwn(settings.dataManipulation, 'filter') && typeof settings.dataManipulation.filter === 'function') {
						settings.dataManipulation.filter = chart.serializeFunction(settings.dataManipulation.filter);
					}
					this.changeConfig({ ...settings, callbackArgs: { bSaveProperties: !!info.bSaveProperties } });
				});
			}
			break;
		}
	}
});

addEventListener('on_drag_enter', (action, x, y, mask) => { // eslint-disable-line no-unused-vars
	// Avoid things outside foobar2000
	if (action.Effect === dropEffect.none || (action.Effect & dropEffect.link) === dropEffect.link) { action.Effect = dropEffect.none; }
});

addEventListener('on_drag_leave', (action, x, y, mask) => {
	on_mouse_leave(x, y, mask);
});

addEventListener('on_drag_over', (action, x, y, mask) => {
	// Avoid things outside foobar2000
	if (action.Effect === dropEffect.none || (action.Effect & dropEffect.link) === dropEffect.link) { action.Effect = dropEffect.none; return; }
	charts.some((chart) => {
		if (chart.move(x, y, mask)) {
			if ((mask & dropMask.ctrl) === dropMask.ctrl && chart.dragDropCache.Count) { action.Effect = dropEffect.copy; action.Text = 'Add tracks to chart'; } // Mask is mouse + key
			else { action.Effect = dropEffect.move; action.Text = 'Add tracks to chart (replace)'; }
			return true;
		}
	});
});

addEventListener('on_drag_drop', (action, x, y, mask) => {
	// Avoid things outside foobar2000
	if (action.Effect === dropEffect.none) { return; }
	charts.some((chart) => {
		if (chart.move(x, y, mask)) {
			let sourceArg = fb.GetSelections(1);
			if (sourceArg && sourceArg.Count) {
				sourceArg.Sort();
				if ((mask & MK_CONTROL) === MK_CONTROL) {
					chart.dragDropCache.MakeUnion(sourceArg);
					sourceArg = chart.dragDropCache;
				} else {
					chart.dragDropCache.RemoveAll();
					chart.dragDropCache.AddRange(sourceArg);
				}
				chart.setData({ sourceType: 'handleList', sourceArg, queryHandle: sourceArg[0] });
				return true;
			}
		}
	});
	action.Effect = dropEffect.none; // Forces not sending things to a playlist
});

if (charts.some((chart) => chart.properties.bOnNotifyColors[1])) { // Ask color-servers at init
	setTimeout(() => {
		window.NotifyOthers('Colors: ask color scheme', window.ScriptInfo.Name + ': set color scheme');
		window.NotifyOthers('Colors: ask colors', window.ScriptInfo.Name + ': set colors');
	}, 1000);
}

globProfiler.Print('callbacks');
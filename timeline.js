'use strict';
//21/11/25

if (!window.ScriptInfo.PackageId) { window.DefineScript('Timeline-SMP', { author: 'regorxxx', version: '2.1.1', features: { drag_n_drop: false, grab_focus: true } }); }

include('helpers\\helpers_xxx.js');
/* global globTags:readable, globQuery:readable, globProfiler:readable, folders:readable, VK_CONTROL:readable, clone:readable, VK_ALT:readable */
include('helpers\\helpers_xxx_file.js');
/* global _open:readable, utf8:readable, _save:readable, _foldPath:readable */
include('helpers\\helpers_xxx_flags.js');
/* global VK_LWIN:readable */
include('helpers\\helpers_xxx_prototypes_smp.js');
/* global extendGR:readable, isUUID:readable */
include('main\\statistics\\statistics_xxx.js');
/* global _chart:readable */
include('main\\statistics\\statistics_xxx_menu.js');
/* global createStatisticsMenu:readable, _menu:readable */
include('main\\timeline\\timeline_helpers.js');
/* global  _gdiFont:readable, MK_LBUTTON:readable, deepAssign:readable, RGB:readable, isJSON:readable, _scale:readable, isString:readable, isBoolean:readable, globSettings:readable, checkUpdate:readable, getDataAsync:readable, _qCond:readable, queryJoin:readable, getData:readable, getPlaylistIndexArray:readable, _t:readable, isArrayEqual:readable, queryReplaceWithCurrent:readable, toType:readable, _ps:readable */
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
	background: ['Background options', JSON.stringify(deepAssign()(
		(new _background).defaults(),
		{ colorMode: 'gradient', colorModeOptions: { color: [RGB(270, 270, 270), RGB(300, 300, 300)] }, coverMode: 'front' }
	)), { func: isJSON, forceDefaults: true }],
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
			configuration: { bDynLabelColor: true, bDynLabelColorBW: true, bDynSeriesColor: true, bDynBgColor: false, bLoadAsyncData: true },
			buttons: { alpha: 25, timer: 1500 },
		}
	)), { func: isJSON, forceDefaults: true }],
	data: ['Data options', JSON.stringify({
		x: { key: 'Date', tf: _qCond(_t(globTags.date)) },
		y: { key: 'Tracks', tf: '1' },
		z: { key: 'Artist', tf: _qCond(globTags.artist) }
	}), { func: isJSON, forceDefaults: true }],
	dataQuery: ['Data query', 'ALL', { func: isString }],
	dataSource: ['Data source', JSON.stringify({ sourceType: 'library', sourceArg: null, bRemoveDuplicates: true }), { func: isJSON, forceDefaults: true }],
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
				['x', 'y', 'w', 'h', 'callbacks'].forEach((key) => delete config[key]);
				properties.background[1] = JSON.stringify(config);
				overwriteProperties(properties);
			}
		},
		artColors: (colArray, bForced) => {
			if (!bForced && !charts.some((chart) => chart.configuration.bDynSeriesColor)) { return; }
			else if (colArray) {
				const bChangeBg = charts.some((chart) => chart.configuration.bDynBgColor);
				const { main, sec, note } = dynamicColors(
					colArray,
					bChangeBg ? RGB(122, 122, 122) : background.getColors()[0],
					true
				);
				if (bChangeBg && background.colorMode !== 'none') {
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
			window.Repaint();
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
									overwriteProperties(this.properties);
									if (this.properties.bOnNotifyColors[1]) {
										window.NotifyOthers('Colors: ask color scheme', window.ScriptInfo.Name + ': set color scheme');
										window.NotifyOthers('Colors: ask color', window.ScriptInfo.Name + ': set colors');
									}
								},
								checkFunc: () => this.properties.bOnNotifyColors[1]
							}, {
								menuName,
								entryText: 'Act as color-server',
								func: () => {
									this.properties.bNotifyColors[1] = !this.properties.bNotifyColors[1];
									overwriteProperties(this.properties);
									if (this.properties.bNotifyColors[1] && background.scheme) {
										window.NotifyOthers('Colors: set color scheme', background.scheme);
									}
								},
								checkFunc: () => this.properties.bNotifyColors[1]
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
				backgroundColor: background.getColors,
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
	const bHasZ = Object.hasOwn(config.axis.z, 'tf') && config.axis.z.tf.length;
	const bListens = bHasY
		? config.axis.y.tf === '#LISTENS#'
		: false;
	const bListensPerPeriod = bListens && bHasX && timePeriods.includes(config.axis.x.tf);
	const bAsync = properties.bAsync[1];
	if (bAsync || defaultConfig.configuration.bLoadAsyncData) {
		const func = bAsync ? getDataAsync : getData;
		config[bAsync ? 'dataAsync' : 'data'] = () => func({
			option: bHasZ
				? 'timeline'
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
		const title = (isUUID(window.Name.replace(/[{}]/g, '')) ? '' : window.Name + ' - ') + 'Graph ' + (1 + rows * i + j) + ' {' + newConfig[i][j].axis.x.key + ' - ' + newConfig[i][j].axis.y.key + '}';
		return new _chart({ ...defaultConfig, x, y, w, h }).changeConfig({ ...newConfig[i][j], bPaint: false, title });
	});
});
const charts = nCharts.flat(Infinity);

/*
	Helper to set data
*/
charts.forEach((/** @type {_chart} */ chart, i) => {
	chart.properties = properties;
	chart.setData = function (entry = {}) {
		const bHasX = Object.hasOwn(entry, 'x') && entry.x.length;
		const bHasY = Object.hasOwn(entry, 'y') && entry.y.length;
		const bHasZ = Object.hasOwn(entry, 'z') && entry.z.length;
		const bHasTfX = Object.hasOwn(this.axis.x, 'tf') && this.axis.x.tf.length;
		const bHasTfY = Object.hasOwn(this.axis.y, 'tf') && this.axis.y.tf.length;
		const bHasTfZ = Object.hasOwn(this.axis.z, 'tf') && this.axis.z.tf.length;
		const bListens = bHasY
			? entry.y === '#LISTENS#'
			: bHasTfY
				? this.axis.y.tf === '#LISTENS#'
				: false;
		const bListensPerPeriod = bListens && timePeriods.includes(bHasX ? entry.x : (bHasTfX ? this.axis.x.tf : ''));
		const dataSource = JSON.parse(this.properties.dataSource[1]);
		const dataOpts = JSON.parse(this.properties.data[1]);
		const timeRange = getTimeRange(this.properties);
		const groupBy = JSON.parse(this.properties.groupBy[1]);
		const chartConfig = JSON.parse(this.properties.chart[1]);
		const filePaths = JSON.parse(this.properties.filePaths[1]);
		const option = bHasTfZ || bHasZ
			? 'timeline'
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
				sourceType: Object.hasOwn(entry, 'sourceType') ? entry.sourceType : dataSource.sourceType,
				sourceArg: (Object.hasOwn(entry, 'sourceArg') ? entry.sourceArg : dataSource.sourceArg) || null,
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
				bRemoveDuplicates: Object.hasOwn(entry, 'bRemoveDuplicates') ? entry.bRemoveDuplicates : dataSource.bRemoveDuplicates,
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
		const title = (isUUID(window.Name.replace(/[{}]/g, '')) ? '' : window.Name + ' - ') + 'Graph ' + i + ' {' + this.axis.x.key + ' - ' + this.axis.y.key + '}';
		this.changeConfig({ ...newConfig, bPaint: true, bForceLoadData: true });
		this.changeConfig({ title, bPaint: false, callbackArgs: { bSaveProperties: true } });
	};
	chart.shareUiSettings = function (mode = 'popup') {
		const settings = Object.fromEntries(
			['chart', 'background']
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
		window.Repaint();
		const answer = bForce
			? popup.yes
			: WshShell.Popup('Apply current settings to highlighted panel?\nCheck UI.', 0, window.Name + _ps(window.ScriptInfo.Name), popup.question + popup.yes_no);
		if (answer === popup.yes) {
			const newBg = JSON.parse(String(settings.background[1]));
			['x', 'y', 'w', 'h', 'callbacks'].forEach((key) => delete newBg[key]);
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
			window.Repaint();
		} else {
			window.highlight = false;
			window.Repaint();
		}
	};
});
globProfiler.Print('charts');

let playingPlaylist = plman.PlayingPlaylist;
let activePlaylist = plman.ActivePlaylist;
let selectedHandle = getSel();
let selectedPlaylists = -1;
function refreshData(plsIdx, callback, bForce = false) {
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
				if (toType(currSel) === 'FbMetadbHandle' && toType(selectedHandle) === 'FbMetadbHandle' && currSel.RawPath === selectedHandle.RawPath) { return false; }
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

/*
	Callbacks
*/
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
	window.Repaint();
});

addEventListener('on_mouse_move', (x, y, mask) => {
	if (!window.ID) { return; }
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
		charts.some((chart) => chart.mouseWheelResize(step, void(0), { bSaveProperties: true }));
	} else { charts.some((chart) => chart.mouseWheel(step)); }
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
	if (background.coverMode.toLowerCase() !== 'none') { background.updateImageBg(); }
	if (!window.ID) { return; }
	if (charts.some((chart) => chart.properties.bAutoData[1])) { refreshData(plman.PlayingPlaylist, 'on_playback_new_track'); }
	if (dynQueryMode.onPlayback) { refreshData(plman.PlayingPlaylist, 'on_playback_new_track_dynQuery'); }
});

addEventListener('on_selection_changed', () => {
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
	if (dynQueryMode.onSelection) { refreshData(plman.ActivePlaylist, 'on_selection_changed_dynQuery'); }
});

addEventListener('on_item_focus_change', () => {
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
	if (dynQueryMode.onSelection) { refreshData(plman.ActivePlaylist, 'on_item_focus_change_dynQuery'); }
});

addEventListener('on_playlist_switch', () => {
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
	if (!window.ID) { return; }
	if (charts.some((chart) => chart.properties.bAutoData[1])) { refreshData(-1, 'on_playlist_switch'); }
});

addEventListener('on_playback_stop', (reason) => {
	if (reason !== 2) { // Invoked by user or Starting another track
		if (background.coverMode.toLowerCase() !== 'none' && background.coverModeOptions.bNowPlaying) { background.updateImageBg(); }
	}
});

addEventListener('on_playlists_changed', () => { // To show/hide loaded playlist indicators...
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
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
		case window.ScriptInfo.Name + ': share UI settings': {
			if (info) { charts.every((chart) => chart.applyUiSettings(clone(info))); }
			break;
		}
		case window.ScriptInfo.Name +': set colors': { // Needs an array of 3 colors or an object {background, left, right}
			if (info && charts.some((chart) => chart.properties.bOnNotifyColors[1])) {
				const colors = clone(info);
				const getColor = (key) => Object.hasOwn(colors, key) ? colors.background : colors[['background', 'left', 'right'].indexOf(key)];
				const hasColor = (key) => typeof getColor(key) !== 'undefined';
				if (background.colorMode !== 'none' && hasColor('bakground')) {
					background.changeConfig({ config: { colorModeOptions: { color: getColor('bakground') } }, callbackArgs: { bSaveProperties: false } });
				}
				if (hasColor('left') && hasColor('right')) { charts.forEach((chart) => chart.callbacks.config.artColors([getColor('left'), getColor('right')])); }
				window.Repaint();
			}
			break;
		}
		case 'Colors: set color scheme':
		case window.ScriptInfo.Name + ': set color scheme': { // Needs an array of at least 6 colors to automatically adjust dynamic colors
			if (info && charts.some((chart) => chart.properties.bOnNotifyColors[1])) { background.callbacks.artColors(clone(info), true); }
			break;
		}
		case 'Colors: ask color scheme': {
			if (info && charts.some((chart) => chart.properties.bOnNotifyColors[1]) && background.scheme) {
				window.NotifyOthers(String(info), background.scheme);
			}
			break;
		}
	}
});

if (charts.some((chart) => chart.properties.bOnNotifyColors[1])) { // Ask color-servers at init
	setTimeout(() => {
		window.NotifyOthers('Colors: ask color scheme', window.ScriptInfo.Name + ': set color scheme');
		window.NotifyOthers('Colors: ask colors', window.ScriptInfo.Name + ': set colors');
	}, 1000);
}

globProfiler.Print('callbacks');
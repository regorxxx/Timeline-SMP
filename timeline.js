﻿'use strict';
//28/01/25

if (!window.ScriptInfo.PackageId) { window.DefineScript('Timeline', { author: 'regorxxx', version: '1.5.0', features: { drag_n_drop: false, grab_focus: true } }); }

include('helpers\\helpers_xxx.js');
/* global globTags:readable, globQuery:readable, globProfiler:readable, folders:readable */
include('helpers\\helpers_xxx_file.js');
/* global _open:readable, utf8:readable */
include('helpers\\helpers_xxx_prototypes_smp.js');
/* global extendGR:readable, isUUID */
include('main\\statistics\\statistics_xxx.js');
/* global _chart:readable */
include('main\\statistics\\statistics_xxx_menu.js');
/* global createStatisticsMenu:readable */
include('main\\timeline\\timeline_helpers.js');
/* global  _gdiFont:readable, MK_LBUTTON:readable, deepAssign:readable, RGB:readable, isJSON:readable, _scale:readable, isString:readable, isBoolean:readable, globSettings:readable, setProperties:readable, getPropertiesPairs:readable, checkUpdate:readable, overwriteProperties:readable, getDataAsync:readable, _qCond:readable, queryJoin:readable, getData:readable, getPlaylistIndexArray:readable, _t:readable, isArrayEqual:readable, queryReplaceWithCurrent:readable, toType:readable */
include('main\\timeline\\timeline_menus.js');
/* global onLbtnUpPoint:readable, onLbtnUpSettings:readable, createBackgroundMenu:readable, Chroma:readable */
include('main\\window\\window_xxx_background.js');
/* global _background:readable */
include('main\\window\\window_xxx_dynamic_colors.js');
/* global dynamicColors:readable */
include('helpers\\helpers_xxx_properties.js');

globProfiler.Print('helpers');

let properties = {
	background: ['Background options', JSON.stringify(deepAssign()(
		(new _background).defaults(),
		{ colorMode: 'gradient', colorModeOptions: { color: [RGB(270, 270, 270), RGB(300, 300, 300)] }, coverMode: 'front' }
	)), { func: isJSON }],
	chart: ['Chart options', JSON.stringify(deepAssign()(
		(new _chart).exportConfig(),
		{
			graph: { type: 'timeline', multi: true, borderWidth: _scale(1), pointAlpha: Math.round(60 * 255 / 100) },
			dataManipulation: { sort: { x: 'natural', y: null, z: null, my: 'natural num', mz: null }, group: 3, filter: null, slice: [0, Infinity], distribution: null },
			background: { color: null },
			chroma: { scheme: 'Set1' },
			margin: { left: _scale(20), right: _scale(20), top: _scale(10), bottom: _scale(15) },
			axis: {
				x: { show: true, color: RGB(50, 50, 50), width: _scale(2), ticks: 'auto', labels: true, bAltLabels: true },
				y: { show: false, color: RGB(50, 50, 50), width: _scale(2), ticks: 5, labels: true }
			},
			configuration: { bDynLabelColor: true, bDynLabelColorBW: true, bDynSerieColor: false, bDynBgColor: false, bLoadAsyncData: true },
			buttons: { alpha: 25, timer: 1500 },
		}
	)), { func: isJSON }],
	data: ['Data options', JSON.stringify({
		x: { key: 'Date', tf: _qCond(_t(globTags.date)) },
		y: { key: 'Tracks', tf: '1' },
		z: { key: 'Artist', tf: _qCond(globTags.artist) }
	}), { func: isJSON }],
	dataQuery: ['Data query', 'ALL', { func: isString }],
	dataSource: ['Data source', JSON.stringify({ sourceType: 'library', sourceArg: null, bRemoveDuplicates: true }), { func: isJSON }],
	xEntries: ['Axis X TF entries', JSON.stringify([
		{ x: _t(globTags.date), keyX: 'Date' },
		{ x: '$div(' + _t(globTags.date) + ',10)0s', keyX: 'Decade' },
		{ x: _t(globTags.bpm), keyX: 'BPM' },
		{ x: '$mul($div(' + _t(globTags.bpm) + ',10),10)s', keyX: 'BPM (range)' },
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
		{ y: globTags.playCount, keyY: 'Listens', bProportional: false },
		{ name: 'sep' },
		{ y: globTags.playCount, keyY: 'Avg. Listens', bProportional: true },
		{ y: globTags.isLoved, keyY: 'Avg. Loves', bProportional: true }, // requires not to ouput true value
		{ y: globTags.isHated, keyY: 'Avg. Hates', bProportional: true },
		{ y: globTags.rating, keyY: 'Avg. Rating', bProportional: true },
		{ name: 'sep' },
		{ y: globTags.isRatedTop, keyY: 'Rated 5/Track', bProportional: true },
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
		{ query: globQuery.recent, name: 'Played this month' },
		{ query: globQuery.ratingTop, name: 'Rated 5 tracks' },
		{ query: globQuery.loved, name: 'Loved tracks' },
		{ query: globQuery.hated, name: 'Hated tracks' },
		{ name: 'sep' },
		{ query: '"$stricmp($directory(%path%,2),\'Various\')" MISSING AND NOT (%ALBUM ARTIST% IS various artists OR %ALBUM ARTIST% IS va) AND COMPILATION MISSING', name: 'No compilations' },
		{ query: 'NOT DESCRIPTION IS single', name: 'No singles' },
		{ query: 'NOT DESCRIPTION IS ep', name: 'No EPs' },
		{ query: '"$stricmp($directory(%path%,2),\'Various\')" MISSING AND NOT (%ALBUM ARTIST% IS various artists OR %ALBUM ARTIST% IS va) AND COMPILATION MISSING AND NOT DESCRIPTION IS single AND NOT DESCRIPTION IS ep', name: 'Only albums' },
		{ name: 'sep' },
		{
			query: globTags.artist + ' IS #' + globTags.artistRaw + '#', name: 'Selected artist(s)',
			dynQueryMode: {
				onSelection: true,
				onPlayback: true,
				preferPlayback: true
			}
		},
		{
			query: globTags.genre + ' IS #' + globTags.genre + '#', name: 'Selected genre(s)',
			dynQueryMode: {
				onSelection: true,
				onPlayback: true,
				preferPlayback: true
			}
		},
		{
			query: globTags.style + ' IS #' + globTags.style + '#', name: 'Selected style(s)',
			dynQueryMode: {
				onSelection: true,
				onPlayback: true,
				preferPlayback: true
			}
		},
		{ name: 'sep' },
		{
			query: '"$stricmp($directory(%path%,2),\'Various\')" MISSING AND NOT (%ALBUM ARTIST% IS various artists OR %ALBUM ARTIST% IS va) AND COMPILATION MISSING AND NOT DESCRIPTION IS single AND NOT DESCRIPTION IS ep AND (' + globTags.artist + ' IS #' + globTags.artistRaw + '#)', name: 'Albums by Selected artist(s)',
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
	bAutoUpdateCheck: ['Automatically check updates?', globSettings.bAutoUpdateCheck, { func: isBoolean }],
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
	}), { func: isJSON }],
	bDynamicColors: ['Adjust colors to artwork', true, { func: isBoolean }],
	bDynamicColorsBg: ['Adjust colors to artwork (bg)', false, { func: isBoolean }]
};
Object.keys(properties).forEach(p => properties[p].push(properties[p][1]));
setProperties(properties, '', 0);
properties = getPropertiesPairs(properties, '', 0);
Object.keys(properties).forEach(p => {
	if (properties[p][2].func === isJSON) {
		const obj = JSON.parse(properties[p][1]);
		const def = JSON.parse(properties[p][3]);
		if (!Array.isArray(obj) && !isArrayEqual(Object.keys(obj), Object.keys(def))) {
			for (let key in def) {
				if (!Object.hasOwn(obj, key)) { obj[key] = def[key]; }
			}
			properties[p][1] = JSON.stringify(obj);
			overwriteProperties(properties);
		}
	}
});

// Helpers
const dynQueryMode = JSON.parse(properties.dynQueryMode[1]);
const getSel = () => {
	let sel = dynQueryMode.multipleSelection ? fb.GetSelections(1) : fb.GetFocusItem(true);
	if (dynQueryMode.multipleSelection && !sel.Count) { sel = fb.GetFocusItem(true); }
	if (dynQueryMode.onSelection) {
		if (dynQueryMode.onPlayback) {
			if (dynQueryMode.preferPlayback) { return fb.GetNowPlaying() || sel; }
			else { return sel || fb.GetNowPlaying(); }
		} else { return sel; }
	}
	else if (dynQueryMode.onPlayback) { return fb.GetNowPlaying() || sel; }
	else { return sel; }
};

// Info Popup
if (!properties.firstPopup[1]) {
	properties.firstPopup[1] = true;
	overwriteProperties(properties); // Updates panel
	const readmePath = folders.xxx + 'helpers\\readme\\timeline.txt';
	const readme = _open(readmePath, utf8);
	if (readme.length) { fb.ShowPopupMessage(readme, 'Timeline-SMP'); }
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
	callbacks: {
		change: function (config, changeArgs, callbackArgs) {
			if (callbackArgs && callbackArgs.bSaveProperties) {
				['x', 'y', 'w', 'h'].forEach((key) => delete config[key]);
				properties.background[1] = JSON.stringify(config);
				overwriteProperties(properties);
			}
		},
		artColors: (colArray) => {
			if (!charts.some((chart) => chart.configuration.bDynSerieColor)) { return; }
			if (colArray) {
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
				charts.forEach((chart) => chart.callbacks.config.artColors([main, sec]));
			} else {
				background.changeConfig({ config: { colorModeOptions: { color: JSON.parse(properties.background[1]).colorModeOptions.color } }, callbackArgs: { bSaveProperties: false } });
				charts.forEach((chart) => chart.callbacks.config.artColors(JSON.parse(properties.chart[1]).chroma.scheme));
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
		tooltipText: function (point, serie, mask) { // eslint-disable-line no-unused-vars
			return '\n\n(L. click to show point menu)' +
				(this.getCurrentRange() < this.getMaxRange() ? '\n(L. click dragging to scroll)' : '') +
				'\n(Use buttons to configure chart)';
		},
		configuration: { bSlicePerKey: true },
		callbacks: {
			point: {
				onLbtnUp: onLbtnUpPoint
			},
			settings: {
				onLbtnUp: function (x, y, mask) { onLbtnUpSettings.call(this).btn_up(x, y); }, // eslint-disable-line no-unused-vars
				onDblLbtn: function (x, y, mask) { this.setData(); }, // eslint-disable-line no-unused-vars
				tooltip: 'Main settings\n\nDouble L. Click to force data update\n(Shift + Win + R. Click\nfor SMP panel menu)'
			},
			display: {
				onLbtnUp: function (x, y, mask) { createStatisticsMenu.call(this).btn_up(x, y, ['sep', createBackgroundMenu.call(background, { menuName: 'Background' }, void (0), { nameColors: true })]); } // eslint-disable-line no-unused-vars
			},
			config: {
				change: function (config, changeArgs, callbackArgs) {
					if (callbackArgs && callbackArgs.bSaveProperties) {
						['x', 'y', 'w', 'h'].forEach((key) => delete config[key]);
						config.dataManipulation.sort = this.exportSortLabel();
						properties.chart[1] = JSON.stringify(config);
						properties.data[1] = JSON.stringify(this.exportDataLabels());
						overwriteProperties(properties);
						if (changeArgs.configuration && (Object.hasOwn(changeArgs.configuration, 'bDynSerieColor') || Object.hasOwn(changeArgs.configuration, 'bDynBgColor'))) {
							background.updateImageBg(true);
							if (!config.configuration.bDynSerieColor || !(changeArgs.configuration.bDynBgColor || config.configuration.bDynBgColor)) {
								background.changeConfig({ config: { colorModeOptions: { color: JSON.parse(properties.background[1]).colorModeOptions.color } }, callbackArgs: { bSaveProperties: false } });
							}
						}
					}
				},
				backgroundColor: background.getColors,
				artColors: function (scheme) {
					if (scheme && this.configuration.bDynSerieColor) { // This flag has been added at script init
						this.changeConfig({ colors: [], chroma: { scheme }, bPaint: true, callbackArgs: { bSaveProperties: false } });
					} else {
						this.changeConfig({ colors: [], chroma: { scheme: JSON.parse(properties.chart[1]).chroma.scheme }, bPaint: true, callbackArgs: { bSaveProperties: false } });
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
	const bHasX = Object.hasOwn(config.axis.x, 'tf') && config.axis.x.tf.length;
	const bHasY = Object.hasOwn(config.axis.y, 'tf') && config.axis.y.tf.length;
	const bHasZ = Object.hasOwn(config.axis.z, 'tf') && config.axis.z.tf.length;
	if (properties.bAsync[1]) {
		config.dataAsync = () => getDataAsync({
			option: bHasZ ? 'timeline' : 'tf',
			sourceType: dataSource.sourceType,
			sourceArg: dataSource.sourceArg || null,
			x: bHasX ? _qCond(config.axis.x.tf, true) : '',
			y: bHasY ? _qCond(config.axis.y.tf, true) : '',
			z: bHasZ ? _qCond(config.axis.z.tf, true) : '',
			query: queryJoin([
				properties.dataQuery[1],
				bHasX ? config.axis.x.tf + ' PRESENT' : '',
				bHasZ ? config.axis.z.tf + ' PRESENT' : ''
			], 'AND'),
			queryHandle: getSel(),
			bProportional: config.axis.y.bProportional,
			bRemoveDuplicates: dataSource.bRemoveDuplicates
		});
	} else if (defaultConfig.configuration.bLoadAsyncData) {
		config.data = getData({
			option: bHasZ ? 'timeline' : 'tf',
			sourceType: dataSource.sourceType,
			sourceArg: dataSource.sourceArg || null,
			x: bHasX ? _qCond(config.axis.x.tf, true) : '',
			y: bHasY ? _qCond(config.axis.y.tf, true) : '',
			z: bHasZ ? _qCond(config.axis.z.tf, true) : '',
			query: queryJoin([
				properties.dataQuery[1],
				bHasX ? config.axis.x.tf + ' PRESENT' : '',
				bHasZ ? config.axis.z.tf + ' PRESENT' : ''
			], 'AND'),
			queryHandle: getSel(),
			bProportional: config.axis.y.bProportional,
			bRemoveDuplicates: dataSource.bRemoveDuplicates
		});
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
charts.forEach((chart, i) => {
	chart.setData = function (entry = {}) {
		const bHasX = Object.hasOwn(entry, 'x') && entry.x.length;
		const bHasY = Object.hasOwn(entry, 'y') && entry.y.length;
		const bHasZ = Object.hasOwn(entry, 'z') && entry.z.length;
		const bHasTfX = Object.hasOwn(this.axis.x, 'tf') && this.axis.x.tf.length;
		const bHasTfZ = Object.hasOwn(this.axis.z, 'tf') && this.axis.z.tf.length;
		const dataSource = JSON.parse(properties.dataSource[1]);
		const dataOpts = JSON.parse(properties.data[1]);
		const chartConfig = JSON.parse(properties.chart[1]);
		const newConfig = {
			[properties.bAsync[1] ? 'dataAsync' : 'data']: (properties.bAsync[1] ? getDataAsync : getData)({
				option: bHasTfZ || bHasZ ? 'timeline' : 'tf',
				sourceType: Object.hasOwn(entry, 'sourceType') ? entry.sourceType : dataSource.sourceType,
				sourceArg: (Object.hasOwn(entry, 'sourceArg') ? entry.sourceArg : dataSource.sourceArg) || null,
				x: bHasX ? entry.x : _qCond(this.axis.x.tf || '', true),
				y: bHasY ? entry.y : _qCond(this.axis.y.tf || '', true),
				z: bHasZ ? entry.z : _qCond(this.axis.z.tf || '', true),
				query: queryJoin([
					Object.hasOwn(entry, 'query') ? entry.query : properties.dataQuery[1],
					bHasTfX || bHasX ? (bHasX ? _qCond(entry.x) : this.axis.x.tf) + ' PRESENT' : '',
					bHasTfZ || bHasZ ? (bHasZ ? _qCond(entry.z) : this.axis.z.tf) + ' PRESENT' : ''
				], 'AND'),
				queryHandle: getSel(),
				bProportional: bHasY ? entry.bProportional : dataOpts.y.bProportional,
				bRemoveDuplicates: Object.hasOwn(entry, 'bRemoveDuplicates') ? entry.bRemoveDuplicates : dataSource.bRemoveDuplicates
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
	charts.some((chart) => chart.mouseWheel(step));
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
	if (properties.bAutoData[1]) { refreshData(plman.PlayingPlaylist, 'on_playback_new_track'); }
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
	if (properties.bAutoData[1]) { refreshData(-1, 'on_playlist_switch'); }
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
	if (properties.bAutoData[1]) { refreshData(-1, 'on_playlists_changed'); }
});

addEventListener('on_playlist_items_added', (idx) => { // eslint-disable-line no-unused-vars
	if (!window.ID) { return; }
	if (properties.bAutoData[1]) { refreshData(idx, 'on_playlist_items_added'); }
});

addEventListener('on_playlist_items_removed', (idx) => { // eslint-disable-line no-unused-vars
	if (!window.ID) { return; }
	if (properties.bAutoData[1]) { refreshData(idx, 'on_playlist_items_removed'); }
});

globProfiler.Print('callbacks');
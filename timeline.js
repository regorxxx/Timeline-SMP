'use strict';
//22/07/24

if (!window.ScriptInfo.PackageId) { window.DefineScript('Timeline', { author: 'regorxxx', version: '1.3.0', features: { drag_n_drop: false, grab_focus: true } }); }

include('helpers\\helpers_xxx.js');
/* global globTags:readable, globQuery:readable, globProfiler:readable */
include('helpers\\helpers_xxx_prototypes_smp.js');
/* global extendGR:readable */
include('main\\statistics\\statistics_xxx.js');
/* global _chart:readable */
include('main\\statistics\\statistics_xxx_menu.js');
/* global createStatisticsMenu:readable */
include('main\\timeline\\timeline_helpers.js');
/* global  _gdiFont:readable, MK_LBUTTON:readable, deepAssign:readable, RGB:readable, isJSON:readable, _scale:readable, isString:readable, isBoolean:readable, globSettings:readable, setProperties:readable, getPropertiesPairs:readable, checkUpdate:readable, overwriteProperties:readable, getDataAsync:readable, _qCond:readable, queryJoin:readable, getData:readable, getPlaylistIndexArray:readable, _t:readable, isArrayEqual:readable */
include('main\\timeline\\timeline_menus.js');
/* global onLbtnUpPoint:readable, onLbtnUpSettings:readable, createBackgroundMenu:readable */
include('main\\window\\window_xxx_background.js');
/* global _background:readable */
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
			dataManipulation: { sort: 'natural|x', group: 3, filter: null, slice: [0, Infinity], distribution: null },
			background: { color: null },
			chroma: { scheme: 'Set1' },
			margin: { left: _scale(20), right: _scale(10), top: _scale(10), bottom: _scale(15) },
			axis: {
				x: { show: true, color: RGB(50, 50, 50), width: _scale(2), ticks: 'auto', labels: true, bAltLabels: true },
				y: { show: false, color: RGB(50, 50, 50), width: _scale(2), ticks: 5, labels: true }
			},
			configuration: { bDynColor: true, bDynColorBW: false }
		}
	)), { func: isJSON }],
	data: ['Data options', JSON.stringify({
		x: { key: 'Date', tf: _qCond(_t(globTags.bpm)) },
		y: { key: 'Tracks', tf: '1' },
		z: { key: 'Artist', tf: _qCond(globTags.artist) }
	}), { func: isJSON }],
	dataQuery: ['Data query', 'ALL', { func: isString }],
	dataSource: ['Data source', JSON.stringify({ sourceType: 'library', sourceArg: null }), { func: isJSON }],
	xEntries: ['Axis X TF entries', JSON.stringify([
		{ x: _t(globTags.date), keyX: 'Date' },
		{ x: '$right($div(' + _t(globTags.date) + ',10)0s,3)', keyX: 'Decade' },
		{ x: _t(globTags.bpm), keyX: 'BPM' },
		{ x: '$mul($div(' + _t(globTags.bpm) + ',10),10)s', keyX: 'BPM (range)' },
		{ x: _t(globTags.rating), keyX: 'Rating' },
		{ name: 'sep' },
		{ x: _t(globTags.camelotKey), keyX: 'Camelot Key' }, // helpers_xxx_global.js
		{ x: _t(globTags.openKey), keyX: 'Open Key' },
		{ name: 'sep' },
		{ x: _t(globTags.mood), keyX: 'Mood' },
		{ x: _t(globTags.genre), keyX: 'Genre' },
		{ x: _t(globTags.style), keyX: 'Style' },
	].map((v) => { return (Object.hasOwn(v, 'name') ? v : { ...v, name: 'By ' + v.keyX }); })), { func: isJSON }],
	yEntries: ['Axis Y TF entries', JSON.stringify([ // Better use queries to filter by 0 and 1...
		{ y: '1', keyY: 'Total Tracks', bProportional: false },
		{ y: globTags.playCount, keyY: 'Listens', bProportional: false },
		{ name: 'sep' },
		{ y: globTags.playCount, keyY: 'Listens/Track', bProportional: true },
		{ y: globTags.isLoved, keyY: 'Loves/Track', bProportional: true }, // requires not to ouput true value
		{ y: globTags.isHated, keyY: 'Hates/Track', bProportional: true },
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
		{ query: 'ALL', name: 'All' },
	]), { func: isJSON }],
	bAsync: ['Data asynchronous calculation', true, { func: isBoolean }],
	bAutoUpdateCheck: ['Automatically check updates?', globSettings.bAutoUpdateCheck, { func: isBoolean }],
	bAutoData: ['Automatically update data sources', true, { func: isBoolean }],
	playingTF: ['Update data on playback by TF', JSON.stringify([
		'PLAY_COUNT',
		'LASTFM_PLAY_COUNT',
		'LAST_PLAYED_ENHANCED',
		'LAST_PLAYED'
	]), { func: isJSON }],
};
Object.keys(properties).forEach(p => properties[p].push(properties[p][1]));
setProperties(properties, '', 0);
properties = getPropertiesPairs(properties, '', 0);

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
	},
});

/*
	Charts
*/
const defaultConfig = deepAssign()(
	JSON.parse(properties.chart[1], (key, value) => {
		return (key === 'slice' && value ? value.map((v) => (v === null ? Infinity : v)) : value);
	}),
	{
		data: [],
		x: 0, y: 0, w: 0, h: 0,
		tooltipText: '\n\n(L. click to create playlist)\n(Use buttons to configure chart)',
		configuration: { bSlicePerKey: true },
		callbacks: {
			point: { onLbtnUp: onLbtnUpPoint },
			settings: { onLbtnUp: function (x, y, mask) { onLbtnUpSettings.call(this).btn_up(x, y); } }, // eslint-disable-line no-unused-vars
			display: { onLbtnUp: function (x, y, mask) { createStatisticsMenu.call(this).btn_up(x, y, ['sep', createBackgroundMenu.call(background, { menuName: 'Background' }, void (0), { nameColors: true })]); } }, // eslint-disable-line no-unused-vars
			config: {
				change: function (config, changeArgs, callbackArgs) {
					if (callbackArgs && callbackArgs.bSaveProperties) {
						['x', 'y', 'w', 'h'].forEach((key) => delete config[key]);
						config.dataManipulation.sort = this.exportSortLabel();
						properties.chart[1] = JSON.stringify(config);
						properties.data[1] = JSON.stringify(this.exportDataLabels());
						overwriteProperties(properties);
					}
				},
				backgroundColor: background.getColors
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
			z: bHasZ ?_qCond(config.axis.z.tf, true) : '',
			query: queryJoin([
				properties.dataQuery[1],
				bHasX ? config.axis.x.tf + ' PRESENT' : '',
				bHasZ ? config.axis.z.tf + ' PRESENT' : ''
			], 'AND'),
			bProportional: config.axis.y.bProportional
		});
	} else {
		config.data = getData({
			option: bHasZ ? 'timeline' : 'tf',
			sourceType: dataSource.sourceType,
			sourceArg: dataSource.sourceArg || null,
			x: bHasX ? _qCond(config.axis.x.tf, true) : '',
			y: bHasY ? _qCond(config.axis.y.tf, true) : '',
			z: bHasZ ?_qCond(config.axis.z.tf, true) : '',
			query: queryJoin([
				properties.dataQuery[1],
				bHasX ? config.axis.x.tf + ' PRESENT' : '',
				bHasZ ? config.axis.z.tf + ' PRESENT' : ''
			], 'AND'),
			bProportional: config.axis.y.bProportional
		});
	}
	if (!bHasZ) { config.graph = { multi: false }; }
}));

/*
	Automatically draw new graphs using table above
*/
const rows = newConfig.length;
const columns = newConfig[0].length;
const nCharts = new Array(rows).fill(1).map(() => { return new Array(columns).fill(1); }).map((row, i) => {
	return row.map((cell, j) => {
		const w = window.Width / columns;
		const h = window.Height / rows * (i + 1);
		const x = w * j;
		const y = window.Height / rows * i;
		const title = window.Name + ' - ' + 'Graph ' + (1 + rows * i + j) + ' {' + newConfig[i][j].axis.x.key + ' - ' + newConfig[i][j].axis.y.key + '}';
		return new _chart({ ...defaultConfig, x, y, w, h }).changeConfig({ ...newConfig[i][j], bPaint: false, title });
	});
});
const charts = nCharts.flat(Infinity);

/*
	Helper to set data
*/
charts.forEach((chart) => {
	chart.setData = function (entry = {}) {
		const bHasX = Object.hasOwn(entry, 'x') && entry.x.length;
		const bHasY = Object.hasOwn(entry, 'y') && entry.y.length;
		const bHasZ = Object.hasOwn(entry, 'z') && entry.z.length;
		const bHasTfX = Object.hasOwn(this.axis.x, 'tf') && this.axis.x.tf.length;
		const bHasTfZ = Object.hasOwn(this.axis.z, 'tf') && this.axis.z.tf.length;
		const dataSource = JSON.parse(properties.dataSource[1]);
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
				bProportional: entry.bProportional
			}),
			axis: {},
		};
		if (bHasX) { newConfig.axis.x = { key: entry.keyX, tf: _qCond(entry.x) }; }
		if (bHasY) { newConfig.axis.y = { key: entry.keyY, tf: _qCond(entry.y), bProportional: entry.bProportional }; }
		if (bHasZ) { newConfig.axis.z = { key: entry.keyZ, tf: _qCond(entry.z) }; }
		if (bHasZ || bHasTfZ) { newConfig.graph = { multi: true }; }
		else { newConfig.graph = { multi: false }; }
		this.changeConfig({ ...newConfig, bPaint: true });
		this.changeConfig({ title: window.Name + ' - ' + 'Graph 1 {' + this.axis.x.key + ' - ' + this.axis.y.key + '}', bPaint: false, callbackArgs: { bSaveProperties: true } });
	};
});
globProfiler.Print('charts');

let playingPlaylist = plman.PlayingPlaylist;
let activePlaylist = plman.ActivePlaylist;
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
					return properties.dataQuery[1].toUpperCase().includes(tag) || ['x', 'y', 'z'].some((axis) => {
						return chart.axis[axis].tf.toUpperCase().includes(tag);
					});
				});
		};
		const updateCharts = (bForce) => {
			let bRefresh = false;
			charts.forEach((chart) => {
				if (!chart.pop.isEnabled() && (bForce || needsUpdateByTf(chart))) {
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
			if ((activePlaylist !== plman.ActivePlaylist || plsIdx === plman.PlayingPlaylist)) {
				bRefresh = updateCharts(true);
			}
		}
		if (callback === 'on_playback_new_track' && bPlaying) {
			if (playingPlaylist !== plman.PlayingPlaylist) {
				bRefresh = updateCharts(true);
			} else if (plsIdx === plman.PlayingPlaylist) {
				bRefresh = updateCharts();
			}
		}
		playingPlaylist = plman.PlayingPlaylist;
		if (callback === 'on_playlist_switch' && bActive) {
			bRefresh = updateCharts(true);
		} else if (bActive && (activePlaylist !== plman.ActivePlaylist || plsIdx === plman.PlayingPlaylist)) {
			bRefresh = updateCharts();
		}
		activePlaylist = plman.ActivePlaylist;
		if (dataSource.sourceType === 'playlist') {
			const idxArr = dataSource.sourceArg.reduce((acc, curr) => acc.concat(getPlaylistIndexArray(curr)), []);
			if (bPlaylistChanged && idxArr.includes(plsIdx)) {
				bRefresh = updateCharts(true);
			} else if (selectedPlaylists !== idxArr.length || idxArr.includes(plsIdx)) {
				bRefresh = updateCharts();
			}
			selectedPlaylists = idxArr.length;
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
			if (chart.inFocus) { chart.scrollX({ x, release: 0x01 /* VK_LBUTTON */, bThrottle: true }); }
		});
	} else {
		charts.some((chart) => { return chart.move(x, y, mask); });
	}
});

addEventListener('on_mouse_leave', () => {
	charts.forEach((chart) => { chart.leave(); });
});

addEventListener('on_mouse_rbtn_up', (x, y, mask) => {
	charts.some((chart) => { return chart.rbtnUp(x, y, mask); });
	return true; // left shift + left windows key will bypass this callback and will open default context menu.
});

addEventListener('on_mouse_lbtn_up', (x, y, mask) => {
	if (!window.ID) { return; }
	charts.some((chart) => { return chart.lbtnUp(x, y, mask); });
});

addEventListener('on_mouse_lbtn_down', (x, y, mask) => {
	if (!window.ID) { return; }
	charts.some((chart) => { return chart.lbtnDown(x, y, mask); });
});

addEventListener('on_mouse_lbtn_dblclk', (x, y, mask) => {
	if (!window.ID) { return; }
	charts.some((chart) => { return chart.lbtnDblClk(x, y, mask); });
});

addEventListener('on_mouse_wheel', (step) => {
	if (!window.ID) { return; }
	charts.some((chart) => { return chart.mouseWheel(step); });
});

addEventListener('on_key_down', (vKey) => {
	if (!window.ID) { return; }
	charts.some((chart) => { return chart.keyDown(vKey); });
});

addEventListener('on_key_up', (vKey) => {
	if (!window.ID) { return; }
	charts.some((chart) => { return chart.keyUp(vKey); });
});

addEventListener('on_playback_new_track', () => { // To show playing now playlist indicator...
	if (background.coverMode.toLowerCase() !== 'none') { background.updateImageBg(); }
	if (!window.ID) { return; }
	if (properties.bAutoData[1]) { refreshData(plman.PlayingPlaylist, 'on_playback_new_track'); }
});

addEventListener('on_selection_changed', () => {
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
});

addEventListener('on_item_focus_change', () => {
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
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
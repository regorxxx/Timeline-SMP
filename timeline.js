'use strict';
//22/11/23

include('main\\statistics\\statistics_xxx.js');
include('main\\statistics\\statistics_xxx_menu.js');
include('main\\timeline\\timeline_helpers.js');
include('main\\timeline\\timeline_menus.js');
include('main\\window\\window_xxx_background.js');
include('main\\window\\window_xxx_background_menu.js');
include('helpers\\helpers_xxx_properties.js');

if (!window.ScriptInfo.PackageId) {window.DefineScript('Timeline', {author:'regorxxx', version: '0.6.0', features: {drag_n_drop: false, grab_focus: true}});}

let properties = {
	background:	['Background options', JSON.stringify(deepAssign()(
		(new _background).defaults(), 
		{colorMode: 'gradient', colorModeOptions: {color: [RGB(270,270,270), RGB(300,300,300)]}, coverMode: 'front'}
	)), {func: isJSON}],
	chart:		['Chart options', JSON.stringify(deepAssign()(
		(new _chart).exportConfig(), 
		{
			graph: {type: 'timeline', multi: true, borderWidth: _scale(1), pointAlpha: Math.round(60 * 255 / 100)},
			dataManipulation: {sort: 'natural|x', group: 3, filter: null, slice: [0, Infinity], distribution: null},
			background: {color: null},
			chroma: {scheme: 'Set1'},
			margin: {left: _scale(20), right: _scale(10), top: _scale(10), bottom: _scale(15)},
			axis: {
				x: {show: true, color: RGB(50,50,50), width: _scale(2), ticks: 'auto', labels: true, bAltLabels: true}, 
				y: {show: false, color: RGB(50,50,50), width: _scale(2), ticks: 5, labels: true}
			},
			configuration : {bDynColor: true, bDynColorBW: false}
		}
	)), {func: isJSON}],
	data:		['Data options', JSON.stringify({
		x: {key: 'Date',	tf: '"$year(%DATE%)"'}, 
		y: {key: 'Tracks',	tf: '1'},
		z: {key: 'Artist',	tf: '%ALBUM ARTIST%'}
	}), {func: isJSON}],
	dataQuery:	['Data query', 'ALL', {func: isString}],
	xEntries:	['Axis X TF entries', JSON.stringify([
		{x: '$year(%DATE%)',						keyX: 'Date'},
		{x: '$right($div($year(%DATE%),10)0s,3)',	keyX: 'Decade'},
		{x: '%BPM%',								keyX: 'BPM'},
		{x: '%RATING%',								keyX: 'Rating'},
		{name: 'sep'},
		{x: globTags.camelotKey,					keyX: 'Camelot Key'}, // helpers_xxx_global.js
		{x: globTags.openKey,						keyX: 'Open Key'},
		{name: 'sep'},
		{x: '%MOOD%',								keyX: 'Mood'},
		{x: '%GENRE%',								keyX: 'Genre'},
		{x: '%STYLE%',								keyX: 'Style'},
	].map((v) => {return (v.hasOwnProperty('name') ? v : {...v, name: 'By ' + v.keyX});})), {func: isJSON}],
	yEntries:	['Axis Y TF entries', JSON.stringify([ // Better use queries to filter by 0 and 1...
		{y: '1',									keyY: 'Total Tracks',	bProportional: false},
		{y: '%PLAY_COUNT%',							keyY: 'Listens',		bProportional: false},
		{name: 'sep'},
		{y: '%PLAY_COUNT%',							keyY: 'Listens/Track',	bProportional: true},
		{y: '$ifequal(%FEEDBACK%,1,1$not(0),0)',	keyY: 'Loves/Track',	bProportional: true}, // requires not to ouput true value
		{y: '$ifequal(%FEEDBACK%,-1,1$not(0),0)',	keyY: 'Hates/Track',	bProportional: true},
		{y: '$ifequal(%RATING%,5,1$not(0),0)',		keyY: 'Rated 5/Track',	bProportional: true},
	].map((v) => {return (v.hasOwnProperty('name') ? v : {...v, name: 'By ' + v.keyY});})), {func: isJSON}],
	zEntries:	['Axis Z TF entries', JSON.stringify([
		{z: '%ALBUM ARTIST%',						keyZ: 'Artist'},
		{z: '%COMPOSER%',							keyZ: 'Composer'},
		{z: '%MOOD%',								keyZ: 'Mood'},
		{z: '%GENRE%',								keyZ: 'Genre'},
		{z: '%STYLE%',								keyZ: 'Style'},
		{z: '%RATING%',								keyZ: 'Rating'},
	].map((v) => {return (v.hasOwnProperty('name') ? v : {...v, name: 'By ' + v.keyZ});})), {func: isJSON}],
	queryEntries:	['Query entries', JSON.stringify([
		{query: '%LAST_PLAYED% DURING LAST 4 WEEKS',	name: 'Played this month'},
		{query: '%RATING% EQUAL 5',						name: 'Rated 5 tracks'},
		{query: '%FEEDBACK% IS 1',						name: 'Loved tracks'},
		{query: '%FEEDBACK% IS -1',						name: 'Hated tracks'},
		{name: 'sep'},
		{query: 'ALL',									name: 'All'},
	]), {func: isJSON}],
	bAsync: 	['Data asynchronous calculation', true, {func: isBoolean}],
	bAutoUpdateCheck: ['Automatically check updates?', globSettings.bAutoUpdateCheck, {func: isBoolean}],
};
Object.keys(properties).forEach(p => properties[p].push(properties[p][1]));
setProperties(properties, '', 0);
properties = getPropertiesPairs(properties, '', 0);

// Update check
if (properties.bAutoUpdateCheck[1]) {
	include('helpers\\helpers_xxx_web_update.js');
	setTimeout(checkUpdate, 120000, {bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb});
}

/* 
	Panel background
*/
const background = new _background({
	...JSON.parse(properties.background[1]),
	callbacks: {
		change: function(config, changeArgs, callbackArgs) {
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
		configuration: {bSlicePerKey: true},
		callbacks: {
			point:		{onLbtnUp: onLbtnUpPoint},
			settings:	{onLbtnUp: function(x, y, mask) {onLbtnUpSettings.call(this).btn_up(x, y);}},
			display:	{onLbtnUp: function(x, y, mask) {createStatisticsMenu.call(this).btn_up(x, y, ['sep', createBackgroundMenu.call(background, 'Background')]);}},
			config:		{
				change:   function(config, changeArgs, callbackArgs) {
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
		buttons: {xScroll: true, settings: true, display: true, zoom: true},
		gFont: _gdiFont('Segoe UI', _scale(12))
	}
);

const newConfig = [
	[ // Row
		{
			axis: JSON.parse(properties.data[1])
		},
	]
];
newConfig.forEach((row) => row.forEach((config) => {
	if (properties.bAsync[1]) {
		config.dataAsync = () => getDataAsync(
			'timeline',
			_qCond(config.axis.x.tf, true),
			query_join([properties.dataQuery[1], config.axis.x.tf + ' PRESENT AND ' + config.axis.z.tf + ' PRESENT'], 'AND'),
			_qCond(config.axis.z.tf, true),
			_qCond(config.axis.y.tf, true),
			config.axis.y.bProportional
		);
	} else {
		config.data = getData(
			'timeline',
			_qCond(config.axis.x.tf, true),
			query_join([properties.dataQuery[1], config.axis.x.tf + ' PRESENT AND ' + config.axis.z.tf + ' PRESENT'], 'AND'),
			_qCond(config.axis.z.tf, true),
			_qCond(config.axis.y.tf, true),
			config.axis.y.bProportional
		);
	}
}));

/* 
	Automatically draw new graphs using table above
*/
const rows = newConfig.length;
const columns = newConfig[0].length;
const nCharts = new Array(rows).fill(1).map((row) => {return new Array(columns).fill(1);}).map((row, i) => {
	return row.map((cell, j) => {
		const w = window.Width / columns;
		const h = window.Height / rows * (i + 1);
		const x = w * j;
		const y = window.Height / rows * i;
		const title = window.Name + ' - ' + 'Graph ' + (1 + rows * i + j) + ' {' + newConfig[i][j].axis.x.key + ' - ' + newConfig[i][j].axis.y.key + '}';
		return new _chart({...defaultConfig, x, y, w, h}).changeConfig({...newConfig[i][j], bPaint: false, title});
	});
});
const charts = nCharts.flat(Infinity);

/* 
	Callbacks
*/
addEventListener('on_paint', (gr) => { 
	if (!window.ID) {return;}
	if (!window.Width || !window.Height) {return;}
	background.paint(gr);
	charts.forEach((chart) => {chart.paint(gr);});
});

addEventListener('on_size', () => {
	if (!window.ID) {return;}
	if (!window.Width || !window.Height) {return;}
	background.resize({w: window.Width, h: window.Height, bPaint: false});
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < columns; j++) {
			const w = window.Width / columns;
			const h = window.Height / rows * (i + 1);
			const x = w * j;
			const y = window.Height / rows * i;
			nCharts[i][j].changeConfig({x, y, w, h, bPaint: false});
		}
	}
	window.Repaint();
});

addEventListener('on_mouse_move', (x, y, mask) => {
	if (!window.ID) {return;}
	if (mask === MK_LBUTTON) {
		charts.forEach((chart) => {
			if (chart.inFocus) {chart.scrollX({x, release: 0x01 /* VK_LBUTTON */, bThrottle: true});}
		});
	} else {
		const bFound = charts.some((chart) => {return chart.move(x, y, mask);});
	}
});

addEventListener('on_mouse_leave', () => {
	charts.forEach((chart) => {chart.leave();});
});

addEventListener('on_mouse_rbtn_up', (x, y, mask) => {
	charts.some((chart) => {return chart.rbtnUp(x,y, mask);});
	return true; // left shift + left windows key will bypass this callback and will open default context menu.
});

addEventListener('on_mouse_lbtn_up', (x, y, mask) => {
	if (!window.ID) {return;}
	charts.some((chart) => {return chart.lbtnUp(x, y, mask);});
});

addEventListener('on_mouse_lbtn_down', (x, y, mask) => {
	if (!window.ID) {return;}
	charts.some((chart) => {return chart.lbtnDown(x, y, mask);});
});

addEventListener('on_mouse_lbtn_dblclk', (x, y, mask) => {
	if (!window.ID) {return;}
	charts.some((chart) => {return chart.lbtnDblClk(x, y, mask);});
});

addEventListener('on_mouse_wheel', (step) => {
	if (!window.ID) {return;}
	charts.some((chart) => {return chart.mouseWheel(step);});
});

addEventListener('on_key_down', (vKey) => {
	if (!window.ID) {return;}
	charts.some((chart) => {return chart.keyDown(vKey);});
});

addEventListener('on_key_up', (vKey) => {
	if (!window.ID) {return;}
	charts.some((chart) => {return chart.keyUp(vKey);});
});

addEventListener('on_playback_new_track', () => { // To show playing now playlist indicator...
	if (background.coverMode.toLowerCase() !== 'none') {background.updateImageBg();}
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
});

addEventListener('on_playback_stop', (reason) => {
	if (reason !== 2) { // Invoked by user or Starting another track
		if (background.coverMode.toLowerCase() !== 'none' && background.coverModeOptions.bNowPlaying) {background.updateImageBg();}
	}
});

addEventListener('on_playlists_changed', () => { // To show/hide loaded playlist indicators...
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
});
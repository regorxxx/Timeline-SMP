﻿'use strict';
//11/03/25

/* exported getDataAsync, getData */

/* global _jsonParseFileCheck:readable, folders:readable, utf8:readable, topTracksFromDate:readable, _bt:readable, _scale:readable, Chroma:readable, RGB:readable, grid:readable, _menu:readable, _chart:readable, createStatisticsMenuV2:readable, defaultConfig:readable */

async function getDataAsync(option = 'TF', tf = 'GENRE') {
	let data;
	switch (option.toLowerCase()) {
		case 'world map': {
			const file = '.\\profile\\' + folders.dataName + 'worldMap_library.json'; // TODO Expose paths at properties
			const libraryPoints = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => { return { x: point.id, y: point.val }; });
			data = [libraryPoints];
			break;
		}
		case 'tf': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = (await fb.TitleFormat(_bt(tf)).EvalWithMetadbsAsync(handleList)).map((val) => { return val.split(','); }).flat(Infinity);
			const tagCount = new Map();
			libraryTags.forEach((tag) => {
				if (!tagCount.has(tag)) { tagCount.set(tag, 1); }
				else { tagCount.set(tag, tagCount.get(tag) + 1); }
			});
			data = [Array.from(tagCount, (point) => { return { x: point[0], y: point[1] }; })];
			break;
		}
		case 'most played': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = await fb.TitleFormat(_bt(tf)).EvalWithMetadbsAsync(handleList);
			const playCount = await fb.TitleFormat('$max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%,0)').EvalWithMetadbsAsync(handleList);
			const tagCount = new Map();
			libraryTags.forEach((tag, i) => {
				if (!tagCount.has(tag)) { tagCount.set(tag, Number(playCount[i])); }
				else { tagCount.set(tag, tagCount.get(tag) + Number(playCount[i])); }
			});
			data = [Array.from(tagCount, (point) => { return { x: point[0], y: point[1] }; })];
			break;
		}
		case 'most played proportional': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = await fb.TitleFormat(_bt(tf)).EvalWithMetadbsAsync(handleList);
			const playCount = await fb.TitleFormat('$max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%,0)').EvalWithMetadbsAsync(handleList);
			const tagCount = new Map();
			const keyCount = new Map();
			libraryTags.forEach((tag, i) => {
				if (!tagCount.has(tag)) { tagCount.set(tag, Number(playCount[i])); }
				else { tagCount.set(tag, tagCount.get(tag) + Number(playCount[i])); }
				if (!keyCount.has(tag)) { keyCount.set(tag, 1); }
				else { keyCount.set(tag, keyCount.get(tag) + 1); }
			});
			keyCount.forEach((value, key) => {
				if (tagCount.has(key)) { tagCount.set(key, Math.round(tagCount.get(key) / keyCount.get(key))); }
			});
			data = [Array.from(tagCount, (point) => { return { x: point[0], y: point[1] }; })];
			break;
		}
		case 'most played from date': {
			const [handleList, handleListData] = topTracksFromDate({ playlistLength: Infinity, year: new Date().getFullYear() - 1, bUseLast: false, bSendToPls: false });
			const libraryTags = (await fb.TitleFormat(_bt(tf)).EvalWithMetadbsAsync(handleList)).map((val) => { return val.split(', '); });
			const playCount = handleListData.map((track) => { return track.playCount; });
			const tagCount = new Map();
			libraryTags.forEach((tagArr, i) => {
				tagArr.forEach((tag) => {
					if (!tagCount.has(tag)) { tagCount.set(tag, Number(playCount[i])); }
					else { tagCount.set(tag, tagCount.get(tag) + Number(playCount[i])); }
				});
			});
			data = [Array.from(tagCount, (point) => { return { x: point[0], y: point[1] }; })];
			break;
		}
	}
	return data;
}

function getData(option = 'TF', tf = 'GENRE') {
	let data;
	switch (option.toLowerCase()) {
		case 'world map': {
			const file = '.\\profile\\' + folders.dataName + 'worldMap_library.json'; // TODO Expose paths at properties
			const libraryPoints = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => { return { x: point.id, y: point.val }; });
			data = [libraryPoints];
			break;
		}
		case 'tf': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList).map((val) => { return val.split(','); }).flat(Infinity);
			const tagCount = new Map();
			libraryTags.forEach((tag) => {
				if (!tagCount.has(tag)) { tagCount.set(tag, 1); }
				else { tagCount.set(tag, tagCount.get(tag) + 1); }
			});
			data = [Array.from(tagCount, (point) => { return { x: point[0], y: point[1] }; })];
			break;
		}
		case 'most played': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList);
			const playCount = fb.TitleFormat('$max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%,0)').EvalWithMetadbs(handleList);
			const tagCount = new Map();
			libraryTags.forEach((tag, i) => {
				if (!tagCount.has(tag)) { tagCount.set(tag, Number(playCount[i])); }
				else { tagCount.set(tag, tagCount.get(tag) + Number(playCount[i])); }
			});
			data = [Array.from(tagCount, (point) => { return { x: point[0], y: point[1] }; })];
			break;
		}
		case 'most played proportional': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList);
			const playCount = fb.TitleFormat('$max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%,0)').EvalWithMetadbs(handleList);
			const tagCount = new Map();
			const keyCount = new Map();
			libraryTags.forEach((tag, i) => {
				if (!tagCount.has(tag)) { tagCount.set(tag, Number(playCount[i])); }
				else { tagCount.set(tag, tagCount.get(tag) + Number(playCount[i])); }
				if (!keyCount.has(tag)) { keyCount.set(tag, 1); }
				else { keyCount.set(tag, keyCount.get(tag) + 1); }
			});
			keyCount.forEach((value, key) => {
				if (tagCount.has(key)) { tagCount.set(key, Math.round(tagCount.get(key) / keyCount.get(key))); }
			});
			data = [Array.from(tagCount, (point) => { return { x: point[0], y: point[1] }; })];
			break;
		}
		case 'most played from date': {
			const [handleList, handleListData] = topTracksFromDate({ playlistLength: Infinity, year: new Date().getFullYear() - 1, bUseLast: false, bSendToPls: false });
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList).map((val) => { return val.split(', '); });
			const playCount = handleListData.map((track) => { return track.playCount; });
			const tagCount = new Map();
			libraryTags.forEach((tagArr, i) => {
				tagArr.forEach((tag) => {
					if (!tagCount.has(tag)) { tagCount.set(tag, Number(playCount[i])); }
					else { tagCount.set(tag, tagCount.get(tag) + Number(playCount[i])); }
				});
			});
			data = [Array.from(tagCount, (point) => { return { x: point[0], y: point[1] }; })];
			break;
		}
	}
	return data;
}

const colors = Chroma.scale('YlGnBu').colors(8, 'rgb').reverse().map((arr) => { return RGB(...arr); });

const newConfig = [
	[ // Row
		{
			colors: [colors[0]],
			chroma: { scheme: 'random' },
			dataAsync: () => getDataAsync('TF', 'GENRE'),
			graph: { type: 'bars', borderWidth: _scale(1) },
			axis: {
				x: { key: 'genre' },
				y: { key: 'tracks' }
			}
		},
		{
			colors: [colors[1]],
			chroma: { scheme: 'OrRd' },
			dataAsync: () => getDataAsync('most played', 'ARTIST'),
			graph: { type: 'bars', borderWidth: _scale(1) },
			axis: {
				x: { key: 'artist' },
				y: { key: 'plays' }
			}
		}
	],
	[ // Row
		{
			colors: [colors[2]],
			chroma: { scheme: 'OrRd' },
			dataAsync: () => getDataAsync('most played from date', 'ARTIST'),
			graph: { type: 'bars', borderWidth: _scale(1) },
			axis: {
				x: { key: 'artist' },
				y: { key: 'plays' }
			}
		},
		{
			colors: [colors[3]],
			chroma: { scheme: ['yellow', 'green'] },
			dataAsync: () => getDataAsync('most played from date', 'GENRE'),
			graph: { type: 'bars', borderWidth: _scale(1) },
			axis: {
				x: { key: 'genre' },
				y: { key: 'plays' }
			}
		}
	]
];

grid.rows = newConfig.length;
grid.columns = newConfig[0].length;
grid.cells = Array.from({length: grid.rows}, (row, i) => {
	return Array.from({length: grid.columns}, (cell, j) => {
		const w = window.Width / grid.columns;
		const h = window.Height / grid.rows * (i + 1);
		const x = w * j;
		const y = window.Height / grid.rows * i;
		const title = window.Name + ' - ' + 'Graph ' + (1 + grid.rows * i + j) + ' {' + newConfig[i][j].axis.x.key + ' - ' + newConfig[i][j].axis.y.key + '}';
		return { column: j, row: i, val: new _chart({ ...defaultConfig, x, y, w, h }).changeConfig({ ...newConfig[i][j], bPaint: false, title }) };
	});
}).flat(Infinity);
grid.forEach((chart) => { _menu.attachInstance({ parent: chart, rMenu: createStatisticsMenuV2.bind(chart), popup: chart.pop }); }); // Binds the generic right click menu to every chart
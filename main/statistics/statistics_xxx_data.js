'use strict';
//25/11/22

async function getDataAsync(option = 'TF', tf = 'GENRE') {
	let data;
	switch (option.toLowerCase()) {
		case 'world map': {
			const file = (_isFile(fb.FoobarPath + 'portable_mode_enabled') ? '.\\profile\\' + folders.dataName : folders.data) + 'worldMap_library.json';
			const libraryPoints = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => {return {x: point.id, y: point.val};});
			data = [libraryPoints];
			break;
		}
		case 'tf': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = (await fb.TitleFormat(_bt(tf)).EvalWithMetadbsAsync(handleList)).map((val) => {return val.split(',')}).flat(Infinity);
			const tagCount = new Map();
			libraryTags.forEach((tag) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, 1);}
				else {tagCount.set(tag, tagCount.get(tag) + 1);}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'most played': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = await fb.TitleFormat(_bt(tf)).EvalWithMetadbsAsync(handleList);
			const playCount = await fb.TitleFormat('$max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%)').EvalWithMetadbsAsync(handleList);
			const tagCount = new Map();
			libraryTags.forEach((tag, i) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, Number(playCount[i]));}
				else {tagCount.set(tag, tagCount.get(tag) + Number(playCount[i]));}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'most played proportional': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = await fb.TitleFormat(_bt(tf)).EvalWithMetadbsAsync(handleList);
			const playCount = await fb.TitleFormat('$max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%)').EvalWithMetadbsAsync(handleList);
			const tagCount = new Map();
			const keyCount = new Map();
			libraryTags.forEach((tag, i) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, Number(playCount[i]));}
				else {tagCount.set(tag, tagCount.get(tag) + Number(playCount[i]));}
				if (!keyCount.has(tag)) {keyCount.set(tag, 1);}
				else {keyCount.set(tag, keyCount.get(tag) + 1);}
			});
			keyCount.forEach((value, key) => {
				if (tagCount.has(key)) {tagCount.set(key, Math.round(tagCount.get(key) / keyCount.get(key)));}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'most played from date': {
			const [handleList, handleListData] = topTracksFromDate({playlistLength: Infinity, year: new Date().getFullYear() - 1, bUseLast: false, bSendToPls: false});
			const libraryTags = (await fb.TitleFormat(_bt(tf)).EvalWithMetadbsAsync(handleList)).map((val) => {return val.split(', ')});
			const playCount = handleListData.map((track) => {return track.playCount;});;
			const tagCount = new Map();
			libraryTags.forEach((tagArr, i) => {
				tagArr.forEach((tag) => {
					if (!tagCount.has(tag)) {tagCount.set(tag, Number(playCount[i]));}
					else {tagCount.set(tag, tagCount.get(tag) + Number(playCount[i]));}
				});
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
	}
	return data;
}

function getData(option = 'TF', tf = 'GENRE') {
	let data;
	switch (option.toLowerCase()) {
		case 'world map': {
			const file = (_isFile(fb.FoobarPath + 'portable_mode_enabled') ? '.\\profile\\' + folders.dataName : folders.data) + 'worldMap_library.json';
			const libraryPoints = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => {return {x: point.id, y: point.val};});
			data = [libraryPoints];
			break;
		}
		case 'tf': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList).map((val) => {return val.split(',')}).flat(Infinity);
			const tagCount = new Map();
			libraryTags.forEach((tag) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, 1);}
				else {tagCount.set(tag, tagCount.get(tag) + 1);}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'most played': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList);
			const playCount = fb.TitleFormat('$max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%)').EvalWithMetadbs(handleList);
			const tagCount = new Map();
			libraryTags.forEach((tag, i) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, Number(playCount[i]));}
				else {tagCount.set(tag, tagCount.get(tag) + Number(playCount[i]));}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'most played proportional': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList);
			const playCount = fb.TitleFormat('$max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%)').EvalWithMetadbs(handleList);
			const tagCount = new Map();
			const keyCount = new Map();
			libraryTags.forEach((tag, i) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, Number(playCount[i]));}
				else {tagCount.set(tag, tagCount.get(tag) + Number(playCount[i]));}
				if (!keyCount.has(tag)) {keyCount.set(tag, 1);}
				else {keyCount.set(tag, keyCount.get(tag) + 1);}
			});
			keyCount.forEach((value, key) => {
				if (tagCount.has(key)) {tagCount.set(key, Math.round(tagCount.get(key) / keyCount.get(key)));}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'most played from date': {
			const [handleList, handleListData] = topTracksFromDate({playlistLength: Infinity, year: new Date().getFullYear() - 1, bUseLast: false, bSendToPls: false});
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList).map((val) => {return val.split(', ')});
			const playCount = handleListData.map((track) => {return track.playCount;});;
			const tagCount = new Map();
			libraryTags.forEach((tagArr, i) => {
				tagArr.forEach((tag) => {
					if (!tagCount.has(tag)) {tagCount.set(tag, Number(playCount[i]));}
					else {tagCount.set(tag, tagCount.get(tag) + Number(playCount[i]));}
				});
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
	}
	return data;
}

const newConfig = [
	[ // Row
		{
			colors: [colors[0]],
			chroma: {scheme: 'random'},
			dataAsync: () => getDataAsync('TF', 'GENRE'),
			graph: {type: 'bars', borderWidth: _scale(1)},
			axis: {
				x: {key: 'genre'}, 
				y: {key: 'tracks'}
			}
		},
		{
			colors: [colors[1]],
			chroma: {scheme: 'OrRd'},
			dataAsync: () => getDataAsync('most played', 'ARTIST'),
			graph: {type: 'bars', borderWidth: _scale(1)},
			axis: {
				x: {key: 'artist'}, 
				y: {key: 'plays'}
			}
		}
	],
	[ // Row
		{
			colors: [colors[2]],
			chroma: {scheme: 'OrRd'},
			dataAsync: () => getDataAsync('most played from date', 'ARTIST'),
			graph: {type: 'bars', borderWidth: _scale(1)},
			axis: {
				x: {key: 'artist'}, 
				y: {key: 'plays'}
			}
		},
		{
			colors: [colors[3]],
			chroma: {scheme: ['yellow', 'green']},
			dataAsync: () => getDataAsync('most played from date', 'GENRE'),
			graph: {type: 'bars', borderWidth: _scale(1)},
			axis: {
				x: {key: 'genre'}, 
				y: {key: 'plays'}
			}
		}
	]
];

grid.rows = newConfig.length;
grid.columns = newConfig[0].length;
grid.cells = new Array(grid.rows).fill(1).map((row) => {return new Array(grid.columns).fill(1);}).map((row, i) => {
		return row.map((cell, j) => {
			const w = window.Width / grid.columns;
			const h = window.Height / grid.rows * (i + 1);
			const x = w * j;
			const y = window.Height / grid.rows * i;
			const title = window.Name + ' - ' + 'Graph ' + (1 + grid.rows * i + j) + ' {' + newConfig[i][j].axis.x.key + ' - ' + newConfig[i][j].axis.y.key + '}';
			return {column: j, row: i, val: new _chart({...defaultConfig, x, y, w, h}).changeConfig({...newConfig[i][j], bPaint: false, title})};
		});
	}).flat(Infinity);
grid.forEach((chart) => {_attachedMenu.call(chart, {rMenu: createStatisticsMenuV2.bind(chart), popup: chart.pop});}); // Binds the generic right click menu to every chart
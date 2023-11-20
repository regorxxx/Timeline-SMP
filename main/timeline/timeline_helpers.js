'use strict';
//20/11/23

include('..\\..\\helpers\\helpers_xxx_tags.js');
include('..\\..\\helpers\\helpers_xxx_playlists.js');
include('..\\filter_and_query\\remove_duplicates.js');

/* 
	Data to feed the charts:
	This may be arbitrary data in a single series, with each point having x,y,z properties.
	[	
		[
			[{x1, y11, z11}, ...],
			[{x2, y21, z21}, ...],
			...
		]
	]
	Data is then automatically manipulated into different series:
	[
		[
			{x1, y11, z11}, {x2, y21, z21}, ...
		],
		[
			{x1, y12, z12}, {x2, y22, z22}, ...
		],
		[
			...
		]
	]
	
	In this example a timeline is shown..
*/
function getData(option = 'tf', tf = 'genre', query = 'ALL', arg = null, counter = 1, bProportional = false) {
	let data;
	switch (option) {
		case 'timeline': { // 3D {x, y, z}, x and z can be exchanged
			const handleList = query.length && query !== 'ALL' ? fb.GetQueryItems(fb.GetLibraryItems(), query) : fb.GetLibraryItems();
			const xTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList).map((val) => {return val.split(',')}); // X
			const serieTags = fb.TitleFormat(_bt(arg)).EvalWithMetadbs(handleList).map((val) => {return val.split(',')}); // Z
			const bSingleY = !isNaN(counter);
			const serieCounters = bSingleY ? Number(counter) : fb.TitleFormat(_bt(queryReplaceWithCurrent(counter))).EvalWithMetadbs(handleList); // Y
			const dic = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((x) => {
					if (!dic.has(x)) {dic.set(x, {});}
					const val = dic.get(x);
					serieTags[i].forEach((serie, j) => {
						const count = bSingleY ? serieCounters : serieCounters[i];
						if (val.hasOwnProperty(serie)) {
							if (count) {val[serie].count += count;}
							val[serie].total++;
						} else {
							val[serie] = {count, total: 1};
						}
					});
					dic.set(x, val);
				});
			});
			dic.forEach((value, key, map) => {
				map.set(key, Object.entries(value).map((pair) => {return {key: pair[0], ...pair[1] /* count, total */};};}).sort((a, b) => {return b.count - a.count;}));
			})
			data = [[...dic].map((points) => points[1].map((point) => {return {x: points[0], y: (bProportional ? point.count / point.total : point.count), z: point.key};}))];
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
			const playCount = fb.TitleFormat('%play_count%').EvalWithMetadbs(handleList);
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
			const playCount = fb.TitleFormat('%play_count%').EvalWithMetadbs(handleList);
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
	}
	return data;
}

async function getDataAsync(option = 'tf', tf = 'genre', query = 'ALL', arg, counter = 1, bProportional = false) {
	let data;
	switch (option) {
		case 'timeline': { // 3D {x, y, z}, x and z can be exchanged
			const handleList = query.length && query !== 'ALL' ? fb.GetQueryItems(fb.GetLibraryItems(), query) : fb.GetLibraryItems();
			const xTags = (await fb.TitleFormat(_bt(tf)).EvalWithMetadbsAsync(handleList))
				.map((val) => {return val.split(',')}); // Y
			const serieTags = (await fb.TitleFormat(_bt(arg)).EvalWithMetadbsAsync(handleList))
				.map((val) => {return val.split(',')}); //Z
			const bSingleY = !isNaN(counter);
			const serieCounters = bSingleY ? Number(counter) : (await fb.TitleFormat(_bt(queryReplaceWithCurrent(counter))).EvalWithMetadbsAsync(handleList))
				.map((val) => {return val ? Number(val) : 0}); // Y
			const dic = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((x) => {
					if (!dic.has(x)) {dic.set(x, {});}
					const val = dic.get(x);
					serieTags[i].forEach((serie, j) => {
						const count = bSingleY ? serieCounters : serieCounters[i];
						if (val.hasOwnProperty(serie)) {
							if (count) {val[serie].count += count;}
							val[serie].total++;
						} else {
							val[serie] = {count, total: 1};
						}
					});
					dic.set(x, val);
				});
			});
			dic.forEach((value, key, map) => {
				map.set(key, Object.entries(value).map((pair) => {return {key: pair[0], ...pair[1] /* count, total */};}).sort((a, b) => {return b.count - a.count;}));
			});
			data = [[...dic].map((points) => points[1].map((point) => {return {x: points[0], y: (bProportional ? point.count / point.total : point.count), z: point.key};}))];
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
			const playCount = await fb.TitleFormat('%PLAY_COUNT%').EvalWithMetadbsAsync(handleList);
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
			const playCount = await fb.TitleFormat('%PLAY_COUNT%').EvalWithMetadbsAsync(handleList);
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
	}
	return data;
}
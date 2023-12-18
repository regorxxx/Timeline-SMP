'use strict';
//18/12/23

/* exported getData, getDataAsync */

/* global globQuery:readable */
include('..\\..\\helpers\\helpers_xxx_prototypes.js');
/* global _t:readable, _bt:readable, globTags:readable */
include('..\\..\\helpers\\helpers_xxx_tags.js');
/* global queryReplaceWithCurrent:readable */
include('..\\..\\helpers\\helpers_xxx_playlists.js');
/* global getHandleFromUIPlaylists:readable */
include('..\\filter_and_query\\remove_duplicates.js');
/* global removeDuplicatesV2:readable */

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
function getData({
	option = 'tf',
	x = 'genre', y = 1, z = 'artist',
	query = 'ALL', sourceType = 'library', sourceArg = null,
	bProportional = false,
	bRemoveDuplicates = true
} = {}) {
	const noSplitTags = new Set(['ALBUM']); noSplitTags.forEach((tag) => noSplitTags.add(_t(tag)));
	const source = filterSource(query, getSource(sourceType, sourceArg));
	const handleList = bRemoveDuplicates ? deduplicateSource(source) : source;
	let data;
	switch (option) {
		case 'timeline': { // 3D {x, y, z}, x and z can be exchanged
			const xTags = noSplitTags.has(x.toUpperCase())
				? fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => val.split(',')); // X
			const serieTags = noSplitTags.has(z.toUpperCase())
				? fb.TitleFormat(_bt(z)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(z)).EvalWithMetadbs(handleList).map((val) => val.split(',')); // Z
			const bSingleY = !isNaN(y);
			const serieCounters = bSingleY
				? Number(y)
				: fb.TitleFormat(_bt(queryReplaceWithCurrent(y))).EvalWithMetadbs(handleList).map((val) => {return val ? Number(val) : 0;}); // Y
			const dic = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((x) => {
					if (!dic.has(x)) {dic.set(x, {});}
					const val = dic.get(x);
					serieTags[i].forEach((serie) => {
						const count = bSingleY ? serieCounters : serieCounters[i];
						if (Object.prototype.hasOwnProperty.call(val, serie)) {
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
			const libraryTags = fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => {return val.split(',');}).flat(Infinity);
			const tagCount = new Map();
			libraryTags.forEach((tag) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, 1);}
				else {tagCount.set(tag, tagCount.get(tag) + 1);}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'most played': {
			const libraryTags = fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList);
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
			const libraryTags = fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList);
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

async function getDataAsync({
	option = 'tf',
	x = 'genre', y = 1, z = 'artist',
	query = 'ALL', sourceType = 'library', sourceArg = null,
	bProportional = false,
	bRemoveDuplicates = true
} = {}) {
	const noSplitTags = new Set(['ALBUM']); noSplitTags.forEach((tag) => noSplitTags.add(_t(tag)));
	const source = filterSource(query, getSource(sourceType, sourceArg));
	const handleList = bRemoveDuplicates ? deduplicateSource(source) : source;
	let data;
	switch (option) {
		case 'timeline': { // 3D {x, y, z}, x and z can be exchanged
			const xTags = noSplitTags.has(x.toUpperCase())
				? (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(',')); // X
			const serieTags = noSplitTags.has(z.toUpperCase())
				? (await fb.TitleFormat(_bt(z)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(z)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(',')); //Z
			const bSingleY = !isNaN(y);
			const serieCounters = bSingleY
				? Number(y)
				: (await fb.TitleFormat(_bt(queryReplaceWithCurrent(y))).EvalWithMetadbsAsync(handleList)).map((val) => {return val ? Number(val) : 0;}); // Y
			const dic = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((x) => {
					if (!dic.has(x)) {dic.set(x, {});}
					const val = dic.get(x);
					serieTags[i].forEach((serie) => {
						const count = bSingleY ? serieCounters : serieCounters[i];
						if (Object.prototype.hasOwnProperty.call(val, serie)) {
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
			const libraryTags = (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => {return val.split(',');}).flat(Infinity);
			const tagCount = new Map();
			libraryTags.forEach((tag) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, 1);}
				else {tagCount.set(tag, tagCount.get(tag) + 1);}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'most played': {
			const libraryTags = await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList);
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
			const libraryTags = await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList);
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

function getSource(type, arg) {
	switch (type) {
		case 'playlist':		return getHandleFromUIPlaylists(arg, false); // [playlist names]
		case 'playingPlaylist':	return (plman.PlayingPlaylist !== -1 && fb.IsPlaying ? plman.GetPlaylistItems(plman.PlayingPlaylist) : getSource('activePlaylist'));
		case 'activePlaylist':	return (plman.ActivePlaylist !== -1 ? plman.GetPlaylistItems(plman.ActivePlaylist) : new FbMetadbHandleList());
		case 'library':
		default:				return fb.GetLibraryItems();
	}
}

function filterSource(query, source) {
	return (query.length && query !== 'ALL' ? fb.GetQueryItems(source, query) : source);
}

function deduplicateSource(source) {
	return removeDuplicatesV2({handleList: source, checkKeys: globTags.remDupl, sortBias: globQuery.remDuplBias, bPreserveSort: true, bAdvTitle: true});
}
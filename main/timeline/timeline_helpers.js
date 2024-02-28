'use strict';
//27/02/24

/* exported getData, getDataAsync */

/* global globQuery:readable, globTags:readable, */
include('..\\..\\helpers\\helpers_xxx_prototypes.js');
/* global _t:readable, _bt:readable */
include('..\\..\\helpers\\helpers_xxx_tags.js');
/* global queryReplaceWithCurrent:readable */
include('..\\..\\helpers\\helpers_xxx_file.js');
/* global _isFile:readable, folders:readable, _jsonParseFileCheck:readable, utf8:readable */
include('..\\..\\helpers\\helpers_xxx_playlists.js');
/* global getHandlesFromUIPlaylists:readable */
include('..\\filter_and_query\\remove_duplicates.js');
/* global removeDuplicatesV2:readable */
include('..\\search\\top_tracks_from_date.js');
/* global getPlayCount:readable, getSkipCount:readable */
include('..\\search_by_distance\\search_by_distance_culture.js');
/* global getCountryISO:readable, music_graph_descriptors_countries:readable */

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

/**
 * Retrieve statistics data as x-y-z points
 *
 * @function
 * @name getData
 * @kind function
 * @param {object} [o] - arguments
 * @param {string} o.option - [='tf'] timeline|tf|playcount|playcount proportional
 * @param {?*} o.optionArg - Optional arg for 'playcount' options', see getPlayCount()
 * @param {string} o.x - [='genre'] X asis TF
 * @param {string|number} o.y - [=1] Y asis TF. Not used on 'playcount options
 * @param {string} o.z - [='artist'] Z asis TF. Only used on 'timeline' option (3D)
 * @param {string} o.query - [='ALL'] Query to filter the source
 * @param {string} o.sourceType - [='library'] playlist|playingPlaylist|activePlaylist|handleList|library
 * @param {?*} o.sourceArg - Optional arg for source, see getSource()
 * @param {boolean} o.bProportional - [=false] Calculate Y count proportional to population
 * @param {boolean} o.bRemoveDuplicates - [=true] Remove duplicates from source
 * @param {boolean} o.bIncludeHandles - [=true] Include associated handle per point
 * @returns {<Array.<Array,Array>>} Array of series with points [[{x, y, [z]},...], ...]
 */
function getData({
	option = 'tf', optionArg = null,
	x = 'genre', y = 1, z = 'artist',
	query = 'ALL', sourceType = 'library', sourceArg = null,
	bProportional = false,
	bRemoveDuplicates = true,
	bIncludeHandles = false
} = {}) {
	const noSplitTags = new Set(['ALBUM']); noSplitTags.forEach((tag) => noSplitTags.add(_t(tag)));
	const source = filterSource(query, getSource(sourceType, sourceArg));
	const handleList = bRemoveDuplicates ? deduplicateSource(source) : source;
	let data;
	switch (option) {
		case 'timeline': { // 3D {x, y, z}, x and z can be exchanged
			const xTags = noSplitTags.has(x.toUpperCase())
				? fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => val.split(/, ?/)); // X
			const serieTags = noSplitTags.has(z.toUpperCase())
				? fb.TitleFormat(_bt(z)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(z)).EvalWithMetadbs(handleList).map((val) => val.split(/, ?/)); // Z
			const bSingleY = !isNaN(y);
			const serieCounters = bSingleY
				? Number(y)
				: fb.TitleFormat(_bt(queryReplaceWithCurrent(y))).EvalWithMetadbs(handleList)
					.map((val) => { return val ? Number(val) : 0; }); // Y
			const dic = new Map();
			const handlesMap = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((x) => {
					if (!dic.has(x)) { dic.set(x, {}); }
					const val = dic.get(x);
					serieTags[i].forEach((serie) => {
						const count = bSingleY ? serieCounters : serieCounters[i];
						if (Object.hasOwn(val, serie)) {
							if (count) { val[serie].count += count; }
							val[serie].total++;
						} else {
							val[serie] = { count, total: 1 };
						}
					});
					dic.set(x, val);
					if (bIncludeHandles) {
						const handles = handlesMap.get(x);
						if (!handles) { handlesMap.set(x, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			dic.forEach((value, key, map) => {
				map.set(key, Object.entries(value).map((pair) => { return { key: pair[0], ...pair[1] /* count, total */ }; }).sort((a, b) => { return b.count - a.count; }));
			});
			data = [[...dic].map((points) => points[1].map((point) => { return { x: points[0], y: (bProportional ? point.count / point.total : point.count), z: point.key, ...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {}) }; }))];
			break;
		}
		case 'tf': {
			const libraryTags = noSplitTags.has(x.toUpperCase())
				? fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => val.split(/, ?/));
			const tagCount = new Map();
			const handlesMap = new Map();
			libraryTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					if (!tagCount.has(tag)) { tagCount.set(tag, 1); }
					else { tagCount.set(tag, tagCount.get(tag) + 1); }
					if (bIncludeHandles) {
						const handles = handlesMap.get(x);
						if (!handles) { handlesMap.set(x, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			data = [[...tagCount].map((point) => { return { x: point[0], y: point[1], ...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {}) }; })];
			break;
		}
		case 'playcount': {
			const libraryTags = noSplitTags.has(x.toUpperCase())
				? fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => val.split(/, ?/));
			const playCount = optionArg
				? getPlayCount(handleList, ...optionArg).map((V) => V.playCount)
				: fb.TitleFormat(globTags.playCount).EvalWithMetadbs(handleList);
			const tagCount = new Map();
			const handlesMap = new Map();
			libraryTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					if (!tagCount.has(tag)) { tagCount.set(tag, Number(playCount[i])); }
					else { tagCount.set(tag, tagCount.get(tag) + Number(playCount[i])); }
					if (bIncludeHandles) {
						const handles = handlesMap.get(tag);
						if (!handles) { handlesMap.set(tag, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			data = [[...tagCount].map((point) => { return { x: point[0], y: point[1], ...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {}) }; })];
			break;
		}
		case 'playcount proportional': {
			const libraryTags = noSplitTags.has(x.toUpperCase())
				? fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => val.split(/, ?/));
			const playCount = optionArg
				? getPlayCount(handleList, ...optionArg).map((V) => V.playCount)
				: fb.TitleFormat(globTags.playCount).EvalWithMetadbs(handleList);
			const tagCount = new Map();
			const keyCount = new Map();
			const handlesMap = new Map();
			libraryTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					if (!tagCount.has(tag)) { tagCount.set(tag, Number(playCount[i])); }
					else { tagCount.set(tag, tagCount.get(tag) + Number(playCount[i])); }
					if (!keyCount.has(tag)) { keyCount.set(tag, 1); }
					else { keyCount.set(tag, keyCount.get(tag) + 1); }
					if (bIncludeHandles) {
						const handles = handlesMap.get(tag);
						if (!handles) { handlesMap.set(tag, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			keyCount.forEach((value, key) => {
				if (tagCount.has(key)) { tagCount.set(key, Math.round(tagCount.get(key) / keyCount.get(key))); }
			});
			data = [[...tagCount].map((point) => { return { x: point[0], y: point[1], ...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {}) }; })];
			break;
		}
		case 'playcount wordlmap':
		case 'playcount wordlmap region': {
			const file = (_isFile(fb.FoobarPath + 'portable_mode_enabled') ? '.\\profile\\' + folders.dataName : folders.data) + 'worldMap.json';
			const worldMapData = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => { return { id: point.artist, country: (point.val.slice(-1) || [''])[0] }; });
			const libraryTags = noSplitTags.has(x.toUpperCase())
				? fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => val.split(/, ?/));
			const playCount = optionArg
				? getPlayCount(handleList, ...optionArg).map((V) => V.playCount)
				: fb.TitleFormat(globTags.playCount).EvalWithMetadbs(handleList);
			const tagCount = new Map();
			const handlesMap = new Map();
			libraryTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					const idData = worldMapData.find((data) => data.id === tag);
					if (idData) {
						const isoCode = getCountryISO(idData.country);
						if (isoCode) {
							const id = idData
								? option === 'playcount wordlmap region'
									? music_graph_descriptors_countries.getFirstNodeRegion(isoCode)
									: idData.country
								: null;
							if (!id) { return; }
							if (!tagCount.has(id)) { tagCount.set(id, Number(playCount[i])); }
							else { tagCount.set(id, tagCount.get(id) + Number(playCount[i])); }
							if (bIncludeHandles) {
								const handles = handlesMap.get(tag);
								if (!handles) { handlesMap.set(tag, [handleList[i]]); }
								else { handles.push(handleList[i]); }
							}
						}
					}
				});
			});
			data = [[...tagCount].map((point) => { return { x: point[0], y: point[1] }; })];
			break;
		}
	}
	return data;
}

/**
 * Retrieve statistics data as x-y-z points
 *
 * @function
 * @name getDataAsync
 * @kind function
 * @param {object} [o] - arguments
 * @param {string} o.option - [='tf'] timeline|tf|playcount|playcount proportional
 * @param {?*} o.optionArg - Optional arg for 'playcount' options', see getPlayCount()
 * @param {string} o.x - [='genre'] X asis TF
 * @param {string|number} o.y - [=1] Y asis TF. Not used on 'playcount options
 * @param {string} o.z - [='artist'] Z asis TF. Only used on 'timeline' option (3D)
 * @param {string} o.query - [='ALL'] Query to filter the source
 * @param {string} o.sourceType - [='library'] playlist|playingPlaylist|activePlaylist|handleList|library
 * @param {?*} o.sourceArg - Optional arg for source, see getSource()
 * @param {boolean} o.bProportional - [=false] Calculate Y count proportional to population
 * @param {boolean} o.bRemoveDuplicates - [=true] Remove duplicates from source
 * @param {boolean} o.bIncludeHandles - [=true] Include associated handle per point
 * @returns {promise.<Array.<Array,Array>>} Array of series with points [[{x, y, [z]},...], ...]
 */
async function getDataAsync({
	option = 'tf', optionArg = null,
	x = 'genre', y = 1, z = 'artist',
	query = 'ALL', sourceType = 'library', sourceArg = null,
	bProportional = false,
	bRemoveDuplicates = true,
	bIncludeHandles = false
} = {}) {
	const noSplitTags = new Set(['ALBUM', 'TITLE']); noSplitTags.forEach((tag) => noSplitTags.add(_t(tag)));
	const dedupByIdTags = new Set(['TITLE']); dedupByIdTags.forEach((tag) => noSplitTags.add(_t(tag)));
	const idChars = ['\u200b', '\u200c', '\u200d', '\u200e', '\u200f', '\u2060'];
	const idCharsRegExp = new RegExp(idChars.join('|'), 'gi');
	const source = filterSource(query, getSource(sourceType, sourceArg));
	const handleList = bRemoveDuplicates ? deduplicateSource(source) : source;
	let data;
	switch (option) {
		case 'timeline': { // 3D {x, y, z}, x and z can be exchanged
			const xTags = noSplitTags.has(x.toUpperCase())
				? (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(/, ?/)); // X
			const serieTags = noSplitTags.has(z.toUpperCase())
				? (await fb.TitleFormat(_bt(z)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(z)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(/, ?/)); //Z
			const bSingleY = !isNaN(y);
			const serieCounters = bSingleY
				? Number(y)
				: (await fb.TitleFormat(_bt(queryReplaceWithCurrent(y))).EvalWithMetadbsAsync(handleList))
					.map((val) => { return val ? Number(val) : 0; }); // Y
			const dic = new Map();
			const handlesMap = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((x) => {
					if (!dic.has(x)) { dic.set(x, {}); }
					const val = dic.get(x);
					serieTags[i].forEach((serie) => {
						const count = bSingleY ? serieCounters : serieCounters[i];
						if (Object.hasOwn(val, serie)) {
							if (count) { val[serie].count += count; }
							val[serie].total++;
						} else {
							val[serie] = { count, total: 1 };
						}
					});
					dic.set(x, val);
					if (bIncludeHandles) {
						const handles = handlesMap.get(x);
						if (!handles) { handlesMap.set(x, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			dic.forEach((value, key, map) => {
				map.set(key, Object.entries(value).map((pair) => { return { key: pair[0], ...pair[1] /* count, total */ }; }).sort((a, b) => { return b.count - a.count; }));
			});
			data = [[...dic].map((points) => points[1].map((point) => { return { x: points[0], y: (bProportional ? point.count / point.total : point.count), z: point.key, ...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {}) }; }))];
			break;
		}
		case 'tf': {
			const libraryTags = noSplitTags.has(x.toUpperCase())
				? (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(/, ?/));
			const tagCount = new Map();
			const handlesMap = new Map();
			libraryTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					if (!tagCount.has(tag)) { tagCount.set(tag, 1); }
					else { tagCount.set(tag, tagCount.get(tag) + 1); }
					if (bIncludeHandles) {
						const handles = handlesMap.get(tag);
						if (!handles) { handlesMap.set(tag, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			data = [[...tagCount].map((point) => { return { x: point[0], y: point[1], ...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {}) }; })];
			break;
		}
		case 'playcount': {
			const bUseId = dedupByIdTags.has(x);
			const bIncludeSkip = optionArg && optionArg.bSkipCount;
			const xTag = _bt(x) +
				(bUseId ? '||$if3(%MUSICBRAINZ_TRACKID%,%MUSICBRAINZ_ALBUMARTISTID%,%ARTIST%)' : '');
			const libraryTags = noSplitTags.has(x.toUpperCase())
				? (await fb.TitleFormat(xTag).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(xTag).EvalWithMetadbsAsync(handleList)).map((val) => val.split(/, ?/));
			const playCount = optionArg && optionArg.timePeriod
				? getPlayCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((V) => V.playCount)
				: await fb.TitleFormat(globTags.playCount).EvalWithMetadbsAsync(handleList);
			const skipCount = bIncludeSkip
				? optionArg.timePeriod
					? getSkipCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((V) => V.skipCount)
					: await fb.TitleFormat(globTags.skipCount).EvalWithMetadbsAsync(handleList)
				: null;
			const tagCount = new Map();
			const idMap = new Map();
			libraryTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					if (bUseId) {
						let id = '';
						[tag, id] = tag.split('||');
						if (id) {
							if (!idMap.has(id)) { idMap.set(id, idChars.shuffle().join('')); }
							id = idMap.get(id);
						} else { id = ''; }
						tag += id;
					}
					const entry = tagCount.get(tag);
					if (!entry) {
						tagCount.set(tag, {
							playCount: Number(playCount[i]),
							handles: bIncludeHandles ? [handleList[i]] : null,
							skipCount: bIncludeSkip ? Number(skipCount[i]) : null,
						});
					} else {
						entry.playCount += Number(playCount[i]);
						if (bIncludeHandles) { entry.handles.push(handleList[i]); }
						if (bIncludeSkip) { entry.skipCount += Number(skipCount[i]); }
					}
				});
			});
			data = [[...tagCount].map((point) => {
				return {
					x: point[0].replace(idCharsRegExp, ''),
					y: point[1].playCount,
					...(bIncludeHandles ? { handle: point[1].handles } : {}),
					...(bIncludeSkip ? { skipCount: point[1].skipCount } : {}),
				};
			})];
			break;
		}
		case 'playcount proportional': {
			const bUseId = dedupByIdTags.has(x);
			const xTag = _bt(x) +
				(bUseId ? '||$if3(%MUSICBRAINZ_TRACKID%,%MUSICBRAINZ_ALBUMARTISTID%,%ARTIST%)' : '');
			const libraryTags = noSplitTags.has(x.toUpperCase())
				? (await fb.TitleFormat(xTag).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(xTag).EvalWithMetadbsAsync(handleList)).map((val) => val.split(/, ?/));
			const playCount = optionArg && optionArg.timePeriod
				? getPlayCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((V) => V.playCount)
				: await fb.TitleFormat(globTags.playCount).EvalWithMetadbsAsync(handleList);
			const tagCount = new Map();
			const keyCount = new Map();
			const handlesMap = new Map();
			const idMap = new Map();
			libraryTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					if (bUseId) {
						let id = '';
						[tag, id] = tag.split('||');
						if (id) {
							if (!idMap.has(id)) { idMap.set(id, idChars.shuffle().join('')); }
							id = idMap.get(id);
						} else { id = ''; }
						tag += id;
					}
					if (!tagCount.has(tag)) { tagCount.set(tag, Number(playCount[i])); }
					else { tagCount.set(tag, tagCount.get(tag) + Number(playCount[i])); }
					if (!keyCount.has(tag)) { keyCount.set(tag, 1); }
					else { keyCount.set(tag, keyCount.get(tag) + 1); }
					if (bIncludeHandles) {
						const handles = handlesMap.get(tag);
						if (!handles) { handlesMap.set(tag, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			keyCount.forEach((value, key) => {
				if (tagCount.has(key)) { tagCount.set(key, Math.round(tagCount.get(key) / keyCount.get(key))); }
			});
			data = [[...tagCount].map((point) => { return { x: point[0].replace(idCharsRegExp, ''), y: point[1], ...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {}) }; })];
			break;
		}
		case 'playcount wordlmap':
		case 'playcount wordlmap region': {
			const file = (_isFile(fb.FoobarPath + 'portable_mode_enabled') ? '.\\profile\\' + folders.dataName : folders.data) + 'worldMap.json';
			const worldMapData = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => { return { id: point.artist, country: (point.val.slice(-1) || [''])[0] }; });
			const libraryTags = noSplitTags.has(x.toUpperCase())
				? (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(/, ?/));
			const playCount = optionArg && optionArg.timePeriod
				? getPlayCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((V) => V.playCount)
				: await fb.TitleFormat(globTags.playCount).EvalWithMetadbsAsync(handleList);
			const tagCount = new Map();
			const handlesMap = new Map();
			libraryTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					const idData = worldMapData.find((data) => data.id === tag);
					if (idData) {
						const isoCode = getCountryISO(idData.country);
						if (isoCode) {
							const id = idData
								? option === 'playcount wordlmap region'
									? music_graph_descriptors_countries.getFirstNodeRegion(isoCode)
									: idData.country
								: null;
							if (!id) { return; }
							if (!tagCount.has(id)) { tagCount.set(id, Number(playCount[i])); }
							else { tagCount.set(id, tagCount.get(id) + Number(playCount[i])); }
							if (bIncludeHandles) {
								const handles = handlesMap.get(tag);
								if (!handles) { handlesMap.set(tag, [handleList[i]]); }
								else { handles.push(handleList[i]); }
							}
						}
					}
				});
			});
			data = [[...tagCount].map((point) => { return { x: point[0], y: point[1], ...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {}) }; })];
			break;
		}
		case 'playcount wordlmap city': {
			const file = (_isFile(fb.FoobarPath + 'portable_mode_enabled') ? '.\\profile\\' + folders.dataName : folders.data) + 'worldMap.json';
			const worldMapData = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => { return { id: point.artist, city: point.val[0] || '', country: (point.val.slice(-1) || [''])[0] }; });
			const libraryTags = noSplitTags.has(x.toUpperCase())
				? (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(/, ?/));
			const playCount = optionArg && optionArg.timePeriod
				? getPlayCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((V) => V.playCount)
				: await fb.TitleFormat(globTags.playCount).EvalWithMetadbsAsync(handleList);
			const tagCount = new Map();
			const cityMap = new Map();
			const handlesMap = new Map();
			libraryTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					const idData = worldMapData.find((data) => data.id === tag);
					if (idData && idData.city && idData.city !== idData.country) {
						const id = idData.city;
						if (idData.country) {
							const pointTags = cityMap.get(id);
							if (!pointTags) {
								cityMap.set(id, { country: idData.country, artists: new Map([[idData.id, Number(playCount[i])]]) });
							} else {
								pointTags.artists.set(idData.id, (pointTags.artists.get(idData.id) || 0) + Number(playCount[i]));
							}
						}
						if (!id) { return; }
						if (!tagCount.has(id)) { tagCount.set(id, Number(playCount[i])); }
						else { tagCount.set(id, tagCount.get(id) + Number(playCount[i])); }
						if (bIncludeHandles) {
							const handles = handlesMap.get(tag);
							if (!handles) { handlesMap.set(tag, [handleList[i]]); }
							else { handles.push(handleList[i]); }
						}
					}
				});
			});
			data = [[...tagCount].map((point) => {
				const tags = cityMap.get(point[0]);
				return {
					x: point[0],
					y: point[1],
					country: tags.country,
					artists: [...tags.artists]
						.sort((a, b) => b[1] - a[1])
						.map((a) => { return { artist: a[0], listens: a[1] }; }),
					...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {})
				};
			})];
			break;
		}
		default: {
			throw new Error('Non recognized option:' + option);
		}
	}
	return data;
}

function getSource(type, arg) {
	switch (type) {
		case 'playlist': return getHandlesFromUIPlaylists(arg, false); // [playlist names]
		case 'playingPlaylist': return (plman.PlayingPlaylist !== -1 && fb.IsPlaying ? plman.GetPlaylistItems(plman.PlayingPlaylist) : getSource('activePlaylist'));
		case 'activePlaylist': return (plman.ActivePlaylist !== -1 ? plman.GetPlaylistItems(plman.ActivePlaylist) : new FbMetadbHandleList());
		case 'handleList': return arg;
		case 'library':
		default: return fb.GetLibraryItems();
	}
}

function filterSource(query, source) {
	return (query.length && query !== 'ALL' ? fb.GetQueryItems(source, query) : source);
}

function deduplicateSource(source) {
	return removeDuplicatesV2({ handleList: source, checkKeys: globTags.remDupl, sortBias: globQuery.remDuplBias, bPreserveSort: true, bAdvTitle: true });
}
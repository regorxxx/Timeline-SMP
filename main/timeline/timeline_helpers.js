'use strict';
//15/12/24

/* exported getData, getDataAsync */

/* global globQuery:readable, globTags:readable, */
include('..\\..\\helpers\\helpers_xxx_prototypes.js');
/* global _t:readable, _bt:readable */
include('..\\..\\helpers\\helpers_xxx_tags.js');
/* global queryReplaceWithCurrent:readable, checkQuery:readable */
include('..\\..\\helpers\\helpers_xxx_file.js');
/* global _isFile:readable, folders:readable, _jsonParseFileCheck:readable, utf8:readable */
include('..\\..\\helpers\\helpers_xxx_playlists.js');
/* global getHandlesFromUIPlaylists:readable */
include('..\\filter_and_query\\remove_duplicates.js');
/* global removeDuplicates:readable */
include('..\\search\\top_tracks_from_date.js');
/* global getPlayCount:readable, getPlayCountV2:readable, getSkipCount:readable */
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
 * Retrieve statistics data as x-y-z points.
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
 * @param {{filter:boolean, sort: function|null}} o.zGroups - [={ filter: false, sort: null } Settings to handle Z-data using 'timeline' option. If filter is true, then only non null z-values are output.
 * @returns {<Array.<Array,Array>>} Array of series with points [[{x, y, [z]},...], ...]
 */
function getData({
	option = 'tf', optionArg = null,
	x = 'genre', y = 1, z = 'artist',
	query = 'ALL', sourceType = 'library', sourceArg = null,
	queryHandle = null,
	bProportional = false,
	bRemoveDuplicates = true,
	bIncludeHandles = false,
	zGroups = { filter: false, sort: null /* (a, b) => b.count - a.count */ }
} = {}) {
	const noSplitTags = new Set(['ALBUM', 'TITLE']); noSplitTags.forEach((tag) => noSplitTags.add(_t(tag)));
	const dedupByIdTags = new Set(['TITLE']); dedupByIdTags.forEach((tag) => dedupByIdTags.add(_t(tag)));
	const idChars = ['\u200b', '\u200c', '\u200d', '\u200e', '\u200f', '\u2060'];
	const idCharsRegExp = new RegExp(idChars.join('|'), 'gi');
	const source = filterSource(query, getSource(sourceType, sourceArg), queryHandle);
	const handleList = bRemoveDuplicates ? deduplicateSource(source) : source;
	let splitter;
	try { splitter = new RegExp('(?<!\\d), ?(?!\\d)'); }
	catch (e) {
		splitter = /, /;
		console.log(window.Parent + ' '+  utils.Version + ': RegExp lookahead and lookbehind not supported');
	}
	if ((typeof z === 'undefined' || z === null || !z.length) && option === 'timeline') { option = 'tf'; }
	let data;
	switch (option) {
		case 'timeline': { // 3D {x, y, z}, x and z can be exchanged
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => val.split(splitter)); // X
			const serieTags = noSplitTags.has(z.toUpperCase())
				? fb.TitleFormat(_bt(z)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(z)).EvalWithMetadbs(handleList).map((val) => val.split(splitter)); // Z
			const bSingleY = !isNaN(y);
			const serieCounters = bSingleY
				? Number(y)
				: fb.TitleFormat(_bt(queryReplaceWithCurrent(y))).EvalWithMetadbs(handleList)
					.map((val) => val ? Number(val) : 0); // Y
			const dic = new Map();
			const handlesMap = new Map();
			if (!zGroups.filter) {
				const xLabels = new Set(xTags.flat(Infinity));
				const zLabels = new Set(serieTags.flat(Infinity));
				xLabels.forEach((x) => {
					const val = {};
					dic.set(x, val);
					zLabels.forEach((serie) => val[serie] = { count: 0, total: 0 });
				});
			}
			xTags.forEach((arr, i) => {
				arr.forEach((x) => {
					let val = dic.get(x);
					if (!val) { val = {}; dic.set(x, val); }
					serieTags[i].forEach((serie) => {
						const count = bSingleY ? serieCounters : serieCounters[i];
						if (Object.hasOwn(val, serie)) {
							if (count) { val[serie].count += count; }
							val[serie].total++;
						} else {
							val[serie] = { count, total: 1 };
						}
					});
					if (bIncludeHandles) {
						const handles = handlesMap.get(x);
						if (!handles) { handlesMap.set(x, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			dic.forEach((value, key, map) => {
				map.set(
					key,
					Object.entries(value).map((pair) => { return { key: pair[0], ...pair[1] }; })
				);
			});
			if (zGroups.sort) { dic.forEach((value) => value.sort(zGroups.sort)); }
			data = [
				Array.from(
					dic,
					(/** @type {[string, {key: string, count: number, total: number}[]]} */points) => points[1].map((point) => {
						return {
							x: points[0],
							y: bProportional ? point.count / point.total : point.count,
							z: point.key,
							...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {})
						};
					})
				)
			];
			break;
		}
		case 'tf': {
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => val.split(splitter));
			const bSingleY = !isNaN(y);
			const serieCounters = bSingleY
				? Number(y)
				: fb.TitleFormat(_bt(queryReplaceWithCurrent(y))).EvalWithMetadbs(handleList)
					.map((val) => val ? Number(val) : 0); // Y
			const dic = new Map();
			const handlesMap = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					const count = bSingleY ? serieCounters : serieCounters[i];
					const val = dic.get(tag);
					if (!val) { dic.set(tag, { count, total: 1 }); }
					else {
						val.count += count;
						val.total++;
					}
					if (bIncludeHandles) {
						const handles = handlesMap.get(tag);
						if (!handles) { handlesMap.set(tag, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			data = [Array.from(dic, (point) => {
				return {
					x: point[0],
					y: bProportional ? point[1].count / point[1].total : point[1].count,
					...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {})
				};
			})];
			break;
		}
		case 'playcount': {
			const bUseId = dedupByIdTags.has(x);
			const bIncludeSkip = optionArg && optionArg.bSkipCount;
			const xTag = _bt(x) +
				(bUseId ? '|‎|$if3(%MUSICBRAINZ_TRACKID%,%MUSICBRAINZ_ALBUMARTISTID%,%ARTIST%)' : '');
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? fb.TitleFormat(xTag).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(xTag).EvalWithMetadbs(handleList).map((val) => val.split(splitter));
			const playCount = optionArg && optionArg.timePeriod
				? getPlayCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((v) => v.playCount)
				: fb.TitleFormat(globTags.playCount).EvalWithMetadbs(handleList);
			const skipCount = bIncludeSkip
				? optionArg.timePeriod
					? getSkipCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((v) => v.skipCount)
					: fb.TitleFormat(globTags.skipCount).EvalWithMetadbs(handleList)
				: null;
			const tagCount = new Map();
			const idMap = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					if (bUseId) {
						let id = '';
						[tag, id] = tag.split('|‎|');
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
			data = [Array.from(tagCount, (point) => {
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
				(bUseId ? '|‎|$if3(%MUSICBRAINZ_TRACKID%,%MUSICBRAINZ_ALBUMARTISTID%,%ARTIST%)' : '');
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? fb.TitleFormat(xTag).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(xTag).EvalWithMetadbs(handleList).map((val) => val.split(splitter));
			const playCount = optionArg && optionArg.timePeriod
				? getPlayCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((v) => v.playCount)
				: fb.TitleFormat(globTags.playCount).EvalWithMetadbs(handleList);
			const tagCount = new Map();
			const keyCount = new Map();
			const handlesMap = new Map();
			const idMap = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					if (bUseId) {
						let id = '';
						[tag, id] = tag.split('|‎|');
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
			data = [Array.from(tagCount, (point) => {
				return {
					x: point[0].replace(idCharsRegExp, ''),
					y: point[1],
					...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {})
				};
			})];
			break;
		}
		case 'playcount worldmap':
		case 'playcount worldmap region': {
			const file = (_isFile(fb.FoobarPath + 'portable_mode_enabled') ? '.\\profile\\' + folders.dataName : folders.data) + 'worldMap.json';
			const worldMapData = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => { return { id: point.artist, country: (point.val.slice(-1) || [''])[0] }; });
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => val.split(splitter));
			const playCount = optionArg && optionArg.timePeriod
				? getPlayCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((V) => V.playCount)
				: fb.TitleFormat(globTags.playCount).EvalWithMetadbs(handleList);
			const tagCount = new Map();
			const handlesMap = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					const idData = worldMapData.find((data) => data.id === tag);
					if (idData) {
						const isoCode = getCountryISO(idData.country);
						if (isoCode) {
							const id = idData
								? option === 'playcount worldmap region'
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
			data = [Array.from(tagCount, (point) => {
				return {
					x: point[0],
					y: point[1],
					...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {})
				};
			})];
			break;
		}
		case 'playcount worldmap city': {
			const file = (_isFile(fb.FoobarPath + 'portable_mode_enabled') ? '.\\profile\\' + folders.dataName : folders.data) + 'worldMap.json';
			const worldMapData = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => { return { id: point.artist, city: point.val[0] || '', country: (point.val.slice(-1) || [''])[0] }; });
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => [val])
				: fb.TitleFormat(_bt(x)).EvalWithMetadbs(handleList).map((val) => val.split(splitter));
			const playCount = optionArg && optionArg.timePeriod
				? getPlayCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((v) => v.playCount)
				: fb.TitleFormat(globTags.playCount).EvalWithMetadbs(handleList);
			const tagCount = new Map();
			const cityMap = new Map();
			const handlesMap = new Map();
			xTags.forEach((arr, i) => {
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
			data = [Array.from(tagCount, (point) => {
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

/**
 * Retrieve statistics data as x-y-z points. There are additional settings for compatibility with ListenBrainz API listens retrieval (compared to the {@link getData}).
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
 * @param {{filter:boolean, sort: function|null}} o.zGroups - [={ filter: false, sort: null } Settings to handle Z-data using 'timeline' option. If filter is true, then only non null z-values are output.
 * @param {{token:string, bOffline:boolean}} o.listenBrainz - [={token: '', bOffline: true}] ListenBrainz settings to retrieve playcounts. If no token provided, it's skipped
 * @returns {promise.<Array.<Array,Array>>} Array of series with points [[{x, y, [z]},...], ...]
 */
async function getDataAsync({
	option = 'tf', optionArg = null,
	x = 'genre', y = 1, z = 'artist',
	query = 'ALL', sourceType = 'library', sourceArg = null,
	queryHandle = null,
	bProportional = false,
	bRemoveDuplicates = true,
	bIncludeHandles = false,
	zGroups = { filter: false, sort: null /* (a, b) => b.count - a.count */ },
	listenBrainz = { token: '', user: '', bOffline: true }
} = {}) {
	const noSplitTags = new Set(['ALBUM', 'TITLE']); noSplitTags.forEach((tag) => noSplitTags.add(_t(tag)));
	const dedupByIdTags = new Set(['TITLE']); dedupByIdTags.forEach((tag) => dedupByIdTags.add(_t(tag)));
	const idChars = ['\u200b', '\u200c', '\u200d', '\u200e', '\u200f', '\u2060'];
	const idCharsRegExp = new RegExp(idChars.join('|'), 'gi');
	const source = filterSource(query, getSource(sourceType, sourceArg), queryHandle);
	const handleList = bRemoveDuplicates ? deduplicateSource(source) : source;
	let splitter;
	try { splitter = new RegExp('(?<!\\d), ?(?!\\d)'); }
	catch (e) {
		splitter = /, /;
		console.log(window.Parent + ' '+  utils.Version + ': RegExp lookahead and lookbehind not supported');
	}
	if ((typeof z === 'undefined' || z === null || !z.length) && option === 'timeline') { option = 'tf'; }
	let data;
	switch (option) {
		case 'timeline': { // 3D {x, y, z}, x and z can be exchanged
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(splitter)); // X
			const serieTags = noSplitTags.has(z.toUpperCase().replace(/\|.*/, ''))
				? (await fb.TitleFormat(_bt(z)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(z)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(splitter)); //Z
			const bSingleY = !isNaN(y);
			const serieCounters = bSingleY
				? Number(y)
				: (await fb.TitleFormat(_bt(queryReplaceWithCurrent(y))).EvalWithMetadbsAsync(handleList))
					.map((val) => val ? Number(val) : 0); // Y
			const dic = new Map();
			const handlesMap = new Map();
			if (!zGroups.filter) {
				const xLabels = new Set(xTags.flat(Infinity));
				const zLabels = new Set(serieTags.flat(Infinity));
				xLabels.forEach((x) => {
					const val = {};
					dic.set(x, val);
					zLabels.forEach((serie) => val[serie] = { count: 0, total: 0 });
				});
			}
			xTags.forEach((arr, i) => {
				arr.forEach((x) => {
					let val = dic.get(x);
					if (!val) { val = {}; dic.set(x, val); }
					serieTags[i].forEach((serie) => {
						const count = bSingleY ? serieCounters : serieCounters[i];
						if (Object.hasOwn(val, serie)) {
							if (count) { val[serie].count += count; }
							val[serie].total++;
						} else {
							val[serie] = { count, total: 1 };
						}
					});
					if (bIncludeHandles) {
						const handles = handlesMap.get(x);
						if (!handles) { handlesMap.set(x, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			dic.forEach((value, key, map) => {
				map.set(
					key,
					Object.entries(value).map((pair) => { return { key: pair[0], ...pair[1] }; })
				);
			});
			if (zGroups.sort) { dic.forEach((value) => value.sort(zGroups.sort)); }
			data = [
				Array.from(
					dic,
					(/** @type {[string, {key: string, count: number, total: number}[]]} */ points) => points[1].map((point) => {
						return {
							x: points[0],
							y: bProportional ? point.count / point.total : point.count,
							z: point.key,
							...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {})
						};
					})
				)
			];
			break;
		}
		case 'tf': {
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(splitter));
			const bSingleY = !isNaN(y);
			const serieCounters = bSingleY
				? Number(y)
				: (await fb.TitleFormat(_bt(queryReplaceWithCurrent(y))).EvalWithMetadbsAsync(handleList))
					.map((val) => val ? Number(val) : 0); // Y
			const dic = new Map();
			const handlesMap = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					const count = bSingleY ? serieCounters : serieCounters[i];
					const val = dic.get(tag);
					if (!val) { dic.set(tag, { count, total: 1 }); }
					else {
						val.count += count;
						val.total++;
					}
					if (bIncludeHandles) {
						const handles = handlesMap.get(tag);
						if (!handles) { handlesMap.set(tag, [handleList[i]]); }
						else { handles.push(handleList[i]); }
					}
				});
			});
			data = [Array.from(dic, (point) => {
				return {
					x: point[0],
					y: bProportional ? point[1].count / point[1].total : point[1].count,
					...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {})
				};
			})];
			break;
		}
		case 'playcount': {
			const bUseId = dedupByIdTags.has(x);
			const bIncludeSkip = optionArg && optionArg.bSkipCount;
			const xTag = _bt(x) +
				(bUseId ? '|‎|$if3(%MUSICBRAINZ_TRACKID%,%MUSICBRAINZ_ALBUMARTISTID%,%ARTIST%)' : '');
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? (await fb.TitleFormat(xTag).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(xTag).EvalWithMetadbsAsync(handleList)).map((val) => val.split(splitter));
			const playCount = optionArg && optionArg.timePeriod
				? (await getPlayCountV2(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate, true, listenBrainz)).map((v) => v.playCount)
				: await fb.TitleFormat(globTags.playCount).EvalWithMetadbsAsync(handleList);
			const skipCount = bIncludeSkip
				? optionArg.timePeriod
					? getSkipCount(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate).map((v) => v.skipCount)
					: await fb.TitleFormat(globTags.skipCount).EvalWithMetadbsAsync(handleList)
				: null;
			const tagCount = new Map();
			const idMap = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					if (bUseId) {
						let id = '';
						[tag, id] = tag.split('|‎|');
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
			data = [Array.from(tagCount, (point) => {
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
				(bUseId ? '|‎|$if3(%MUSICBRAINZ_TRACKID%,%MUSICBRAINZ_ALBUMARTISTID%,%ARTIST%)' : '');
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? (await fb.TitleFormat(xTag).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(xTag).EvalWithMetadbsAsync(handleList)).map((val) => val.split(splitter));
			const playCount = optionArg && optionArg.timePeriod
				? (await getPlayCountV2(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate, true, listenBrainz)).map((v) => v.playCount)
				: await fb.TitleFormat(globTags.playCount).EvalWithMetadbsAsync(handleList);
			const tagCount = new Map();
			const keyCount = new Map();
			const handlesMap = new Map();
			const idMap = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					if (bUseId) {
						let id = '';
						[tag, id] = tag.split('|‎|');
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
			data = [Array.from(tagCount, (point) => {
				return {
					x: point[0].replace(idCharsRegExp, ''),
					y: point[1],
					...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {})
				};
			})];
			break;
		}
		case 'playcount worldmap':
		case 'playcount worldmap region': {
			const file = (_isFile(fb.FoobarPath + 'portable_mode_enabled') ? '.\\profile\\' + folders.dataName : folders.data) + 'worldMap.json';
			const worldMapData = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => { return { id: point.artist, country: (point.val.slice(-1) || [''])[0] }; });
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(splitter));
			const playCount = optionArg && optionArg.timePeriod
				? (await getPlayCountV2(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate, true, listenBrainz)).map((v) => v.playCount)
				: await fb.TitleFormat(globTags.playCount).EvalWithMetadbsAsync(handleList);
			const tagCount = new Map();
			const handlesMap = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((tag) => {
					const idData = worldMapData.find((data) => data.id === tag);
					if (idData) {
						const isoCode = getCountryISO(idData.country);
						if (isoCode) {
							const id = idData
								? option === 'playcount worldmap region'
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
			data = [Array.from(tagCount, (point) => {
				return {
					x: point[0],
					y: point[1],
					...(bIncludeHandles ? { handle: handlesMap.get(point[0]) } : {})
				};
			})];
			break;
		}
		case 'playcount worldmap city': {
			const file = (_isFile(fb.FoobarPath + 'portable_mode_enabled') ? '.\\profile\\' + folders.dataName : folders.data) + 'worldMap.json';
			const worldMapData = _jsonParseFileCheck(file, 'Library json', window.Name, utf8).map((point) => { return { id: point.artist, city: point.val[0] || '', country: (point.val.slice(-1) || [''])[0] }; });
			const xTags = noSplitTags.has(x.toUpperCase().replace(/\|.*/, ''))
				? (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => [val])
				: (await fb.TitleFormat(_bt(x)).EvalWithMetadbsAsync(handleList)).map((val) => val.split(splitter));
			const playCount = optionArg && optionArg.timePeriod
				? (await getPlayCountV2(handleList, optionArg.timePeriod, optionArg.timeKey, optionArg.fromDate, true, listenBrainz)).map((v) => v.playCount)
				: await fb.TitleFormat(globTags.playCount).EvalWithMetadbsAsync(handleList);
			const tagCount = new Map();
			const cityMap = new Map();
			const handlesMap = new Map();
			xTags.forEach((arr, i) => {
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
			data = [Array.from(tagCount, (point) => {
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

function filterSource(query, source, handle = null) {
	query = queryReplaceWithCurrent(query, handle, { bToLowerCase: true });
	if (!checkQuery(query)) { return new FbMetadbHandleList(); }
	return (query.length && query !== 'ALL' ? fb.GetQueryItems(source, query) : source);
}

function deduplicateSource(source) {
	return removeDuplicates({ handleList: source, checkKeys: globTags.remDupl, sortBias: globQuery.remDuplBias, bPreserveSort: true, bAdvTitle: true });
}
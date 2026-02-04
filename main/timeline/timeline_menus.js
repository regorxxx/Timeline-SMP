'use strict';
//03/02/26

/* exported onLbtnUpPoint, onLbtnUpSettings, onRbtnUpImportSettings */

/* global _p:readable, checkQuery:readable, globTags:readable, globQuery:readable, round:readable, capitalizeAll:readable, properties:readable, WshShell:readable, popup:readable, _qCond:readable, overwriteProperties:readable, checkUpdate:readable, globSettings:readable , isArrayEqual:readable, _b:readable, folders:readable, dynQueryMode:readable, refreshData:readable, queryJoin:readable, queryReplaceWithCurrent:readable, selectedHandle:readable, VK_SHIFT:readable, fallbackTagsQuery:readable, getTimeRange:readable, timePeriods:readable, charts:readable */
include('..\\..\\helpers\\helpers_xxx_file.js');
/* global _open:readable, utf8:readable */
include('..\\..\\helpers\\helpers_xxx_playlists.js');
/* global sendToPlaylist:readable */
include('..\\..\\helpers\\helpers_xxx_input.js');
/* global Input:readable */
include('..\\..\\helpers\\helpers_xxx_export.js');
/* global exportSettings:readable, importSettings:readable */
include('..\\..\\helpers\\menu_xxx.js');
/* global MF_GRAYED:readable, _menu:readable, MF_STRING:readable, MF_CHECKED:readable */
include('..\\..\\helpers\\menu_xxx_extras.js');
/* global _createSubMenuEditEntries:readable */
include('..\\filter_and_query\\remove_duplicates.js');
/* global removeDuplicates:readable */
include('..\\window\\window_xxx_background_menu.js');

/** @this _chart */
function onLbtnUpPoint(point, x, y, mask) { // eslint-disable-line no-unused-vars
	if (!point) { return; }
	// Constants
	const menu = new _menu();
	const bShowAllPoints = this.graph.multi && ['scatter', 'lines', 'fill'].includes(this.graph.type);
	const points = bShowAllPoints && this.dataDraw.length > 1
		? this.dataDraw.map((series) => series.find((p) => p.x === point.x)).flat(Infinity).filter(Boolean)
		: [point];
	// Header
	menu.newEntry({ entryText: this.title, flags: MF_GRAYED });
	menu.newSeparator();
	// Menus
	points.forEach((subPoint) => {
		const menuName = this.graph.multi ? menu.newMenu(subPoint.z) : menu.getMainMenuName();
		{	// Playlists
			const subMenu = [menu.newMenu('Create playlist', menuName), menu.newMenu('Create AutoPlaylist', menuName)];
			menu.newEntry({ menuName: subMenu[0], entryText: 'De-duplicated and randomized:', flags: MF_GRAYED });
			menu.newSeparator(subMenu[0]);
			menu.newEntry({ menuName: subMenu[1], entryText: 'Press Shift to configure:', flags: MF_GRAYED });
			menu.newSeparator(subMenu[1]);
			const currPoints = this.dataDraw.map((series) => series.find((newPoint) => newPoint.x === point.x)).filter(Boolean);
			[
				{ name: 'By ' + this.axis.x.key, query: this.axis.x.tf + ' IS ' + subPoint.x.toString().toLowerCase(), playlist: 'Timeline: ' + subPoint.x.replace(/\|.*/, '') },
				...(this.graph.multi
					? [
						{ name: 'By ' + this.axis.z.key, query: fallbackTagsQuery(this.axis.z.tf, subPoint.z.toString().toLowerCase()), playlist: 'Timeline: ' + subPoint.z.replace(/\|.*/, '') },
						{
							name: 'By ' + this.axis.x.key + ' and ' + this.axis.z.key, query: this.axis.x.tf + ' IS ' + subPoint.x.toString().toLowerCase() + ' AND ' + _p(fallbackTagsQuery(this.axis.z.tf, subPoint.z.toString().toLowerCase())),
							playlist: 'Timeline: ' + subPoint.x.replace(/\|.*/, '') + ' - ' + subPoint.z.replace(/\|.*/, '')
						},
						{
							name: 'By ' + this.axis.x.key + ' and top ' + this.axis.z.key, query: this.axis.x.tf + ' IS ' + subPoint.x.toString().toLowerCase() + ' AND ' + _p(currPoints.map((newPoint) => fallbackTagsQuery(this.axis.z.tf, newPoint.z.toString().toLowerCase())).join(' OR ')),
							playlist: 'Timeline: ' + subPoint.x.replace(/\|.*/, '') + ' - Top ' + currPoints.length + ' ' + this.axis.z.key.replace(/\|.*/, '')
						}
					]
					: [])
			].filter(Boolean).forEach((entry) => {
				menu.newEntry({
					menuName: subMenu[0], entryText: entry.name, func: () => {
						let query = properties.dataQuery[1].count('#') > 2
							? entry.query
							: queryJoin([entry.query, properties.dataQuery[1]].filter(Boolean), 'AND');
						query = queryReplaceWithCurrent(query, selectedHandle, { bToLowerCase: true });
						if (checkQuery(query)) {
							let handleList = fb.GetQueryItems(fb.GetLibraryItems(), query);
							handleList = removeDuplicates({ handleList, sortOutput: '', checkKeys: globTags.remDupl, sortBias: globQuery.remDuplBias, bAdvTitle: true, bMultiple: true, bPreserveSort: false });
							sendToPlaylist(handleList, entry.playlist);
							console.log('Statistics: playlist created\n\t ' + query);
						} else { console.log('Statistics: query error\n\t ' + query); }
					}
				});
				menu.newEntry({
					menuName: subMenu[1], entryText: entry.name, func: () => {
						let query = properties.dataQuery[1].count('#') > 2
							? entry.query
							: queryJoin([entry.query, properties.dataQuery[1]].filter(Boolean), 'AND');
						query = queryReplaceWithCurrent(query, selectedHandle, { bToLowerCase: true });
						if (checkQuery(query)) {
							plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, entry.playlist, query);
							if (utils.IsKeyPressed(VK_SHIFT)) {
								plman.ShowAutoPlaylistUI(plman.ActivePlaylist);
							}
						} else { console.log('Statistics: query error\n\t ', query); }
					}
				});
			});
		}
		menu.newSeparator(menuName);
		menu.newEntry({
			menuName, entryText: 'Show point statistics...', func: () => {
				const stats = this.computeStatisticsPoint(subPoint);
				const libItems = fb.GetLibraryItems();
				fb.ShowPopupMessage(
					'[X]' + this.axis.x.key + ' - [Y]' + this.axis.y.key + (this.graph.multi ? ' - [Z]' + this.axis.z.key : '') + '\n\n' +
					'[X]' + this.axis.x.key + ':\t' + subPoint.x +
					'\n' +
					'[Y]' + this.axis.y.key + ':\t' + round(subPoint.y, 1) + ' ' + _p(stats.current.y100 + '%') +
					'\n' +
					(
						this.graph.multi
							? '[Z]' + this.axis.z.key + ':\t' + subPoint.z + '\n'
							: '[Z]None' + '\n'
					) +
					'Average ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + stats.current.avg + ' ' + _p(stats.current.avg100 + '%') +
					'\n' +
					'Total ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + stats.current.total +
					'\n' +
					(
						this.graph.multi
							? 'Total Tracks (any ' + this.axis.x.key + ') -not deduplicated-: ' + (fb.GetQueryItemsCheck(libItems, fallbackTagsQuery(this.axis.z.tf, subPoint.z)) || {}).Count +
							'\n'
							: ''
					) +
					(
						this.graph.multi
							? '-'.repeat(40) +
							'\n' +
							'Global total ' + this.axis.y.key + ': ' + stats.global.total +
							'\n' +
							'Global average ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + stats.global.avg + ' ' + _p(stats.global.avg100 + '%')
							+ '\n'
							: ''
					) +
					'Total Tracks on library -not deduplicated-: ' + libItems.Count
					, window.PanelName + ': Point statistics'
				);
			}
		});
	});
	return menu.btn_up(x, y);
}

/** @this _chart */
function onDblLbtnPoint(point, x, y, mask) { // eslint-disable-line no-unused-vars
	if (!point && !this.series) {
		this.setData();
	}
}

/** @this _chart */
function onLbtnUpSettings({ bShowZ = true, readmes } = {}) {
	// Constants
	const properties = this.properties;
	const menu = new _menu();
	const dataSource = JSON.parse(properties.dataSource[1]);
	const timeRange = JSON.parse(properties.timeRange[1], (key, val) => val === null ? Infinity : val);
	const groupBy = JSON.parse(properties.groupBy[1]);
	const bHasX = Object.hasOwn(this.axis.x, 'tf') && this.axis.x.tf.length;
	const bHasY = Object.hasOwn(this.axis.y, 'tf') && this.axis.y.tf.length;
	const bListens = bHasY
		? this.axis.y.tf === '#LISTENS#'
		: false;
	const bListensPerPeriod = bListens && bHasX && timePeriods.includes(this.axis.x.tf);
	const inputTF = (axis = 'x', bCopyCurrent = false) => {
		axis = axis.toLowerCase();
		if (bCopyCurrent) {
			const keyAxis = 'key' + axis.toUpperCase();
			return {
				[axis]: this.axis[axis].tf,
				[keyAxis]: this.axis[axis][keyAxis],
				bProportional: this.axis[axis].bProportional
			};
		} else {
			const axisTF = Input.string('string', this.axis[axis].tf.replace(/"/g, ''), 'Enter tag or TF expression:\n\n' + (axis === 'y' ? 'Expression should output a number per track (and TRUE value).\nFor example:\n\nListens: $max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%,0)\nRated 5 tracks: $ifequal(' + globTags.rating + ',5,1$not(0),0)' : 'For example:\n%GENRE%'), 'Axis ' + axis + ' TitleFormat', '%GENRE%');
			if (axisTF === null) { return; }
			const axisKey = Input.string('string', capitalizeAll(axisTF.replace(/[%"]/g, '')), 'Enter axis name:', 'Axis ' + axis + ' name', 'Date') || Input.lastInput;
			if (axisKey === null) { return; }
			return {
				[axis]: axisTF,
				['key' + axis.toUpperCase()]: axisKey,
				bProportional: axis === 'y' && WshShell.Popup('Proportional to total number of tracks per series?', 0, 'Y-data calculation', popup.question + popup.yes_no) === popup.yes
			};
		}
	};
	// Header
	menu.newEntry({ entryText: this.title, flags: MF_GRAYED });
	menu.newSeparator();
	// Menus
	{	// X
		const subMenu = menu.newMenu('Set X-axis data', void (0), Object.hasOwn(this.axis.x, 'tf') ? MF_CHECKED : MF_STRING);
		menu.newEntry({ menuName: subMenu, entryText: 'X-axis:', flags: MF_GRAYED });
		menu.newSeparator(subMenu);
		const list = JSON.parse(properties.xEntries[1]);
		list.push(...[
			{ name: 'sep' },
			{ x: '#DAY#', keyX: 'Day' + (bListens ? '' : ' (listens range)'), flags: bListens ? MF_STRING : MF_GRAYED },
			{ x: '#WEEK#', keyX: 'Week' + (bListens ? '' : ' (listens range)'), flags: bListens ? MF_STRING : MF_GRAYED },
			{ x: '#MONTH#', keyX: 'Month' + (bListens ? '' : ' (listens range)'), flags: bListens ? MF_STRING : MF_GRAYED },
			{ x: '#YEAR#', keyX: 'Year' + (bListens ? '' : ' (listen range)'), flags: bListens ? MF_STRING : MF_GRAYED }
		].map((v) => { return (Object.hasOwn(v, 'name') ? v : { ...v, name: 'By ' + v.keyX }); }));
		list.forEach((entry) => {
			if (menu.isSeparator(entry)) { menu.newSeparator(subMenu); }
			else {
				menu.newEntry({ menuName: subMenu, entryText: entry.name, func: () => this.setData(entry), flags: entry.flags || MF_STRING });
				menu.newCheckMenuLast(() => this.axis.x.tf === _qCond(entry.x));
			}
		});
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'By TF...\t' + _b(bHasY ? this.axis.x.tf.cut(10) : ''), func: () => {
				const entry = inputTF('x');
				if (entry) { this.setData(entry); }
			}
		});
		menu.newCheckMenuLast(() => list.filter(menu.isNotSeparator).findIndex((entry) => _qCond(entry.x) === this.axis.x.tf) === -1);
		menu.newSeparator(subMenu);
		_createSubMenuEditEntries(menu, subMenu, {
			name: 'Axis X TF entries',
			list,
			defaults: JSON.parse(properties.xEntries[3]),
			input: (bCopyCurrent) => inputTF('x', bCopyCurrent),
			bNumbered: true,
			bCopyCurrent: true,
			onBtnUp: (entries) => {
				properties.xEntries[1] = JSON.stringify(entries);
				overwriteProperties(properties);
			}
		});
	}
	{	// Y
		const subMenu = menu.newMenu('Set Y-axis data', void (0), Object.hasOwn(this.axis.y, 'tf') ? MF_CHECKED : MF_STRING);
		menu.newEntry({ menuName: subMenu, entryText: 'Y-axis:', flags: MF_GRAYED });
		menu.newSeparator(subMenu);
		const list = JSON.parse(properties.yEntries[1]);
		list.forEach((entry) => {
			if (menu.isSeparator(entry)) { menu.newSeparator(subMenu); }
			else {
				menu.newEntry({
					menuName: subMenu, entryText: entry.name, func: () => {
						if (bListensPerPeriod && _qCond(entry.y, true) !== globTags.playCount && entry.y !== '#LISTENS#') {
							const defaultX = JSON.parse(properties.xEntries[1])[0];
							entry.x = defaultX.x;
							entry.keyX = defaultX.keyX;
						}
						const bListens = entry.y === '#LISTENS#';
						const bProportional = entry.bProportional;
						const bTfY = isNaN(entry.y);
						if (!bHasY || bListens || bListensPerPeriod || bProportional || bTfY) {
							for (let key in groupBy) { groupBy[key] = null; }
							this.saveDataSettings({ groupBy });
						}
						this.setData(entry);
					}
				});
				menu.newCheckMenuLast(() => this.axis.y.tf === _qCond(entry.y) && this.axis.y.bProportional === entry.bProportional);
			}
		});
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'By TF...\t' + _b(bHasY ? this.axis.y.tf.cut(10) : ''), func: () => {
				const entry = inputTF('y');
				if (entry) { this.setData(entry); }
			}
		});
		menu.newCheckMenuLast(() => list.filter(menu.isNotSeparator).findIndex((entry) => this.axis.y.tf === _qCond(entry.y) && this.axis.y.bProportional === entry.bProportional) === -1);
		menu.newSeparator(subMenu);
		_createSubMenuEditEntries(menu, subMenu, {
			name: 'Axis Y TF entries',
			list,
			defaults: JSON.parse(properties.yEntries[3]),
			input: (bCopyCurrent) => inputTF('y', bCopyCurrent),
			bNumbered: true,
			bCopyCurrent: true,
			onBtnUp: (entries) => {
				properties.yEntries[1] = JSON.stringify(entries);
				overwriteProperties(properties);
			}
		});
	}
	if (bShowZ) {	// Z
		const bHasZ = Object.hasOwn(this.axis.z, 'tf');
		const subMenu = menu.newMenu('Set Z-axis data', void (0), bListensPerPeriod ? MF_GRAYED : bHasZ ? MF_CHECKED : MF_STRING);
		menu.newEntry({ menuName: subMenu, entryText: 'Z-axis:', flags: MF_GRAYED });
		menu.newSeparator(subMenu);
		const list = JSON.parse(properties.zEntries[1]);
		list.forEach((entry) => {
			if (menu.isSeparator(entry)) { menu.newSeparator(subMenu); }
			else {
				menu.newEntry({ menuName: subMenu, entryText: entry.name, func: () => this.setData(entry) });
				menu.newCheckMenuLast(() => this.axis.z.tf === _qCond(entry.z));
			}
		});
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'None (disable axis)', func: () => {
				this.axis.z = {};
				this.setData();
			}
		});
		menu.newCheckMenuLast(() => !bHasZ);
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'By TF...\t' + _b(bHasZ ? this.axis.z.tf.cut(10) : ''), func: () => {
				const entry = inputTF('z');
				if (entry) { this.setData(entry); }
			}
		});
		menu.newCheckMenuLast(() => bHasZ && list.filter(menu.isNotSeparator).findIndex((entry) => this.axis.z.tf === _qCond(entry.z)) === -1);
		menu.newSeparator(subMenu);
		_createSubMenuEditEntries(menu, subMenu, {
			name: 'Axis Z TF entries',
			list,
			defaults: JSON.parse(properties.zEntries[3]),
			input: (bCopyCurrent) => inputTF('z', bCopyCurrent),
			bNumbered: true,
			bCopyCurrent: true,
			onBtnUp: (entries) => {
				properties.zEntries[1] = JSON.stringify(entries);
				overwriteProperties(properties);
			}
		});
	}
	menu.newSeparator();
	{	// Group by
		const bProportional = bHasY ? this.axis.y.bProportional : false;
		const bTfY = bHasY ? isNaN(this.axis.y.tf) : false;
		const subMenu = menu.newMenu(
			'Aggregate by', void (0),
			!bHasY || bListens || bListensPerPeriod || bProportional || bTfY
				? MF_GRAYED
				: Object.keys(groupBy).some((key) => groupBy[key] !== null) ? MF_CHECKED : MF_STRING
		);
		menu.newEntry({ menuName: subMenu, entryText: 'Select tag for aggregation:', flags: MF_GRAYED });
		menu.newSeparator(subMenu);
		const options = [
			{ entryText: 'Album', groupBy: { y: '%ALBUM%', yKey: 'Albums' } },
			{ entryText: 'Artist', groupBy: { y: '%ARTIST%', yKey: 'Artists' } },
			{ entryText: 'Genre', groupBy: { y: globTags.genre, yKey: 'Genres' } },
			{ entryText: 'Style', groupBy: { y: globTags.style, yKey: 'Styles' } },
			{ entryText: 'Folksonomy', groupBy: { y: globTags.folksonomy, yKey: 'Tags' } },
		];
		options.forEach((option) => {
			menu.newEntry({
				menuName: subMenu, entryText: option.entryText, func: () => {
					for (let key in option.groupBy) {
						groupBy[key] = option.groupBy[key];
					}
					this.saveDataSettings({ groupBy });
					this.changeConfig({ axis: { y: { key: option.groupBy.yKey } }, callbackArgs: { bSaveProperties: true } });
					this.setData();
				}
			});
			menu.newCheckMenuLast(() => Object.keys(option.groupBy).every((key) => groupBy[key] === option.groupBy[key]));
		});
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'By TF...\t' + _b(groupBy.y !== null ? groupBy.y.cut(10) : ''), func: () => {
				groupBy.y = Input.string('string', groupBy.y || '%ALBUM%', 'Input desired tag for aggregation:', 'Y-Axis label', '%ALBUM%') || Input.lastInput;
				if (groupBy.y === null) { return; };
				groupBy.yKey = Input.string('string', groupBy.yKey || 'Albums', 'Input the desired Y-Axis label:', 'Y-Axis label', 'Albums') || Input.lastInput;
				if (groupBy.yKey === null) { return; };
				this.saveDataSettings({ groupBy });
				this.changeConfig({ axis: { y: { key: groupBy.yKey } }, callbackArgs: { bSaveProperties: true } });
				this.setData();
			}
		});
		menu.newCheckMenuLast(() => groupBy.y !== null && groupBy.yKey !== null && !options.some((option) => Object.keys(option.groupBy).every((key) => groupBy[key] === option.groupBy[key])));
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'None (disable aggregation)', func: () => {
				for (let key in groupBy) { groupBy[key] = null; }
				this.saveDataSettings({ groupBy });
				const input = Input.string('string', 'Tracks', 'Input the desired Y-Axis label:', 'Y-Axis label', 'Tracks') || Input.lastInput;
				if (input === null) { return; };
				this.changeConfig({ axis: { y: { key: input } }, callbackArgs: { bSaveProperties: true } });
				this.setData();
			}
		});
		menu.newCheckMenuLast(() => Object.values(groupBy).every((val) => val === null));
	}
	{	// Listens range
		const subMenu = menu.newMenu('Time range', void (0), !bListens && !bListensPerPeriod ? MF_GRAYED : (timeRange.timePeriod !== Infinity ? MF_CHECKED : MF_STRING));
		menu.newEntry({ menuName: subMenu, entryText: 'Select time range:', flags: MF_GRAYED });
		menu.newSeparator(subMenu);
		const options = [
			{ entryText: 'All', timePeriod: Infinity, timeKey: 'Days' },
			{ entryText: 'This year', timePeriod: 1, timeKey: 'nowYear' },
			{ entryText: 'This month', timePeriod: 1, timeKey: 'nowMonth' },
			{ entryText: 'This week', timePeriod: 1, timeKey: 'nowWeek' },
			{ entryText: 'This day', timePeriod: 1, timeKey: 'nowDay' },
		];
		options.forEach((option) => {
			menu.newEntry({
				menuName: subMenu, entryText: option.entryText, func: () => {
					timeRange.timePeriod = option.timePeriod;
					timeRange.timeKey = option.timeKey;
					this.saveDataSettings({ timeRange });
					this.setData({ optionArg: getTimeRange(properties) });
				}
			});
		});
		menu.newSeparator(subMenu);
		const days = getTimeRange(properties).timePeriod;
		menu.newEntry({
			menuName: subMenu, entryText: 'Last X days...\t' + _b(days || '\u221E'), func: () => {
				const input = Input.number('int positive', timeRange.timePeriod, 'Set number of days: ', 'Time range: last X days', 4);
				if (input === null) {
					if (!Input.isLastEqual || timeRange.timeKey === 'Days') { return; }
				} else {
					timeRange.timePeriod = input;
				}
				timeRange.timeKey = 'Days';
				properties.timeRange[1] = JSON.stringify(timeRange);
				overwriteProperties(properties);
				this.setData({ optionArg: getTimeRange(properties) });
			}
		});
		menu.newCheckMenuLast(() => {
			const idx = options.findIndex((opt) => opt.timePeriod === timeRange.timePeriod && opt.timeKey === timeRange.timeKey);
			return (idx !== -1 ? idx : timeRange.timePeriod === Infinity ? 0 : options.length);
		}, options.length + 2);
	}
	menu.newSeparator();
	{	// Data source
		const subMenu = menu.newMenu('Data source');
		menu.newEntry({ menuName: subMenu, entryText: 'Select source for tracks:', flags: MF_GRAYED });
		menu.newSeparator(subMenu);
		const options = [
			{ entryText: 'Library', sourceType: 'library' },
			{ entryText: 'Current playlist', sourceType: 'activePlaylist' },
			{ entryText: 'Playing playlist', sourceType: 'playingPlaylist' },
			{ entryText: 'Selected playlist(s)...', sourceType: 'playlist', sourceArg: null },
			{ entryText: 'Panel(s)...', sourceType: 'panel', sourceArg: null },
			{ entryText: 'Manual (drag n\' drop)', sourceType: 'handleList', sourceArg: null },
		];
		options.forEach((option) => {
			menu.newEntry({
				menuName: subMenu, entryText: option.entryText, func: () => {
					if (Object.hasOwn(option, 'sourceArg')) {
						if (option.sourceArg === null) {
							if (!['handleList', 'panel'].includes(option.sourceType)) {
								const input = Input.string('string', dataSource.sourceArg || '', 'Enter playlist name(s):\n(separated by |)', 'Playlist sources', 'My Playlist|Other Playlist', void (0), true) || Input.lastInput;
								if (input === null) { return; }
								dataSource.sourceArg = input.split('|');
							} else if ('panel' === option.sourceType) {
								const input = Input.string('string', dataSource.sourceArg || '', 'Enter source panel name:\n\n• To get the name, go to the panel to be used as source\n• Press Shift + Windows + R. Click and choose \'configure panel\'\n• Paste the panel name or ID, at the top, into here\n• Edit source panel name if required\n• For more than one source panel, use pipe separator, for ex:\n\tPanel 1|Panel 2', 'Playlist sources', 'Panel 1|Panel 2', void (0)) || Input.lastInput;
								if (input === null) { return; }
								dataSource.sourceArg = input.split('|');
								this.panelCache.uuid.push(...dataSource.sourceArg);
							}
						} else {
							dataSource.sourceArg = option.sourceArg;
						}
					}
					this.dragDropCache.RemoveAll(); // Delete any cached drag n' drop tracks
					dataSource.sourceType = option.sourceType;
					this.saveDataSettings({ dataSource });
					this.setData(dataSource);
					if (option.sourceType === 'panel') {
						window.NotifyOthers('Library-Tree-SMP: ask selection', this.panelCache.uuid);
					}
				}
			});
		});
		menu.newCheckMenuLast(() => {
			const idx = options.findIndex((opt) => opt.sourceType === dataSource.sourceType);
			return (idx !== -1 ? idx : 0);
		}, options);
	}
	{	// Data filtering
		const subMenu = menu.newMenu('Data deduplication', void (0), dataSource.bRemoveDuplicates ? MF_CHECKED : MF_STRING);
		menu.newEntry({
			menuName: subMenu, entryText: 'Remove duplicates', func: () => {
				dataSource.bRemoveDuplicates = !dataSource.bRemoveDuplicates;
				this.saveDataSettings({ dataSource });
				this.setData(dataSource);
			}
		});
		menu.newCheckMenuLast(() => dataSource.bRemoveDuplicates);
		menu.newSeparator(subMenu);
		[
			{ removeDuplicatesOptions: { checkKeys: [globTags.title, globTags.artist, 'MUSICBRAINZ_ALBUMID'] }, entryText: 'By Title|Artist|Album ID' },
			{ removeDuplicatesOptions: { checkKeys: [globTags.title, globTags.artist, 'ALBUM'] }, entryText: 'By Title|Artist|Album' },
			{ removeDuplicatesOptions: { checkKeys: [globTags.title, globTags.artist, '$year(%DATE%)'] }, entryText: 'By Title|Artist|Year' },
			{ removeDuplicatesOptions: { checkKeys: [globTags.title, globTags.artist] }, entryText: 'By Title|Artist' },
			{ removeDuplicatesOptions: { checkKeys: [globTags.title] }, entryText: 'By Title' },
		].forEach((opt) => {
			menu.newEntry({
				menuName: subMenu, entryText: opt.entryText, func: () => {
					dataSource.removeDuplicatesOptions = { ...dataSource.removeDuplicatesOptions, ...opt.removeDuplicatesOptions };
					this.saveDataSettings({ dataSource });
					this.setData(dataSource);
				}, flags: !dataSource.bRemoveDuplicates ? MF_GRAYED : MF_STRING
			});
			menu.newCheckMenuLast(() => Object.keys(opt.removeDuplicatesOptions).every((key) =>
				JSON.stringify(opt.removeDuplicatesOptions[key]) === JSON.stringify(dataSource.removeDuplicatesOptions[key])
			));
		});
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'By custom TF...' + '\t' + _b((dataSource.removeDuplicatesOptions.checkQueys || globTags.remDupl).join(', ').cut(10)), func: () => {
				const input = Input.json('array strings', dataSource.removeDuplicatesOptions.checkQueys || globTags.remDupl, 'Enter tags:\n', 'Deduplicate source tags', globTags.remDupl);
				if (input === null) { return; }
				this.saveDataSettings({ dataSource });
				this.setData(dataSource);
			}, flags: !dataSource.bRemoveDuplicates ? MF_GRAYED : MF_STRING
		});
	}
	{	// Data filtering
		const subMenu = menu.newMenu('Data filtering');
		menu.newEntry({ menuName: subMenu, entryText: 'By query:', flags: MF_GRAYED });
		menu.newSeparator(subMenu);
		const list = JSON.parse(properties.queryEntries[1]);
		list.forEach((entry) => {
			if (menu.isSeparator(entry)) { menu.newSeparator(subMenu); }
			else {
				menu.newEntry({
					menuName: subMenu, entryText: entry.name, func: () => {
						this.saveDataSettings(entry);
						this.setData(entry);
					}
				});
				menu.newCheckMenuLast(() => properties.dataQuery[1] === entry.query);
			}
		});
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'By query...', func: () => {
				const input = Input.string('string', properties.dataQuery[1], 'Enter query:\n(dynamic queries also allowed, see readme)', 'Filter source by query', 'ALL');
				if (input === null) { return; }
				this.saveDataSettings({ query: input });
				this.setData({ query: input });
			}
		});
		menu.newCheckMenuLast(() => list.filter(menu.isNotSeparator).findIndex((entry) => entry.query === properties.dataQuery[1]) === -1);
		menu.newSeparator(subMenu);
		_createSubMenuEditEntries(menu, subMenu, {
			name: 'Query entries',
			list,
			defaults: JSON.parse(properties.queryEntries[3]),
			input: () => Input.string('string', properties.dataQuery[1], 'Enter query:', 'Filter source by query', 'ALL'),
			bNumbered: true,
			onBtnUp: (entries) => {
				properties.queryEntries[1] = JSON.stringify(entries);
				overwriteProperties(properties);
			}
		});
	}
	{	// Data calculation
		const subMenu = menu.newMenu('Data calculation');
		menu.newEntry({
			menuName: subMenu, entryText: 'Asynchronous calculation', func: () => {
				properties.bAsync[1] = !properties.bAsync[1];
				overwriteProperties(properties);
			}
		});
		menu.newCheckMenuLast(() => properties.bAsync[1]);
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'Init data on startup', func: () => {
				this.changeConfig({ configuration: { bLoadAsyncData: !this.configuration.bLoadAsyncData }, callbackArgs: { bSaveProperties: true } });
				if (this.configuration.bLoadAsyncData) {
					fb.ShowPopupMessage('Chart will not display any data upon panel reload/startup until it\'s manually forced to do so using \'Force data refresh\' menu entry.\n\nThis may be used to improve loading times if chart is only meant to be used on demand.', 'Timeline-SMP');
				}
			}, flags: ['handleList'].includes(dataSource.sourceType) ? MF_GRAYED : MF_STRING
		});
		menu.newCheckMenuLast(() => !['handleList'].includes(dataSource.sourceType) && this.configuration.bLoadAsyncData);
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'Auto-refresh data sources', func: () => {
				properties.bAutoData[1] = !properties.bAutoData[1];
				overwriteProperties(properties);
			}, flags: ['library', 'handleList', 'panel'].includes(dataSource.sourceType) ? MF_GRAYED : MF_STRING
		});
		menu.appendToLast(dataSource.sourceType === 'library' ? '\t[non library]' : '');
		menu.newCheckMenuLast(() => !['library', 'handleList', 'panel'].includes(dataSource.sourceType) && properties.bAutoData[1]);
		const playingTF = JSON.parse(properties.playingTF[1]).map((tag) => tag.toUpperCase());
		const bAlways = isArrayEqual(playingTF, ['*']);
		const playingTFTip = bAlways
			? 'Always'
			: playingTF.length ? 'Tags' : 'Never';
		menu.newEntry({
			menuName: subMenu, entryText: 'On playback only by TF...' + '\t' + _b(playingTFTip), func: () => {
				const input = Input.json('array strings', playingTF, 'Enter tags:\n(Use ["*"] for all tags)', 'Auto-refresh sources by TitleFormat', '["PLAY_COUNT"]');
				if (input === null) { return; }
				properties.playingTF[1] = JSON.stringify(input.map((tag) => tag.toUpperCase()));
				overwriteProperties(properties);
			}, flags: ['library', 'handleList', 'panel'].includes(dataSource.sourceType) || !properties.bAutoData[1] ? MF_GRAYED : MF_STRING
		});
		menu.newCheckMenuLast(() => !['library', 'handleList', 'panel'].includes(dataSource.sourceType) && !!properties.playingTF[1].length);
		menu.newSeparator(subMenu);
		const subMenuTwo = menu.newMenu('Auto-refresh dynamic queries', subMenu, properties.dataQuery[1].count('#') >= 2 ? MF_STRING : MF_GRAYED);
		[
			{ key: 'onSelection', entryText: 'Selecting tracks (playlist)' },
			{ key: 'onPlayback', entryText: 'When playing a track' },
		].forEach((o) => {
			menu.newEntry({
				menuName: subMenuTwo, entryText: o.entryText, func: () => {
					dynQueryMode[o.key] = !dynQueryMode[o.key];
					properties.dynQueryMode[1] = JSON.stringify(dynQueryMode);
					overwriteProperties(properties);
					if (fb.IsPlaying) { refreshData(plman.PlayingPlaylist, 'on_playback_new_track_dynQuery'); }
				}, flags: o.key === 'preferPlayback' && !dynQueryMode.onPlayback ? MF_GRAYED : MF_STRING
			});
			menu.newCheckMenuLast(() => dynQueryMode[o.key]);
		});
		menu.newSeparator(subMenuTwo);
		menu.newEntry({
			menuName: subMenuTwo, entryText: 'Prefer now playing', func: () => {
				dynQueryMode.preferPlayback = !dynQueryMode.preferPlayback;
				properties.dynQueryMode[1] = JSON.stringify(dynQueryMode);
				overwriteProperties(properties);
			}, flags: !dynQueryMode.onPlayback ? MF_GRAYED : MF_STRING
		});
		menu.newCheckMenuLast(() => dynQueryMode.onPlayback && dynQueryMode.preferPlayback);
		menu.newEntry({
			menuName: subMenuTwo, entryText: 'Evaluate multiple selection', func: () => {
				dynQueryMode.multipleSelection = !dynQueryMode.multipleSelection;
				properties.dynQueryMode[1] = JSON.stringify(dynQueryMode);
				overwriteProperties(properties);
			}
		});
		menu.newCheckMenuLast(() => dynQueryMode.multipleSelection);
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'Max Refresh rate...\t' + _b(properties.dataRefreshRate[1] + ' ms'), func: () => {
				const input = Input.number('int positive', properties.dataRefreshRate[1], 'Set ms:\n(integer number ≥0)', 'Data max refresh rate', 250);
				if (input === null) { return; }
				properties.dataRefreshRate[1] = input;
				overwriteProperties(properties);
				window.Reload();
			}
		});
	}
	{	// Other
		menu.newSeparator();
		const subMenu = menu.newMenu('Other settings');
		{
			const subMenuTwo = menu.newMenu('Debug and testing', subMenu);
			menu.newEntry({
				menuName: subMenuTwo, entryText: 'Debug logging', func: () =>
					this.changeConfig({ configuration: { bDebug: !this.configuration.bDebug }, callbackArgs: { bSaveProperties: true } })
			});
			menu.newCheckMenuLast(() => this.configuration.bDebug);
			menu.newEntry({
				menuName: subMenuTwo, entryText: 'Profile logging', func: () =>
					this.changeConfig({ configuration: { bProfile: !this.configuration.bProfile }, callbackArgs: { bSaveProperties: true } })
			});
			menu.newCheckMenuLast(() => this.configuration.bProfile);
		}
		{
			const subMenuTwo = menu.newMenu('Updates', subMenu);
			menu.newEntry({
				menuName: subMenuTwo, entryText: 'Automatically check for updates', func: () => {
					properties.bAutoUpdateCheck[1] = !properties.bAutoUpdateCheck[1];
					overwriteProperties(properties);
					if (properties.bAutoUpdateCheck[1]) {
						if (typeof checkUpdate === 'undefined') { include('..\\..\\helpers\\helpers_xxx_web_update.js'); }
						setTimeout(checkUpdate, 1000, { bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false });
					}
				}
			});
			menu.newCheckMenuLast(() => properties.bAutoUpdateCheck[1]);
			menu.newSeparator(subMenuTwo);
			menu.newEntry({
				menuName: subMenuTwo, entryText: 'Check for updates...', func: () => {
					if (typeof checkUpdate === 'undefined') { include('..\\..\\helpers\\helpers_xxx_web_update.js'); }
					checkUpdate({ bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false })
						.then((bFound) => !bFound && fb.ShowPopupMessage('No updates found.', window.FullPanelName + ': Update check'));
				}
			});
		}
	}
	menu.newSeparator();
	menu.newEntry({
		entryText: 'Force data refresh', func: () => {
			this.setData();
		}
	});
	menu.newSeparator();
	{	// Readmes
		const subMenu = menu.newMenu('Readmes');
		(readmes || [
			{ path: folders.xxx + 'helpers\\readme\\timeline.txt', name: window.ScriptInfo.Name },
			{ path: folders.xxx + 'helpers\\readme\\timeline_dynamic_query.txt', name: 'Dynamic queries' }
		]).forEach((o) => {
			menu.newEntry({
				menuName: subMenu, entryText: o.name, func: () => {
					const readme = _open(o.path, utf8);
					if (readme.length) { fb.ShowPopupMessage(readme, o.name); }
					else { console.log('Statistics: readme not found\n\t ' + o.path); }
				}
			});
		});
	}
	return menu;
}

function onRbtnUpImportSettings(properties = this.properties || {}) {
	const menu = new _menu();
	menu.newEntry({ entryText: 'Panel menu: ' + window.PanelName, flags: MF_GRAYED });
	menu.newEntry({ entryText: 'Version: ' + window.ScriptInfo.Version, flags: MF_GRAYED });
	menu.newSeparator();
	// Generic code is left from other packages, but only JSON settings is used
	menu.newEntry({
		entryText: 'Export panel settings...', func: () => {
			exportSettings(
				properties,
				[],
				window.ScriptInfo.Name
			);
		}
	});
	menu.newEntry({
		entryText: 'Import panel settings...', func: () => {
			importSettings(
				void (0),
				properties,
				window.ScriptInfo.Name
			);
		}
	});
	menu.newSeparator();
	menu.newEntry({
		entryText: 'Share UI settings...', func: () => {
			charts.every((chart) => chart.shareUiSettings());
		}
	});
	menu.newSeparator();
	menu.newEntry({
		entryText: 'Configure panel...', func: () => window.ShowConfigureV2()
	});
	menu.newEntry({
		entryText: 'Panel properties...', func: () => window.ShowProperties()
	});
	menu.newSeparator();
	{
		const subMenuTwo = menu.newMenu('Updates');
		menu.newEntry({
			menuName: subMenuTwo, entryText: 'Automatically check for updates', func: () => {
				properties.bAutoUpdateCheck[1] = !properties.bAutoUpdateCheck[1];
				overwriteProperties(properties);
				if (properties.bAutoUpdateCheck[1]) {
					if (typeof checkUpdate === 'undefined') { include('..\\..\\helpers\\helpers_xxx_web_update.js'); }
					setTimeout(checkUpdate, 1000, { bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false });
				}
			}
		});
		menu.newCheckMenuLast(() => properties.bAutoUpdateCheck[1]);
		menu.newSeparator(subMenuTwo);
		menu.newEntry({
			menuName: subMenuTwo, entryText: 'Check for updates...', func: () => {
				if (typeof checkUpdate === 'undefined') { include('..\\..\\helpers\\helpers_xxx_web_update.js'); }
				checkUpdate({ bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false })
					.then((bFound) => !bFound && fb.ShowPopupMessage('No updates found.', window.FullPanelName + ': Update check'));
			}
		});
	}
	menu.newSeparator();
	menu.newEntry({
		entryText: 'Reload panel', func: () => window.Reload()
	});
	return menu;
}
'use strict';
//27/10/24

/* exported onLbtnUpPoint, onLbtnUpSettings*/

/* global _p:readable, checkQuery:readable, globTags:readable, globQuery:readable, round:readable, capitalizeAll:readable, properties:readable, WshShell:readable, popup:readable, _qCond:readable, overwriteProperties:readable, checkUpdate:readable, globSettings:readable , isArrayEqual:readable, _b:readable, folders:readable */
include('..\\..\\helpers\\helpers_xxx_file.js');
/* global _open:readable, utf8:readable */
include('..\\..\\helpers\\helpers_xxx_playlists.js');
/* global sendToPlaylist:readable */
include('..\\..\\helpers\\helpers_xxx_input.js');
/* global Input:readable */
include('..\\..\\helpers\\menu_xxx.js');
/* global MF_GRAYED:readable, _menu:readable, MF_STRING:readable */
include('..\\..\\helpers\\menu_xxx_extras.js');
/* global _createSubMenuEditEntries:readable */
include('..\\filter_and_query\\remove_duplicates.js');
/* global removeDuplicates:readable */
include('..\\window\\window_xxx_background_menu.js');
include('..\\..\\helpers-external\\namethatcolor\\ntc.js'); // For createBackgroundMenu() on createStatisticsMenu() call

function onLbtnUpPoint(point, x, y, mask) { // eslint-disable-line no-unused-vars
	// Constants
	const menu = new _menu();
	const bShowAllPoints = this.graph.multi && ['scatter', 'lines', 'fill'].includes(this.graph.type);
	const points = bShowAllPoints && this.dataDraw.length > 1
		? this.dataDraw.map((serie) => serie.find((p) => p.x === point.x)).flat(Infinity).filter(Boolean)
		: [point];
	// Header
	menu.newEntry({ entryText: this.title, flags: MF_GRAYED });
	menu.newEntry({ entryText: 'sep' });
	// Menus
	points.forEach((subPoint) => {
		const menuName = this.graph.multi ? menu.newMenu(subPoint.z) : menu.getMainMenuName();
		{	// Playlists
			const subMenu = [menu.newMenu('Create playlist', menuName), menu.newMenu('Create AutoPlaylist', menuName)];
			menu.newEntry({ menuName: subMenu[0], entryText: 'De-duplicated and randomized:', flags: MF_GRAYED });
			menu.newEntry({ menuName: subMenu[0], entryText: 'sep' });
			menu.newEntry({ menuName: subMenu[1], entryText: 'Configurable query:', flags: MF_GRAYED });
			menu.newEntry({ menuName: subMenu[1], entryText: 'sep' });
			const currPoints = this.dataDraw.map((serie) => serie.find((newPoint) => newPoint.x === point.x)).filter(Boolean);
			[
				{ name: 'By ' + this.axis.x.key, query: this.axis.x.tf + ' IS ' + subPoint.x, playlist: 'Timeline: ' + subPoint.x },
				...(this.graph.multi
					? [
						{ name: 'By ' + this.axis.z.key, query: this.axis.z.tf + ' IS ' + subPoint.z, playlist: 'Timeline: ' + subPoint.z },
						{
							name: 'By ' + this.axis.x.key + ' and ' + this.axis.z.key, query: this.axis.x.tf + ' IS ' + subPoint.x + ' AND ' + this.axis.z.tf + ' IS ' + subPoint.z,
							playlist: 'Timeline: ' + subPoint.x + ' - ' + subPoint.z
						},
						{
							name: 'By ' + this.axis.x.key + ' and top ' + this.axis.z.key, query: this.axis.x.tf + ' IS ' + subPoint.x + ' AND ' + _p(currPoints.map((newPoint) => this.axis.z.tf + ' IS ' + newPoint.z).join(' OR ')),
							playlist: 'Timeline: ' + subPoint.x + ' - Top ' + currPoints.length + ' ' + this.axis.z.key
						}
					]
					: [])
			].filter(Boolean).forEach((entry) => {
				menu.newEntry({
					menuName: subMenu[0], entryText: entry.name, func: () => {
						if (checkQuery(entry.query)) {
							let handleList = fb.GetQueryItems(fb.GetLibraryItems(), entry.query);
							handleList = removeDuplicates({ handleList, sortOutput: '', checkKeys: globTags.remDupl, sortBias: globQuery.remDuplBias, bAdvTitle: true, bMultiple: true, bPreserveSort: false });
							sendToPlaylist(handleList, entry.playlist);
						}
					}
				});
				menu.newEntry({
					menuName: subMenu[1], entryText: entry.name, func: () => {
						if (checkQuery(entry.query)) {
							plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, entry.playlist, entry.query);
						}
					}
				});
			});
		}
		menu.newEntry({ menuName, entryText: 'sep' });
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
							: '[Z] None' + '\n'
					) +
					'Average ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + stats.current.avg + ' ' + _p(stats.current.avg100 + '%') +
					'\n' +
					'Total ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + stats.current.total +
					'\n' +
					(
						this.graph.multi
							? 'Total Tracks (any ' + this.axis.x.key + ') -not deduplicated-: ' + fb.GetQueryItems(libItems, this.axis.z.tf + ' IS ' + subPoint.z).Count +
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
					, window.Name + ': Point statistics'
				);
			}
		});
	});
	return menu.btn_up(x, y);
}

function onLbtnUpSettings() {
	// Constants
	const menu = new _menu();
	const dataSource = JSON.parse(properties.dataSource[1]);
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
			const axisTF = Input.string('string', this.axis[axis].tf, 'Enter tag or TF expression:\n\n' + (axis === 'y' ? 'Expression should output a number per track (and TRUE). For example:\nListens: $max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%,0)\nRated 5 tracks: $ifequal(%RATING%,5,1$not(0),0)' : 'For example:\n%GENRE%'), window.Name, '%GENRE%');
			if (axisTF === null) { return; }
			const axisKey = Input.string('string', capitalizeAll(axisTF.replace(/%/g, '')), 'Enter axis name:', window.Name, 'Date') || Input.lastInput;
			if (axisKey === null) { return; }
			return {
				[axis]: axisTF,
				['key' + axis.toUpperCase()]: axisKey,
				bProportional: axis === 'y' && WshShell.Popup('Proportional to total number of tracks per serie?', 0, window.Name, popup.question + popup.yes_no) === popup.yes
			};
		}
	};
	// Header
	menu.newEntry({ entryText: this.title, flags: MF_GRAYED });
	menu.newEntry({ entryText: 'sep' });
	// Menus
	{
		const subMenu = menu.newMenu('Set X-axis data');
		menu.newEntry({ menuName: subMenu, entryText: 'X-axis:', flags: MF_GRAYED });
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		const list = JSON.parse(properties.xEntries[1]);
		list.forEach((entry) => {
			if (entry.name === 'sep') { menu.newEntry({ menuName: subMenu, entryText: 'sep' }); }
			else {
				menu.newEntry({ menuName: subMenu, entryText: entry.name, func: () => this.setData(entry) });
				menu.newCheckMenuLast(() => this.axis.x.tf === _qCond(entry.x));
			}
		});
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		menu.newEntry({
			menuName: subMenu, entryText: 'By TF...', func: () => {
				const entry = inputTF('x');
				if (entry) { this.setData(entry); }
			}
		});
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
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
	{
		const subMenu = menu.newMenu('Set Y-axis data');
		menu.newEntry({ menuName: subMenu, entryText: 'Y-axis:', flags: MF_GRAYED });
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		const list = JSON.parse(properties.yEntries[1]);
		list.forEach((entry) => {
			if (entry.name === 'sep') { menu.newEntry({ menuName: subMenu, entryText: 'sep' }); }
			else {
				menu.newEntry({ menuName: subMenu, entryText: entry.name, func: () => this.setData(entry) });
				menu.newCheckMenuLast(() => this.axis.y.tf === _qCond(entry.y) && this.axis.y.bProportional === entry.bProportional);
			}
		});
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		menu.newEntry({
			menuName: subMenu, entryText: 'By TF...', func: () => {
				const entry = inputTF('y');
				if (entry) { this.setData(entry); }
			}
		});
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
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
	{
		const subMenu = menu.newMenu('Set Z-axis data');
		menu.newEntry({ menuName: subMenu, entryText: 'Z-axis:', flags: MF_GRAYED });
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		const list = JSON.parse(properties.zEntries[1]);
		list.forEach((entry) => {
			if (entry.name === 'sep') { menu.newEntry({ menuName: subMenu, entryText: 'sep' }); }
			else {
				menu.newEntry({ menuName: subMenu, entryText: entry.name, func: () => this.setData(entry) });
				menu.newCheckMenuLast(() => this.axis.z.tf === _qCond(entry.z));
			}
		});
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		menu.newEntry({
			menuName: subMenu, entryText: 'None (disable axis)', func: () => {
				this.axis.z = {};
				this.setData();
			}
		});
		menu.newCheckMenuLast(() => !Object.hasOwn(this.axis.z, 'tf'));
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		menu.newEntry({
			menuName: subMenu, entryText: 'By TF...', func: () => {
				const entry = inputTF('z');
				if (entry) { this.setData(entry); }
			}
		});
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
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
	menu.newEntry({ entryText: 'sep' });
	{
		const subMenu = menu.newMenu('Data source');
		menu.newEntry({ menuName: subMenu, entryText: 'Select source for tracks:', flags: MF_GRAYED });
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		const options = [
			{ entryText: 'Library', sourceType: 'library' },
			{ entryText: 'Current playlist', sourceType: 'activePlaylist' },
			{ entryText: 'Playing playlist', sourceType: 'playingPlaylist' },
			{ entryText: 'Selected playlist(s)...', sourceType: 'playlist', sourceArg: null },
		];
		options.forEach((option) => {
			menu.newEntry({
				menuName: subMenu, entryText: option.entryText, func: () => {
					if (Object.hasOwn(option, 'sourceArg')) {
						if (option.sourceArg === null) {
							const input = Input.string('string', dataSource.sourceArg || '', 'Enter playlist name(s):\n(separated by ;)', window.Name, 'My Playlist;Other Playlist', void (0), true) || Input.lastInput;
							if (input === null) { return; }
							dataSource.sourceArg = input.split(';');
						} else {
							dataSource.sourceArg = option.sourceArg;
						}
					}
					dataSource.sourceType = option.sourceType;
					properties.dataSource[1] = JSON.stringify(dataSource);
					overwriteProperties(properties);
					this.setData({ ...dataSource });
				}
			});
		});
		menu.newCheckMenuLast(() => {
			const idx = options.findIndex((opt) => opt.sourceType === dataSource.sourceType);
			return (idx !== -1 ? idx : 0);
		}, options);
	}
	menu.newEntry({ entryText: 'sep' });
	{
		const subMenu = menu.newMenu('Filter data');
		menu.newEntry({ menuName: subMenu, entryText: 'By query:', flags: MF_GRAYED });
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		const list = JSON.parse(properties.queryEntries[1]);
		list.forEach((entry) => {
			if (entry.name === 'sep') { menu.newEntry({ menuName: subMenu, entryText: 'sep' }); }
			else {
				menu.newEntry({
					menuName: subMenu, entryText: entry.name, func: () => {
						properties.dataQuery[1] = entry.query;
						overwriteProperties(properties);
						this.setData(entry);
					}
				});
				menu.newCheckMenuLast(() => properties.dataQuery[1] === entry.query);
			}
		});
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		menu.newEntry({
			menuName: subMenu, entryText: 'By query...', func: () => {
				const input = Input.string('string', properties.dataQuery[1], 'Enter query:', window.Name, 'ALL');
				if (input === null) { return; }
				properties.dataQuery[1] = input;
				overwriteProperties(properties);
				this.setData({ query: input });
			}
		});
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		_createSubMenuEditEntries(menu, subMenu, {
			name: 'Query entries',
			list,
			defaults: JSON.parse(properties.queryEntries[3]),
			input: () => Input.string('string', properties.dataQuery[1], 'Enter query:', window.Name, 'ALL'),
			bNumbered: true,
			onBtnUp: (entries) => {
				properties.queryEntries[1] = JSON.stringify(entries);
				overwriteProperties(properties);
			}
		});
	}
	{
		menu.newEntry({ entryText: 'sep' });
		const subMenu = menu.newMenu('Other settings');
		menu.newEntry({
			menuName: subMenu, entryText: 'Asynchronous calculation', func: () => {
				properties.bAsync[1] = !properties.bAsync[1];
				overwriteProperties(properties);
			}
		});
		menu.newCheckMenuLast(() => properties.bAsync[1]);
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		menu.newEntry({
			menuName: subMenu, entryText: 'Init data on startup', func: () => {
				this.changeConfig({ configuration: { bLoadAsyncData: !this.configuration.bLoadAsyncData }, callbackArgs: { bSaveProperties: true } });
				if (this.configuration.bLoadAsyncData) {
					fb.ShowPopupMessage('Chart will not display any data upon panel reload/startup until it\'s manually forced to do so using \'Force data update\' menu entry.\n\nThis may be used to improve loading times if chart is only meant to be used on demand.', 'Timeline-SMP');
				}
			}
		});
		menu.newCheckMenuLast(() => this.configuration.bLoadAsyncData);
		menu.newEntry({
			menuName: subMenu, entryText: 'Auto-update data sources', func: () => {
				properties.bAutoData[1] = !properties.bAutoData[1];
				overwriteProperties(properties);
			}, flags: dataSource.sourceType === 'library' ? MF_GRAYED : MF_STRING
		});
		menu.appendToLast(dataSource.sourceType === 'library' ? '\t[non library]' : '');
		menu.newCheckMenuLast(() => properties.bAutoData[1]);
		const playingTF = JSON.parse(properties.playingTF[1]).map((tag) => tag.toUpperCase());
		const bAlways = isArrayEqual(playingTF, ['*']);
		const playingTFTip = bAlways
			? 'Always'
			: playingTF.length ? 'Tags' : 'Never';
		menu.newEntry({
			menuName: subMenu, entryText: 'On playback only by TF...' + '\t' + _b(playingTFTip), func: () => {
				const input = Input.json('array strings', playingTF, 'Enter tags:\n(Use ["*"] for all tags)', window.Name, '["PLAY_COUNT"]');
				if (input === null) { return; }
				properties.playingTF[1] = JSON.stringify(input.map((tag) => tag.toUpperCase()));
				overwriteProperties(properties);
			}, flags: dataSource.sourceType === 'library' || !properties.bAutoData[1] ? MF_GRAYED : MF_STRING
		});
		menu.newCheckMenuLast(() => !!properties.playingTF[1].length);
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
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
		menu.newEntry({ menuName: subMenu, entryText: 'sep' });
		menu.newEntry({
			menuName: subMenu, entryText: 'Automatically check for updates', func: () => {
				properties.bAutoUpdateCheck[1] = !properties.bAutoUpdateCheck[1];
				overwriteProperties(properties);
				if (properties.bAutoUpdateCheck[1]) {
					if (typeof checkUpdate === 'undefined') { include('helpers\\helpers_xxx_web_update.js'); }
					setTimeout(checkUpdate, 1000, { bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false });
				}
			}
		});
		menu.newCheckMenuLast(() => properties.bAutoUpdateCheck[1]);
		menu.newEntry({
			menuName: subMenu, entryText: 'Check for updates...', func: () => {
				if (typeof checkUpdate === 'undefined') { include('helpers\\helpers_xxx_web_update.js'); }
				checkUpdate({ bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false })
					.then((bFound) => !bFound && fb.ShowPopupMessage('No updates found.', window.Name));
			}
		});
	}
	menu.newEntry({ entryText: 'sep' });
	menu.newEntry({
		entryText: 'Force data update', func: () => {
			this.setData();
		}
	});
	menu.newEntry({ entryText: 'sep' });
	{	// Readme
		const path = folders.xxx + 'helpers\\readme\\timeline.txt';
		menu.newEntry({
			entryText: 'Open readme...', func: () => {
				const readme = _open(path, utf8);
				if (readme.length) { fb.ShowPopupMessage(readme, 'Timeline-SMP'); }
				else { console.log('Readme not found: ' + path); }
			}
		});
	}
	return menu;
}
'use strict';
//20/11/23

include('..\\..\\helpers\\helpers_xxx_playlists.js');
include('..\\..\\helpers\\helpers_xxx_input.js');
include('..\\..\\helpers\\menu_xxx.js');
include('..\\..\\helpers\\menu_xxx_extras.js');
include('..\\filter_and_query\\remove_duplicates.js');

function onLbtnUpPoint(point, x, y, mask) { 
	// Constants
	const menu = new _menu();
	// Header
	menu.newEntry({entryText: this.title, flags: MF_GRAYED});
	menu.newEntry({entryText: 'sep'});
	// Menus
	{
		const subMenu = menu.newMenu('Create playlist...');
		menu.newEntry({menuName: subMenu, entryText: 'De-duplicated and randomized:', flags: MF_GRAYED});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		[
			{name: 'By ' + this.axis.x.key, func: () => {
				const query = this.axis.x.tf + ' IS ' + point.x;
				if (checkQuery(query)) {
					let handleList = fb.GetQueryItems(fb.GetLibraryItems(), query);
					handleList = removeDuplicatesV2({handleList, sortOutput: '', checkKeys: globTags.remDupl, sortBias: globQuery.remDuplBias, bAdvTitle: true, bPreserveSort: false});
					sendToPlaylist(handleList, 'Timeline: ' + point.x);
				}
			}},
			{name: 'By ' + this.axis.z.key, func: () => {
				const query = this.axis.z.tf + ' IS ' + point.z;
				if (checkQuery(query)) {
					let handleList = fb.GetQueryItems(fb.GetLibraryItems(), query);
					handleList = removeDuplicatesV2({handleList, sortOutput: '', checkKeys: globTags.remDupl, sortBias: globQuery.remDuplBias, bAdvTitle: true, bPreserveSort: false});
					sendToPlaylist(handleList, 'Timeline: ' + point.z, query);
				}
			}},
			{name: 'By ' + this.axis.x.key + ' and ' + this.axis.z.key, func: () => {
				const query = this.axis.x.tf + ' IS ' + point.x + ' AND ' + this.axis.z.tf + ' IS ' + point.z;
				if (checkQuery(query)) {
					let handleList = fb.GetQueryItems(fb.GetLibraryItems(), query);
					handleList = removeDuplicatesV2({handleList, sortOutput: '', checkKeys: globTags.remDupl, sortBias: globQuery.remDuplBias, bAdvTitle: true, bPreserveSort: false});
					sendToPlaylist(handleList, 'Timeline: ' + point.x + ' - ' + point.z);
				}
			}},
			{name: 'By ' + this.axis.x.key + ' and top ' + this.axis.z.key, func: () => {
				const points = this.dataDraw.map((serie) => serie.find((newPoint) => newPoint.x === point.x));
				const query = this.axis.x.tf + ' IS ' + point.x + ' AND ' + _p(points.map((point) => this.axis.z.tf + ' IS ' + point.z).join(' OR '));
				if (checkQuery(query)) {
					let handleList = fb.GetQueryItems(fb.GetLibraryItems(), query);
					handleList = removeDuplicatesV2({handleList, sortOutput: '', checkKeys: globTags.remDupl, sortBias: globQuery.remDuplBias, bAdvTitle: true, bPreserveSort: false});
					sendToPlaylist(handleList, 'Timeline: ' + point.x + ' - Top ' + points.length + ' ' + this.axis.z.key);
				}
			}},
		].forEach((entry) => {
			menu.newEntry({menuName: subMenu, entryText: entry.name, func: entry.func});
		}) 
	}
	{
		const subMenu = menu.newMenu('Create AutoPlaylist...');
		menu.newEntry({menuName: subMenu, entryText: 'Configurable query:', flags: MF_GRAYED});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		[
			{name: 'By ' + this.axis.x.key, func: () => {
				const query = this.axis.x.tf + ' IS ' + point.x;
				if (checkQuery(query)) {
					plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, 'Timeline: ' + point.x, query);
				}
			}},
			{name: 'By ' + this.axis.z.key, func: () => {
				const query = this.axis.z.tf + ' IS ' + point.z;
				if (checkQuery(query)) {
					plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, 'Timeline: ' + point.z, query);
				}
			}},
			{name: 'By ' + this.axis.x.key + ' and ' + this.axis.z.key, func: () => {
				const query = this.axis.x.tf + ' IS ' + point.x + ' AND ' + this.axis.z.tf + ' IS ' + point.z;
				if (checkQuery(query)) {
					plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, 'Timeline: ' + point.x + ' - ' + point.z, query);
				}
			}},
			{name: 'By ' + this.axis.x.key + ' and top ' + this.axis.z.key, func: () => {
				const points = this.dataDraw.map((serie) => serie.find((newPoint) => newPoint.x === point.x));
				const query = this.axis.x.tf + ' IS ' + point.x + ' AND ' + _p(points.map((point) => this.axis.z.tf + ' IS ' + point.z).join(' OR '));
				if (checkQuery(query)) {
					plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, 'Timeline: ' + point.x + ' - Top ' + points.length + ' ' + this.axis.z.key, query);
				}
			}},
		].forEach((entry) => {
			menu.newEntry({menuName: subMenu, entryText: entry.name, func: entry.func});
		}) 
	}
	menu.newEntry({entryText: 'sep'});
	menu.newEntry({entryText: 'Point statistics', func: () => {
		const report = '';
		const avg = this.data[0]
			.map((pointArr) => pointArr.map((subPoint) => subPoint.y)).flat(Infinity)
			.reduce((acc, curr, i, arr) => acc + (curr - acc) / (i + 1), 0);
		const avgCurr = this.data[0]
			.map((pointArr) => pointArr.filter((dataPoint) => dataPoint.z === point.z))
			.map((pointArr) => pointArr.map((subPoint) => subPoint.y)).flat(Infinity)
			.reduce((acc, curr, i, arr) => acc + (curr - acc) / (i + 1), 0);
		const libItems = fb.GetLibraryItems();
		fb.ShowPopupMessage(
			this.axis.z.key + ':\t' + point.z +
			'\n' + 
			this.axis.x.key + ':\t' + point.x +
			'\n' + 
			this.axis.y.key + ':\t' + point.y + ' ' + _p(round(point.y / libItems.Count * 100, 2) + '%') +
			'\n' + 
			'Average ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + Math.round(avgCurr) + ' ' + _p(round(avgCurr / libItems.Count * 100, 2) + '%') +
			'\n' + 
			'Total ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + fb.GetQueryItems(libItems, this.axis.z.tf + ' IS ' + point.z).Count +
			'\n' + 
			'-'.repeat(40) +
			'\n' + 
			'Global total ' + this.axis.y.key + ': ' + libItems.Count +
			'\n' + 
			'Global average ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + Math.round(avg) +  ' ' + _p(round(avg / libItems.Count * 100, 2) + '%')
		, window.Name + ': Point statistics');
	}});
	return menu.btn_up(x, y);
}

function onLbtnUpSettings() { 
	// Constants
	const menu = new _menu();
	const setData = (entry) => {
		const newConfig = {
			[properties.bAsync[1] ? 'dataAsync' : 'data']: (properties.bAsync[1] ? getDataAsync : getData)(
				'timeline',
				entry.x || _qCond(this.axis.x.tf, true),
				query_join([
					entry.hasOwnProperty('query') ? entry.query : properties.dataQuery[1],
					(entry.hasOwnProperty('z') ? _qCond(entry.z) : this.axis.z.tf) + ' PRESENT AND ' + (entry.hasOwnProperty('x') ? _qCond(entry.x) : this.axis.x.tf) + ' PRESENT'
				], 'AND'),
				entry.z || _qCond(this.axis.z.tf, true),
				entry.y || _qCond(this.axis.y.tf, true),
				entry.bProportional
			),
			axis: {}
		};
		if (entry.x) {newConfig.axis.x = {key: entry.keyX, tf: _qCond(entry.x)};}
		if (entry.y) {newConfig.axis.y = {key: entry.keyY, tf: _qCond(entry.y), bProportional: entry.bProportional};}
		if (entry.z) {newConfig.axis.z = {key: entry.keyZ, tf: _qCond(entry.z)};}
		this.changeConfig({...newConfig, bPaint: true});
		this.changeConfig({title: window.Name + ' - ' + 'Graph 1 {' + this.axis.x.key + ' - ' + this.axis.y.key + '}', bPaint: false, callbackArgs: {bSaveProperties: true}});
	};
	const inputTF = (axis = 'x') => {
		axis = axis.toLowerCase();
		const input = Input.string('string', '', 'Enter tag or TF expression:\n\n' + (axis === 'y' ? 'Expression should output a number per track (and TRUE). For example:\nListens: %PLAY_COUNT%\nRated 5 tracks: $ifequal(%RATING%,5,1$not(0),0)' : 'For example:\n%GENRE%'), window.Name, '%GENRE%');
		if (input === null) {return;}
		return {
			[axis]: input,
			['key' + axis.toUpperCase()]: Input.string('string', input, 'Enter axis name:', window.Name, 'Date') || input,
			bProportional: axis === 'y' && WshShell.Popup('Proportional to total number of tracks per serie?', 0, window.Name, popup.question + popup.yes_no) === popup.yes
		};
	};
	// Header
	menu.newEntry({entryText: this.title, flags: MF_GRAYED});
	menu.newEntry({entryText: 'sep'});
	// Menus
	{
		const subMenu = menu.newMenu('Set X-axis data...');
		menu.newEntry({menuName: subMenu, entryText: 'By TF:', flags: MF_GRAYED});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		const list = JSON.parse(properties.xEntries[1]);
		list.forEach((entry) => {
			if (entry.name === 'sep') {menu.newEntry({menuName: subMenu, entryText: 'sep'});}
			else {
				menu.newEntry({menuName: subMenu, entryText: entry.name, func: setData.bind(this, entry)});
				menu.newCheckMenu(subMenu, entry.name, void(0),  () => this.axis.x.tf === _qCond(entry.x));
			}
		});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		menu.newEntry({menuName: subMenu, entryText: 'By TF...', func: () => {
			const entry = inputTF('x');
			if (entry) {setData.call(this, entry);}
		}});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		_createSubMenuEditEntries(menu, subMenu, {
			name: 'Axis X TF entries',
			list, 
			defaults: JSON.parse(properties.xEntries[3]), 
			input: () => inputTF('x'),
			bNumbered: true,
			onBtnUp: (entries) => {
				properties.xEntries[1] = JSON.stringify(entries);
				overwriteProperties(properties);
			}
		});
	}
	{
		const subMenu = menu.newMenu('Set Y-axis data...');
		menu.newEntry({menuName: subMenu, entryText: 'By TF:', flags: MF_GRAYED});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		const list = JSON.parse(properties.yEntries[1]);
		list.forEach((entry) => {
			if (entry.name === 'sep') {menu.newEntry({menuName: subMenu, entryText: 'sep'});}
			else {
				menu.newEntry({menuName: subMenu, entryText: entry.name, func: setData.bind(this, entry)});
				menu.newCheckMenu(subMenu, entry.name, void(0),  () => this.axis.y.tf === _qCond(entry.y) && this.axis.y.bProportional === entry.bProportional);
			}
		});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		menu.newEntry({menuName: subMenu, entryText: 'By TF...', func: () => {
			const entry = inputTF('y');
			if (entry) {setData.call(this, entry);}
		}});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		_createSubMenuEditEntries(menu, subMenu, {
			name: 'Axis Y TF entries',
			list, 
			defaults: JSON.parse(properties.yEntries[3]), 
			input: () => inputTF('y'),
			bNumbered: true,
			onBtnUp: (entries) => {
				properties.yEntries[1] = JSON.stringify(entries);
				overwriteProperties(properties);
			}
		});
	}
	{
		const subMenu = menu.newMenu('Set Z-axis data...');
		menu.newEntry({menuName: subMenu, entryText: 'By TF:', flags: MF_GRAYED});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		const list = JSON.parse(properties.zEntries[1]);
		list.forEach((entry) => {
			if (entry.name === 'sep') {menu.newEntry({menuName: subMenu, entryText: 'sep'});}
			else {
				menu.newEntry({menuName: subMenu, entryText: entry.name, func: setData.bind(this, entry)});
				menu.newCheckMenu(subMenu, entry.name, void(0),  () => this.axis.z.tf === _qCond(entry.z));
			}
		});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		menu.newEntry({menuName: subMenu, entryText: 'By TF...', func: () => {
			const entry = inputTF('z');
			if (entry) {setData.call(this, entry);}
		}});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		_createSubMenuEditEntries(menu, subMenu, {
			name: 'Axis Z TF entries',
			list, 
			defaults: JSON.parse(properties.zEntries[3]), 
			input: () => inputTF('z'),
			bNumbered: true,
			onBtnUp: (entries) => {
				properties.zEntries[1] = JSON.stringify(entries);
				overwriteProperties(properties);
			}
		});
	}
	menu.newEntry({entryText: 'sep'});
	{
		const subMenu = menu.newMenu('Filter data...');
		menu.newEntry({menuName: subMenu, entryText: 'By query:', flags: MF_GRAYED});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		const list = JSON.parse(properties.queryEntries[1]);
		list.forEach((entry) => {
			if (entry.name === 'sep') {menu.newEntry({menuName: subMenu, entryText: 'sep'});}
			else {
				menu.newEntry({menuName: subMenu, entryText: entry.name, func: () => {
					properties.dataQuery[1] = entry.query;
					overwriteProperties(properties);
					setData.call(this, entry);
				}});
				menu.newCheckMenu(subMenu, entry.name, void(0), () => properties.dataQuery[1] === entry.query);
			}
		});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		menu.newEntry({menuName: subMenu, entryText: 'By query...', func: () => {
			const input = Input.string('string', properties.dataQuery[1], 'Enter query:', window.Name, 'ALL');
			if (input === null) {return;}
			properties.dataQuery[1] = input;
			overwriteProperties(properties);
			setData.call(this, {query: input})
		}});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
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
		menu.newEntry({entryText: 'sep'});
		const subMenu = menu.newMenu('Other settings...');
		menu.newEntry({menuName: subMenu, entryText: 'Asynchronous calculation', func: () => {
			properties.bAsync[1] = !properties.bAsync[1];
			overwriteProperties(properties);
		}});
		menu.newCheckMenu(subMenu, 'Asynchronous calculation', void(0), () => properties.bAsync[1]);
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		menu.newEntry({menuName: subMenu, entryText: 'Automatically check for updates', func: () => {
			properties.bAutoUpdateCheck[1] = !properties.bAutoUpdateCheck[1];
			overwriteProperties(properties);
			if (properties.bAutoUpdateCheck[1]) {
				if (typeof checkUpdate === 'undefined') {include('helpers\\helpers_xxx_web_update.js');}
				setTimeout(checkUpdate, 1000, {bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false});
			}
		}});
		menu.newCheckMenu(subMenu, 'Automatically check for updates', void(0),  () => properties.bAutoUpdateCheck[1]);
	}
	menu.newEntry({entryText: 'sep'});
	menu.newEntry({entryText: 'Check for updates...',  func: () => {
		if (typeof checkUpdate === 'undefined') {include('helpers\\helpers_xxx_web_update.js');}
		checkUpdate({bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false})
			.then((bFound) => !bFound && fb.ShowPopupMessage('No updates found.', window.Name));
	}});
	return menu;
}
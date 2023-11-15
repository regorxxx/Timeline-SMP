'use strict';
//09/11/23

include('..\\..\\helpers\\helpers_xxx_playlists.js');
include('..\\..\\helpers\\helpers_xxx_input.js');
include('..\\..\\helpers\\menu_xxx.js');
include('..\\..\\helpers\\menu_xxx_extras.js');
include('..\\filter_and_query\\remove_duplicates.js');

function onLbtnUpPoint(point, x, y) { 
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
			this.axis.y.key + ':\t' + point.y +
			'\n' + 
			'Average ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + Math.round(avgCurr) +
			'\n' + 
			'Total ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + fb.GetQueryItems(libItems, this.axis.z.tf + ' IS ' + point.z).Count +
			'\n' + 
			'-'.repeat(40) +
			'\n' + 
			'Global total ' + this.axis.y.key + ' : ' + libItems.Count +
			'\n' + 
			'Global average ' + this.axis.y.key + ' (any ' + this.axis.x.key + '): ' + Math.round(avg)
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
				entry.hasOwnProperty('query')
					? entry.query 
					: (entry.hasOwnProperty('z') ? _qCond(entry.z) : this.axis.z.tf) + ' PRESENT AND ' + (entry.hasOwnProperty('x') ? _qCond(entry.x) : this.axis.x.tf) + ' PRESENT',
				entry.z || _qCond(this.axis.z.tf, true)
			),
			axis: {}
		};
		if (entry.x) {newConfig.axis.x = {key: entry.keyX, tf: _qCond(entry.x)};}
		if (entry.y) {newConfig.axis.y = {key: entry.keyY, tf: _qCond(entry.y)};}
		if (entry.z) {newConfig.axis.z = {key: entry.keyZ, tf: _qCond(entry.z)};}
		this.changeConfig({...newConfig, bPaint: true});
		this.changeConfig({title: window.Name + ' - ' + 'Graph 1 {' + this.axis.x.key + ' - ' + this.axis.y.key + '}', bPaint: false, callbackArgs: {bSaveProperties: true}});
	};
	const inputTF = (axis = 'x') => {
		const input = Input.string('string', '', 'Enter tag or TF expression:\n\nFor example:\n%GENRE%', window.Name, '%GENRE%');
		if (input === null) {return;}
		return axis.toLowerCase() === 'x'
			? {x: input, keyX: Input.string('string', input, 'Enter axis name:', window.Name, 'Date') || input}
			: {z: input, keyZ: Input.string('string', input, 'Enter axis name:', window.Name, 'Date') || input};
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
			else {menu.newEntry({menuName: subMenu, entryText: entry.name, func: setData.bind(this, entry)});}
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
		const subMenu = menu.newMenu('Set Z-axis data...');
		menu.newEntry({menuName: subMenu, entryText: 'By TF:', flags: MF_GRAYED});
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		const list = JSON.parse(properties.zEntries[1]);
		list.forEach((entry) => {
			if (entry.name === 'sep') {menu.newEntry({menuName: subMenu, entryText: 'sep'});}
			else {menu.newEntry({menuName: subMenu, entryText: entry.name, func: setData.bind(this, entry)});}
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
	{
		menu.newEntry({entryText: 'sep'});
		const subMenu = menu.newMenu('Other settings...');
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
	menu.newEntry({entryText: 'Asynchronous calculation', func: () => {
		properties.bAsync[1] = !properties.bAsync[1];
		overwriteProperties(properties);
	}});
	menu.newCheckMenu(void(0), 'Asynchronous calculation', void(0), () => properties.bAsync[1]);
	menu.newEntry({entryText: 'sep'});
	menu.newEntry({entryText: 'Check for updates...',  func: () => {
		if (typeof checkUpdate === 'undefined') {include('helpers\\helpers_xxx_web_update.js');}
		checkUpdate({bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false})
			.then((bFound) => !bFound && fb.ShowPopupMessage('No updates found.', window.Name));
	}});
	return menu;
}
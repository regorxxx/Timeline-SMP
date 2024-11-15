'use strict';
//15/11/24

/* exported bindMenu */

// Don't load this helper unless menu framework is also present
// https://github.com/regorxxx/Menu-Framework-SMP
try { include('..\\..\\helpers\\menu_xxx.js'); } catch (e) {
	try { include('..\\..\\examples\\_statistics\\menu_xxx.js'); } catch (e) { fb.ShowPopupMessage('Missing menu framework file', window.Name); }
}
/* global _attachedMenu:readable, _menu:readable */
/* global MF_GRAYED:readable, _scale:readable, MF_STRING:readable, colorbrewer:readable, MF_MENUBARBREAK:readable, Input:readable, isArrayEqual:readable */

function bindMenu(parent) {
	return _attachedMenu.call(parent, { rMenu: createStatisticsMenu.bind(parent), popup: parent.pop });
}

// Generic statistics menu which should work on almost any chart
function createStatisticsMenu(bClear = true) { // Must be bound to _chart() instance
	// Constants
	this.tooltip.SetValue(null);
	if (!this.menu) { this.menu = new _menu(); }
	const menu = this.menu;
	if (bClear) { menu.clear(true); } // Reset on every call
	// helper
	const createMenuOption = (key, subKey, menuName = menu.getMainMenuName(), bCheck = true, addFunc = null) => {
		return function (option) {
			if (menu.isSeparator(option) && !menu.isSeparator(menu.getEntries().pop())) { menu.newSeparator(menuName); return; } // Add sep only if any entry has been added
			if (option.isEq && option.key === option.value || !option.isEq && option.key !== option.value || option.isEq === null) {
				menu.newEntry({
					menuName, entryText: option.entryText, func: () => {
						if (addFunc) { addFunc(option); }
						if (subKey) {
							if (Array.isArray(subKey)) {
								const len = subKey.length - 1;
								const obj = { [key]: {}, callbackArgs: { bSaveProperties: true } };
								let prev = obj[key];
								subKey.forEach((curr, i) => {
									prev[curr] = i === len ? option.newValue : {};
									prev = prev[curr];
								});
								this.changeConfig(obj);
							} else {
								this.changeConfig({ [key]: { [subKey]: option.newValue }, callbackArgs: { bSaveProperties: true } });
							}
						}
						else { this.changeConfig({ [key]: option.newValue, callbackArgs: { bSaveProperties: true } }); }
					}
				});
				if (bCheck) {
					menu.newCheckMenu(menuName, option.entryText, void (0), () => {
						const val = subKey
							? Array.isArray(subKey)
								? subKey.reduce((acc, curr) => acc[curr], this[key])
								: this[key][subKey]
							: this[key];
						if (key === 'dataManipulation' && subKey === 'sort' && option.newValue === this.convertSortLabel(this.sortKey)) { return true; }
						if (option.newValue && typeof option.newValue === 'function') { return !!(val && val.name === option.newValue.name); }
						if (option.newValue && typeof option.newValue === 'object') {
							if (Array.isArray(val)) {
								return !!(val && val.toString() === option.newValue.toString());
							} else if (val) {
								const keys = Object.keys(option.newValue);
								return keys.every((key) => val[key] === option.newValue[key]);
							}
						} else {
							return option.isEq === null && option.value === null && (option.newValue === true || option.newValue === false)
								? !!val
								: (val === option.newValue);
						}
					});
				}
			}
		}.bind(this);
	};
	const filtGreat = (num) => ((a) => a.y > num);
	const filtLow = (num) => ((a) => a.y < num);
	const filtBetween = (lim) => ((a) => a.y > lim[0] && a.y < lim[1]);
	const fineGraphs = new Set(['bars', 'doughnut', 'pie', 'timeline']);
	// Header
	menu.newEntry({ entryText: this.title, flags: MF_GRAYED });
	menu.newSeparator();
	// Menus
	{
		const subMenu = menu.newMenu('Chart type');
		[
			{ isEq: null, key: this.graph.type, value: null, newValue: 'timeline', entryText: 'Timeline' },
			{ isEq: null, key: this.graph.type, value: null, newValue: 'scatter', entryText: 'Scatter' },
			{ isEq: null, key: this.graph.type, value: null, newValue: 'bars', entryText: 'Bars' },
			{ isEq: null, key: this.graph.type, value: null, newValue: 'lines', entryText: 'Lines' },
			{ isEq: null, key: this.graph.type, value: null, newValue: 'lines-hq', entryText: 'Lines (high quality)' },
			{ isEq: null, key: this.graph.type, value: null, newValue: 'fill', entryText: 'Fill' },
			{ isEq: null, key: this.graph.type, value: null, newValue: 'doughnut', entryText: 'Doughnut' },
			{ isEq: null, key: this.graph.type, value: null, newValue: 'pie', entryText: 'Pie' },
		].forEach(createMenuOption('graph', 'type', subMenu, void (0), (option) => {
			this.graph.borderWidth = fineGraphs.has(option.newValue) ? _scale(1) : _scale(4);
		}));
	}
	{
		const subMenu = menu.newMenu('Distribution');
		[
			{ isEq: null, key: this.dataManipulation.distribution, value: null, newValue: null, entryText: 'Standard graph' },
			{ isEq: null, key: this.dataManipulation.distribution, value: null, newValue: 'normal', entryText: 'Normal distrib.' },
		].forEach(createMenuOption('dataManipulation', 'distribution', subMenu));
		menu.newSeparator();
	}
	{
		const subMenu = menu.newMenu('Sorting');
		if (this.dataManipulation.distribution === null) {
			[
				{ isEq: null, key: this.dataManipulation.sort, value: null, newValue: 'natural|x', entryText: 'Natural sorting (X)' },
				{ isEq: null, key: this.dataManipulation.sort, value: null, newValue: 'reverse|x', entryText: 'Reverse sorting (X)' },
				{ entryText: 'sep' },
				{ isEq: null, key: this.dataManipulation.sort, value: null, newValue: 'natural|y', entryText: 'Natural sorting (Y)' },
				{ isEq: null, key: this.dataManipulation.sort, value: null, newValue: 'reverse|y', entryText: 'Reverse sorting (Y)' },
				{ entryText: 'sep' },
				...(this.graph.multi
					? [
						{ isEq: null, key: this.dataManipulation.sort, value: null, newValue: 'natural|z', entryText: 'Natural sorting (Z)' },
						{ isEq: null, key: this.dataManipulation.sort, value: null, newValue: 'reverse|z', entryText: 'Reverse sorting (Z)' },
						{ entryText: 'sep' }
					] : []),
				{ isEq: null, key: this.dataManipulation.sort, value: null, newValue: null, entryText: 'No sorting' }
			].forEach(createMenuOption('dataManipulation', 'sort', subMenu));
		} else {
			[
				{ isEq: null, key: this.dataManipulation.distribution, value: 'normal', newValue: 'normal inverse', entryText: 'See tails' },
				{ isEq: null, key: this.dataManipulation.distribution, value: 'normal inverse', newValue: 'normal', entryText: 'Mean centered' }
			].forEach(createMenuOption('dataManipulation', 'distribution', subMenu));
		}
		menu.newSeparator();
	}
	{ // NOSONAR
		{
			const subMenu = menu.newMenu('Show (X-axis)');
			if (this.buttons.zoom) {
				menu.newEntry({ menuName: subMenu, entryText: 'Changed with zoom:', flags: MF_GRAYED });
				menu.newSeparator(subMenu);
			}
			const options = [
				{ isEq: false, key: this.dataManipulation.slice, value: [0, 4], newValue: [0, 4], entryText: '4 items' + (this.dataManipulation.distribution ? ' per tail' : '') },
				{ isEq: false, key: this.dataManipulation.slice, value: [0, 10], newValue: [0, 10], entryText: '10 items' + (this.dataManipulation.distribution ? ' per tail' : '') },
				{ isEq: false, key: this.dataManipulation.slice, value: [0, 20], newValue: [0, 20], entryText: '20 items' + (this.dataManipulation.distribution ? ' per tail' : '') },
				{ isEq: false, key: this.dataManipulation.slice, value: [0, 50], newValue: [0, 50], entryText: '50 items' + (this.dataManipulation.distribution ? ' per tail' : '') }
			];
			options.forEach(createMenuOption('dataManipulation', 'slice', subMenu));
			menu.newSeparator(subMenu);
			menu.newEntry({
				menuName: subMenu, entryText: 'Custom range...' + '\t[' + this.dataManipulation.slice + ']', func: () => {
					const slice = [0, Infinity];
					slice[0] = Input.number('int positive', this.dataManipulation.slice[0], 'Input number:', 'Show X-points from', 40);
					if (slice[0] === null) {
						if (!Input.isLastEqual) { return; }
						slice[0] = Input.previousInput;
					}
					slice[1] = Input.number('int positive', this.dataManipulation.slice[1], 'Input number:\n(must be greater than previous one: ' + slice[0] + ')', 'Show X-points up to', slice[0] + 1, [(n) => n > slice[0]]);
					if (slice[1] === null) {
						if (!Input.isLastEqual) { return; }
						slice[1] = Input.previousInput;
					}
					if (isArrayEqual(this.dataManipulation.slice, slice)) { return; }
					this.changeConfig({ dataManipulation: { slice }, callbackArgs: { bSaveProperties: true } });
				}
			});
			menu.newCheckMenuLast(() => !options.some((opt) => isArrayEqual(this.dataManipulation.slice, opt.value)));
			[
				{ entryText: 'sep' },
				{ isEq: false, key: this.dataManipulation.slice, value: [0, Infinity], newValue: [0, Infinity], entryText: 'Show entire X-axis' },
			].forEach(createMenuOption('dataManipulation', 'slice', subMenu));
		}
		{
			const subMenu = menu.newMenu('Filter (Y-axis)');
			const subMenuGreat = menu.newMenu('Greater than', subMenu);
			const subMenuLow = menu.newMenu('Lower than', subMenu);
			// Create a filter entry for each fraction of the max value (duplicates filtered)
			const parent = this;
			const options = [...new Set([this.stats.maxY, 1000, 100, 10, 10 / 2, 10 / 3, 10 / 5, 10 / 7].map((frac) => {
				return Math.round(this.stats.maxY / frac) || 1; // Don't allow zero
			}))];
			{
				options.map((val) => {
					return { isEq: null, key: this.dataManipulation.filter, value: null, newValue: filtGreat(val), entryText: val };
				}).forEach(function (option, i) {
					createMenuOption('dataManipulation', 'filter', subMenuGreat, false)(option);
					menu.newCheckMenu(subMenuGreat, option.entryText, void (0), () => {
						const filter = this.dataManipulation.filter;
						const filterStr = (filter || '').toString();
						return !!filter && filterStr.includes(' > ') && filter({ y: options[i] + 1 }) && !filter({ y: options[i] }); // Just a hack to check the current value is the filter
					});
				}.bind(parent));
				menu.newSeparator(subMenuGreat);
				menu.newEntry({
					menuName: subMenuGreat, entryText: 'Custom value...', func: () => {
						let val = Input.number('real', -Infinity, 'Input real number:', 'Allow only Y-Value greater than', 40);
						if (val === null) {
							if (!Input.isLastEqual) { return; }
							val = Input.previousInput;
						}
						this.changeConfig({
							dataManipulation: {
								filter: val === -Infinity ? null : filtGreat(val)
							}, callbackArgs: { bSaveProperties: true }
						});
					}
				});
				menu.newCheckMenuLast(() => {
					const filter = this.dataManipulation.filter;
					const filterStr = (filter || '').toString();
					return !!filter && filterStr.includes(' > ') && options.every((val) => !menu.isChecked(subMenuGreat, val));
				});
			}
			{
				options.map((val) => {
					return { isEq: null, key: this.dataManipulation.filter, value: null, newValue: filtLow(val), entryText: val };
				}).forEach(function (option, i) {
					createMenuOption('dataManipulation', 'filter', subMenuLow, false)(option);
					menu.newCheckMenu(subMenuLow, option.entryText, void (0), () => {
						const filter = this.dataManipulation.filter;
						const filterStr = (filter || '').toString();
						return !!filter && filterStr.includes(' < ') && filter({ y: options[i] + 1 }) && !filter({ y: options[i] }); // Just a hack to check the current value is the filter
					});
				}.bind(parent));
				menu.newSeparator(subMenuLow);
				menu.newEntry({
					menuName: subMenuLow, entryText: 'Custom value...', func: () => {
						let val = Input.number('real', Infinity, 'Input real number:', 'Allow only Y-Value lower than', 40);
						if (val === null) {
							if (!Input.isLastEqual) { return; }
							val = Input.previousInput;
						}
						this.changeConfig({
							dataManipulation: {
								filter: val === Infinity ? null : filtLow(val)
							}, callbackArgs: { bSaveProperties: true }
						});
					}
				});
				menu.newCheckMenuLast(() => {
					const filter = this.dataManipulation.filter;
					const filterStr = (filter || '').toString();
					return !!filter && filterStr.includes(' < ') && options.every((val) => !menu.isChecked(subMenuLow, val));
				});
			}
			{
				menu.newSeparator(subMenu);
				menu.newEntry({
					menuName: subMenu, entryText: 'Between 2 values...', func: () => {
						const limits = [-Infinity, Infinity];
						limits[0] = Input.number('real', -Infinity, 'Input real number:', 'Allow only Y-Value greater than', 40);
						if (limits[0] === null) {
							if (!Input.isLastEqual) { return; }
							limits[0] = Input.previousInput;
						}
						limits[1] = Input.number('real', Infinity, 'Input real number:', 'Allow only Y-Value lower than', 40);
						if (limits[1] === null) {
							if (!Input.isLastEqual) { return; }
							limits[1] = Input.previousInput;
						}
						this.changeConfig({
							dataManipulation: {
								filter: limits.every((n) => !Number.isFinite(n)) ? null : filtBetween(limits)
							}, callbackArgs: { bSaveProperties: true }
						});
					}
				});
				menu.newCheckMenuLast(() => {
					const filter = this.dataManipulation.filter;
					const filterStr = (filter || '').toString();
					return !!filter && filterStr.includes(' < ') && filterStr.includes(' > ');
				});
			}
			[
				{ entryText: 'sep' },
				{ isEq: null, key: this.dataManipulation.filter, value: null, newValue: null, entryText: 'No filter' },
			].forEach(createMenuOption('dataManipulation', 'filter', subMenu));
		}
		{
			menu.newSeparator();
			const subMenuGroup = menu.newMenu('Z-Axis groups' + (!this.graph.multi ? '\t[3D-Graphs]' : ''), void (0), this.graph.multi ? MF_STRING : MF_GRAYED);
			if (this.graph.multi) {
				menu.newEntry({ menuName: subMenuGroup, entryText: 'Z-points per X-value:', flags: MF_GRAYED });
				menu.newSeparator(subMenuGroup);
				const parent = this;
				const options = [...new Set([this.stats.maxGroup, 10, 8, 5, 4, 3, 2, 1].map((frac) => {
					return Math.round(this.stats.maxGroup / frac) || this.stats.minGroup; // Don't allow zero
				}))];

				options.map((val) => {
					return { isEq: null, key: this.dataManipulation.group, value: null, newValue: val, entryText: val + ' point(s)' };
				}).forEach(function (option, i) {
					createMenuOption('dataManipulation', 'group', subMenuGroup, false)(option);
					menu.newCheckMenuLast(() => this.dataManipulation.group === options[i]);
				}.bind(parent));
				menu.newSeparator(subMenuGroup);
				menu.newEntry({
					menuName: subMenuGroup, entryText: 'Custom value...' + '\t[' + this.dataManipulation.group + ']', func: () => {
						const val = Input.number('int positive', this.dataManipulation.group, 'Input number:', 'Number of Z-points per X-value', 40);
						if (val === null) { return; }
						this.changeConfig({ dataManipulation: { group: val }, callbackArgs: { bSaveProperties: true } });
					}
				});
				menu.newCheckMenuLast(() => !options.some((val) => this.dataManipulation.group === val));
			}
		}
		menu.newSeparator();
	}
	{
		const subMenu = menu.newMenu('Axis & labels');
		{
			const subMenuTwo = menu.newMenu('Axis', subMenu);
			[
				{ isEq: null, key: this.axis.x.show, value: null, newValue: { show: !this.axis.x.show }, entryText: (this.axis.x.show ? 'Hide' : 'Show') + ' X axis' }
			].forEach(createMenuOption('axis', 'x', subMenuTwo, false));
			[
				{ isEq: null, key: this.axis.y.show, value: null, newValue: { show: !this.axis.y.show }, entryText: (this.axis.y.show ? 'Hide' : 'Show') + ' Y axis' }
			].forEach(createMenuOption('axis', 'y', subMenuTwo, false));
		}
		{
			const subMenuTwo = menu.newMenu('Labels', subMenu);
			[
				{ isEq: null, key: this.axis.x.labels, value: null, newValue: { labels: !this.axis.x.labels }, entryText: (this.axis.x.labels ? 'Hide' : 'Show') + ' X labels' }
			].forEach(createMenuOption('axis', 'x', subMenuTwo, false));
			[
				{ isEq: null, key: this.axis.y.labels, value: null, newValue: { labels: !this.axis.y.labels }, entryText: (this.axis.y.labels ? 'Hide' : 'Show') + ' Y labels' }
			].forEach(createMenuOption('axis', 'y', subMenuTwo, false));
			menu.newSeparator(subMenuTwo);
			[
				{ isEq: null, key: this.axis.x.bAltLabels, value: null, newValue: !this.axis.x.bAltLabels, entryText: 'Alt. X labels' },
			].forEach(createMenuOption('axis', ['x', 'bAltLabels'], subMenuTwo, true));
			if (this.graph.type === 'timeline') {
				[
					{ isEq: null, key: this.graphSpecs.timeline.bAxisCenteredX, value: null, newValue: !this.graphSpecs.timeline.bAxisCenteredX, entryText: 'Center X tick' },
				].forEach(createMenuOption('graphSpecs', ['timeline', 'bAxisCenteredX'], subMenuTwo, true));
			}
		}
		{
			const subMenuTwo = menu.newMenu('Titles', subMenu);
			[
				{ isEq: null, key: this.axis.x.showKey, value: null, newValue: { showKey: !this.axis.x.showKey }, entryText: (this.axis.x.showKey ? 'Hide' : 'Show') + ' X title' }
			].forEach(createMenuOption('axis', 'x', subMenuTwo, false));
			[
				{ isEq: null, key: this.axis.y.showKey, value: null, newValue: { showKey: !this.axis.y.showKey }, entryText: (this.axis.y.showKey ? 'Hide' : 'Show') + ' Y title' }
			].forEach(createMenuOption('axis', 'y', subMenuTwo, false));
		}
		{
			const subMenuTwo = menu.newMenu('Dynamic colors', subMenu, this.callbacks.config.backgroundColor ? MF_STRING : MF_GRAYED);
			[
				{ isEq: null, key: this.configuration.bDynColor, value: null, newValue: !this.configuration.bDynColor, entryText: 'Invert background color' },
			].forEach(createMenuOption('configuration', 'bDynColor', subMenuTwo, true));
			[
				{ isEq: null, key: this.configuration.bDynColorBW, value: null, newValue: !this.configuration.bDynColorBW, entryText: 'Only in B&W' },
			].forEach(createMenuOption('configuration', 'bDynColorBW', subMenuTwo, true));
		}
	}
	{
		const subMenu = menu.newMenu('Color palette');
		[
			{ isEq: null, key: this.chroma.scheme, value: null, newValue: 'diverging', entryText: 'Diverging' },
			{ isEq: null, key: this.chroma.scheme, value: null, newValue: 'qualitative', entryText: 'Qualitative' },
			{ isEq: null, key: this.chroma.scheme, value: null, newValue: 'sequential', entryText: 'Sequential' },
			{ entryText: 'sep' },
			{ isEq: null, key: this.chroma.scheme, value: null, newValue: 'random', entryText: 'Random' },
		].forEach(createMenuOption('chroma', 'scheme', subMenu, true, () => { this.colors = []; })); // Remove colors to force new palette
		menu.newSeparator(subMenu);
		{
			const subMenuTwo = menu.newMenu('By scheme', subMenu);
			let j = 0;
			for (let key in (this.chroma.colorBlindSafe ? colorbrewer.colorBlind : colorbrewer)) {
				if (key === 'colorBlind') { continue; }
				colorbrewer[key].forEach((scheme, i) => {
					if (i === 0) {
						menu.newEntry({ menuName: subMenuTwo, entryText: key.charAt(0).toUpperCase() + key.slice(1), flags: (j === 0 ? MF_GRAYED : MF_GRAYED | MF_MENUBARBREAK) });
						menu.newSeparator(subMenuTwo);
					}
					[
						{ isEq: null, key: this.chroma.scheme, value: null, newValue: scheme, entryText: scheme },
					].forEach(createMenuOption('chroma', 'scheme', subMenuTwo, true, () => { this.colors = []; })); // Remove colors to force new palette
				});
				j++;
			}
		}
		menu.newSeparator(subMenu);
		menu.newEntry({
			menuName: subMenu, entryText: 'Colorblind safe', func: () => {
				this.colors = [];
				this.changeConfig({ chroma: { colorBlindSafe: !this.chroma.colorBlindSafe }, callbackArgs: { bSaveProperties: true } });
			}, flags: this.chroma.scheme === 'random' ? MF_GRAYED : MF_STRING
		});
		menu.newCheckMenu(subMenu, 'Colorblind safe', void (0), () => { return this.chroma.colorBlindSafe; });
	}
	{
		const type = this.graph.type.toLowerCase();
		const subMenu = menu.newMenu('Other settings');
		{
			const configSubMenu = menu.newMenu((type === 'lines' ? 'Line' : 'Point') + ' size', subMenu);
			[1, 2, 3, 4].map((val) => {
				return { isEq: null, key: this.graph.borderWidth, value: null, newValue: _scale(val), entryText: val.toString() };
			}).forEach(createMenuOption('graph', 'borderWidth', configSubMenu));
		}
		if (type === 'scatter' || type === 'p-p plot') {
			const configSubMenu = menu.newMenu('Point type', subMenu);
			['circle', 'circumference', 'cross', 'triangle', 'plus'].map((val) => {
				return { isEq: null, key: this.graph.point, value: null, newValue: val, entryText: val };
			}).forEach(createMenuOption('graph', 'point', configSubMenu));
		}
		{
			const configSubMenu = menu.newMenu('Point transparency', subMenu);
			[0, 20, 40, 60, 80, 100].map((val) => {
				return { isEq: null, key: this.graph.pointAlpha, value: null, newValue: Math.round(val * 255 / 100), entryText: val.toString() + (val === 0 ? '\t(transparent)' : val === 100 ? '\t(opaque)' : '') };
			}).forEach(createMenuOption('graph', 'pointAlpha', configSubMenu));
		}
	}
	return menu;
}
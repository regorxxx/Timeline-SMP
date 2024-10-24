﻿'use strict';
//24/10/24

/* exported _chart */

include('statistics_xxx_helper.js');
/* global _gdiFont:readable, getBrightness:readable, toRGB:readable, RGBA:readable, invert:readable, Chroma:readable, _scale:readable, _tt:readable, round:readable, DT_CENTER:readable, DT_END_ELLIPSIS:readable, DT_CALCRECT:readable, DT_NOPREFIX:readable, DT_RIGHT:readable, DT_LEFT:readable, TextRenderingHint:readable, StringFormatFlags:readable, InterpolationMode:readable, RotateFlipType:readable, VK_SHIFT:readable, range:readable, RGB:readable, isFunction:readable, _p:readable, IDC_HAND:readable, IDC_ARROW:readable, debounce:readable, throttle:readable, VK_CONTROL:readable, MK_LBUTTON:readable, colorbrewer:readable, NatSort:readable, MK_SHIFT:readable, _button:readable, chars:readable, _popup:readable, opaqueColor:readable */

function _chart({
	data /* [[{x, y}, ...]]*/,
	dataAsync = null, /* function returning a promise or promise, resolving to data, see above*/
	colors = [/* rgbSerie1, ... */],
	chroma = {/* scheme, colorBlindSafe, interpolation */ }, // diverging, qualitative, sequential, random or [color, ...] see https://vis4.net/chromajs/#color-scales
	graph = {/* type, multi, borderWidth, point, pointAlpha */ },
	dataManipulation = {/* sort, filter, slice, distribution , probabilityPlot, group*/ },
	background = {/* color, image*/ },
	grid = {
		x: {/* show, color, width */ },
		y: {/* ... */ }
	},
	axis = {
		x: {/* show, color, width, ticks, labels, key, bSingleLabels, bAltLabels */ },
		y: {/* ... */ },  // bSingleLabels & bAltLabels only for X axis
		z: {/* ... */ }
	},
	graphSpecs = { // Graph type specific configuration
		timeline: {/* bAxisCenteredX */ },
	},
	margin = {/* left, right, top, bottom */ },
	buttons = {/* xScroll , settings, display, zoom, custom */ },
	callbacks = {
		point: {/* onLbtnUp, onRbtnUp, onDblLbtn */ },
		focus: {/* onMouseWwheel, onRbtnUp */ },
		settings: {/* onLbtnUp, onRbtnUp, onDblLbtn */ },
		display: {/* onLbtnUp, onRbtnUp, onDblLbtn */ },
		zoom: {/* onLbtnUp, onRbtnUp, onDblLbtn */ },
		custom: {/* onLbtnUp, onRbtnUp, onDblLbtn, tooltip */ },
		config: {/* change, backgroundColor */ }
	},
	configuration = {/* bLoadAsyncData: true , bAltVerticalText: false, bPopupBackground: false, bProfile: false, bSlicePerKey: true*, bDynColor: true, bDynColorBW: true , maxSliceOnDataChange: 100 */ },
	x = 0,
	y = 0,
	w = window.Width,
	h = window.Height,
	title,
	gFont = _gdiFont('Segoe UI', _scale(10)),
	tooltipText = '' /* function or string */
} = {}) {
	// Global tooltip
	this.tooltip = new _tt(null);
	this.profile = null;

	this.setDefaults = () => {
		this.colors = [];
		this.chroma = { scheme: 'sequential', colorBlindSafe: true, interpolation: 'lrgb' }; // diverging, qualitative, sequential, random or [color, ...] see https://vis4.net/chromajs/#color-scales
		this.graph = { type: 'bars', multi: false, borderWidth: _scale(1), point: null, pointAlpha: 255 };
		this.dataManipulation = { sort: 'natural', filter: null, slice: [0, 10], distribution: null, probabilityPlot: null, group: 4 };
		this.background = { color: RGB(255, 255, 255), image: null };
		this.grid = { x: { show: false, color: RGB(0, 0, 0), width: _scale(1) }, y: { show: false, color: RGB(0, 0, 0), width: _scale(1) } };
		this.axis = {
			x: { show: true, color: RGB(0, 0, 0), width: _scale(2), ticks: 'auto', labels: true, bSingleLabels: true, key: '', showKey: true, bAltLabels: false, tf: '' },
			y: { show: true, color: RGB(0, 0, 0), width: _scale(2), ticks: 10, labels: true, key: 'tracks', showKey: true, tf: '', bProportional: false },
			z: { key: '', tf: '' },
		};
		this.graphSpecs = {
			timeline: { bAxisCenteredX: false },
		};
		this.margin = { left: _scale(20), right: _scale(20), top: _scale(20), bottom: _scale(20) };
		this.buttons = { xScroll: false, settings: false, display: false, zoom: false, custom: false };
		this.callbacks = {
			point: { onLbtnUp: null, onRbtnUp: null, onDblLbtn: null },
			focus: {
				onMouseWwheel: this.zoomX,
				onRbtnUp: null
			},
			settings: { onLbtnUp: null, onRbtnUp: null, onDblLbtn: null },
			display: { onLbtnUp: null, onRbtnUp: null, onDblLbtn: null },
			zoom: {
				onLbtnUp: (x, y, mask) => this.zoomX(mask === MK_SHIFT || this.getCurrentRange() === 1 ? -1 : 1),
				onDblLbtn: (x, y, mask) => { this.zoomX(mask === MK_SHIFT || this.getCurrentRange() === 1 ? -Infinity : Infinity); },
				onRbtnUp: null,
			},
			custom: { onLbtnUp: null, onRbtnUp: null, onDblLbtn: null, tooltip: null },
			config: { change: null, backgroundColor: null }
		};
		this.configuration = {
			bLoadAsyncData: true,
			bAltVerticalText: false,
			bPopupBackground: false,
			bProfile: false,
			bSlicePerKey: true,
			bDynColor: true, bDynColorBW: true,
			maxSliceOnDataChange: 50,
		};
		this.title = window.Name + ' {' + this.axis.x.key + ' - ' + this.axis.y.key + '}';
		this.tooltipText = '';
	};

	/*
		Paint
	*/
	this.paintBg = (gr) => {
		if (this.background.imageGDI) {
			gr.DrawImage(this.background.imageGDI, this.x, this.y, this.w, this.h, 0, 0, this.w, this.h);
		} else if (this.background.color !== null) {
			gr.FillSolidRect(this.x, this.y, this.w, this.h, this.background.color);
		}
	};

	this.paintScatter = (gr, serie, i, x, y, w, h, maxY, tickW, xAxisValues) => { // NOSONAR
		// Antialias for lines use gr.SetSmoothingMode(4) before calling
		const selBar = this.graph.borderWidth * 2;
		let valH;
		const borderColor = RGBA(...toRGB(invert(this.colors[i], true)), getBrightness(...toRGB(this.colors[i])) < 50 ? 300 : 25);
		const color = RGBA(...toRGB(this.colors[i]), this.graph.pointAlpha);
		const pointType = (this.graph.point || 'circle').toLowerCase();
		serie.forEach((value, j) => {
			valH = value.y / maxY * (y - h);
			const xPoint = x + xAxisValues.indexOf(value.x) * tickW;
			const yPoint = y - valH;
			const bFocused = this.currPoint[0] === i && this.currPoint[1] === j;
			if (bFocused) {
				gr.FillSolidRect(xPoint - selBar / 2, yPoint, selBar, valH, borderColor);
			}
			if (pointType === 'circumference') {
				this.dataCoords[i][j] = { x: xPoint, y: yPoint - this.graph.borderWidth / 2, w: selBar, h: valH };
				const paintPoint = (color) => {
					gr.DrawEllipse(xPoint - this.graph.borderWidth * 2 / 3, yPoint - this.graph.borderWidth * 2 / 3, this.graph.borderWidth * 4 / 3, this.graph.borderWidth * 4 / 3, this.graph.borderWidth / 2, color);
				};
				paintPoint(color);
				if (bFocused) { paintPoint(borderColor); }
			} else if (pointType === 'cross') {
				this.dataCoords[i][j] = { x: xPoint, y: yPoint - this.graph.borderWidth, w: selBar, h: valH };
				const paintPoint = (color) => {
					gr.DrawLine(xPoint - this.graph.borderWidth, yPoint - this.graph.borderWidth, xPoint + this.graph.borderWidth, yPoint + this.graph.borderWidth, this.graph.borderWidth / 2, color);
					gr.DrawLine(xPoint - this.graph.borderWidth, yPoint + this.graph.borderWidth, xPoint + this.graph.borderWidth, yPoint - this.graph.borderWidth, this.graph.borderWidth / 2, color);
				};
				paintPoint(color);
				if (bFocused) { paintPoint(borderColor); }
			} else if (pointType === 'plus') {
				this.dataCoords[i][j] = { x: xPoint, y: yPoint - this.graph.borderWidth, w: selBar, h: valH };
				const paintPoint = (color) => {
					gr.DrawLine(xPoint - this.graph.borderWidth, yPoint, xPoint + this.graph.borderWidth, yPoint, this.graph.borderWidth / 2, color);
					gr.DrawLine(xPoint, yPoint + this.graph.borderWidth, xPoint, yPoint - this.graph.borderWidth, this.graph.borderWidth / 2, color);
				};
				paintPoint(color);
				if (bFocused) { paintPoint(borderColor); }
			} else if (pointType === 'triangle') {
				this.dataCoords[i][j] = { x: xPoint, y: yPoint - this.graph.borderWidth, w: selBar, h: valH };
				const paintPoint = (color) => {
					gr.DrawLine(xPoint - this.graph.borderWidth, yPoint + this.graph.borderWidth, xPoint + this.graph.borderWidth, yPoint + this.graph.borderWidth, this.graph.borderWidth / 2, color);
					gr.DrawLine(xPoint - this.graph.borderWidth, yPoint + this.graph.borderWidth, xPoint + this.graph.borderWidth / 8, yPoint - this.graph.borderWidth, this.graph.borderWidth / 2, color);
					gr.DrawLine(xPoint + this.graph.borderWidth, yPoint + this.graph.borderWidth, xPoint - this.graph.borderWidth / 8, yPoint - this.graph.borderWidth, this.graph.borderWidth / 2, color);
				};
				paintPoint(color);
				if (bFocused) { paintPoint(borderColor); }
			} else { // circle
				this.dataCoords[i][j] = { x: xPoint, y: yPoint - this.graph.borderWidth / 2, w: selBar, h: valH };
				const paintPoint = (color) => {
					gr.DrawEllipse(xPoint - this.graph.borderWidth / 2, yPoint - this.graph.borderWidth / 2, this.graph.borderWidth, this.graph.borderWidth, this.graph.borderWidth, color);
				};
				paintPoint(color);
				if (bFocused) { paintPoint(borderColor); }
			}
		});
	};

	this.paintLines = (gr, serie, i, x, y, w, h, maxY, tickW, last, xAxisValues) => { // NOSONAR
		// Antialias for lines use gr.SetSmoothingMode(4) before calling
		const selBar = tickW;
		// Values
		let valH;
		const borderColor = RGBA(...toRGB(invert(this.colors[i], true)), getBrightness(...toRGB(this.colors[i])) < 50 ? 300 : 25);
		const color = RGBA(...toRGB(this.colors[i]), this.graph.pointAlpha);
		serie.forEach((value, j) => {
			valH = value.y / maxY * (y - h);
			const idx = xAxisValues.indexOf(value.x);
			const xPoint = x + idx * tickW;
			const yPoint = y - valH;
			const bFocused = this.currPoint[0] === i && this.currPoint[1] === j;
			this.dataCoords[i][j] = { x: j > 0 ? xPoint - selBar / 2 : xPoint, y: yPoint, w: (j > 0 && j !== last ? selBar : selBar / 2), h: valH };
			const point = this.dataCoords[i][j];
			if (bFocused) {
				gr.FillSolidRect(point.x, point.y, point.w, point.h, borderColor);
			}
			if (j !== 0) {
				const paintPoint = (color) => {
					const newValH = serie[j - 1].y / maxY * (y - h);
					const newXPoint = x + (idx - 1) * tickW;
					const newYPoint = y - newValH;
					gr.DrawLine(newXPoint, newYPoint, xPoint, yPoint, this.graph.borderWidth, color);
				};
				paintPoint(color);
			}
		});
	};

	this.paintFill = (gr, serie, i, x, y, w, h, maxY, tickW, last, xAxisValues) => { // NOSONAR
		// Antialias for lines use gr.SetSmoothingMode(4) before calling
		const selBar = tickW;
		// Values
		let valH;
		const borderColor = RGBA(...toRGB(invert(this.colors[i], true)), getBrightness(...toRGB(this.colors[i])) < 50 ? 300 : 25);
		const color = RGBA(...toRGB(this.colors[i]), this.graph.pointAlpha);
		serie.forEach((value, j) => {
			valH = value.y / maxY * (y - h);
			const idx = xAxisValues.indexOf(value.x);
			const xPoint = x + idx * tickW;
			const yPoint = y - valH;
			const bFocused = this.currPoint[0] === i && this.currPoint[1] === j;
			const point = this.dataCoords[i][j] = {
				x: j > 0 ? xPoint - selBar / 2 : xPoint,
				y: yPoint,
				w: (j > 0 && j !== last ? selBar : selBar / 2),
				h: valH
			};
			if (bFocused) {
				gr.FillSolidRect(point.x, point.y, point.w, point.h, borderColor);
			}
			if (j !== 0) {
				const paintPoint = (color) => {
					const newValH = serie[j - 1].y / maxY * (y - h);
					const newXPoint = x + (idx - 1) * tickW;
					const newYPoint = y - newValH;
					const lineArr = [xPoint, yPoint, xPoint, y, newXPoint + 0.25, y, newXPoint + 0.25, newYPoint];
					gr.FillPolygon(color, 0, lineArr);
				};
				paintPoint(color);
			}
		});
	};

	this.paintBars = (gr, serie, i, x, y, w, h, maxY, tickW, barW, xAxisValues) => { // NOSONAR
		// Antialias for lines use gr.SetSmoothingMode(4) before calling
		// Values
		const xValues = x + i * barW;
		let valH;
		const borderColor = RGBA(...toRGB(invert(this.colors[i], true)), getBrightness(...toRGB(this.colors[i])) < 50 ? 300 : 25);
		const color = RGBA(...toRGB(this.colors[i]), this.graph.pointAlpha);
		serie.forEach((value, j) => {
			valH = value.y / maxY * (y - h);
			const xPoint = xValues + xAxisValues.indexOf(value.x) * tickW;
			const yPoint = y - valH;
			const bFocused = this.currPoint[0] === i && this.currPoint[1] === j;
			this.dataCoords[i][j] = { x: xPoint, y: yPoint, w: barW, h: valH };
			const point = this.dataCoords[i][j];
			gr.FillSolidRect(point.x, point.y, point.w, point.h, color);
			if (bFocused) { gr.FillSolidRect(point.x, point.y, point.w, point.h, borderColor); }
			// Borders
			if (this.graph.borderWidth) {
				gr.DrawRect(point.x, point.y, point.w, point.h, this.graph.borderWidth, borderColor);
			}
		});
	};

	this.paintTimeline = (gr, serie, i, x, y, w, h, maxY, tickW, barW, xAxisValues) => { // NOSONAR
		// Antialias for lines use gr.SetSmoothingMode(4) before calling
		// Values
		const xValues = x + i * barW;
		let valH;
		const borderColor = RGBA(...toRGB(invert(this.colors[i], true)), getBrightness(...toRGB(this.colors[i])) < 50 ? 300 : 25);
		const color = RGBA(...toRGB(this.colors[i]), this.graph.pointAlpha);
		serie.forEach((value, j) => {
			valH = value.y / maxY / 2 * (y - h);
			const xPoint = xValues + xAxisValues.indexOf(value.x) * tickW;
			const yPoint = (y - h) / 2 - valH + this.margin.top;
			const bFocused = this.currPoint[0] === i && this.currPoint[1] === j;
			this.dataCoords[i][j] = { x: xPoint, y: yPoint, w: barW, h: valH };
			const point = this.dataCoords[i][j];
			gr.FillSolidRect(point.x, point.y, point.w, point.h + (this.axis.x.show ? this.axis.x.width / 2 : 0), color);
			gr.FillSolidRect(point.x, point.y + point.h + (this.axis.x.show ? this.axis.x.width * 3 / 2 : 0), point.w, point.h, color);
			if (bFocused) { gr.FillSolidRect(point.x, point.y, point.w, point.h * 2 + (this.axis.x.show ? this.axis.x.width * 3 / 2 : 0), borderColor); }
			// Borders
			if (this.graph.borderWidth) {
				gr.DrawRect(point.x, point.y, point.w, point.h * 2 + (this.axis.x.show ? this.axis.x.width * 3 / 2 : 0), this.graph.borderWidth, borderColor);
			}
		});
	};

	this.paintPie = (gr, serie, i, x, y, w, h, maxY, r) => { // NOSONAR
		// Antialias for lines use gr.SetSmoothingMode(4) before calling
		// Values
		let circleArr = [];
		const labelCoord = [];
		const c = { x: x + w / 2, y: (y + h) / 2 };
		const ticks = r * 2 * Math.PI;
		let iY, iX;
		for (let j = 0; j < ticks; j++) {
			iY = r * Math.sin(2 * Math.PI / ticks * j);
			iX = r * Math.cos(2 * Math.PI / ticks * j);
			circleArr.push(c.x + iX, c.y + iY);
		}
		if (this.background.color !== null || this.configuration.bDynColor && this.callbacks.config.backgroundColor) {
			const bgColor = this.configuration.bDynColor && !!this.callbacks.config.backgroundColor
				? this.configuration.bDynColorBW
					? Chroma(invert(this.callbacks.config.backgroundColor()[0], true)).alpha(0.3).android()
					: Chroma.average(this.callbacks.config.backgroundColor(), void (0), [0.6, 0.4]).android()
				: this.background.color;
			gr.FillPolygon(bgColor, 0, circleArr);
		}
		let alpha = 0;
		serie.forEach((value, j, thisSerie) => {
			const borderColor = RGBA(...toRGB(invert(this.colors[i][j], true)), getBrightness(...toRGB(this.colors[i][j])) < 50 ? 300 : 25);
			const color = RGBA(...toRGB(this.colors[i][j]), this.graph.pointAlpha);
			const bFocused = this.currPoint[0] === i && this.currPoint[1] === j;
			circleArr = [...Object.values(c)];
			const sumY = thisSerie.reduce((acc, val) => acc + val.y, 0);
			const perc = value.y / sumY;
			const sliceTicks = perc * ticks;
			const iAlpha = 2 * Math.PI * perc;
			for (let h = 0; h < sliceTicks; h++) {
				iY = r * Math.sin(alpha + iAlpha / sliceTicks * h);
				iX = r * Math.cos(alpha + iAlpha / sliceTicks * h);
				circleArr.push(c.x + iX, c.y + iY);
			}
			if (circleArr.length) {
				gr.FillPolygon(color, 0, circleArr);
				if (bFocused) { gr.FillPolygon(borderColor, 0, circleArr); }
				// Borders
				if (this.graph.borderWidth) {
					gr.DrawPolygon(borderColor, this.graph.borderWidth, circleArr);
				}
			}
			circleArr.push(...Object.values(c));
			alpha += iAlpha;
			this.dataCoords[i][j] = { c: { ...c }, r1: 0, r2: r, alpha1: alpha - iAlpha, alpha2: alpha };
			labelCoord.push({ from: { ...c }, to: { x: c.x + iX, y: c.y + iY }, val: perc * 100, alpha });
		});
		return labelCoord;
	};

	this.paintDoughnut = (gr, serie, i, x, y, w, h, maxY, r, rInner) => { // NOSONAR
		// Antialias for lines use gr.SetSmoothingMode(4) before calling
		// Values
		let circleArr = [];
		const labelCoord = [];
		const c = { x: x + w / 2, y: (y + h) / 2 };
		const ticks = r * 2 * Math.PI;
		let iY, iX;
		let alpha = 0;
		serie.forEach((value, j, thisSerie) => {
			const borderColor = RGBA(...toRGB(invert(this.colors[i][j], true)), getBrightness(...toRGB(this.colors[i][j])) < 50 ? 300 : 25);
			const color = RGBA(...toRGB(this.colors[i][j]), this.graph.pointAlpha);
			const bFocused = this.currPoint[0] === i && this.currPoint[1] === j;
			circleArr = [];
			const sumY = thisSerie.reduce((acc, val) => acc + val.y, 0);
			const perc = value.y / sumY;
			const sliceTicks = perc * ticks;
			const iAlpha = 2 * Math.PI * perc;
			for (let h = 0; h < sliceTicks; h++) {
				iY = rInner * Math.sin(alpha + iAlpha / sliceTicks * h);
				iX = rInner * Math.cos(alpha + iAlpha / sliceTicks * h);
				circleArr.push(c.x + iX, c.y + iY);
			}
			for (let h = sliceTicks; h > 0; h--) {
				iY = r * Math.sin(alpha + iAlpha / sliceTicks * h);
				iX = r * Math.cos(alpha + iAlpha / sliceTicks * h);
				circleArr.push(c.x + iX, c.y + iY);
			}
			if (circleArr.length) {
				gr.FillPolygon(color, 0, circleArr);
				if (bFocused) { gr.FillPolygon(borderColor, 0, circleArr); }
				// Borders
				if (this.graph.borderWidth) {
					gr.DrawPolygon(borderColor, this.graph.borderWidth, circleArr);
				}
			}
			circleArr.push(...Object.values(c));
			alpha += iAlpha;
			this.dataCoords[i][j] = { c: { ...c }, r1: 0, r2: r, alpha1: alpha - iAlpha, alpha2: alpha };
			labelCoord.push({ from: { ...c }, to: { x: c.x + iX, y: c.y + iY }, val: perc * 100, alpha });
		});
		return labelCoord;
	};

	this.paintGraph = (gr) => {
		this.dataCoords = this.dataDraw.map(() => { return []; });
		let x, y, w, h, xOffsetKey, yOffsetKey;
		let bHideToolbar;
		const bDynColor = this.configuration.bDynColor && this.callbacks.config.backgroundColor;
		const bgColor = bDynColor
			? this.configuration.bDynColorBW
				? invert(this.callbacks.config.backgroundColor()[0], true)
				: Chroma.average(this.callbacks.config.backgroundColor(), void (0), [0.6, 0.4]).android()
			: this.background.color;
		const xAxisColor = bDynColor ? bgColor : this.axis.x.color || bgColor;
		const xAxisColorInverted = xAxisColor === this.axis.x.color
			? xAxisColor
			: this.configuration.bDynColorBW
				? bgColor
				: invert(xAxisColor, true);
		const yAxisColor = bDynColor ? bgColor : this.axis.y.color || bgColor;
		const xGridColor = bDynColor ? bgColor : this.grid.x.color || bgColor;
		const yGridColor = bDynColor ? bgColor : this.grid.y.color || bgColor;
		// Max Y value for all series
		let maxY = 0, minY = 0;
		this.dataDraw.forEach((serie) => {
			serie.forEach((value) => {
				if (value.y > maxY) { maxY = value.y; }
				if (value.y < minY) { minY = value.y; }
			});
		});
		this.stats.maxY = maxY;
		this.stats.minY = minY;
		// Ticks
		const ticks = this.steps(0, maxY, this.axis.y.ticks === 'auto' ? void (0) : Number(this.axis.y.ticks)); // NOSONAR
		const tickText = ticks.map((tick) => { return this.nFormatter(tick, 1); });
		// Retrieve all different label on all series
		const points = [];
		this.dataDraw.forEach((serie, i) => {
			points.push([]);
			serie.forEach((value) => points[i].push(value));
		});
		const getUniqueListBy = function getUniqueListBy(arr, key) {
			return [...new Map(arr.map(item => [item[key], item])).values()];
		};
		const xAxisValues = getUniqueListBy(points.flat(Infinity), 'x').map((value) => value.x);
		const xAxisValuesLen = xAxisValues.length;
		const labelOver = { coord: [] }; // For pie Graphs
		/*
			Draw for all graphs
		*/
		w = this.w - this.margin.right;
		h = this.y + this.margin.top;
		x = this.x + this.margin.leftAuto;
		y = this.h - this.margin.bottom;
		xOffsetKey = 0;
		yOffsetKey = 0;
		switch (this.graph.type) {
			case 'doughnut':
			case 'pie':
				// XY Titles
				if (this.axis.x.show && this.axis.x.key.length && this.axis.x.showKey) {
					yOffsetKey = gr.CalcTextHeight(this.axis.x.key, this.gFont) + _scale(2);
					y -= yOffsetKey;
				}
				if (this.axis.y.show && this.axis.y.key.length && this.axis.y.showKey) {
					xOffsetKey = gr.CalcTextHeight(this.axis.y.key, this.gFont) + _scale(2);
					// x += xOffsetKey;
					w -= xOffsetKey;
				}
				break;
			default:
				// XY Titles
				if (this.axis.x.show && this.axis.x.key.length && this.axis.x.showKey || this.graph.type === 'timeline') {
					yOffsetKey = gr.CalcTextHeight(this.axis.x.key, this.gFont) + _scale(2);
					y -= yOffsetKey;
				}
				if (this.axis.y.show && this.axis.y.key.length && this.axis.y.showKey) {
					xOffsetKey = gr.CalcTextHeight(this.axis.y.key, this.gFont) + _scale(2);
					x += xOffsetKey;
					w -= xOffsetKey;
				}
				// Ticks
				if (this.axis.y.show && this.axis.y.labels) {
					tickText.forEach((tick) => {
						const yTickW = gr.CalcTextWidth(tick, this.gFont) + this.axis.y.width / 2 + _scale(4);
						if (this.margin.leftAuto <= yTickW) { this.margin.leftAuto += this.margin.left; x += this.margin.left; }
					});
				}
				// XY Axis
				if (this.axis.x.show) {
					if (this.graph.type === 'timeline') {
						gr.DrawLine(x, (y - h) / 2 + this.margin.top + this.axis.x.width / 2, x + w - this.margin.leftAuto, (y - h) / 2 + this.margin.top + this.axis.x.width / 2, this.axis.x.width, xAxisColor);
					} else {
						gr.DrawLine(x, y - this.axis.x.width / 2, x + w - this.margin.leftAuto, y - this.axis.x.width / 2, this.axis.x.width, xAxisColor);
					}
				}
				if (this.axis.y.show) {
					gr.DrawLine(x, y, x, h, this.axis.y.width, yAxisColor);
				}
		}
		x += this.axis.x.width / 2;
		w -= this.axis.y.width / 2;
		y -= this.axis.y.width;
		let tickW, barW, offsetTickText = 0;
		switch (this.graph.type) {
			case 'lines':
			case 'fill': {
				x -= this.axis.x.width * 1 / 2;
				tickW = (w - this.margin.leftAuto) / ((xAxisValuesLen - 1) || 1);
				barW = 0;
				offsetTickText = - tickW / 2;
				// Values
				const last = xAxisValuesLen - 1;
				gr.SetSmoothingMode(4); // Antialias for lines
				this.dataDraw.forEach((serie, i) => {
					if (this.graph.type === 'fill') {
						this.paintFill(gr, serie, i, x, y, w, h, maxY, tickW, last, xAxisValues);
					} else if (this.graph.type === 'lines') {
						this.paintLines(gr, serie, i, x, y, w, h, maxY, tickW, last, xAxisValues);
					}
				});
				gr.SetSmoothingMode(0);
				break;
			}
			case 'scatter': {
				x -= this.axis.x.width * 1 / 2;
				tickW = (w - this.margin.leftAuto) / ((xAxisValuesLen - 1) || 1);
				barW = 0;
				offsetTickText = - tickW / 2;
				// Values
				gr.SetSmoothingMode(4); // Antialias for lines
				this.dataDraw.forEach((serie, i) => {
					this.paintScatter(gr, serie, i, x, y, w, h, maxY, tickW, xAxisValues);
				});
				gr.SetSmoothingMode(0);
				break;
			}
			case 'q-q plot':
			case 'p-p plot': { // Mixes scatter and lines (last serie)
				x -= this.axis.x.width * 1 / 2;
				tickW = (w - this.margin.leftAuto) / ((xAxisValuesLen - 1) || 1);
				barW = 0;
				offsetTickText = - tickW / 2;
				// Values
				const last = xAxisValuesLen - 1;
				gr.SetSmoothingMode(4); // Antialias for lines
				const len = this.dataDraw.length - 1;
				if (len > 0) { // Paint first the line, then the points
					this.paintLines(gr, this.dataDraw[len], len, x, y, w, h, maxY, tickW, last, xAxisValues);
					for (let i = 0; i < len; i++) {
						const serie = this.dataDraw[i];
						this.paintScatter(gr, serie, i, x, y, w, h, maxY, tickW, xAxisValues);
					}
				}
				gr.SetSmoothingMode(0);
				break;
			}
			case 'pie': {
				x -= this.axis.x.width * 1 / 2;
				tickW = Math.min((w - this.margin.leftAuto) / 2, (y - h - this.margin.top - this.margin.bottom) / 2);
				barW = 0;
				offsetTickText = - tickW / 2;
				// Values
				gr.SetSmoothingMode(4); // Antialias for lines
				const series = this.dataDraw.length;
				this.dataDraw.forEach((serie, i) => {
					const r = tickW * (series - i) / series;
					const serieCoord = this.paintPie(gr, serie, i, x, y, w, h, maxY, r);
					labelOver.coord.push([{ from: { x: x + w / 2, y: (y + h) / 2 }, to: { x: x + w / 2 + r, y: (y + h) / 2 }, val: void (0), alpha: 0 }, ...serieCoord]);
					this.dataCoords[i].forEach((point) => { point.r1 = (series - i - 1) / series * r; });
				});
				labelOver.r = tickW;
				gr.SetSmoothingMode(0);
				break;
			}
			case 'doughnut': {
				x -= this.axis.x.width * 1 / 2;
				tickW = Math.min((w - this.margin.leftAuto) / 2, (y - h - this.margin.top - this.margin.bottom) / 2);
				barW = 0;
				offsetTickText = - tickW / 2;
				// Values
				gr.SetSmoothingMode(4); // Antialias for lines
				const series = this.dataDraw.length + 1;
				this.dataDraw.forEach((serie, i) => {
					const r1 = tickW * (series - i) / series;
					const r2 = tickW * (series - i - 1) / series;
					const serieCoord = this.paintDoughnut(gr, serie, i, x, y, w, h, maxY, r1, r2);
					labelOver.coord.push([{ from: { x: x + w / 2, y: (y + h) / 2 }, to: { x: x + w / 2 + r1, y: (y + h) / 2 }, val: void (0), alpha: 0 }, ...serieCoord]);
					this.dataCoords[i].forEach((point) => { point.r1 = (series - i - 1) / series * r1; });
				});
				labelOver.r = tickW;
				gr.SetSmoothingMode(0);
				break;
			}
			case 'timeline': {
				tickW = (w - this.margin.leftAuto) / xAxisValuesLen;
				barW = tickW / this.series;
				// Values
				this.dataDraw.forEach((serie, i) => {
					this.paintTimeline(gr, serie, i, x, y, w, h, maxY, tickW, barW, xAxisValues);
				});
				break;
			}
			case 'bars':
			default: {
				tickW = (w - this.margin.leftAuto) / xAxisValuesLen;
				barW = tickW / this.series;
				// Values
				this.dataDraw.forEach((serie, i) => {
					this.paintBars(gr, serie, i, x, y, w, h, maxY, tickW, barW, xAxisValues);
				});
			}
		}

		/*
			Draw for all graphs
		*/
		switch (this.graph.type) {
			case 'doughnut':
			case 'pie':
				// Y Axis ticks
				if (this.axis.y.show || this.axis.x.show) {
					if (this.axis.y.labels || this.axis.x.labels) {
						const series = this.dataDraw.length + (this.graph.type === 'doughnut' ? 1 : 0);
						this.dataDraw.forEach((serie, i) => {
							const labels = labelOver.coord[i];
							let prevLabel = labels[0];
							labels.slice(1).forEach((label, j) => {
								const tetha = (label.alpha - prevLabel.alpha) / 2 + prevLabel.alpha;
								if (this.axis.y.labels) { // Value labels
									const labelText = round(label.val, 0) + '%';
									const tickH = gr.CalcTextHeight(labelText, this.gFont);
									const tickW = gr.CalcTextWidth(labelText, this.gFont);
									const centroid = labelOver.r / series * ((series - (i + 1)) / 2 + (series - i) / 2);
									const yTickText = label.from.y + centroid * Math.sin(tetha) - tickH / 2;
									const xTickText = label.from.x + centroid * Math.cos(tetha) - tickW / 2;
									const flags = DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
									gr.GdiDrawText(labelText, this.gFont, yAxisColor, xTickText, yTickText, tickW, tickH, flags);
								}
								if (this.axis.x.labels && i === 0 || !this.axis.x.bSingleLabels) { // keys
									const labelText = xAxisValues[j];
									const tickH = gr.CalcTextHeight(labelText, this.gFont);
									const tickW = gr.CalcTextWidth(labelText, this.gFont);
									const border = labelOver.r / series * (series - i);
									const yTickText = label.from.y + (border + tickH / 2) * Math.sin(tetha) - tickH / 2;
									const xTickText = label.from.x + (border + tickW) * Math.cos(tetha) - tickW / 2;
									const flags = DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
									const borderColor = bgColor
										? RGBA(...Chroma.average([invert(this.colors[i][j], true), bgColor], void (0), [0.9, 0.1]).rgb(), 150)
										: RGBA(...toRGB(invert(this.colors[i][j], true)), 150);
									const offsetR = Math.max(Math.max(xTickText + tickW + _scale(2) + this.margin.right / 3, w) - w - x, 0);
									const offsetL = Math.max(Math.max(xTickText, this.x + _scale(2) + this.margin.left / 3) - xTickText, 0);
									// Lines to labels
									if (this.axis.x.bAltLabels) {
										const centroid = labelOver.r / series * ((series - (i + 1)) / 2 + (series - i) / 2); // Set to zero to draw from center
										const centerX = label.from.x + centroid * Math.cos(tetha);
										const centerY = label.from.y + centroid * Math.sin(tetha);
										const borderX = xTickText - _scale(2) - offsetR + offsetL;
										gr.DrawEllipse(centerX, centerY, 1, 1, 4, borderColor);
										const anchorX = (borderX < centerX && borderX + tickW > centerX)
											? centerX
											: (borderX > label.from.x ? Math.min : Math.max)(borderX, borderX + tickW / 2);
										const anchorY = (yTickText < centerY && yTickText + tickH > centerY)
											? centerY
											: (yTickText > label.from.y ? Math.min : Math.max)(yTickText, yTickText + tickH);
										gr.DrawLine(label.from.x + centroid * Math.cos(tetha), label.from.y + centroid * Math.sin(tetha), anchorX, anchorY, this.graph.borderWidth, borderColor);
									}
									// Labels
									gr.FillSolidRect(xTickText - _scale(2) - offsetR + offsetL, yTickText, tickW + _scale(4), tickH, borderColor);
									gr.GdiDrawText(labelText, this.gFont, this.colors[i][j], xTickText - offsetR + offsetL, yTickText, tickW, this.h, flags);
								}
								prevLabel = label;
							});
						});
					}
					if (this.axis.y.key.length && this.axis.y.showKey && labelOver.coord.length) {
						const key = this.configuration.bAltVerticalText ? this.axis.y.key.flip() : this.axis.y.key;
						const keyW = gr.CalcTextWidth(key, this.gFont);
						const keyH = gr.CalcTextHeight(key, this.gFont);
						if (this.configuration.bAltVerticalText) { // Flip chars
							gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
							gr.DrawString(key, this.gFont, yAxisColor, labelOver.coord[0][0].from.x - labelOver.r - keyH * 2, this.y + (this.h - this.y) / 2 - keyW * 2 / 3, w, this.h, StringFormatFlags.DirectionVertical);
							gr.SetTextRenderingHint(TextRenderingHint.SystemDefault);
						} else { // Draw vertical text in 2 passes, with different rendering hinting and alpha channel to enhance readability
							const img = gdi.CreateImage(keyW, keyH);
							const _gr = img.GetGraphics();
							_gr.SetTextRenderingHint(TextRenderingHint.SingleBitPerPixelGridFit);
							_gr.DrawString(key, this.gFont, RGBA(...toRGB(yAxisColor), 200), 0, 0, keyW, keyH, StringFormatFlags.NoWrap);
							_gr.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
							_gr.DrawString(key, this.gFont, RGBA(...toRGB(yAxisColor), 123), 0, 0, keyW, keyH, StringFormatFlags.NoWrap);
							img.RotateFlip(RotateFlipType.Rotate90FlipXY);
							img.ReleaseGraphics(_gr);
							gr.SetInterpolationMode(InterpolationMode.NearestNeighbor);
							gr.DrawImage(img, labelOver.coord[0][0].from.x - labelOver.r - keyH * 2, this.y + (this.h - this.y) / 2 - keyW * 2 / 3, keyH, keyW, 0, 0, img.Width, img.Height);
							gr.SetInterpolationMode(InterpolationMode.Default);
						}
					}
				}
				// X Axis ticks
				if (this.axis.x.show) {
					if (this.axis.x.key.length && this.axis.x.showKey && labelOver.coord.length) {
						const keyW = gr.CalcTextWidth(this.axis.x.key, this.gFont);
						gr.GdiDrawText(this.axis.x.key, this.gFont, xAxisColorInverted, labelOver.coord[0][0].from.x - keyW / 2, y + this.axis.x.width, keyW, this.h, DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX);
					}
				}
				break;
			case 'timeline': { // NOSONAR [fallthrough]
				if (this.axis.y.show) {
					ticks.reverse().forEach((tick, i) => {
						const yTick = y - tick / maxY * (y - h) / 2 || y;
						if (yTick < 0) { return; }
						const tickH = gr.CalcTextHeight(tickText[i], this.gFont);
						const yTickText = yTick - tickH / 2;
						if (yTickText < 0) { return; }
						if (i !== 0) {
							gr.DrawLine(x - this.axis.x.width * 2, yTick + this.axis.x.width, x + this.axis.x.width, yTick + this.axis.x.width, this.axis.y.width / 2, yAxisColor);
							gr.DrawLine(x - this.axis.x.width * 2, y + this.margin.top - yTick, x + this.axis.x.width, y + this.margin.top - yTick, this.axis.y.width / 2, yAxisColor);
						} else {
							gr.DrawLine(x - this.axis.x.width * 2, yTick, x + this.axis.x.width, yTick, this.axis.y.width / 2, yAxisColor);
						}
						if (this.axis.y.labels) {
							const flags = DT_RIGHT | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
							if (i !== 0) {
								gr.GdiDrawText(tickText[i], this.gFont, yAxisColor, this.x - this.axis.y.width / 2 - _scale(4) + xOffsetKey, yTickText + (this.axis.x.show ? this.axis.x.width : 0), this.margin.leftAuto, tickH, flags);
								gr.GdiDrawText(tickText[i], this.gFont, yAxisColor, this.x - this.axis.y.width / 2 - _scale(4) + xOffsetKey, y - h + this.margin.top - yTick - this.axis.y.width / 2 + (this.axis.x.show ? this.axis.x.width : 0), this.margin.leftAuto, tickH, flags);
							} else {
								gr.GdiDrawText(tickText[i], this.gFont, yAxisColor, this.x - this.axis.y.width / 2 - _scale(4) + xOffsetKey, yTickText, this.margin.leftAuto, tickH, flags);
							}
						}
					});
				}
				if (this.axis.x.show) {
					if (this.axis.x.show && this.axis.x.labels) {
						const yPos = (y - h) + this.margin.top - this.graph.borderWidth / 2 - (this.axis.x.bAltLabels ? 0 : (y - h) / 2);
						const minTickW = w / 30;
						const bFitTicks = w / tickW < 30;
						const drawLabelW = bFitTicks ? tickW : tickW * 3;
						let lastLabel = x;
						xAxisValues.forEach((valueX, i) => {
							const xLabel = x + i * tickW;
							// Don't paint labels when they can't be fitted properly
							if (!bFitTicks) {
								if (i !== 0 && (xLabel - lastLabel) < minTickW) { return; }
								lastLabel = xLabel;
							}
							if (this.axis.x.labels) {
								const tickH = gr.CalcTextHeight(valueX, this.gFont);
								const borderColor = RGBA(...toRGB(invert(xAxisColor, true)), 150);
								const xTickW = gr.CalcTextWidth(valueX, this.gFont);
								const flags = DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
								gr.FillSolidRect(xLabel + tickW / 2 + offsetTickText - _scale(3) - xTickW / 2, yPos + tickH / 6, xTickW + _scale(4), tickH, borderColor);
								gr.GdiDrawText(valueX, this.gFont, xAxisColorInverted, xLabel + offsetTickText - (bFitTicks ? 0 : tickW), yPos + this.axis.y.width, drawLabelW, this.h, flags);
							}
							const yLine = yPos + this.axis.x.width * 2;
							let xLine = xLabel;
							let hLine = yPos - this.axis.x.width - (this.axis.x.bAltLabels ? (y - h) / 2 : 0);
							// Center line and ajust height if data is evenly grouped
							if (this.graphSpecs.timeline.bAxisCenteredX) {
								xLine += tickW / 2;
								if (this.dataManipulation.group % 2 !== 0) {
									const [serie, idx] = this.tracePoint(xLine, yPos - this.axis.x.width - (y - h) / 2);
									if (serie !== -1 && idx !== -1) {
										const coords = this.sizePoint(this.dataCoords[serie][idx], false);
										hLine += coords.h;
									}
								}
							}
							gr.DrawLine(xLine, yLine, xLine, hLine, this.axis.x.width / 2, xAxisColor);
						});
					}
					if (this.axis.x.key.length && this.axis.x.showKey) {
						const offsetH = this.axis.x.labels ? gr.CalcTextHeight('A', this.gFont) : 0;
						gr.GdiDrawText(this.axis.x.key, this.gFont, xAxisColorInverted, x, y + this.axis.x.width + offsetH, w, this.h, DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX);
					}
				}
			}
			// eslint-disable-next-line no-fallthrough
			case 'bars': // NOSONAR [fallthrough]
				if (this.axis.x.show && this.axis.x.labels && this.axis.x.bAltLabels && this.graph.type !== 'timeline') {
					const yLabel = (y - h) / 2;
					const minTickW = w / 30;
					const bFitTicks = w / tickW < 30;
					if (!bFitTicks) { offsetTickText -= tickW; }
					let lastLabel = x;
					xAxisValues.forEach((valueX, i) => {
						let xLabel = x + i * tickW;
						// Don't paint labels when they can't be fitted properly
						if (!bFitTicks) {
							if (i !== 0 && (xLabel - lastLabel) < minTickW) { return; }
							lastLabel = xLabel;
						}
						valueX = this.configuration.bAltVerticalText ? valueX.flip() : valueX;
						const xTickW = gr.CalcTextWidth(valueX, this.gFont);
						const xtickH = gr.CalcTextHeight(valueX, this.gFont);
						// Draw line and rectangle
						const borderColor = RGBA(...toRGB(invert(xAxisColor, true)), 150);
						gr.DrawLine(xLabel, y, xLabel, yLabel, this.axis.x.width / 2, xAxisColor);
						xLabel -= (i === 0 ? 0 : xtickH / 2);
						gr.FillSolidRect(xLabel, yLabel - xTickW - _scale(5), xtickH, xTickW + _scale(5), borderColor);
						if (this.configuration.bAltVerticalText) { // Flip chars
							gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
							gr.DrawString(valueX, this.gFont, xAxisColor, xLabel, yLabel - xTickW - this.axis.x.width, tickW, this.h, StringFormatFlags.DirectionVertical);
							gr.SetTextRenderingHint(TextRenderingHint.SystemDefault);
						} else {
							const keyH = gr.CalcTextHeight(valueX, this.gFont);
							const img = gdi.CreateImage(xTickW, keyH);
							const _gr = img.GetGraphics();
							_gr.SetTextRenderingHint(TextRenderingHint.SingleBitPerPixelGridFit);
							_gr.DrawString(valueX, this.gFont, RGBA(...toRGB(xAxisColor), 255), 0, 0, xTickW, keyH, StringFormatFlags.NoWrap);
							_gr.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
							_gr.DrawString(valueX, this.gFont, RGBA(...toRGB(xAxisColor), 123), 0, 0, xTickW, keyH, StringFormatFlags.NoWrap);
							img.RotateFlip(RotateFlipType.Rotate90FlipXY);
							img.ReleaseGraphics(_gr);
							gr.SetInterpolationMode(InterpolationMode.NearestNeighbor);
							gr.DrawImage(img, xLabel, yLabel - xTickW - this.axis.x.width, keyH, xTickW, 0, 0, img.Width, img.Height);
							gr.SetInterpolationMode(InterpolationMode.Default);
						}
					});
				}
				if (this.graph.multi) {
					if (w / tickW < 30) { // Don't paint labels when they can't be fitted properly
						points.forEach((serie, i) => {
							serie.forEach((value, j) => {
								const zLabel = x + (xAxisValues.indexOf(value.x) + i / this.series) * tickW;
								let valueZ = (this.configuration.bAltVerticalText ? value.z.flip() : value.z) || '';
								const xTickW = gr.CalcTextWidth(valueZ, this.gFont);
								if (xTickW) {
									if (this.configuration.bAltVerticalText) { // Flip chars
										gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
										gr.DrawString(valueZ, this.gFont, xAxisColor, zLabel, y - xTickW - this.axis.x.width, tickW, this.h, StringFormatFlags.DirectionVertical);
										gr.SetTextRenderingHint(TextRenderingHint.SystemDefault);
									} else {
										const keyH = gr.CalcTextHeight(valueZ, this.gFont);
										const img = gdi.CreateImage(xTickW, keyH);
										const _gr = img.GetGraphics();
										let topMax = xTickW;
										if (this.currPoint[0] !== i || this.currPoint[1] !== j) {
											topMax = Math.min(xTickW, value.y / maxY * (y - h));
											if (valueZ.length > 3 && topMax > 30) {
												if (xTickW > (topMax - this.axis.x.width - _scale(2))) {
													const wPerChar = (xTickW / valueZ.length);
													valueZ = valueZ.cut(Math.floor((topMax - this.axis.x.width) / (wPerChar) - 3));
												}
											} else { valueZ = valueZ.cut(1); }
										} else if (this.hasToolbar && (zLabel + keyH) >= this.buttonsCoords.x()) { bHideToolbar = true; }
										_gr.SetTextRenderingHint(TextRenderingHint.SingleBitPerPixelGridFit);
										_gr.DrawString(valueZ, this.gFont, RGBA(...toRGB(xAxisColor), 255), 0, 0, topMax, keyH, StringFormatFlags.NoWrap);
										_gr.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
										_gr.DrawString(valueZ, this.gFont, RGBA(...toRGB(xAxisColor), 123), 0, 0, topMax, keyH, StringFormatFlags.NoWrap);
										img.RotateFlip(RotateFlipType.Rotate90FlipXY);
										img.ReleaseGraphics(_gr);
										gr.SetInterpolationMode(InterpolationMode.NearestNeighbor);
										if (this.graph.type === 'timeline') {
											const point = this.dataCoords[i][j];
											gr.DrawImage(img, zLabel, point.y + point.h * 2 - xTickW - this.axis.x.width, keyH, xTickW, 0, 0, img.Width, img.Height);
										} else {
											gr.DrawImage(img, zLabel, y - xTickW - this.axis.x.width, keyH, xTickW, 0, 0, img.Width, img.Height);
										}
										gr.SetInterpolationMode(InterpolationMode.Default);
									}
								}
							});
						});
					}
				}
			default: // eslint-disable-line no-fallthrough
				// Y Axis ticks
				if (this.axis.y.show) {
					if (this.graph.type !== 'timeline') {
						ticks.forEach((tick, i) => {
							const yTick = y - tick / maxY * (y - h) || y;
							if (yTick < 0) { return; }
							const tickH = gr.CalcTextHeight(tickText[i], this.gFont);
							const yTickText = yTick - tickH / 2;
							if (yTickText < 0) { return; }
							gr.DrawLine(x - this.axis.x.width * 2, yTick, x + this.axis.x.width, yTick, this.axis.y.width / 2, yAxisColor);
							if (this.axis.y.labels) {
								const flags = DT_RIGHT | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
								gr.GdiDrawText(tickText[i], this.gFont, yAxisColor, this.x - this.axis.y.width / 2 - _scale(4) + xOffsetKey, yTickText, this.margin.leftAuto, tickH, flags);
							}
						});
					}
					if (this.axis.y.key.length && this.axis.y.showKey) {
						const key = this.configuration.bAltVerticalText ? this.axis.y.key.flip() : this.axis.y.key;
						const maxTickW = gr.CalcTextWidth(tickText[tickText.length - 1], this.gFont);
						const keyW = gr.CalcTextWidth(key, this.gFont);
						const keyH = gr.CalcTextHeight(key, this.gFont);
						if (this.configuration.bAltVerticalText) { // Flip chars
							gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
							gr.DrawString(key, this.gFont, yAxisColor, x - yOffsetKey - maxTickW - _scale(4), this.y + (this.h - this.y) / 2 - keyW / 2, w, this.h, StringFormatFlags.DirectionVertical);
							gr.SetTextRenderingHint(TextRenderingHint.SystemDefault);
						} else { // Draw vertical text in 2 passes, with different rendering hinting and alpha channel to enhance readability
							const img = gdi.CreateImage(keyW, keyH);
							const _gr = img.GetGraphics();
							_gr.SetTextRenderingHint(TextRenderingHint.SingleBitPerPixelGridFit);
							_gr.DrawString(key, this.gFont, RGBA(...toRGB(yAxisColor), 200), 0, 0, keyW, keyH, StringFormatFlags.NoWrap);
							_gr.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
							_gr.DrawString(key, this.gFont, RGBA(...toRGB(yAxisColor), 123), 0, 0, keyW, keyH, StringFormatFlags.NoWrap);
							img.RotateFlip(RotateFlipType.Rotate90FlipXY);
							img.ReleaseGraphics(_gr);
							gr.SetInterpolationMode(InterpolationMode.NearestNeighbor);
							gr.DrawImage(img, x - yOffsetKey - maxTickW - _scale(5), this.y + (this.h - this.y) / 2 - keyW / 2, keyH, keyW, 0, 0, img.Width, img.Height);
							gr.SetInterpolationMode(InterpolationMode.Default);
						}
					}
				}
				// X Axis ticks
				if (this.axis.x.show) {
					if (this.graph.type !== 'timeline') {
						const last = xAxisValuesLen - 1;
						const borderColor = RGBA(...toRGB(invert(xAxisColor, true)), 150);
						const minTickW = w / 30;
						const bFitTicks = w / tickW < 30;
						const drawLabelW = bFitTicks ? tickW : tickW * 3;
						if (!bFitTicks) { offsetTickText -= tickW; }
						let lastLabel = x;
						xAxisValues.forEach((valueX, i) => {
							const xtickH = gr.CalcTextHeight(valueX, this.gFont);
							const xtickW = gr.CalcTextWidth(valueX, this.gFont);
							let xLabel = x + i * tickW;
							// Don't paint labels when they can't be fitted properly
							if (!bFitTicks) {
								if (i !== 0 && (xLabel - lastLabel) < minTickW) { return; }
								lastLabel = xLabel;
							}
							if (this.axis.x.labels && (this.graph.type !== 'bars' || !this.axis.x.bAltLabels)) {
								if (i === 0 && offsetTickText) { // Fix for first label position
									const zeroW = xLabel + offsetTickText - this.x - this.margin.leftAuto / 2  + (bFitTicks ? tickW : drawLabelW);
									const zeroX = this.x + this.margin.leftAuto / 2 + xOffsetKey + (bFitTicks ? 0 : tickW * 2 / 3);
									if (this.axis.x.bAltLabels) { gr.FillSolidRect(this.x + this.margin.leftAuto + xOffsetKey - xtickW / 2 + _scale(2), y + this.axis.y.width * 3 / 2, xtickW + _scale(2), xtickH, borderColor); }
									const flags = DT_LEFT | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
									gr.GdiDrawText(valueX, this.gFont, xAxisColor, zeroX, y + this.axis.y.width, zeroW, this.h, flags);
								} else if (i === last) { // Fix for last label position
									const lastW = xLabel + offsetTickText + tickW > w - this.margin.right
										? this.x + w - (xLabel + offsetTickText) + this.margin.right
										: tickW;
									if (this.axis.x.bAltLabels) { gr.FillSolidRect(xLabel + offsetTickText + xOffsetKey + (lastW / 2 - xtickW) + _scale(2), y + this.axis.y.width * 3 / 2, xtickW + _scale(2), xtickH, borderColor); }
									const flags = DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
									gr.GdiDrawText(valueX, this.gFont, xAxisColor, xLabel + offsetTickText + xOffsetKey, y + this.axis.y.width, lastW - xOffsetKey, this.h, flags);
								} else {
									if (this.axis.x.bAltLabels) { gr.FillSolidRect(xLabel - xtickW / 2 - _scale(2), y + this.axis.y.width * 3 / 2, xtickW + _scale(2), xtickH, borderColor); }
									const flags = DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
									gr.GdiDrawText(valueX, this.gFont, xAxisColor, xLabel + offsetTickText, y + this.axis.y.width, drawLabelW, this.h, flags);
								}
							}
							const xLine = xLabel + barW;
							gr.DrawLine(xLine, y + this.axis.x.width * 2, xLine, y - this.axis.x.width, this.axis.x.width / 2, xAxisColor);
						});
						if (this.axis.x.key.length && this.axis.x.showKey) {
							const offsetH = this.axis.x.labels ? gr.CalcTextHeight('A', this.gFont) : 0;
							gr.GdiDrawText(this.axis.x.key, this.gFont, xAxisColor, x, y + this.axis.x.width + offsetH, w, this.h, DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX);
						}
					}
				}
				// Grid
				if (this.grid.y.show) {
					ticks.forEach((tick) => {
						const yTick = y - tick / maxY * (y - h);
						gr.DrawLine(x, yTick, w, yTick, this.grid.y.width, this.callbacks.config.backgroundColor ? invert(this.callbacks.config.backgroundColor()[0], true) : yGridColor);
					});
				}
				if (this.grid.x.show) {
					xAxisValues.forEach((tick, i) => {
						const xLine = x + barW + i * tickW;
						gr.DrawLine(xLine, y - this.grid.y.width, xLine, h, this.grid.x.width, xGridColor);
					});
				}
		}
		return { bHideToolbar };
	};

	this.paintButtons = (gr, bHideToolbar = false) => {
		const color = invert(this.callbacks.config.backgroundColor ? this.callbacks.config.backgroundColor()[0] : this.background.color || this.axis.x.color, true);
		if (this.buttons.xScroll) {
			this.leftBtn.paint(gr, color);
			this.rightBtn.paint(gr, color);
		}
		// Toolbar
		if (!bHideToolbar) {
			if (this.buttons.settings) { this.settingsBtn.paint(gr, color); }
			if (this.buttons.display) { this.displayBtn.paint(gr, color); }
			if (this.buttons.zoom) { this.zoomBtn.paint(gr, color); }
			if (this.buttons.custom) { this.customBtn.paint(gr, color); }
		}
	};

	this.paint = (gr) => {
		if (!window.ID) { return; }
		if (!window.Width || !window.Height) { return; }
		if (this.configuration.bProfile) { this.profile.Reset(); }
		this.paintBg(gr);
		if (this.configuration.bProfile) { this.profile.Print('Paint background', false); }
		const { bHideToolbar } = this.paintGraph(gr);
		if (this.configuration.bProfile) { this.profile.Print('Paint graph', false); }
		this.paintButtons(gr, bHideToolbar);
		this.pop.paint(gr);
	};

	this.repaint = (x = this.x, y = this.y, w = x + this.w, h = y + this.h, bForce = false) => {
		window.RepaintRect(x, y, w, h, bForce);
	};

	/*
		Helpers
	*/
	this.steps = (min, max, num = 10) => {
		const len = this.h - this.y - this.margin.bottom - this.margin.top;
		const minSep = Math.round(len / 5);
		if (len / num < minSep) { num = Math.round(len / minSep); }
		const step = Math.floor((max - min) / num);
		return min !== max ? range(min, max, step || 1) : [min];
	};

	this.randomColor = () => {
		return RGB(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
	};

	this.chromaColor = (scheme = this.chroma.scheme, len = this.series, mode = this.chroma.interpolation) => {
		return Chroma.scale(scheme).mode(mode || 'lrgb').colors(len, 'rgb').map((arr) => { return RGB(...arr); });
	};

	this.nFormatter = (num) => { // Y axis formatter
		const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
		const tier = Math.log10(Math.abs(num)) / 3 | 0;
		// if zero, we don't need a suffix
		if (tier === 0) { return num; }
		// get suffix and determine scale
		const suffix = SI_SYMBOL[tier];
		const scale = Math.pow(10, tier * 3);
		// scale the number
		const scaled = num / scale;
		// format number and add suffix
		return scaled.toFixed(1) + suffix;
	};

	this.cleanPoints = () => {
		this.dataCoords = this.dataDraw.map(() => { return []; });
		this.currPoint = [-1, -1];
		this.nearPoint = [-1, -1];
		this.stats.maxY = this.stats.minY = 0;
	};

	/*
		Callbacks
	*/

	this.sizePoint = (point /* pointCoords */, bWithOffset = false) => {
		const size = { x: void (0), y: void (0), w: void (0), h: void (0) };
		switch (this.graph.type) {
			case 'doughnut':
			case 'pie': {
				const r = point.r2;
				const pointX = [
					point.c.x + Math.cos(point.alpha2) * r,
					point.c.x + Math.cos(point.alpha1) * r,
					point.c.x + Math.cos(point.alpha2) * point.r1,
					point.c.x + Math.cos(point.alpha1) * point.r1
				];
				const pointY = [
					point.c.y + Math.sin(point.alpha2) * r,
					point.c.y + Math.sin(point.alpha1) * r,
					point.c.y + Math.sin(point.alpha2) * point.r1,
					point.c.y + Math.sin(point.alpha1) * point.r1
				];
				const regions = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2, Math.PI * 2];
				const pointRegions = [point.alpha1, point.alpha2]
					.map((angle) => regions.find((region) => region < angle && region + Math.PI / 2 > angle));
				if ((new Set(pointRegions)).size !== 1) { // Not in same region
					regions.forEach((angle) => {
						if (angle >= pointRegions[0] && angle <= pointRegions[1]) {
							pointX.push(point.c.x + Math.cos(angle) * r);
							pointY.push(point.c.y + Math.sin(angle) * r);
						}
					});
				}
				size.x = Math.min(...pointX);
				size.y = Math.min(...pointY);
				size.w = Math.max(...pointX) - size.x;
				size.h = Math.max(...pointY) - size.y;
				bWithOffset = false;
				break;
			}
			default: {
				size.x = point.x;
				size.y = point.y;
				size.w = point.w;
				size.h = this.graph.type === 'timeline'
					? point.h * 2
					: point.h;
			}
		}
		if (bWithOffset) {
			size.x -= size.w * 0.25;
			size.w *= 1.5;
		}
		return size;
	};

	this.distanceToPoint = (x, y, point /* pointCoords */) => {
		switch (this.graph.type) {
			case 'doughnut':
			case 'pie': {
				const xc = x - point.c.x;
				const yc = y - point.c.y;
				const r = (xc ** 2 + yc ** 2) ** (1 / 2);
				const phi = xc >= 0
					? yc >= 0
						? Math.asin(yc / r)
						: Math.asin(yc / r) + 2 * Math.PI
					: -Math.asin(yc / r) + Math.PI;
				const distPhi = phi >= point.alpha1 && phi <= point.alpha2 ? 0 : Math.min(Math.abs(phi - point.alpha1), Math.abs(phi - point.alpha2));
				const distR = r >= point.r1 && r <= point.r2 ? 0 : Math.min(Math.abs(r - point.r1), Math.abs(r - point.r2));
				return [distPhi, distR];
			}
			default: {
				const top = point.y + point.h + (this.graph.type === 'timeline' ? point.h + this.axis.x.width : 0);
				const distX = x >= point.x && x <= point.x + point.w ? 0 : Math.min(Math.abs(x - point.x), Math.abs(x - point.x - point.w));
				const distY = y >= point.y && y <= top ? 0 : Math.min(Math.abs(y - point.y), Math.abs(y - top));
				return [distX, distY];
			}
		}
	};

	this.tracePoint = (x, y, bCacheNear = false) => {
		const distances = bCacheNear ? [] : null;
		switch (this.graph.type) {
			case 'doughnut':
			case 'pie':
				for (let i = 0; i < this.series; i++) {
					const serie = this.dataCoords[i];
					const len = serie.length;
					for (let j = 0; j < len; j++) {
						const [distPhi, distR] = this.distanceToPoint(x, y, serie[j]);
						if (distPhi === 0 && distR === 0) {
							if (bCacheNear) { this.nearPoint = [i, j]; }
							return [i, j];
						} else if (bCacheNear) {
							distances.push({ idx: [i, j], dist: distR });
						}
					}
				}
				break;
			default: {
				const tracedPoints = [];
				for (let i = 0; i < this.series; i++) {
					const serie = this.dataCoords[i];
					const len = serie.length;
					for (let j = 0; j < len; j++) {
						const point = serie[j];
						const [distX, distY] = this.distanceToPoint(x, y, point);
						if (distX === 0 && distY === 0) {
							tracedPoints.push({ serieIdx: i, pointIdx: j, point });
							break;
						} else if (bCacheNear) {
							distances.push({ idx: [i, j], dist: (distX ** 2 + distY ** 2) ** (1 / 2) });
						}
					}
				} // For multiple series, points may be stacked and they are preferred by Y position
				if (tracedPoints.length) {
					tracedPoints.sort((a, b) => { return a.point.x - b.point.x + a.point.y - b.point.y; });
					if (bCacheNear) { this.nearPoint = [tracedPoints[0].serieIdx, tracedPoints[0].pointIdx]; }
					return [tracedPoints[0].serieIdx, tracedPoints[0].pointIdx];
				}
			}
		}
		if (bCacheNear && distances.length) {
			this.nearPoint = distances.sort((a, b) => { return a.dist - b.dist; })[0].idx; // NOSONAR
		}
		return [-1, -1];
	};

	this.trace = (x, y) => {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	};

	this.move = (x, y, mask) => {
		if (!window.ID) { return false; }
		if (this.trace(x, y)) {
			let bHand = false;
			let ttText = '';
			this.mx = x;
			this.my = y;
			this.inFocus = true;
			if (this.pop.isEnabled()) { this.pop.move(x, y); }
			else {
				if (this.buttons.xScroll) {
					if (this.leftBtn.move(x, y) || this.rightBtn.move(x, y)) {
						bHand = true;
						ttText = 'L. Click to scroll on X-axis\n\nDouble L. Click to jump to ' + (this.rightBtn.hover ? 'right' : 'left');
					}
				}
				if (this.buttons.settings) {
					if (this.settingsBtn.move(x, y)) {
						bHand = true;
						ttText = 'Main settings\n\n(Shift + Win + R. Click\nfor SMP panel menu)';
					}
				}
				if (this.buttons.display) {
					if (this.displayBtn.move(x, y)) {
						bHand = true;
						ttText = 'Display settings';
					}
				}
				if (this.buttons.zoom) {
					if (this.zoomBtn.move(x, y)) {
						bHand = true;
						ttText = 'Press Shift to zoom out\n\nDouble CLick for max zoom in/out';
					}
				}
				if (this.buttons.custom) {
					if (this.customBtn.move(x, y)) {
						bHand = true;
						ttText = this.callbacks.custom.tooltip
							? isFunction(this.callbacks.custom.tooltip) ? this.callbacks.custom.tooltip() : this.callbacks.custom.tooltip
							: '';
					}
				}
				const [serie, idx] = this.tracePoint(x, y, true);
				const bPoint = serie !== -1 && idx !== -1;
				const bPaint = this.currPoint[0] !== serie || this.currPoint[1] !== idx;
				if (bPaint) {
					let coords;
					// Repaint around current point
					if (bPoint) {
						coords = this.sizePoint(this.dataCoords[serie][idx], true);
						this.repaint(...Object.values(coords));
					}
					// Repaint around old point
					if (this.currPoint[0] !== -1 && this.currPoint[1] !== -1) {
						coords = this.sizePoint(this.dataCoords[this.currPoint[0]][this.currPoint[1]], true);
						this.repaint(...Object.values(coords));
					}
				}
				if (!bHand && !ttText) {
					this.currPoint = [serie, idx];
					if (bPoint) {
						bHand = true;
						const bPercent = this.graph.type === 'doughnut' || this.graph.type === 'pie';
						const refPoint = this.dataDraw[serie][idx];
						const bShowAllPoints = this.graph.multi && ['scatter', 'lines', 'fill'].includes(this.graph.type);
						const points = bShowAllPoints && this.dataDraw.length > 1
							? this.dataDraw.map((s) => s.find((p) => p.x === refPoint.x)).flat(Infinity).filter(Boolean)
							: [refPoint];
						ttText = '';
						points.forEach((point, i) => {
							if (i > 0) {ttText += '\n';}
							const percent = bPercent
								? Math.round(point.y * 100 / this.dataDraw[i].reduce((acc, point) => acc + point.y, 0)) 
								: null;
							ttText += point.x + ': ' + round(point.y, 3) 
								+ (this.axis.y.key ? ' ' + this.axis.y.key : '') +
								(bPercent ? ' ' + _p(percent + '%') : '') +
								(Object.hasOwn(point, 'z') ? ' - ' + point.z : '');
						});
						ttText += this.tooltipText
							? isFunction(tooltipText) ? tooltipText.call(this, refPoint, serie, mask) : tooltipText
							: '';
					}
				}
				if (ttText.length) { this.tooltip.SetValue(ttText, true); }
				else { this.tooltip.SetValue(null); }
				window.SetCursor(bHand ? IDC_HAND : IDC_ARROW);
				return true;
			}
		}
		this.leavePoints(false);
		return false;
	};

	this.leavePoints = (cleanNear = true) => {
		if (cleanNear) { this.nearPoint = [-1, -1]; }
		if (this.currPoint[0] !== -1 || this.currPoint[1] !== -1) {
			let xPoint = 0;
			let wPoint = this.width;
			if (this.currPoint[0] !== -1 && this.currPoint[1] !== -1) {
				({ x: xPoint, w: wPoint } = this.sizePoint(this.dataCoords[this.currPoint[0]][this.currPoint[1]], true));
			}
			this.currPoint = [-1, -1];
			this.repaint(xPoint, void (0), wPoint, void (0));
			return true;
		}
		return false;
	};

	this.leave = () => {
		this.mx = -1;
		this.my = -1;
		this.inFocus = false;
		if (this.buttons.xScroll) {
			this.leftBtn.hover = false;
			this.rightBtn.hover = false;
		}
		if (this.buttons.settings) {
			this.settingsBtn.hover = false;
		}
		if (this.buttons.display) {
			this.displayBtn.hover = false;
		}
		if (this.buttons.zoom) {
			this.zoomBtn.hover = false;
		}
		if (this.buttons.custom) {
			this.customBtn.hover = false;
		}
		return this.leavePoints() || this.repaint();
	};

	this.initPopup = () => {
		if (!this.pop.isEnabled()) {
			this.pop.enable(true, 'Calculating...', 'Calculating statistics...\nPanel will be disabled during the process.');
		}
	};

	this.getCurrentPointIndexFromFirst = () => {
		const near = this.nearPoint[0] !== -1 && this.nearPoint[1] !== -1 ? this.getCurrentPoint(true) : null;
		if (near) {
			let i = 0;
			for (let serie of this.dataDraw) {
				const idx = serie.findIndex((point) => near.x === point.x);
				if (idx !== -1) { return [i, idx]; }
				i++;
			}
		}
		return null;
	};

	this.getCurrentPointIndex = (bNear = false) => {
		return this.currPoint[0] !== -1 && this.currPoint[1] !== -1
			? [...this.currPoint]
			: bNear
				? this.nearPoint[0] !== -1 && this.nearPoint[1] !== -1
					? [...this.nearPoint]
					: null
				: null;
	};

	this.getCurrentPoint = (bNear = false) => {
		const idx = this.getCurrentPointIndex(bNear);
		return idx ? { ...this.dataDraw[idx[0]][idx[1]] } : null;
	};

	this.getCurrentRange = () => {
		const points = Math.max(...this.stats.points);
		const currSlice = [Math.max(this.dataManipulation.slice[0], 0), Math.min(this.dataManipulation.slice[1], points)];
		return Math.max(Math.min(currSlice[1] - currSlice[0], points), 1);
	};

	let prevX = null;
	const cleanPrevX = debounce((release) => { !utils.IsKeyPressed(release) && (prevX = null); }, 500);
	this.calcScrollSlice = (x, currSlice = this.dataManipulation.slice, points = Math.max(...this.stats.points)) => {
		if (!prevX) { prevX = x; return []; }
		const diff = prevX - x;
		if (Math.abs(diff) < _scale(30)) { return []; }
		const left = currSlice[0] + 1 * Math.sign(diff);
		const right = (Number.isFinite(currSlice[1]) ? currSlice[1] : points) + 1 * Math.sign(diff);
		return [left, right];
	};
	this.scrollX = ({ x, step, release = 0x01 /* VK_LBUTTON */, bThrottle = false } = {}) => {
		if (bThrottle) { return this.scrollXThrottle({ x, step, release, bThrottle: false }); }
		const points = Math.max(...this.stats.points);
		const currSlice = [Math.max(this.dataManipulation.slice[0], 0), Math.min(this.dataManipulation.slice[1], points)];
		let left, right;
		if (typeof x === 'undefined') {
			[left, right] = [currSlice[0] + step, currSlice[1] + step];
		} else if (typeof step === 'undefined') {
			[left, right] = this.calcScrollSlice(x, currSlice, points);
			prevX = x;
			cleanPrevX(release);
		} else { return false; }
		if (!left && !right) { return false; }
		if (right > points) { right = points; }
		if (right <= 0) { right = currSlice[1] - currSlice[0]; }
		if (left >= points) { left = points - (currSlice[1] - currSlice[0]); }
		if (left < 0) { left = 0; }
		if (currSlice[0] === left || currSlice[1] === right) { return false; }
		this.changeConfig({ bPaint: true, dataManipulation: { slice: [left, right === points ? Infinity : right] } });
		this.move(this.mx, this.my);
		return true;
	};
	this.scrollXThrottle = throttle(this.scrollX, 60);

	this.zoomX = (step, bThrottle) => {
		if (bThrottle) { return this.zoomXThrottle(step, false); }
		const currPoint = this.getCurrentPointIndexFromFirst(true);
		if (!currPoint) { return false; }
		const points = Math.max(...this.stats.points);
		const pointsDraw = Math.max(...this.stats.pointsDraw);
		const currSlice = [Math.max(this.dataManipulation.slice[0], 0), Math.min(this.dataManipulation.slice[1], points)];
		currPoint[1] += currSlice[0];
		const range = Math.max(Math.min(currSlice[1] - currSlice[0], points), 1);
		const newRange = range - step * Math.ceil(pointsDraw / 5) *
			(utils.IsKeyPressed(VK_CONTROL)
				? 3
				: utils.IsKeyPressed(VK_SHIFT)
					? 2
					: 1
			);
		if (range === points && newRange > range) { return false; }
		let left, right;
		if (this.isNormalDistribution()) {
			if (Number.isFinite(newRange)) {
				left = 0;
				right = left + newRange;
				right = Math.min(right, Math.floor((points - 2) / 2));
			} else if (newRange === Infinity) {
				left = 0;
				right = Infinity;
			} else {
				left = 0;
				right = 1;
			}
		} else {
			if (Number.isFinite(newRange)) { // NOSONAR
				if (step < 0 && points - currPoint[1] < Math.round(newRange / 2)) {
					left = points - newRange;
				} else {
					left = currPoint[1] - Math.round(newRange / 2);
				}
				left = Math.max(left, 0);
				right = left + newRange;
				right = Math.min(right, points);
			} else if (newRange === Infinity) {
				left = 0;
				right = Infinity;
			} else {
				left = right = Math.floor(points / 2);
			}
		}
		if (left === right) { right = left + 1; }
		if ((left - right) >= points) {
			right = Infinity;
			if ((left - right) >= range) { return false; }
		}
		this.changeConfig({ bPaint: true, dataManipulation: { slice: [left, right === points ? Infinity : right] } });
		this.move(this.mx, this.my);
		return true;
	};
	this.zoomXThrottle = throttle(this.zoomX, 30);

	this.hasToolbar = false;
	this.buttonsCoords = { x: () => this.x + this.w - _scale(26), y: () => this.y + _scale(12), size: _scale(24) };
	this.resizeButtons = () => {
		this.leftBtn.x = this.x;
		this.leftBtn.y = (this.y + this.h) / 2;
		this.leftBtn.w = this.buttonsCoords.size / 2;
		this.rightBtn.x = this.x + this.w - this.rightBtn.w;
		this.rightBtn.y = (this.y + this.h) / 2;
		this.rightBtn.w = this.buttonsCoords.size / 2;
		// Toolbar
		let i = 0;
		Object.keys(this.buttons).forEach((label) => {
			const key = label + 'Btn';
			if (Object.hasOwn(this, key) && this.buttons[label]) {
				this[key].x = this.buttonsCoords.x();
				this[key].y = this.buttonsCoords.y() + i * this.buttonsCoords.size;
				this[key].w = this[key].h = this.buttonsCoords.size;
				this.hasToolbar = true;
				i++;
			}
		});
	};

	this.resize = (x, y, w, h, bRepaint = true) => {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.resizeButtons();
		this.pop.x = this.x;
		this.pop.y = this.y;
		this.pop.resize(this.w, this.pop.h);
		this.pop.resize(this.pop.w, this.h - this.y);
		if (bRepaint) { this.repaint(); }
	};

	this.lbtnDown = (x, y, mask) => {
		if (this.trace(x, y)) {
			if (this.buttons.xScroll) {
				if (this.leftBtn.lbtn_down(x, y, mask, this) || this.rightBtn.lbtn_down(x, y, mask, this)) { return true; }
			}
			return true;
		}
		return false;
	};

	this.lbtnUp = (x, y, mask) => {
		if (this.trace(x, y)) {
			if (this.buttons.xScroll && (this.leftBtn.hover || this.rightBtn.hover)) {
				if (this.leftBtn.lbtn_up(x, y, mask, this) || this.rightBtn.lbtn_up(x, y, mask, this)) { return true; }
			}
			if (this.buttons.settings && this.settingsBtn.hover && this.callbacks.settings.onLbtnUp) {
				if (this.settingsBtn.lbtn_up(x, y, MK_LBUTTON, this)) { return true; }
			}
			if (this.buttons.display && this.displayBtn.hover && this.callbacks.display.onLbtnUp) {
				if (this.displayBtn.lbtn_up(x, y, MK_LBUTTON, this)) { return true; }
			}
			if (this.buttons.zoom && this.zoomBtn.hover && this.callbacks.zoom.onLbtnUp) {
				if (this.zoomBtn.lbtn_up(x, y, mask, this)) { return true; }
			}
			if (this.buttons.custom && this.customBtn.hover && this.callbacks.custom.onLbtnUp) {
				if (this.customBtn.lbtn_up(x, y, mask, this)) { return true; }
			}
			if (this.callbacks.point.onLbtnUp) {
				const point = this.getCurrentPoint(false);
				if (point) { this.callbacks.point.onLbtnUp.call(this, point, x, y, mask); }
			}
			return true;
		}
		return false;
	};

	// This callback must be used in case single click is also used, otherwise double clicking will result in 2 single click calls
	this.lbtnDblClk = (x, y, mask) => {
		mask -= MK_LBUTTON; // Remove useless mask here...
		if (this.trace(x, y)) {
			if (this.buttons.xScroll && (this.leftBtn.hover || this.rightBtn.hover)) {
				if (this.leftBtn.lbtn_dblclk(x, y, mask, this) || this.rightBtn.lbtn_dblclk(x, y, mask, this)) { return true; }
			}
			if (this.buttons.settings && this.settingsBtn.hover) {
				if (this.settingsBtn.lbtn_dblclk(x, y, mask, this)) { return true; }
			}
			if (this.buttons.display && this.displayBtn.hover) {
				if (this.displayBtn.lbtn_dblclk(x, y, mask, this)) { return true; }
			}
			if (this.buttons.zoom && this.zoomBtn.hover) {
				if (this.zoomBtn.lbtn_dblclk(x, y, mask, this)) { return true; }
			}
			if (this.buttons.custom && this.customBtn.hover) {
				if (this.customBtn.lbtn_dblclk(x, y, mask, this)) { return true; }
			}
			return true;
		}
		return false;
	};

	this.rbtnUp = (x, y, mask) => {
		if (this.trace(x, y)) {
			if (this.pop && this.pop.isEnabled()) { return false; }
			const point = this.getCurrentPoint(false);
			if (point && this.callbacks.point.onRbtnUp) {
				this.callbacks.point.onRbtnUp.call(this, point, x, y, mask);
			} else if (this.buttons.settings && this.settingsBtn.hover && this.callbacks.settings.onRbtnUp) {
				this.settingsBtn.rbtn_up(x, y, mask, this);
			} else if (this.buttons.display && this.displayBtn.hover && this.callbacks.display.onRbtnUp) {
				this.displayBtn.rbtn_up(x, y, mask, this);
			} else if (this.buttons.zoom && this.zoomBtn.hover && this.callbacks.zoom.onRbtnUp) {
				this.zoomBtn.rbtn_up(x, y, mask, this);
			} else if (this.buttons.custom && this.customBtn.hover && this.callbacks.custom.onRbtnUp) {
				this.customBtn.rbtn_up(x, y, mask, this);
			} else if (this.callbacks.focus.onRbtnUp) {
				this.callbacks.focus.onRbtnUp.call(this, x, y, mask);
			}
			return true;
		}
		return false;
	};

	this.mouseWheel = (step) => {
		if (this.inFocus) {
			this.callbacks.focus.onMouseWwheel.call(this, step);
			return true;
		}
		return false;
	};

	this.keyUp = (vKey) => { // Switch animations when releasing keys
		if (this.inFocus) {
			switch (vKey) { // NOSONAR
				case VK_SHIFT: {
					if (this.buttons.zoom) {
						this.repaint();
						return true;
					}
					return false;
				}
				default: return false;
			}
		}
		return false;
	};

	this.keyDown = (vKey) => {
		if (this.inFocus) {
			switch (vKey) { // NOSONAR
				case VK_SHIFT: {
					if (this.buttons.zoom) {
						this.repaint();
						return true;
					}
					return false;
				}
				default: return false;
			}
		}
		return false;
	};
	/*
		Data manipulation
	*/

	this.sort = () => { // Sort points with user provided function, may be a compare function, Array method or pair of Array method + argument
		if (!this.dataManipulation.sort) { return; }
		const bHasArg = Array.isArray(this.dataManipulation.sort);
		const sortFunc = bHasArg ? this.dataManipulation.sort[0] : this.dataManipulation.sort;
		const sortArg = bHasArg ? this.dataManipulation.sort[1] : void (0);
		if (Object.values(Array.prototype).includes(sortFunc)) {
			const method = Object.entries(Array.prototype).find((pair) => pair[1] === sortFunc)[0];
			if (sortArg) {
				this.dataDraw = this.dataDraw.map((serie) => { return serie[method](...sortArg); });
			} else {
				this.dataDraw = this.dataDraw.map((serie) => { return serie[method](); });
			}
		} else {
			this.dataDraw = this.dataDraw.map((serie) => { return serie.sort(this.dataManipulation.sort); });
		}
	};

	this.cleanData = () => { // Filter points without valid x or y values
		if (!this.dataDraw) { return; }
		this.dataDraw = this.dataDraw
			.map((serie) => {
				return serie.filter((point) => {
					return (Object.hasOwn(point, 'x') && point.x !== null && point.x !== '' && Object.hasOwn(point, 'y') && Number.isFinite(point.y));
				});
			});
	};

	this.filter = () => { // Filter points with user provided function
		if (!this.dataManipulation.filter) { return; }
		this.dataDraw = this.dataDraw.map((serie) => { return serie.filter(this.dataManipulation.filter); });
	};

	this.slice = () => { // Draw only selected points
		const slice = this.dataManipulation.slice;
		if (!slice || !slice.length === 2 || (slice[0] === 0 && slice[1] === Infinity)) { return; } // NOSONAR
		// If end is greater than the length of the array, it uses the length of the array
		if (this.configuration.bSlicePerKey) {
			const xKeys = new Set();
			const xKeysSerie = [];
			const range = Math.abs(slice[1] - slice[0]);
			const series = this.dataDraw.length;
			for (let i = 0; i < series; i++) {
				const serie = this.dataDraw[i];
				const serieLen = serie.length;
				xKeysSerie.push(new Set());
				let j = i === 0
					? slice[0]
					: serie.findIndex((v) => xKeys.has(v.x));
				let k = j;
				if (range === Infinity) {
					for (void (0); j < serieLen; j++) {
						const value = serie[j];
						if (typeof value === 'undefined' || value === null) { continue; } // Serie may have no point at this range
						if (!xKeys.has(value.x)) { xKeys.add(value.x); }
						xKeysSerie[i].add(value.x);
					}
					this.dataDraw[i] = serie.slice(k, Infinity);
				} else {
					for (void (0); j < serieLen; j++) {
						const value = serie[j];
						if (typeof value === 'undefined' || value === null) { continue; } // Serie may have no point at this range
						if (!xKeys.has(value.x)) {
							if (xKeys.size >= range) {
								this.dataDraw[i] = serie.slice(k, j);
								break;
							}
							xKeys.add(value.x);
						}
						xKeysSerie[i].add(value.x);
					}
				}
			}
		} else {
			this.dataDraw = this.dataDraw.map((serie) => { return serie.slice(...slice); });
		}
	};

	this.normal = (bInverse = false) => { // Sort as normal distribution
		this.dataDraw = this.normalApply(this.dataDraw, bInverse);
	};

	this.normalApply = (series, bInverse = false) => { // Sort as normal distribution
		const sort = bInverse ? (a, b) => { return b.y - a.y; } : (a, b) => { return a.y - b.y; };
		series = series.map((serie) => { return serie.sort(sort).reduceRight((acc, val, i) => { return i % 2 === 0 ? [...acc, val] : [val, ...acc]; }, []); });
		const slice = this.dataManipulation.slice;
		if (!slice || !slice.length === 2 || (slice[0] === 0 && slice[1] === Infinity)) { return series; } // NOSONAR
		series = series.map((serie) => {
			const len = serie.length;
			const tail = slice[1];
			const center = Math.round(len / 2) + slice[0];
			const left = Math.max(center - tail, 1);
			const right = center + tail;
			return serie.slice(left - 1, right);
		});
		return series;
	};

	this.normalInverse = () => { // Tails of normal distribution
		this.normal(true);
	};

	this.isNormalDistribution = (dist = this.dataManipulation.distribution || '') => {
		switch (dist.toLowerCase()) {
			case 'normal': return true;
			case 'normal inverse': return true;
			default: return false;
		}
	};

	this.distribution = (dist = this.dataManipulation.distribution || '') => { // Apply known distributions
		switch (dist.toLowerCase()) {
			case 'normal':
				this.normal();
				return true;
			case 'normal inverse':
				this.normalInverse();
				return true;
			case 'none':
			default:
				return false;
		}
	};

	this.probabilityPlot = (pPlot = this.dataManipulation.probabilityPlot || '') => {
		let bCumulative = false;
		switch (pPlot.toLowerCase()) {
			case 'cdf plot': { bCumulative = true; } // NOSONAR
			case 'cumulative distribution plot': { bCumulative = true; } // eslint-disable-line no-fallthrough
			case 'distribution plot': { // eslint-disable-line no-fallthrough
				let newSerie;
				if (this.series === 1 && this.dataManipulation.distribution) {
					const dist = this.dataManipulation.distribution.toLowerCase();
					if (dist === 'normal inverse') { this.normal(); }
					const serie = this.dataDraw[0];
					const statistics = this.computeStatistics(serie);
					if (dist === 'normal inverse') { this.normalInverse(); }
					newSerie = new Array(statistics.total).fill(0);
					const fNorm = (x) => Math.exp(-((x - statistics.mean) ** 2 / statistics.sigma ** 2) / 2) / (statistics.sigma * Math.sqrt(2 * Math.PI));
					switch (dist) {
						case 'normal':
							newSerie = newSerie.map((_, i) => { return { x: serie[i].x, y: fNorm(i) * statistics.count }; });
							break;
						case 'normal inverse':
							newSerie = newSerie.map((_, i) => { return { x: serie[i].x, y: (1 - fNorm(i)) * statistics.count / statistics.total }; });
							break;
						case 'none':
						default:
							break;
					}
				}
				if (newSerie) { this.dataDraw.push(newSerie); }
				if (bCumulative) { // Create new objects to not overwrite original references...
					this.dataDraw.forEach((serie) => { serie.forEach((val, i, arr) => { arr[i] = { x: val.x, y: val.y + (i ? arr[i - 1].y : 0) }; }); });
				}
				return true;
			}
			case 'p-p plot': {
				let newSerie;
				if (this.series === 1 && this.dataManipulation.distribution) {
					const dist = this.dataManipulation.distribution.toLowerCase();
					if (dist === 'normal inverse') { this.normal(); }
					const serie = this.dataDraw[0];
					const statistics = this.computeStatistics(serie);
					if (dist === 'normal inverse') { this.normalInverse(); }
					newSerie = new Array(statistics.total).fill(0);
					const fNorm = (x) => Math.exp(-((x - statistics.mean) ** 2 / statistics.sigma ** 2) / 2) / (statistics.sigma * Math.sqrt(2 * Math.PI));
					switch (dist.toLowerCase()) {
						case 'normal':
						case 'normal inverse':
							newSerie = newSerie.map((_, i) => { return { x: serie[i].x, y: (1 - fNorm(i)) / statistics.total }; });
							break;
						case 'none':
						default:
							break;
					}
				}
				this.dataDraw.forEach((serie) => {
					const total = serie.reduce((curr, val) => { return curr + val.y; }, 0);
					serie.forEach((val) => { val.y = val.y / total; });
				});
				if (newSerie) { this.dataDraw.push(newSerie); }
				this.dataDraw.forEach((serie) => { serie.forEach((val, i, arr) => { val.y = i ? arr[i - 1].y + val.y : val.y; }); });
				const last = this.dataDraw[this.dataDraw.length - 1];
				// "Fix" float errors and round
				const error = this.dataDraw.map((serie) => (1 - serie[serie.length - 1].y));
				this.dataDraw.forEach((serie, j) => {
					const len = serie.length;
					serie.forEach((val, i) => {
						val.y += error[j] / len * (2 * i - len);
						val.y = round(val.y, 3, 10 ** -3);
					});
				});
				// Change axis
				this.dataDraw.forEach((serie) => {
					serie.forEach((val, i) => {
						val.x = last[i].y;
					});
				});
				return true;
			}
			case 'q-q plot':
				return true;
			case 'none':
			default:
				return false;
		}
	};

	this.computeStatistics = (serie, options = { bClampRange: true }) => {
		options = { bClampRange: true, ...(options || {}) };
		const statistics = {
			max: -Infinity,
			min: +Infinity,
			maxCount: 0,
			minCount: 0,
			total: 0,
			count: 0,
			mean: null,
			median: null,
			mode: null,
			sigma: 0,
			range: null,
			popRange: {
				normal: { '50%': [], '75%': [], '89%': [], '95%': [] },
				universal: { '50%': [], '75%': [], '89%': [], '95%': [] }
			},
		};
		statistics.total = serie.length;
		serie.forEach((p, i) => {
			const val = p.y;
			if (val > statistics.max) { statistics.max = val; }
			if (val < statistics.min) { statistics.min = val; }
			statistics.mean += i * val;
			statistics.count += val;
		});
		statistics.range = statistics.max - statistics.min;
		statistics.mean = statistics.mean / statistics.count;
		serie.forEach((p, i) => {
			const val = p.y;
			if (val === statistics.max) { statistics.maxCount++; }
			else if (val === statistics.min) { statistics.minCount++; }
			statistics.sigma += val * (i - statistics.mean) ** 2;
		});
		statistics.sigma = Math.sqrt(statistics.sigma / (statistics.count - 1));
		statistics.popRange.universal['50%'].push(statistics.mean - Math.sqrt(2) * statistics.sigma, statistics.mean + Math.sqrt(2) * statistics.sigma);
		statistics.popRange.universal['75%'].push(statistics.mean - 2 * statistics.sigma, statistics.mean + 2 * statistics.sigma);
		statistics.popRange.universal['89%'].push(statistics.mean - 3 * statistics.sigma, statistics.mean + 3 * statistics.sigma);
		statistics.popRange.universal['95%'].push(statistics.mean - 4 * statistics.sigma, statistics.mean + 4 * statistics.sigma);
		statistics.popRange.normal['50%'].push(statistics.mean - 0.674490 * statistics.sigma, statistics.mean + 0.674490 * statistics.sigma);
		statistics.popRange.normal['75%'].push(statistics.mean - 1.149954 * statistics.sigma, statistics.mean + 1.149954 * statistics.sigma);
		statistics.popRange.normal['89%'].push(statistics.mean - 1.644854 * statistics.sigma, statistics.mean + 1.644854 * statistics.sigma);
		statistics.popRange.normal['95%'].push(statistics.mean - 2 * statistics.sigma, statistics.mean + 2 * statistics.sigma);
		if (options.bClampRange) {
			for (let key in statistics.popRange) {
				for (let subKey in statistics.popRange[key]) {
					statistics.popRange[key][subKey][0] = Math.max(statistics.min, statistics.popRange[key][subKey][0]);
					statistics.popRange[key][subKey][1] = Math.min(statistics.max, statistics.popRange[key][subKey][1]);
				}
			}
		}
		const binSize = 1;
		const histogram = this.calcHistogram(serie.map((p) => p.y), binSize, statistics.max, statistics.min);
		const masxFreq = Math.max(...histogram);
		statistics.mode = { value: statistics.min + histogram.indexOf(masxFreq) * binSize, frequency: masxFreq };
		{
			let i = 0, acumFreq = statistics.count / 2;
			while (true) {
				acumFreq -= histogram[i];
				if (acumFreq <= 0) { break; } else { i++; }
			}
			statistics.median = statistics.min + (i > 0 ? (2 * i - 1) * binSize / 2 : 0);
		}
		return statistics;
	};

	this.calcHistogram = (data, size, max, min) => {
		if (typeof max === 'undefined' || typeof min === 'undefined') {
			min = Infinity;
			max = -Infinity;
			for (const item of data) {
				if (item < min) { min = item; }
				if (item > max) { max = item; }
			}
		}
		if (min === Infinity) { min = 0; }
		if (max === -Infinity) { max = 0; }
		let bins = Math.ceil((max - min + 1) / size);
		const histogram = new Array(bins).fill(0);
		for (const item of data) {
			histogram[Math.floor((item - min) / size)]++;
		}
		return histogram;
	};

	this.computeStatisticsPoint = (point = this.getCurrentPoint(), precision = 1) => {
		const serieIdx = this.dataDraw.length === 1 
			? 0
			: this.getCurrentPoint() === point 
				? this.getCurrentPointIndex()
				: this.dataDraw.findIndex((serie) => serie.findIndex((p) => {
					return ['x', 'y', 'z'].every((c) => !p[c] && !point[c] || p[c] === point[c]);
				}));
		const bIs3D = Object.hasOwn(this.axis.z, 'tf') && this.axis.z.tf.length;
		let currNum = 0, totalNum = 0;
		const total = bIs3D
			? this.data[serieIdx]
				.map((pointArr) => pointArr.map((subPoint) => subPoint.y)).flat(Infinity)
				.reduce((acc, curr) => { totalNum++; return acc + curr; }, 0)
			: this.data[serieIdx]
				.map((dataPoint) => dataPoint.y).flat(Infinity)
				.reduce((acc, curr) => { totalNum++; return acc + curr; }, 0);
		const totalCurr = bIs3D
			? this.data[serieIdx]
				.map((pointArr) => pointArr.filter((dataPoint) => dataPoint.z === point.z))
				.map((pointArr) => pointArr.map((subPoint) => subPoint.y)).flat(Infinity)
				.reduce((acc, curr) => { currNum++; return acc + curr; }, 0)
			: total;
		const avg = total / totalNum;
		const avgCurr = bIs3D
			? totalCurr / currNum
			: avg;
		const stats = {
			global: {
				total, 
				avg,
				avg100: avg / total * 100
			}, 
			current: {
				total: totalCurr, 
				total100: totalCurr / total * 100,
				avg: avgCurr,
				avg100: avgCurr / totalCurr * 100,
				y: round(point.x, 1), 
				y100: point.y / total * 100 
			}
		};
		if (precision >= 0) {
			['global', 'current'].forEach((key) => {
				['total', 'avg', 'y'].forEach((subKey) => {
					const item = stats[key];
					if (Object.hasOwn(item, subKey)) {item[subKey] = round(item[subKey], precision);}
				});
				['total100', 'avg100', 'y100'].forEach((subKey) => {
					const item = stats[key];
					if (Object.hasOwn(item, subKey)) {item[subKey] = round(item[subKey], precision + 1);}
				});
			});
		}
		return stats;
	};

	this.expandData = (group = this.dataManipulation.group) => {
		if (this.graph.multi) { // 3-dimensional data with every point having multiple {Y,Z} points
			const series = this.data.map((serie) => { return [...(serie || [])]; });
			this.dataDraw = [];
			for (let i = 0; i < group; i++) { this.dataDraw.push([]); }
			series.forEach((serie) => {
				serie.forEach((pointArr) => {
					const len = pointArr.length;
					this.stats.minGroup = Math.min(len, this.stats.maxGroup);
					this.stats.maxGroup = Math.max(len, this.stats.maxGroup);
					for (let j = 0; j < len; j++) {
						if (j >= group) { break; }
						const point = pointArr[j];
						this.dataDraw[j].push(point);
					}
				});
			});
			this.series = this.dataDraw.length;
		} else {
			this.dataDraw = this.data.map((serie) => { return [...(serie || [])]; });
		}
	};

	this.manipulateData = () => {
		if (!this.data) { return false; }
		if (this.configuration.bProfile) { this.profile.Reset(); }
		this.expandData();
		if (this.configuration.bProfile) { this.profile.Print('Expand data', false); }
		this.cleanData();
		if (this.configuration.bProfile) { this.profile.Print('Clean data', false); }
		this.filter();
		if (this.configuration.bProfile) { this.profile.Print('Filter data', false); }
		this.stats.points = this.dataDraw.map((serie) => serie.length);
		if (!this.distribution()) {
			this.sort();
			this.slice();
			if (this.configuration.bProfile) { this.profile.Print('Sort & Slice data', false); }
		}
		if (this.dataManipulation.probabilityPlot) {
			this.probabilityPlot();
			if (this.configuration.bProfile) { this.profile.Print('Probability plot', false); }
		}
		this.stats.pointsDraw = this.dataDraw.map((serie) => serie.length);
	};

	/*
		Config related
	*/

	this.changeConfig = ({ data, dataAsync = null, colors, chroma, graph, dataManipulation, background, grid, axis, graphSpecs, margin, x, y, w, h, title, configuration, gFont, bPaint = true, callback = this.callbacks.config.change /* (config, arguments, callbackArgs) => void(0) */, callbackArgs = null }) => {
		let bCheckColors = false;
		if (gFont) { this.gFont = gFont; }
		if (this.data && this.data.length) {
			if (data && data !== this.data || dataAsync) {
				this.dataManipulation.slice = [0, Math.max(this.configuration.maxSliceOnDataChange, 0)]; // Draw all data on data type change
			}
		}
		if (data) { this.data = data; this.dataDraw = data; this.series = data.length; }
		if (dataAsync) { this.dataAsync = dataAsync; this.data = []; this.dataDraw = []; this.series = 0; }
		if (dataManipulation) {
			this.dataManipulation = { ...this.dataManipulation, ...dataManipulation };
			if (Object.hasOwn(dataManipulation, 'sort')) { this.sortKey = null; }
			if (Object.hasOwn(dataManipulation, 'distribution')) {
				if (dataManipulation.distribution && dataManipulation.distribution.toLowerCase() !== 'none') {
					this.dataManipulation.sort = this.sortKey = null;
				} else if (!Object.hasOwn(dataManipulation, 'sort')) {
					this.dataManipulation.sort = 'natural';
					this.sortKey = null;
				}
			}
		}
		if (graph) {
			if (graph.type && graph.type !== this.graph.type && ['timeline', 'doughnut', 'pie'].some((t) => this.graph.type === t || graph.type === t)) {
				this.colors = [];
			}
			this.graph = { ...this.graph, ...graph };
		}
		if (background) { this.background = { ...this.background, ...background }; this.background.imageGDI = this.background.image ? gdi.Image(this.background.image) : null; }
		if (colors) { this.colors = colors; bCheckColors = true; }
		if (chroma) { this.chroma = { ...this.chroma, ...chroma }; this.checkScheme(); bCheckColors = true; }
		if (dataManipulation && dataManipulation.slice && this.chroma.scheme) { this.colors = []; bCheckColors = true; }
		if (bCheckColors && !dataAsync && !this.dataAsync) { this.checkColors(); }
		if (axis) {
			if (axis.x) { this.axis.x = { ...this.axis.x, ...axis.x }; }
			if (axis.y) { this.axis.y = { ...this.axis.y, ...axis.y }; }
			if (axis.z) { this.axis.z = { ...this.axis.z, ...axis.z }; }
		}
		if (graphSpecs) {
			if (graphSpecs.timeline) { this.graphSpecs.timeline = { ...this.graphSpecs.timeline, ...graphSpecs.timeline }; }
		}
		if (grid) {
			if (grid.x) { this.grid.x = { ...this.grid.x, ...grid.x }; }
			if (grid.y) { this.grid.y = { ...this.grid.y, ...grid.y }; }
		}
		if (margin) { this.margin = { ...this.margin, ...margin }; }
		if ([x, y, w, h].some((n) => typeof n !== 'undefined')) {
			this.resize(typeof x !== 'undefined' ? x : this.x, typeof y !== 'undefined' ? y : this.y, typeof w !== 'undefined' ? w : this.w, typeof h !== 'undefined' ? h : this.h, false);
		}
		if (title) { this.title = title; }
		if (configuration) {
			for (let key in configuration) {
				this.configuration[key] = configuration[key];
			}
		}
		this.checkConfig();
		if (data || (dataManipulation || graph) && !dataAsync) { this.initData(); }
		if (this.configuration.bLoadAsyncData) {
			if (dataAsync) { this.initDataAsync(); }
			else if (bCheckColors && this.dataAsync) { this.dataAsync.then(() => this.checkColors()); }
		} // May be managed by the chart or externally
		if (callback && isFunction(callback)) { callback.call(this, this.exportConfig(), arguments[0], callbackArgs); }
		if (bPaint) { this.repaint(); }
		return this;
	};

	this.checkScheme = () => { // Check if the scheme is a valid string
		if (!this.chroma) { this.chroma = { scheme: 'random', colorBlindSafe: false }; return false; }
		if (this.chroma.scheme) {
			if (typeof this.chroma.scheme === 'string') {
				let schemeStr = this.chroma.scheme.toLowerCase();
				if (schemeStr === 'random' || schemeStr === 'rand') { return true; }
				else {
					if (Object.hasOwn(colorbrewer, schemeStr)) { return true; }
					for (let key in colorbrewer) {
						if (colorbrewer[key].indexOf(this.chroma.scheme) !== -1) { return true; }
					}
				}
				this.chroma.scheme = 'random'; // Use random as default for non valid values
				return false;
			} else { return true; }
		} else { this.chroma.scheme = 'random'; return false; }
	};

	this.checkColors = (bForce = false) => { // Fill holes and add missing colors at end
		if (!this.colors || bForce) { this.colors = []; }
		const series = Math.max(this.series, this.dataDraw.length);
		switch (this.graph.type) {
			case 'doughnut':
			case 'pie': {
				if (this.colors.filter(Boolean).length !== series) {
					for (let i = 0; i < series; i++) {
						if (!this.colors[i]) { this.colors[i] = []; }
					}
				}
				const len = this.colors.length;
				for (let i = 0; i < len; i++) {
					if (!Array.isArray(this.colors[i])) { this.colors[i] = []; }
				}
				if (series && this.colors.some((arrCol, i) => arrCol.filter(Boolean).length !== this.dataDraw[i].length)) {
					this.colors.forEach((arrCol, i) => {
						const serieLen = this.dataDraw[i].length;
						// Random colors or using Chroma scale with specific scheme or array of colors
						let schemeStr = this.chroma.scheme && typeof this.chroma.scheme === 'string' ? this.chroma.scheme.toLowerCase() : null;
						let bRandom = !this.chroma.scheme || schemeStr === 'random' || schemeStr === 'rand';
						if (bRandom) {
							arrCol.forEach((color, j) => {
								if (!color) { arrCol[j] = this.randomColor(); }
							});
							for (let j = arrCol.length; j < serieLen; j++) {
								arrCol.push(this.randomColor());
							}
						} else { // Chroma scale method
							let scheme;
							// May be a key to use a random colorbrewer palette: diverging, qualitative & sequential
							if (schemeStr && Object.hasOwn(colorbrewer, schemeStr)) {
								const arr = this.chroma.colorBlindSafe ? colorbrewer.colorBlind[schemeStr] : colorbrewer[schemeStr];
								scheme = arr[Math.floor(Math.random() * arr.length)];
							} else { // An array of colors or colorbrewer palette (string)
								scheme = this.chroma.scheme;
							}
							const scale = this.chromaColor(scheme, serieLen, this.chroma.interpolation || 'lrgb');
							let k = 0;
							arrCol.forEach((color, j) => {
								if (!color) {
									arrCol[j] = scale[k];
									k++;
								}
							});
							for (let j = arrCol.length; j < serieLen; j++) {
								arrCol.push(scale[k]);
								k++;
							}
						}
					});
				}
				break;
			}
			default: {
				const len = this.colors.length;
				for (let i = 0; i < len; i++) {
					if (Array.isArray(this.colors[i])) { this.colors[i] = this.colors[i][0]; }
				}
				if (this.colors.filter(Boolean).length !== series) {
					// Random colors or using Chroma scale with specific schems or array of colors
					let schemeStr = this.chroma.scheme && typeof this.chroma.scheme === 'string' ? this.chroma.scheme.toLowerCase() : null;
					let bRandom = !this.chroma.scheme || schemeStr === 'random' || schemeStr === 'rand';
					if (bRandom) {
						this.colors.forEach((color, i) => {
							if (!color) { this.colors[i] = this.randomColor(); }
						});
						for (let i = this.colors.length; i < series; i++) {
							this.colors.push(this.randomColor());
						}
					} else { // Chroma scale method
						let scheme;
						// May be a key to use a random colorbrewer palette: diverging, qualitative & sequential
						if (schemeStr && Object.hasOwn(colorbrewer, schemeStr)) {
							const arr = this.chroma.colorBlindSafe ? colorbrewer.colorBlind[schemeStr] : colorbrewer[schemeStr];
							scheme = arr[Math.floor(Math.random() * arr.length)];
						} else { // An array of colors or colorbrewer palette (string)
							scheme = this.chroma.scheme;
						}
						const scale = this.chromaColor(scheme, series);
						let j = 0;
						this.colors.forEach((color, i) => {
							if (!color) {
								this.colors[i] = scale[j];
								j++;
							}
						});
						for (let i = this.colors.length; i < series; i++) {
							this.colors.push(scale[j]);
							j++;
						}
					}
				}
			}
		}
	};

	this.checkConfig = () => {
		if (this.configuration.bProfile) { this.profile = new FbProfiler(this.title); }
		if (this.graph.type) { this.graph.type = this.graph.type.replace('–', '-'); }
		if (this.dataManipulation.probabilityPlot) { this.dataManipulation.probabilityPlot = this.dataManipulation.probabilityPlot.replace('–', '-'); }
		const pPlot = this.dataManipulation.probabilityPlot ? this.dataManipulation.probabilityPlot.toLowerCase() : null;
		const dist = this.dataManipulation.distribution ? this.dataManipulation.distribution.toLowerCase() : null;
		const pointType = this.graph.point ? this.graph.point.toLowerCase() : null;
		let bPass = true;
		if (pointType && !['circle', 'circumference', 'cross', 'plus', 'triangle'].includes(pointType)) {
			this.graph.point = 'circle';
			console.log('Statistics: not recognized point type ' + _p(pointType) + '.');
			bPass = false;
		}
		if (!this.graph.multi) {
			this.axis.z = {};
		}
		if (this.dataManipulation.sort && dist && dist !== 'none') {
			console.log('Statistics: sort can not be set while using a distribution.');
			bPass = false;
		}
		if (pPlot && pPlot !== 'none') {
			if (this.series === 1 && !dist) {
				if (pPlot === 'cdf plot' || pPlot === 'cumulative distribution plot' || pPlot === 'distribution plot') {
					console.log('Statistics: distribution has not been set and there is only a single serie for ' + pPlot + '. Using normal by default.');
					this.dataManipulation.distribution = 'normal';
					bPass = false;
				} else if (pPlot === 'p-p plot') {
					console.log('Statistics: distribution has not been set and there is only a single serie for ' + pPlot + '. Using normal inverse by default.');
					this.dataManipulation.distribution = 'normal inverse';
					this.axis.x.key = 'Theoretical cumulative distribution';
					this.axis.y.key = 'Empirical cumulative distribution';
					if (!this.graph.point) { this.graph.point = 'circumference'; }
					bPass = false;
				}
			}
		}
		if (this.dataManipulation.sort) {
			if (typeof this.dataManipulation.sort === 'string') {
				this.sortKey = this.convertSortLabel(this.dataManipulation.sort);
				const type = this.sortKey[0];
				const axis = this.sortKey[1];
				const sorter = NatSort();
				switch (type) {
					case 'natural':
						this.dataManipulation.sort = function natural(a, b) { return sorter(a[axis], b[axis]); };
						break;
					case 'reverse':
						this.dataManipulation.sort = function reverse(a, b) { return sorter(b[axis], a[axis]); };
						break;
					case 'natural num':
						this.dataManipulation.sort = function naturalNum(a, b) { return a[axis] - b[axis]; };
						break;
					case 'reverse num':
						this.dataManipulation.sort = function reverseNum(a, b) { return b[axis] - a[axis]; };
						break;
					case 'string natural':
						this.dataManipulation.sort = function naturalString(a, b) { return a[axis].localeCompare(b[axis]); };
						break;
					case 'string reverse':
						this.dataManipulation.sort = function reverseString(a, b) { return 0 - a[axis].localeCompare(b[axis]); };
						break;
					case 'random':
						this.dataManipulation.sort = Array.prototype.shuffle;
						break;
					case 'radix':
						this.dataManipulation.sort = Array.prototype.radixSort;
						break;
					case 'radix reverse':
						this.dataManipulation.sort = [Array.prototype.radixSort, true];
						break;
					case 'radix int':
						this.dataManipulation.sort = Array.prototype.radixSortInt;
						break;
					case 'radix int reverse':
						this.dataManipulation.sort = [Array.prototype.radixSortInt, true];
						break;
					default:
						console.log('Statistics: sort name ' + _p(type) + ' not recognized.');
						bPass = false;
				}
			} else if (Array.isArray(this.dataManipulation.sort)) {
				if (this.dataManipulation.sort.length > 2) {
					console.log('Statistics: sort name ' + _p(this.dataManipulation.sort) + ' not recognized.');
					bPass = false;
				}
				if (!isFunction(this.dataManipulation.sort[0])) {
					if (typeof this.dataManipulation.sort[0] === 'string') {
						this.sortKey = this.convertSortLabel(this.dataManipulation.sort);
						const type = this.sortKey[0];
						if (['schwartzian transform', 'schwartzian'].includes(type)) {
							this.dataManipulation.sort[0] = Array.prototype.schwartzianSort;
						} else if (['radix reverse', 'radix'].includes(type)) {
							if (type === 'radix reverse') { this.dataManipulation.sort[1] = true; }
							this.dataManipulation.sort[0] = Array.prototype.radixSort;
						} else if (['radix int reverse', 'radix int'].includes(type)) {
							if (type === 'radix int reverse') { this.dataManipulation.sort[1] = true; }
							this.dataManipulation.sort[0] = Array.prototype.radixSortInt;
						} else {
							console.log('Statistics: sort name' + _p(type) + ' not recognized');
							bPass = false;
						}
					} else {
						console.log('Statistics: sort method ' + _p(this.dataManipulation.sort[0]) + ' is not a function.');
						bPass = false;
					}
				}
				if (this.dataManipulation.sort[1] && !Array.isArray(this.dataManipulation.sort[1])) {
					console.log('Statistics: sort arguments ' + _p(this.dataManipulation.sort[1]) + ' is not an array.');
					bPass = false;
				}
			}
		}
		// Fix stringify/parse Infinity becoming null
		if (this.dataManipulation.slice && this.dataManipulation.slice[1] === null) { this.dataManipulation.slice[1] = Infinity; }
		if (this.configuration.maxSliceOnDataChange === null) { this.configuration.maxSliceOnDataChange = Infinity; }
		if (this.configuration.maxSliceOnDataChange <= 0) {
			console.log('Statistics: max slice on data change ' + _p(this.configuration.maxSliceOnDataChange) + ' is equal or lower than zero.');
			bPass = false;
		}
		return bPass;
	};

	this.exportConfig = (bPosition = false) => {
		return {
			colors: [...this.colors],
			chroma: { ...this.chroma },
			graph: { ...this.graph },
			dataManipulation: { ...this.dataManipulation },
			background: { ...this.background },
			grid: { x: { ...this.grid.x }, y: { ...this.grid.y } },
			axis: { x: { ...this.axis.x }, y: { ...this.axis.y }, z: { ...this.axis.z } },
			margin: { ...this.margin },
			buttons: { ...this.buttons },
			configuration: { ...this.configuration },
			...(bPosition ? { x: this.x, y: this.y, w: this.w, h: this.h } : {}),
			title: this.title
		};
	};

	this.exportDataLabels = () => {
		return {
			x: { key: this.axis.x.key, tf: this.axis.x.tf },
			y: { key: this.axis.y.key, tf: this.axis.y.tf, bProportional: this.axis.y.bProportional },
			z: { key: this.axis.z.key, tf: this.axis.z.tf }
		};
	};

	this.convertSortLabel = (input) => {
		if (!input) {
			return null;
		} else if (Array.isArray(input)) {
			const sort = (input.length === 1 ? [...input, 'x'] : input.slice(0, 2)).join('|');
			return sort;
		} else {
			const key = input.toLowerCase().split('|');
			if (key.length === 1) { key.push('x'); }
			if (key.length > 2) { key.length = 2; }
			return key;
		}
	};
	this.exportSortLabel = (bConvert = true) => {
		return (bConvert ? this.convertSortLabel(this.sortKey) : this.sortKey);
	};

	this.initData = () => {
		// Clean calculated offsets
		this.margin.leftAuto = this.margin.left;
		// Clean and manipulate data
		this.manipulateData();
		this.cleanPoints();
		// Missing colors
		this.checkScheme();
		if (this.data && this.data.length) { this.checkColors(); }
	};

	this.initDataAsync = () => {
		if (!this.dataAsync) { return null; }
		this.initPopup();
		if (isFunction(this.dataAsync)) { this.dataAsync = this.dataAsync(); }
		return this.dataAsync.then((data) => {
			this.changeConfig({ data, dataAsync: null });
			this.pop.disable(true);
			this.repaint();
			return true;
		});
	};

	this.init = () => {
		// Bg Image
		this.background.imageGDI = this.background.image ? gdi.Image(this.background.image) : null;
		this.checkConfig();
		this.initData();
		this.resizeButtons();
		if (this.configuration.bLoadAsyncData && this.dataAsync) { this.initDataAsync(); } // May be managed by the chart or externally
	};

	this.setDefaults();
	this.gFont = gFont;
	this.data = data;
	this.dataAsync = dataAsync;
	this.dataDraw = data || [];
	this.dataCoords = this.dataDraw.map(() => { return []; });
	this.dataManipulation = { ...this.dataManipulation, ...(dataManipulation || {}) };
	this.sortKey = null;
	this.series = data ? data.length : 0;
	this.graph = { ...this.graph, ...(graph || {}) };
	this.background = { ...this.background, ...(background || {}) };
	this.colors = colors;
	this.chroma = { ...this.chroma, ...(chroma || {}) };
	if (axis) {
		if (axis.x) { this.axis.x = { ...this.axis.x, ...axis.x }; }
		if (axis.y) { this.axis.y = { ...this.axis.y, ...axis.y }; }
		if (axis.z) { this.axis.z = { ...this.axis.z, ...axis.z }; }
	}
	if (grid) {
		if (grid.x) { this.grid.x = { ...this.grid.x, ...grid.x }; }
		if (grid.y) { this.grid.y = { ...this.grid.y, ...grid.y }; }
	}
	this.margin = { ...this.margin, ...(margin || {}) };
	if (graphSpecs) {
		if (graphSpecs.timeline) { this.graphSpecs.timeline = { ...this.graphSpecs.timeline, ...graphSpecs.timeline }; }
	}
	this.buttons = { ...this.buttons, ...(buttons || {}) };
	if (callbacks) {
		if (callbacks.point) { this.callbacks.point = { ...this.callbacks.point, ...callbacks.point }; }
		if (callbacks.focus) { this.callbacks.focus = { ...this.callbacks.focus, ...callbacks.focus }; }
		if (callbacks.settings) { this.callbacks.settings = { ...this.callbacks.settings, ...callbacks.settings }; }
		if (callbacks.display) { this.callbacks.display = { ...this.callbacks.display, ...callbacks.display }; }
		if (callbacks.zoom) { this.callbacks.zoom = { ...this.callbacks.zoom, ...callbacks.zoom }; }
		if (callbacks.custom) { this.callbacks.custom = { ...this.callbacks.custom, ...callbacks.custom }; }
		if (callbacks.config) { this.callbacks.config = { ...this.callbacks.config, ...callbacks.config }; }
	}
	this.currPoint = [-1, -1];
	this.nearPoint = [-1, -1];
	this.stats = { maxY: 0, minY: 0, points: [], pointsDraw: [], minGroup: 0, maxGroup: 0 };
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.mx = -1;
	this.my = -1;
	this.inFocus = false;
	this.title = typeof title !== 'undefined' ? title : window.Name + ' {' + this.axis.x.key + ' - ' + this.axis.y.key + '}';
	this.tooltipText = tooltipText;
	this.configuration = { ...this.configuration, ...(configuration || {}) };
	this.leftBtn = new _button({
		text: chars.left,
		x: this.x, y: this.y, w: this.buttonsCoords.size / 2, h: this.buttonsCoords.size / 2,
		isVisible: (time, timer) => { return this.inFocus || (Date.now() - time < timer); },
		notVisibleMode: 25, bTimerOnVisible: true,
		scrollSteps: 1, scrollSpeed: 250,
		lbtnFunc: (x, y, mask, parent, delta = 1) => { this.scrollX({ step: - Math.round(delta), bThrottle: false }); },
		lbtnDblFunc: (x, y, mask, parent) => { this.scrollX({ step: - Infinity, bThrottle: false }); } // eslint-disable-line no-unused-vars
	});
	this.rightBtn = new _button({
		text: chars.right,
		x: this.x, y: this.y, w: this.buttonsCoords.size / 2, h: this.buttonsCoords.size / 2,
		isVisible: (time, timer) => { return this.inFocus || (Date.now() - time < timer); },
		notVisibleMode: 25, bTimerOnVisible: true,
		scrollSteps: 1, scrollSpeed: 250,
		lbtnFunc: (x, y, mask, parent, delta = 1) => { this.scrollX({ step: Math.round(delta), bThrottle: false }); },
		lbtnDblFunc: (x, y, mask, parent) => { this.scrollX({ step: Infinity, bThrottle: false }); } // eslint-disable-line no-unused-vars
	});
	this.zoomBtn = new _button({
		text: () => utils.IsKeyPressed(VK_SHIFT) || this.getCurrentRange() === 1 ? chars.searchMinus : chars.searchPlus,
		x: this.x, y: this.y, w: this.buttonsCoords.size, h: this.buttonsCoords.size,
		isVisible: (time, timer) => { return this.inFocus || (Date.now() - time < timer); },
		notVisibleMode: 25, bTimerOnVisible: true,
		lbtnFunc: (x, y, mask, parent) => { this.callbacks.zoom.onLbtnUp && this.callbacks.zoom.onLbtnUp.call(this, x, y, mask, parent); },
		rbtnFunc: (x, y, mask, parent) => { this.callbacks.zoom.onRbtnUp && this.callbacks.zoom.onRbtnUp.call(this, x, y, mask, parent); },
		lbtnDblFunc: (x, y, mask, parent) => { this.callbacks.zoom.onDblLbtn && this.callbacks.zoom.onDblLbtn.call(this, x, y, mask, parent); }
	});
	this.settingsBtn = new _button({
		text: chars.cogs,
		x: this.x, y: this.y, w: this.buttonsCoords.size, h: this.buttonsCoords.size,
		isVisible: (time, timer) => { return this.inFocus || (Date.now() - time < timer); },
		notVisibleMode: 25, bTimerOnVisible: true,
		lbtnFunc: (x, y, mask, parent) => { this.callbacks.settings.onLbtnUp && this.callbacks.settings.onLbtnUp.call(this, x, y, mask, parent); },
		rbtnFunc: (x, y, mask, parent) => { this.callbacks.settings.onRbtnUp && this.callbacks.settings.onRbtnUp.call(this, x, y, mask, parent); },
		lbtnDblFunc: (x, y, mask, parent) => { this.callbacks.settings.onDblLbtn && this.callbacks.settings.onDblLbtn.call(this, x, y, mask, parent); }
	});
	this.displayBtn = new _button({
		text: chars.chartV2,
		x: this.x, y: this.y, w: this.buttonsCoords.size, h: this.buttonsCoords.size,
		isVisible: (time, timer) => { return this.inFocus || (Date.now() - time < timer); },
		notVisibleMode: 25, bTimerOnVisible: true,
		lbtnFunc: (x, y, mask, parent) => { this.callbacks.display.onLbtnUp && this.callbacks.display.onLbtnUp.call(this, x, y, mask, parent); },
		rbtnFunc: (x, y, mask, parent) => { this.callbacks.display.onRbtnUp && this.callbacks.display.onRbtnUp.call(this, x, y, mask, parent); },
		lbtnDblFunc: (x, y, mask, parent) => { this.callbacks.display.onDblLbtn && this.callbacks.display.onDblLbtn.call(this, x, y, mask, parent); }
	});
	this.customBtn = new _button({
		text: chars.close,
		x: this.x, y: this.y, w: this.buttonsCoords.size, h: this.buttonsCoords.size,
		isVisible: (time, timer) => { return this.inFocus || (Date.now() - time < timer); },
		notVisibleMode: 25, bTimerOnVisible: true,
		lbtnFunc: (x, y, mask, parent) => { this.callbacks.custom.onLbtnUp && this.callbacks.custom.onLbtnUp.call(this, x, y, mask, parent); },
		rbtnFunc: (x, y, mask, parent) => { this.callbacks.custom.onRbtnUp && this.callbacks.custom.onRbtnUp.call(this, x, y, mask, parent); },
		lbtnDblFunc: (x, y, mask, parent) => { this.callbacks.custom.onDblLbtn && this.callbacks.custom.onDblLbtn.call(this, x, y, mask, parent); }
	});
	/*
	Animation
	*/
	this.pop = new _popup({
		x, y, w, h: h - y,
		offsetY: margin.top / 2 - (h - y) / 5,
		offsetX: + margin.left,
		UI: 'MATERIAL',
		scale: 2,
		configuration: {
			border: { enabled: false },
			icon: { enabled: true },
			...(this.configuration.bPopupBackground
				? { color: { panel: opaqueColor(0xFF4354AF, 30), text: invert(this.background.color || RGB(0, 0, 0), true) } } // Blue overlay
				: {})
		}
	});
	this.init();
}
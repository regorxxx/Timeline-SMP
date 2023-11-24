'use strict';
//24/11/23

/* 
	helpers_xxx_UI.js 
*/
include(fb.ComponentPath + 'docs\\Flags.js');

const WshShellUI = new ActiveXObject('WScript.Shell');

// colorbrewer presets
const colorbrewer = {
	diverging: ['Spectral','RdYlGn','RdBu','PiYG','PRGn','RdYlBu','BrBG','RdGy','PuOr'],
	qualitative: ['Set2','Accent','Set1','Set3','Dark2','Paired','Pastel2','Pastel1'],
	sequential: ['OrRd','PuBu','BuPu','Oranges','BuGn','YlOrBr','YlGn','Reds','RdPu','Greens','YlGnBu','Purples','GnBu','Greys','YlOrRd','PuRd','Blues','PuBuGn'],
	colorBlind: {
		diverging: ['RdBu','PiYG','PRGn','RdYlBu','BrBG','PuOr'],
		qualitative: ['Set2','Dark2','Paired'],
		sequential: ['OrRd','PuBu','BuPu','Oranges','BuGn','YlOrBr','YlGn','Reds','RdPu','Greens','YlGnBu','Purples','GnBu','Greys','YlOrRd','PuRd','Blues','PuBuGn']
	}
}

// Cache
const scaleDPI = {}; // Caches _scale() values;
const fonts = {notFound: []}; // Caches _gdifont() values;

function _scale(size, bRound = true) {
	if (!scaleDPI[size]) {
		let DPI;
		try {DPI = WshShellUI.RegRead('HKCU\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI');}
		catch (e) {DPI = 96;} // Fix for linux
		scaleDPI[size] = size * DPI / 72;
	}
	return (bRound ? Math.round(scaleDPI[size]) : scaleDPI[size]);
}

function _gdiFont(name, size, style) {
	let id = name.toLowerCase() + '_' + size + '_' + (style || 0);
	if (!fonts[id]) {
		fonts[id] = gdi.Font(name, size, style || 0);
	}
	if (fonts[id].Name !== name && fonts.notFound.indexOf(name) === -1) { // Display once per session, otherwise it floods the console with the same message...
		fonts.notFound.push(name);
		fb.ShowPopupMessage('Missing font: ' + name + '\n\nPlease install dependency found at:\n' + folders.xxx + '_resources', window.Name);
		console.log('Missing font: ' + name);
	}
	return fonts[id];
}

function _tt(value, font = 'Segoe UI', fontSize = _scale(10), width = 600) {
	this.tooltip = window.Tooltip;
	this.font = {name: font, size: fontSize};
	this.tooltip.SetFont(font, fontSize);
	this.width = width;
	this.tooltip.SetMaxWidth(width);
	this.text = this.tooltip.Text = value;
	this.oldDelay = this.tooltip.GetDelayTime(3); //TTDT_INITIAL
	this.bActive = false;
	
	this.SetValue = function (value,  bForceActivate = false) {
		if (value === null) {
			this.Deactivate();
			return;
		} else {
			if (this.tooltip.Text !== value) {
				this.tooltip.Text = value;
				this.Activate();
			}
			if (bForceActivate) {this.Activate();} // Only on force to avoid flicker
		}
	};
	
	this.SetFont = function (font_name, font_size_pxopt, font_styleopt) {
		this.tooltip.SetFont(font_name, font_size_pxopt, font_styleopt);
	};
	
	this.SetMaxWidth = function (width) {
		this.tooltip.SetMaxWidth(width);
	};
	
	this.Activate = function () {
		this.tooltip.Activate();
		this.bActive = true;
	};
	
	this.Deactivate = function () {
		this.tooltip.Deactivate();
		this.bActive = false;
	};
	
	this.SetDelayTime = function (type, time) {
		this.tooltip.SetDelayTime(type, time) ;
    };
	
	this.GetDelayTime = function (type) {
		this.tooltip.GetDelayTime(type) ;
	};

}

function RGB(r, g, b) {
	return (0xff000000 | (r << 16) | (g << 8) | (b));
}

function RGBA(r, g, b, a) {
	let res = 0xff000000 | (r << 16) | (g << 8) | (b);
	if (typeof a !== 'undefined') {res = (res & 0x00ffffff) | (a << 24);}
	return res;
}

function toRGB(color) { // returns an array like [192, 0, 0]
	const a = color - 0xFF000000;
	return [a >> 16 & 0xFF, a >> 8 & 0xFF, a & 0xFF];
}


function getAlpha(color) {
	return ((color >> 24) & 0xff);
}

function getRed(color) {
	return ((color >> 16) & 0xff);
}

function getGreen(color) {
	return ((color >> 8) & 0xff);
}

function getBlue(color) {
	return (color & 0xff);
}

function getBrightness(r, g, b) { // https://www.w3.org/TR/AERT/#color-contrast
	return (r * 0.299 + g * 0.587 + b * 0.114);
}

function isDark(r, g, b) {
	return (getBrightness(r,g,b) < 186);
}

function opaqueColor(color, percent) {
	return RGBA(...toRGB(color), Math.min(255, 255 * (percent / 100)));
}

function invert(color, bBW = false) {
	const [r, g, b] = [getRed(color), getGreen(color), getBlue(color)];
	if (bBW) {
		return (isDark(r, g, b) ? RGB(255, 255, 255) : RGB(0, 0, 0));
	} else {
		return RGB(255 - r, 255 - g, 255 - b);
	}
}

/* 
	helpers_xxx_UI_chars.js
*/

const chars = {
	cogs			: '\uf085',
	chartV2			: '\uf080',
	// Carets
	left 			: '\uf053',
	right 			: '\uf054',
	up 				: '\uf077',
	down 			: '\uf078',
	// Utilities
	searchPlus 		: '\uf00e',
	searchMinus		: '\uf010',
};

/* 
	helpers_xxx_UI_flip.js
*/

String.prototype.flip = function() {
	const last = this.length - 1;
	let result = new Array(this.length)
	for (let i = last; i >= 0; --i) {
		let c = this.charAt(i);
		let r = flipTable[c.toLowerCase()];
		result[last - i] = r !== void(0) ? r : c;
	}
	return result.join('');
}

const flipTable = {
	a : '\u0250',
	b : 'q',
	c : '\u0254', 
	d : 'p',
	e : '\u01DD',
	f : '\u025F', 
	g : '\u0183',
	h : '\u0265',
	i : '\u0131', 
	j : '\u027E',
	k : '\u029E',
	//l : '\u0283',
	m : '\u026F',
	n : 'u',
	p : 'q',
	r : '\u0279',
	t : '\u0287',
	v : '\u028C',
	w : '\u028D',
	y : '\u028E',
	'.' : '\u02D9',
	'[' : ']',
	'(' : ')',
	'{' : '}',
	'?' : '\u00BF',
	'!' : '\u00A1',
	"\'" : ',',
	'<' : '>',
	'_' : '\u203E',
	';' : '\u061B',
	'\u203F' : '\u2040',
	'\u2045' : '\u2046',
	'\u2234' : '\u2235',
	'\r' : '\n' 
}
for (let i in flipTable) {flipTable[flipTable[i]] = i;}

/* 
	helpers_xxx_prototypes.js
*/
function isFunction(obj) {
	return !!(obj && obj.constructor && obj.call && obj.apply);
}

// Randomly rearranges the items in an array, modifies original. Fisher-Yates algorithm
Array.prototype.shuffle = function() {
	let last = this.length, n;
	while (last > 0) {
		n = Math.floor(Math.random() * last--);
		[this[n], this[last]] = [this[last], this[n]];
	}
	return this;
};

Array.prototype.radixSort = function(bInvert) {
	function getDigit(num, place) {
		return Math.floor(Math.abs(num) / Math.pow(10, place)) % 10;
	}
	const maxDigitCount = this.reduce((acc, num) => {
		return Math.max(acc,
			num === 0 
				? 1 
				: Math.floor(Math.log10(Math.abs(num))) + 1
		);
	}, 0);
	const len = this.length;
	for (let k = 0; k < maxDigitCount; k++) {
		let digitBuckets = Array.from({length: 10}, () => []) // [[], [], [],...]
		for (let i = 0; i < this.length; i++) {
			const digit = bInvert ? 9 - getDigit(this[i], k) : getDigit(this[i], k);
			digitBuckets[digit].push(this[i]);
		}
		// New order after each loop
		this.length = 0;
		digitBuckets.forEach((arr) => this.push.apply(this, arr));
	}
	return this;
}

// https://en.wikipedia.org/wiki/Schwartzian_transform
Array.prototype.schwartzianSort = function (processFunc, sortFunc = (a, b) => a[1] - b[1]) { // or (a, b) => {return a[1].localeCompare(b[1]);}
	return this.map((x) => [x, processFunc(x)]).sort(sortFunc).map((x) => x[0]);
}

const range = (start, stop, step) => new Array(Math.round((stop - start) / step + 1)).fill(void(0)).map((_, i) => start + (i * step));

// Adds/subtracts 'offset' to 'reference' considering the values must follow cyclic logic within 'limits' range (both values included)
// Ex: [1,8], x = 5 -> x + 4 = 1 <=> cyclicOffset(5, 4, [1,8])
function cyclicOffset(reference, offset, limits) {
		if (offset && reference >= limits[0] && reference <= limits[1]) {
			reference += offset;
			if (reference < limits[0]) {reference += limits[1];}
			if (reference > limits[1]) {reference -= limits[1];}
		}
		return reference;
}

const cutRegex = {};
String.prototype.cut = function cut(c) {
	if (!cutRegex.hasOwnProperty(c)) {cutRegex[c] = new RegExp('^(.{' + c + '}).{2,}', 'g');}
	return this.replace(cutRegex[c], '$1…');
};

function _p(value) {
	return '(' + value + ')';
}

function _b(value) {
	return '[' + value + ']';
}

function _t(tag) {
	return tag.indexOf('%') !== -1 ? tag : '%' + tag + '%';
}

function _bt(tag) {
	return _b(_t(tag));
}

function _qCond(tag, bUnquote = false) {
	return bUnquote 
		? tag.replace(/(^")(?:.*\$+.*)("$)/g, '') 
		: tag.includes('$') 
			? _q(tag)
			: tag;
}

function round(floatnum, decimals, eps = 10**-14){
	let result;
	if (decimals > 0) {
		if (decimals === 15) {result = floatnum;}
		else {result = Math.round(floatnum * Math.pow(10, decimals) + eps) / Math.pow(10, decimals);}
	} else {result =  Math.round(floatnum);}
	return result;
}

/* 
	helpers_xxx_basic_js.js
*/
let module = {}, exports = {};
module.exports = null;

function require(script) { // Must be path relative to this file, not the parent one
	let newScript = script;
	['helpers-external', 'main', 'examples', 'buttons'].forEach((folder) => {newScript.replace(new RegExp('^\\.\\\\' + folder + '\\\\', 'i'), '..\\' + folder + '\\');});
	['helpers'].forEach((folder) => {newScript.replace(new RegExp('^\\.\\\\' + folder + '\\\\', 'i'), '');});
	include(newScript + '.js');
	return module.exports;
}

const debounce = (fn, delay, immediate = false, parent = this) => {
	let timerId;
	return (...args) => {
		const boundFunc = fn.bind(parent, ...args);
		clearTimeout(timerId);
		if (immediate && !timerId) {boundFunc();}
		const calleeFunc = immediate ? () => {timerId = null;} : boundFunc;
		timerId = setTimeout(calleeFunc, delay);
		return timerId;
	};
};

const throttle = (fn, delay, immediate = false, parent = this) => {
	let timerId;
	return (...args) => {
		const boundFunc = fn.bind(parent, ...args);
		if (timerId) {return;}
		if (immediate && !timerId) {boundFunc();}
		timerId = setTimeout(() => {
			if(!immediate) {
				boundFunc(); 
			}
			timerId = null; 
		}, delay);
	};
};

/* 
	helpers_xxx_prototypes_smp.js
*/
FbTitleFormat.prototype.EvalWithMetadbsAsync = function EvalWithMetadbsAsync(handleList, slice = 1000) {
	const size = handleList.Count;
	return new Promise(async (resolve) => {
		const items = handleList.Convert();
		const count = items.length;
		const total = Math.ceil(size / slice);
		const tags = [];
		let prevProgress = -1;
		for (let i = 1; i <= total; i++) {
			await new Promise((resolve) => {
				setTimeout(() => {
					const iItems = new FbMetadbHandleList(items.slice((i - 1) * slice, i === total ? count : i * slice));
					tags.push(...this.EvalWithMetadbs(iItems));
					const progress = Math.round(i / total * 100);
					if (progress % 25 === 0 && progress > prevProgress) {prevProgress = progress; console.log('EvalWithMetadbsAsync ' + _p(this.Expression) + ' ' + progress + '%.');}
					resolve('done');
				}, 25);
			});
		}
		resolve(tags);
	});
}

{	// Augment fb.TitleFormat
	const old = fb.TitleFormat;
	fb.TitleFormat = function TitleFormat() {
		const that = old.apply(fb, [...arguments]);
		that.Expression = arguments[0];
		return that;
	}
}

{	// Augment FbTitleFormat
	const old = FbTitleFormat;
	FbTitleFormat = function FbTitleFormat() {
		const that = old(...arguments);
		that.Expression = arguments[0];
		return that;
	}
}

/* 
	window_xxx_button.js
*/
function _button({
			text = '',
			x, y, w, h,
			isVisible = (time, timer) => this.hover || Date.now() - time < (timer || this.timer),
			notVisibleMode = 'invisible', // invisible | alpha
			lbtnFunc = () => void(0),
			lbtnDblFunc = () => void(0),
			rbtnFunc = () => void(0),
			scrollSpeed = 60, // ms
			scrollSteps = 3, // ms
			timer = 1500, // ms
			bTimerOnVisible = false, // ms
			tt = ''
		} = {}) {
	this.paint = (gr, color) => {
		if (this.w <= 0) {return;} 
		// Smooth visibility switch
		let bLastStep = false;
		if (this.isVisible && !this.isVisible(this.time, this.timer)) {
			if (this.bVisible) {
				this.bVisible = false;
			} else {
				switch (this.notVisibleMode) {
					case 'invisible': return;
					default: {
						color = RGBA(...toRGB(color), this.notVisibleMode);
						bLastStep = true;
					}
				}
			}
		}
		if (!this.hover) {color = RGBA(...toRGB(color), getBrightness(...toRGB(color)) < 50 ? 100 : 25);}
		gr.SetTextRenderingHint(4);
		gr.DrawString(this.text, this.font, color, this.x, this.y, this.w, this.h, SF_CENTRE);
		gr.SetTextRenderingHint(0);
		if (!bLastStep && this.isVisible) {this.repaint(this.timer);} // Smooth visibility switch
	};
	const debounced = {
		[this.timer]: debounce(window.RepaintRect, this.timer, false, window)
	}
	this.repaint = (timeout = 0) => {
		if (timeout === 0) {window.RepaintRect(this.x, this.y, this.x + this.w, this.y + this.h);}
		else {
			if (!debounced.hasOwnProperty(timeout)) {debounced[timeout] = debounce(window.RepaintRect, timeout, false, window)}
			debounced[timeout](this.x, this.y, this.x + this.w, this.y + this.h, true);
		}
	}
	this.trace = (x, y) => {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h && this.isVisible();
	};
	this.move = (x, y) => {
		if (this.trace(x, y)) {
			this.time = Date.now();
			window.SetCursor(IDC_HAND);
			this.hover = true;
			if (this.hover && this.tt) {
				if (this.tooltip.Text) {this.tooltip.Deactivate();}
				this.tooltip.SetValue(this.tt, true);
			}
			return true;
		} else {
			if (this.tooltip.Text) {this.tooltip.SetValue(null);}
			if (this.bTimerOnVisible && this.isVisible()) {this.time = Date.now();}
			//window.SetCursor(IDC_ARROW);
			this.hover = this.bDown = false;
			return false;
		}
	};
	let downFunc = null;
	let draggingTime = 0;
	this.lbtn_down = (x, y, mask, parent) => {
		if (!this.scrollSpeed) {return false;}
		if (this.trace(x, y)) {
			this.bHover = true;
			if (this.bHover) {
				this.bDown = true;
				draggingTime = 0;
				downFunc = setInterval(() => {
					if (this.bDown) {
						const delta = 1 + (draggingTime > this.scrollSpeed * 3 ? Math.log(draggingTime / this.scrollSpeed)* this.scrollSteps : 0);
						console.log('lbtn_down', draggingTime, Math.round(delta));
						this.lbtnFunc.call(parent, x, y, mask, parent, delta);
						this.repaint();
					}
					draggingTime += this.scrollSpeed;
				}, this.scrollSpeed);
			}
			this.repaint();
			return true;
		} else { 
			this.bHover = this.bDown = false;
		}
		return false;
	};
	this.lbtn_up = (x, y, mask, parent) => {
		this.bDown = false;
		if (downFunc) {clearInterval(downFunc); downFunc = null; draggingTime = 0;}
		if (this.trace(x, y)) {
			if (this.lbtnFunc) {
				if (parent) {
					this.lbtnFunc.call(parent, x, y, mask, parent, 1);
				} else {
					this.lbtnFunc(x, y, mask);
				}
			}
			return true;
		} else {
			return false;
		}
	};
	this.rbtn_up = (x, y, mask, parent) => {
		if (this.trace(x, y)) {
			if (this.rbtnFunc) {
				if (parent) {
					this.rbtnFunc.call(parent, x, y, mask, parent);
				} else {
					this.rbtnFunc(x, y, mask);
				}
			}
			return true;
		} else {
			return false;
		}
	};
	this.lbtn_dblclk = (x, y) => {
		if (this.trace(x, y)) {
			if (!this.hover || !this.isVisible()) {return false;}
			else if (this.dblclkFunc) {this.lbtnDblFunc(x, y, mask);}
			return true;
		}
		return false;
	};
	this.hover = false;
	this.bDown = false;
	this.text = text;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.isVisible = isVisible;
	this.notVisibleMode = notVisibleMode;
	this.bTimerOnVisible = bTimerOnVisible;
	this.bVisible = true;
	this.lbtnFunc = lbtnFunc;
	this.lbtnDblFunc = lbtnDblFunc;
	this.tt = tt;
	this.font = _gdiFont('FontAwesome', this.h);
	this.tooltip = new _tt(null, void(0), void(0), 600);
	this.time = Date.now();
	this.timer = timer;
	this.scrollSpeed = scrollSpeed;
	this.scrollSteps = scrollSteps;
}
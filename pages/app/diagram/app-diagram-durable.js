export class AppDiagramDurable extends EventTarget {
	/**
	 * @param {SVGSVGElement} svg
	 * @param {IDiagram} diagram
	 */
	constructor(svg, diagram) {
		super();

		this.svg = svg;

		/**
		 * @type {Map<IDiagramShape, {templateKey:string, detail:string}>}}
		 * @private
		 */
		this._shapeData = new Map();
		this._shapes = {};
		this._ids = new Map();

		this._connectors = new Map();

		/** @private */
		this._diagram = diagram
			.on('connect', this)
			.on('disconnect', this)
			.on('add', this)
			.on('move', this);
	}

	/**
	 * @param {CustomEvent<ShapeTextEditorDecoratorEventUpdateDetail> & CustomEvent<IDiagramEventConnectDetail>} evt
	 */
	handleEvent(evt) {
		switch (evt.type) {
			case 'add':
			console.log(evt.detail.target);
				/** @type {IShapeTextEditorDecorator} */(evt.detail.target)
					.on('txtUpd', this)
					.on('del', this);
				break;
			case 'txtUpd':
				var param = {
					id: this._ids.get(evt.detail.target),
					props: evt.detail.props
				}
				return this.dispatchEvent(new CustomEvent('update', {
					detail: param
				}));
				break;
			case 'del':
				this._shapeDel(evt.detail.target);
				break;
			case 'move':
				var param = evt.detail.param;
				param.id = this._ids.get(evt.detail.target);
				return this.dispatchEvent(new CustomEvent('update', {
					detail: param
				}));
				break;
			case 'connect':
				var cc = evt.detail;
				var param = {
					s: { i: this._ids.get(cc.start.shape), c: cc.start.key },
					e: { i: this._ids.get(cc.end.shape), c: cc.end.key }
				}
				this._connectors.set(param, 1);
				return this.dispatchEvent(new CustomEvent('connect', {
					detail: param
				}));
				break;
			case 'disconnect':
				// this._connectors.splice(this._connectors.findIndex(el => connectorEqual(el, evt.detail)), 1);
				break;
		}
	}

	/**
	 * @param {IDiagramShape} shape
	 * @private
	 */
	_shapeDel(shape) {
		this._diagram.shapeDel(shape);
		this._shapeData.delete(shape);
		this._connectors = this._connectors
			.filter(el => el.start.shape !== shape && el.end.shape !== shape);
	}

	/**
	 * @param {PresenterShapeAppendParam} param
	 * @returns {IDiagramShape}
	 */
	shapeAdd(param, dispatch = true) {
		if (!param.id) {
			param.id = Math.random().toString();
		}

		if (this._shapes[param.id]) {
			return ;
		}

		const shape = this._diagram.shapeAdd(param);
		this._shapes[param.id] = shape;
		this._ids.set(shape, param.id);
		this._shapeData.set(
			shape,
			{
				templateKey: param.templateKey,
				detail: /** @type {string} */(param.props.text?.textContent)
			});

		if (dispatch) {
			this.dispatchEvent(new CustomEvent('shapeAdd', {
				cancelable: true,
				detail: param,
				param: param
			}));			
		}	

		return shape;
	}

	/**
	 * @param {IDiagramShape} shape
	 * @param {PresenterShapeUpdateParam} param
	 * @returns {void}
	 */
	shapeUpdate(param) { 
		const shape = this._shapes[param.id];
		if (shape) {
			this._diagram.shapeUpdate(shape, param);
		}
	}

	connect(param) {
		const start = this._shapes[param.s.i];
		const end = this._shapes[param.e.i];
		if (this._connectors.get(param)) {
			return;
		}
		this._diagram.shapeConnect({
			start: { shape: start, connector: param.s.c },
			end: { shape: end, connector: param.e.c }
		});
	}

	/**
	 * @param {IDiagramShape} shape
	 * @param {Point} offsetPoint
	 * @returns {void}
	 */
	shapeSetMoving(shape, offsetPoint) { this._diagram.shapeSetMoving(shape, offsetPoint); }

	/** @returns {void} */
	clear() {
		for (const shapeData of this._shapeData) {
			this._shapeDel(shapeData[0]);
		}
	}


	/**
	 * @param {AppSerializeData} data
	 * @returns {void}
	 */
	dataSet(data) {
		this.clear();
		if (!(data.s && data.s.length > 0)) { return; }

		/** @type {IDiagramShape[]} */
		const shapes = [];

		for (const shapeJson of data.s) {
			const shape = this.shapeAdd({
				templateKey: shapeJson.templateKey,
				position: shapeJson.position,
				props: {
					text: { textContent: shapeJson.detail }
				}
			});
			shapes.push(shape);
		}

		if (data.c && data.c.length > 0) {
			for (const conJson of data.c) {


				this._connectors.push({
					start: { type: 'connector', key: conJson.s.c, shape: shapes[conJson.s.i] },
					end: { type: 'connector', key: conJson.e.c, shape: shapes[conJson.e.i] }
				});
			}
		}
	}

	/**
	 * subscribe to event
	 * @param {AppDiagramEventType} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		this.addEventListener(evtType, listener);
		return this;
	}
}

/**
 * @param {IDiagramEventConnectDetail} con1
 * @param {IDiagramEventConnectDetail} con2
 * @returns {boolean}
 */
function connectorEqual(con1, con2) {
	return con1.start.shape === con2.start.shape && con1.start.key === con2.start.key &&
	con1.end.shape === con2.end.shape && con1.end.key === con2.end.key;
}

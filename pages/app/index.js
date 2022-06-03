import { appDiagramFactory } from './diagram/app-diagram-factory.js';
import { AppDiagramDurable } from './diagram/app-diagram-durable.js';

// elements
import './elements/menu-shape/menu-shape.js';
import './elements/file-options/file-options.js';

const svg = document.getElementById('diagram');

const diagram = new AppDiagramDurable(svg, appDiagramFactory(svg))
	.on('shapeAdd', function() { document.getElementById('tip')?.remove(); });

/** @type {IFileOptions} */
(document.getElementById('file-options')).init(diagram);

/** @type {IMenuShape} */
(document.getElementById('menu-shape')).init(diagram);

if (window.location.hash) {
	diagram.dataSet(JSON.parse(decodeURIComponent(window.location.hash.substring(1))));
	history.replaceState(null, null, ' ');
}

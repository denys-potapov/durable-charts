import { fileOpen, fileSave } from '../../../diagram-extensions/infrastructure/file-utils.js';

/** @implements {IFileOptions} */
export class FileOptions extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML = `
			<style>
			.menu {
				position: fixed;
				top: 15px;
				left: 15px;
				cursor: pointer;
			}
			.options {
				position: fixed;
				padding: 15px;
				box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%);
				border-radius: 16px;
				background-color: rgba(255,255,255, .9);

				top: 0px;
				left: 0px;

				z-index: 1;
			}

			.options div, .options a { 
				color: rgb(13, 110, 253); 
				cursor: pointer; margin: 10px 0;
				display: flex;
				align-items: center;
				line-height: 25px;
				text-decoration: none;
			}
			.options div svg, .options a svg { margin-right: 10px; }
			</style>
			 <svg data-cmd="menu" class="menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgba(52,71,103,1)"/></svg>
			 <div class="options" style="visibility: hidden;">
				<svg data-cmd="menu" class="menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgba(52,71,103,1)"/></svg>
				<div data-cmd="link" style="padding-top:30px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.354a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.354a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z" fill="rgba(52,71,103,1)"/></svg>Invite others...</div>
		 	</div>`;
		shadow.querySelectorAll('[data-cmd]').forEach(el => el.addEventListener('click', this));

		/**
		 * @type {HTMLDivElement}
		 * @private
		 */
		this._options = shadow.querySelector('.options');
	}

	/**
	 * @param {IAppDiagramSerializable & IAppPngExportable} diagram
	 */
	init(diagram) {
		/** @private */
		this._diagram = diagram;

		this._diagram.svg.addEventListener('dragover', evt => { evt.preventDefault(); });
		this._diagram.svg.addEventListener('drop', async evt => {
			evt.preventDefault();

			if (evt.dataTransfer?.items?.length !== 1 ||
				evt.dataTransfer.items[0].kind !== 'file' ||
				evt.dataTransfer.items[0].type !== 'image/png') {
				this._cantOpen();
				return;
			}

			if (!await diagram.pngLoad(evt.dataTransfer.items[0].getAsFile())) {
				this._cantOpen();
			}
		});
	}

	/** @param {PointerEvent & { currentTarget: Element }} evt */
	async handleEvent(evt) {
		this._toggle();

		switch (evt.currentTarget.getAttribute('data-cmd')) {
			case 'link': {
				var modal = document.getElementById("share");
				var url = document.getElementById("url");
				url.value = document.location;
				modal.style.display = "block";

				var span = document.getElementsByClassName("close")[0];
				span.onclick = function() {
				  	modal.style.display = "none";
				}

				// When the user clicks anywhere outside of the modal, close it
				window.onclick = function(event) {
				  if (event.target == modal) {
				    modal.style.display = "none";
				  }
				} 
				break;
			}
		}
	}

	/** @private */
	_toggle() {
		this._options.style.visibility = this._options.style.visibility === 'visible'
			? 'hidden'
			: 'visible';
	}

	/** @private */
	_cantOpen() {
		alert('File cannot be read. Use the exact image file you got from the application.');
	}
};
customElements.define('ap-file-options', FileOptions);

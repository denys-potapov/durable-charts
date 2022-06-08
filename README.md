# Durable Charts

Collaborative charts editor with durable objects.

See the video, or try it yourself https://charts.pages.dev/app/#playground

https://user-images.githubusercontent.com/2123712/172528168-8359d9ef-16e8-4a37-aa11-5610e64cc1b0.mov

## Components and deploy

- Fronend is CF pages
- Backend is CF durable objects

### Pages

Merge your changes into master and CF pages will do the rest.
	
	git push

### Workers and durable objects

	cd workers/
	wrangler publish

## Credits

- *Alexey Boiko* for great [DgrmJS](https://github.com/AlexeyBoiko/DgrmJS) lib
- *Denys Potapov* [@denys-potapov](https://github.com/denys-potapov)
- *Tony Potapov* [@chmen](https://github.com/chmen)

(function ($) {
	$(document).ready(function () {
		task.init();
	});
})(jQuery);

var task = {
	init: function () {
		this.initGiftBuy();
		$('.category-subscribe').on('click', function (e) {
			var href = $(this).attr('href'),
				modal = $('#my-profile-modal'),
				btn = modal.find('.modal-footer button');

			btn.on('click', function () {
				modal.modal('hide');
				location.href = href;
			});

			modal.modal('show');

			return false;
		});

		$('#points-log-load').on('click', function (e) {
			var btn = $(this),
				page = btn.data('page'),
				lastDate = $('.points-log-list .card-header:last').data('date');

			page = page + 1;
			task.showLoading();

			$.get(btn.data('url'), {page: page, lastDate: lastDate}, function (r) {
				btn.data('page', page);
				$('.points-log-list').append(r);
				if (!r.trim()) {
					btn.remove();
				}
				task.hideLoading();
			}).fail(function () {
				task.hideLoading();
			});
		});

		$('a.task-no-category').on('click', function (e) {
			var modal = $('#not-in-category-modal'),
				btn = $(this);

			modal.find('a.btn').attr('href', btn.data('url'));
			modal.find('.category-name').text(btn.data('category'));
			modal.modal('show');

			return false;
		})
	},
	initYmapsCircle: function (center, points) {
		console.log(center);
		console.log(points);

		ymaps.ready(function () {
			var myMap = new ymaps.Map('map', {
					center: center,
					zoom: 8
				}, {
					searchControlProvider: 'yandex#search'
				}),
				objects = ymaps.geoQuery(points).addToMap(myMap),
				circle = new ymaps.Circle([center, 2000], null, {draggable: false});

			myMap.geoObjects.add(circle);

			var objectsInsideCircle = objects.searchInside(circle);
			objectsInsideCircle.setOptions('preset', 'islands#redIcon');
			// РћСЃС‚Р°РІС€РёРµСЃСЏ РѕР±СЉРµРєС‚С‹ - СЃРёРЅРёРјРё.
			objects.remove(objectsInsideCircle).setOptions('preset', 'islands#blueIcon');
		});
	},
	showLoading: function () {
		$('.loading-modal').show();
	},
	hideLoading: function () {
		$('.loading-modal').hide();
	},
	initGiftBuy: function () {
		$('.select-gift-price').on('change', function () {
			var obj = $(this),
				list = obj.data('list'),
				message = obj.parents('.price-block').find('.price-message');

			if (obj.val()) {
				message.text(obj.val() + ' СЂСѓР±Р»РµР№ РЅР° РїРѕРґР°СЂРѕС‡РЅРѕР№ РєР°СЂС‚Рµ');
			} else {
				message.text('');
			}
		});

		$('.gift-buy').on('click', function () {
			var btn = $(this),
				select = $('#sel-' + btn.data('id'));

			if (!select.val()) {
				var modal = $('#errorGiftModal');
				modal.find('.modal-title').text('Р’С‹ РЅРµ РІС‹Р±СЂР°Р»Рё СЃРµСЂС‚РёС„РёРєР°С‚');
				modal.find('.modal-body').text('Р’С‹ РЅРµ РІС‹Р±СЂР°Р»Рё СЃРєРѕР»СЊРєРѕ С…РѕС‚РёС‚Рµ РїРѕС‚СЂР°С‚РёС‚СЊ РјР°СЂРѕРє РЅР° СЃРµСЂС‚РёС„РёРєР°С‚');
				modal.modal('show');
				return false;
			}

			task.showLoading();
			$.get('/gift/buy', {id: btn.data('id'), price: select.val()}, function (r) {
				task.hideLoading();
				if (r.message) {

				} else if(r.error) {
					if (r.status == 3) {
						var modal = $('#lowPointsModal');
						modal.find('.need-money').text(r.needMoney);
						modal.modal('show');
					} else {
						var modal = $('#errorGiftModal');
						modal.find('.modal-title').text('РћС€РёР±РєР°');
						modal.find('.modal-body').text(r.error);
						modal.modal('show');
					}
				}
			}).fail(function () {
				task.hideLoading();
			});
		});
	},
	initSpecialCreatePage: function () {
		var modal = new BootstrapDialog({
			title: 'РќРµ СѓРєР°Р·Р°РЅ РїРµСЂРёРѕРґ РґРµР№СЃС‚РІРёСЏ Р°РєС†РёРё',
			closable: true,
			size: BootstrapDialog.SIZE_SMALL,
			cssClass: 'text-center date-modal',
			buttons: [{
				label: 'РџСЂРѕРїСѓСЃС‚РёС‚СЊ',
				action: function (dialog) {
					$('#special-create').submit();
				}
			}, {
				label: 'РЈРєР°Р·Р°С‚СЊ',
				action: function (dialog) {
					dialog.close();
				}
			}]
		});

		$('#special-create').on('beforeSubmit', function (e) {
			if (!$('#special-date_start').val() || !$('#special-date_end').val()) {
				e.preventDefault();
				if (!modal.isOpened()) {
					modal.open();
					return false;
				}
			}
		});

		var $backgroundModal = $('#special-change-modal'),
			$imageInput = $backgroundModal.find('input[type="file"]'),
			$imagePreview = $backgroundModal.find('.note-image-preview'),
			$imageBtn = $backgroundModal.find('.modal-footer .btn-load'),
			$rotateLeft = $backgroundModal.find('.rotate-left'),
			$rotateRight = $backgroundModal.find('.rotate-right'),
			$imageBlock = $backgroundModal.find('.note-image-edit-block'),
			$errorBlock = $backgroundModal.find('.has-error .help-block'),
			files = [];

		// Cloning imageInput to clear element.
		$imageInput.replaceWith($imageInput.clone().on('change', function () {
			if (this.files && this.files[0]) {
				var reader = new FileReader();

				var fileName = $(this).val(),
					fileExtension = fileName.split('.').pop().toLowerCase();

				if (fileName.indexOf(".") == -1 || fileExtension != 'jpg' && fileExtension != 'jpeg' && fileExtension != 'png' && fileExtension != 'gif') {
					task.hideLoading();
					alert('РќРµРѕР±С…РѕРґРёРјРѕ Р·Р°РіСЂСѓР¶Р°С‚СЊ РёР·РѕР±СЂР°Р¶РµРЅРёРµ СЃ СЂР°Р·СЂРµС€РµРЅРёРµРј: jpg, png');
					//pr.showErrorModal('РќРµРѕР±С…РѕРґРёРјРѕ Р·Р°РіСЂСѓР¶Р°С‚СЊ РёР·РѕР±СЂР°Р¶РµРЅРёРµ СЃ СЂР°Р·СЂРµС€РµРЅРёРµРј: jpg, png');
					return false;
				}

				reader.onload = function (e) {
					var $image = $imagePreview.find('img.cropper-hidden');
					if ($image.length) {
						$image.cropper('destroy');
					}
					$imagePreview.empty();

					var data = e.target.result;
					var mimeType = data.split(",")[0].split(":")[1].split(";")[0];
					if (mimeType == 'base64') {
						var position = data.indexOf('base64');
						data = [data.slice(0, position), 'image/jpeg;', data.slice(position)].join('');
					}

					$image = $('<img src="' + data + '">').appendTo($imagePreview);
					$imageBlock.show();
					$errorBlock.text('');

					$image.cropper({
						viewMode: 0,
						zoomable: false,
						scalable: false,
						movable: false,
						//autoCrop: false,
						autoCropArea: 0,
						cropBoxResizable: false,
						toggleDragModeOnDblclick: false,
						dragMode: 'none',
						ready: function () {
							var $img = $(this),
								imageData = $img.cropper('getImageData'),
								needWidth = 370,
								needHeight = 250,
								calcWidth = (imageData.width * 100) / imageData.naturalWidth,
								width = (needWidth * calcWidth) / 100,
								calcHeight = (imageData.height * 100) / imageData.naturalHeight,
								height = (needHeight * calcHeight) / 100;

							//console.log(imageData.naturalWidth, imageData.naturalHeight);
							//console.log(calcWidth, calcHeight);
							//console.log(width, height);

							if (imageData.naturalWidth < needWidth) {
								$errorBlock.text('РЁРёСЂРёРЅР° РёР·РѕР±СЂР°Р¶РµРЅРёСЏ РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РЅРµ РјРµРЅРµРµ ' + needWidth + 'px');
								$imageBtn.prop('disabled', 'disabled');
							} else if (imageData.naturalHeight < needHeight) {
								$errorBlock.text('Р’С‹СЃРѕС‚Р° РёР·РѕР±СЂР°Р¶РµРЅРёСЏ РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РЅРµ РјРµРЅРµРµ ' + needHeight + 'px');
								$imageBtn.prop('disabled', 'disabled');
							} else {
								$img.cropper('setCropBoxData', {width: width, height: height});
								$imageBtn.removeAttr('disabled');
							}

							//console.log(imageData);
							//console.log(width, height);
						}
					});


				};

				reader.readAsDataURL(this.files[0]);
				files = this.files[0];
			}
		})
			.val(''));

		$rotateLeft.click(function (e) {
			e.preventDefault();
			var img = $imagePreview.find('img.cropper-hidden');
			img.cropper('rotate', -90);
		});

		$rotateRight.click(function (e) {
			e.preventDefault();
			var img = $imagePreview.find('img.cropper-hidden');
			img.cropper('rotate', 90);
		});

		$imageBtn.click(function (e) {
			e.preventDefault();

			var img = $imagePreview.find('img.cropper-hidden'),
				data = img.cropper('getData');

			files['data'] = JSON.stringify(data);

			task.hideLoading();
			task.showLoading();

			var form = new FormData(),
				formUrl = '/special/image';

			form.append("file", files);

			if (files['data']) {
				form.append("data", files['data']);
			}

			$.ajax({
				data: form,
				type: "POST",
				url: formUrl,
				cache: false,
				contentType: false,
				processData: false,
				dataType: "json",
				success: function (r) {
					task.hideLoading();
					if (r.id) {
						$('#special-image_id').val(r.id);
						$backgroundModal.modal('hide');
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					task.hideLoading();
				}
			});
		});

		$backgroundModal.on('hidden.bs.modal', function () {
			var $backgroundModal = $('#special-change-modal'),
				$imageInput = $backgroundModal.find('input[type="file"]'),
				$imagePreview = $backgroundModal.find('.note-image-preview'),
				$imageBtn = $backgroundModal.find('.modal-footer .btn-load'),
				$imageBlock = $backgroundModal.find('.note-image-edit-block'),
				$errorBlock = $backgroundModal.find('.has-error .help-block');

			var $image = $imagePreview.find('img.cropper-hidden');
			if ($image.length) {
				$image.cropper('destroy');
			}
			$imageInput.val('');
			$imageBtn.prop('disabled', 'disabled');
			$imagePreview.empty();
			$imageBlock.hide();
			$errorBlock.text('');
		});
	},
	summernoteInsertImg: function (files, editor) {
		var url = $(editor).data('upload');
		this.summernoteSendFile(files[0], url, $(editor));
	},
	summernoteSendFile: function (file, url, editor) {
		var data = new FormData();
		data.append("file", file);
		if (file['data']) {
			data.append("data", file['data']);
		}
		this.hideLoading();
		this.showLoading();

		$.ajax({
			data: data,
			type: "POST",
			url: url,
			cache: false,
			contentType: false,
			processData: false,
			dataType: "json",
			success: function (r) {
				editor.summernote('insertImage', r.filelink, function ($image) {
					var alt = editor.data('alt');
					if (alt) {
						$image.attr('alt', alt);
					}
				});
				task.hideLoading();
			},
			error: function (jqXHR, textStatus, errorThrown) {
				task.hideLoading();
			}
		});
	},
	initProductTimer: function () {
		var timer = $('#clock'),
			intervalContainer = [],
			interval = 1000;

		if (timer.length <= 0) {
			timer = $('.clock');
		}

		if (timer) {
			$.each(timer, function (i, v) {
				var obj = $(v);
				task.showRemaining(obj);
				intervalContainer[i] = setInterval(function () {
					task.showRemaining(obj, intervalContainer[i]);
				}, interval);
			});
		}
	},
	showRemaining: function (clock, intervalContainer) {
		var now = new Date(),
			start = clock.data('start'),
			end = clock.data('end'),
			endTime = new Date(end * 1000),
			_second = 1000,
			_minute = _second * 60,
			_hour = _minute * 60,
			_day = _hour * 24,
			distance = endTime - now,
			days = Math.floor(distance / _day),
			hours = Math.floor((distance % _day) / _hour),
			minutes = Math.floor((distance % _hour) / _minute),
			seconds = Math.floor((distance % _minute) / _second);

		if (end < start) {
			return false;
		}

		if (distance < 0) {
			clearInterval(intervalContainer);
			return false;
		}

		if (hours < 10) {
			hours = '0' + hours;
		}

		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		if (seconds < 10) {
			seconds = '0' + seconds;
		}

		clock.text(days + ' ' + declOfNum(days, ['РґРµРЅСЊ', 'РґРЅСЏ', 'РґРЅРµР№']) + ' ' + hours + ":" + minutes + ":" + seconds);
	}
}

function declOfNum(number, titles) {
	cases = [2, 0, 1, 1, 1, 2];
	return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

function initYmapsCircle() {
	var myMap = new ymaps.Map('map', {
			center: [55.43, 37.75],
			zoom: 8
		}, {
			searchControlProvider: 'yandex#search'
		}),
		objects = ymaps.geoQuery([
			{
				type: 'Point',
				coordinates: [55.73, 37.75]
			},
			{
				type: 'Point',
				coordinates: [55.10, 37.45]
			},
			{
				type: 'Point',
				coordinates: [55.25, 37.35]
			}
		]).addToMap(myMap),
		circle = new ymaps.Circle([[55.43, 37.7], 10000], null, {draggable: true});

	circle.events.add('drag', function () {
		// РћР±СЉРµРєС‚С‹, РїРѕРїР°РґР°СЋС‰РёРµ РІ РєСЂСѓРі, Р±СѓРґСѓС‚ СЃС‚Р°РЅРѕРІРёС‚СЊСЃСЏ РєСЂР°СЃРЅС‹РјРё.
		var objectsInsideCircle = objects.searchInside(circle);
		objectsInsideCircle.setOptions('preset', 'islands#redIcon');
		// РћСЃС‚Р°РІС€РёРµСЃСЏ РѕР±СЉРµРєС‚С‹ - СЃРёРЅРёРјРё.
		objects.remove(objectsInsideCircle).setOptions('preset', 'islands#blueIcon');
	});
	myMap.geoObjects.add(circle);
}
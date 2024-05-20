// Маска для инпутов (телефон)
function addInputPhoneMask() {
    const phoneInputs = document.querySelectorAll("input[data-tel-input]");

    Array.prototype.forEach.call(phoneInputs, (input) => {
        const phoneMask = IMask(input, {
            mask: '+{7 (9}00) 000-00-00'
        })
    })
}
addInputPhoneMask();

const nameInputs = document.querySelectorAll('input[data-name-input]');

// Запрет ввода цифр в поле имени 
nameInputs.forEach((input) => {
    input.addEventListener('keypress', function (e) {
        //console.log(e.keyCode);
        if (e.keyCode != 8 && e.keyCode != 46 && (input.value.length > 49 || e.key && e.key.match(/[^а-яА-ЯЁёІіЇїҐґЄєa-zA-ZẞßÄäÜüÖöÀàÈèÉéÌìÍíÎîÒòÓóÙùÚúÂâÊêÔôÛûËëÏïŸÿÇçÑñœ’`'.-\s]/)))
            return e.preventDefault();
    });
    input.addEventListener('input', function (e) {
        if (e.inputType == "insertFromPaste") {
            // На случай, если умудрились ввести через копипаст или авто-дополнение.
            input.value = input.value.replace(/[^а-яА-ЯЁёІіЇїҐґЄєa-zA-ZẞßÄäÜüÖöÀàÈèÉéÌìÍíÎîÒòÓóÙùÚúÂâÊêÔôÛûËëÏïŸÿÇçÑñœ’`'.-\s]/g, "").slice(0, 50);
        }
    });
});

// Валидация форм
function removeErrorClassOnInput(input) {
    input.addEventListener('input', () => {
        if (input.value.trim() !== '')
            input.classList.remove('input-error');
    });
    input.addEventListener('focus', () => {});
    input.onblur = function () {
        const {
            value
        } = input;
        const requiredIcon = input.closest('.form-row').querySelector('.input-icon');
        if (!value && requiredIcon) {
            requiredIcon.classList.remove('display-none');
        }
    };

    input.onfocus = function () {
        const requiredIcon = input.closest('.form-row').querySelector('.input-icon');
        if (requiredIcon) {
            requiredIcon.classList.add('display-none');
        }
        input.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        })
    };
}

function formValidation(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('.input');

    inputs.forEach((input) => {
        const {
            value,
            dataset
        } = input;
        input.classList.remove('input-error');

        if (input.hasAttribute('data-tel-input')) {
            const regExp = /[^\d]/g;
            if (
                dataset.minLength &&
                value.replace(regExp, '').length < dataset.minLength
            ) {
                input.classList.add('input-error');
                isValid = false;
            }

            if (
                dataset.maxLength &&
                value.replace(regExp, '').length > dataset.maxLength
            ) {
                input.classList.add('input-error');
                isValid = false;
            }

            if (
                value.replace(regExp, '')[0] == 7 && value.replace(regExp, '').length > 11
            ) {
                input.classList.add('input-error');
                isValid = false;
            }
        }

        if (input.hasAttribute('data-name-input')) {
            const namePattern = /[^а-яА-ЯЁёІіЇїҐґЄєa-zA-ZẞßÄäÜüÖöÀàÈèÉéÌìÍíÎîÒòÓóÙùÚúÂâÊêÔôÛûËëÏïŸÿÇçÑñœ’`'.-\s]/g;

            if (namePattern.test(value.trim()) || value.trim() == '') {
                input.classList.add('input-error');
                isValid = false;
            }
        }

        if (dataset.required === 'true') {
            if (!value) {
                input.classList.add('input-error');
                isValid = false;
            }
        }
    });

    return isValid;
}

function checkValidationFormOnSubmit(form) {
    const inputs = form.querySelectorAll('.input');
    const onSubmitHandler = (event) => {
        if (formValidation(form)) {
            return true;
        } else {
            form.querySelector('.w-button').value = form.querySelector('.w-button').getAttribute('data-btn-default');
            return false;
        }
    };

    inputs.forEach((input) => {
        const isRequiredInput = input.getAttribute('data-required');
        if (isRequiredInput) {
            removeErrorClassOnInput(input);
        }
    });

    $(form).submit(onSubmitHandler);
}

const forms = document.querySelectorAll('form[action="https://samolet.ru/"]');
if (forms) {
    Array.prototype.forEach.call(forms, (form) => {
        checkValidationFormOnSubmit(form);
        const formResetBtn = form.parentNode.querySelector('[data-form-reset]');
        const formDone = form.parentNode.querySelector('.w-form-done');

        if (formResetBtn) {
            formResetBtn.addEventListener('click', () => {
                form.style.display = '';
                form.reset();
                formDone.style.display = 'none';
            })
        }

    })
}

// Отправка формы в апи
$('form').on('submit', function (e) {
    e.preventDefault()
    var form = $(this),
        formData = new FormData($(this)[0]),
        url = 'https://partners.samolet.ru/api/proxy/request/',
        button = form.find('[type="submit"]'),
        object = {}

    if (formValidation(form[0])) {
        formData.set('request_type', 'application_izhs');
        formData.set('calltouch_id', crypto.randomUUID());
        formData.set('phone', formData.get('phone').replace(/\D/g, ""));
        button.val(button.data('wait'));
        button.addClass('pointer-events-none');
        sendRequest(url, form, formData);
        return false;
    } else {
        return false;
    }
});

function sendRequest(url, form, formData) {
    var successMessage = form.siblings('.w-form-done'),
        errorMessage = form.siblings('.w-form-fail'),
        button = form.find('[type="submit"]'),
        callTouchUrl = "https://api.calltouch.ru/calls-service/RestAPI/requests/36409/register/",
        options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json', // Используйте соответствующий Accept-заголовок
                //'Referer': 'https://zagorod.samolet.ru',
                'Authorization': 'Token 5b21b750fd5c4c3e2d447de951c2905f04585a8d'
            },
            body: formData,
        };


    var callTouchFormData = new FormData();
    callTouchFormData.set('fio', formData.get('name'));
    callTouchFormData.set('phoneNumber', formData.get('phone'));
    formData.get('email') && callTouchFormData.set('email', formData.get('email'));
    formData.get('comment') && callTouchFormData.set('comment', formData.get('comment'));
    callTouchFormData.set('requestUrl', location.href);
    callTouchFormData.set('subject', "Заявка с сайта Загород Самолет");
    callTouchFormData.set('sessionId', window.ct('calltracking_params', 'htlowve6').sessionId)

    var callTouchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(callTouchFormData).toString() //JSON.stringify(Object.fromEntries(callTouchFormData))
    }


    button.addClass('pointer-events-none');
    const sendToApi = fetch(url, options)
    //const sendToCallTouch = fetch(callTouchUrl, callTouchOptions)
    const sendToCallTouch = new Promise((resolve, reject) => {
        window.ctw.createRequest('samolet_izhs', formData.get('phone'),
        [
                {
                    "name": "Имя",
                    "value": formData.get('name')
            }
        ],
            function (success, data) {
                success ? resolve(success) : reject(success);
                console.log(success, data)
            },
            null,
        [
            'Форма заявки загород'
        ]
            //131231 /*id отдела*/
        );
    })

    Promise.all([
        sendToApi,
        sendToCallTouch
    ]).then((data) => {
        const [sendToApiResult, sendToCallTouchResult] = data;
        if (sendToApiResult.status == 200 && sendToCallTouchResult) {
            button.removeClass('pointer-events-none');
            button.val(button.data('btn-default'));
            successMessage.show();
            errorMessage.hide();
            form.hide();
        } else {
            button.removeClass('pointer-events-none');
            showErrorMessage(form, 'Произошла ошибка при отправке формы. Попробуйте позже или свяжитесь с&nbsp;нами другим способом.')
            console.log(error);
        }
    }).catch((error) => {
        button.removeClass('pointer-events-none');
        showErrorMessage(form, 'Произошла ошибка при отправке формы. Попробуйте позже или свяжитесь с&nbsp;нами другим способом.')
        console.log(error);
    });
    return false;
}

function showErrorMessage(form, msg) {
    var button = form.find('[type="submit"]'),
        errorMessage = form.siblings('.w-form-fail');

    errorMessage.find('div').html(msg);
    button.val(button.data('btn-default'));
    errorMessage.show();
    setTimeout(function () {
        errorMessage.hide();
    }, 3000)
    form.show();
}

"use strict";
const el = (sel) => document.querySelector(sel);

const form = el("#myForm");
const fioEl = el("#fio");
const emailEl = el("#email");
const phoneEl = el("#phone");
const result = el("#resultContainer");
const button = el("#submitButton");

// variable for our future timeout
let refetch;

// add and remove error class from inputs
function toggleErrorClass(errors) {
  const inputList = document.querySelectorAll("input");

  inputList.forEach(input=> {
    if (errors && errors.find(fld=>fld === input.name)) {
      input.classList.add("error");
    } else {
      input.classList.remove("error");
    }
  });
}

async function mockFetch(url) {
  // let's imitate our submit script with random numbers and stuff
  const rnd = Math.floor(Math.random() * 3);
  let data = {};

  function get(file) {
    return fetch(`${url}/${file}.json`)
      .then(json => json.json())
      .then(json => data = json)
      .catch(error => console.error(error));
  }

  switch (rnd) {
    // 1 is success
    case 1:
      return await get("success");
    // 2 is error
    case 2:
      return await get("error");
    // 0 is waiting
    default:
      return await get("progress");
  }

  window.clearTimeout(refetch);
  return data;
}

const MyForm = {
  validate: function() {
    return {
      isValid: true,
      errorFields: []
    }
  },
  setData: function(obj) {
    fioEl.value = obj.fio;
    emailEl.value = obj.email;
    phoneEl.value = obj.phone;
    return;
  },
  getData: function() {
    return {
      fio: fioEl.value,
      email: emailEl.value,
      phone: phoneEl.value
    }
  },
  submit: function(event) {
    event.preventDefault();

    // let's validate
    let getData = MyForm.getData();
    let validate = MyForm.validate();
    let{errorFields,isValid} = validate;

    // check fio
    if (getData.fio.split(" ").length !== 3) {
      errorFields.push("fio");
    }

    // check email
    if (!/^[\w\d\.]*@(?:(?:ya\.ru)|(yandex\.(?:ru|ua|by|com)))/.test(getData.email)) {
      errorFields.push("email");
    }

    // check phone
    let rawPhone = getData.phone.replace(/\D/g, '');
    let phoneArr = rawPhone.split("");
    let phoneSum = phoneArr.reduce((acc,curr)=>acc + parseFloat(curr), 0);

    if (!/\+7\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}/.test(getData.phone) || phoneSum > 30) {
      errorFields.push("phone");
    }

    // check if there are errors
    if (errorFields.length > 0) {
      isValid = false;
    }

    toggleErrorClass(!isValid && errorFields);
    
    if (isValid) {
      button.disabled = true;

      (function sendForm() {
        mockFetch(form.action)
        .then(data => {
          // reset styles
          result.classList.remove("error", "success", "progress");

          switch (data.status) {
            case "success":
              result.classList.add("success");
              result.innerHTML = "Success";
              button.disabled = false;
            break;
            case "error":
              result.classList.add("error");
              result.innerHTML = data.reason;
              button.disabled = false;
            break;
            case "progress":
            default:
              result.classList.add("progress");
              result.innerHTML = "Пожалуйста, подождите...";
              refetch = setTimeout(sendForm, data.timeout);
            break;
          }
        });
      })();
    }

    return false;
  }
}

// add event listener
form.addEventListener("submit", MyForm.submit);

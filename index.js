"use strict";
// helper function because it's tiresome
// to type document.querySelector every time
// could've gone for one liner
//   const el = (sel) => document.querySelector(sel)
// but func is more readable in this case, I think
function el(sel) {
  return document.querySelector(sel);
}

// our constants
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
  const inputNodes = document.querySelectorAll("input");

  inputNodes.forEach(input => {
    if (errors && errors.find(fld => fld === input.name)) {
      input.classList.add("error");
    } else {
      input.classList.remove("error");
    }
  });
}

// let's imitate our submit script with random numbers and stuff
async function mockFetch(url) {
  let data = {};

  // generate random number (0-2)
  function rnd() {
    return Math.floor(Math.random() * 3);
  }
  
  // generic fetch to reduce code dublication
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

// MyForm obligatory object with methods
const MyForm = {
  validate: function() {
    return {
      isValid: true,
      errorFields: []
    }
  },
  // I couldn't figure out where this is gonna come in handy,
  // but here it is
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
  submit: function(e) {
    e.preventDefault();

    // let's validate
    let getData = MyForm.getData();
    let validate = MyForm.validate();
    let { errorFields, isValid } = validate;

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

    // add or remove classes from inputs
    toggleErrorClass(!isValid && errorFields);
    
    // if isValid is true, disable button
    // and go do our imitated fetch call
    if (isValid) {
      button.disabled = true;

      (function sendForm() {
        mockFetch(form.action)
        .then(data => {
          // reset #resultContainer styles,
          result.classList.remove("error", "success", "progress");

          // then make it great again (depending on data.status)
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

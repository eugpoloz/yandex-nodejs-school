"use strict";
const form = document.querySelector("#myForm");
const fioEl = document.querySelector("#fio");
const emailEl = document.querySelector("#email");
const phoneEl = document.querySelector("#phone");

function toggleErrorClass(errors) {
  const inputList = document.querySelectorAll("input");
  const error = "input--error";

  inputList.forEach(input => {
    if( errors && errors.find(fld => fld === input.name) ) {
      input.classList.add(error);
    } else {
      input.classList.remove(error);
    }
  });
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
    let { errorFields, isValid } = validate;
    
    // check fio
    if (getData.fio.split(" ").length !== 3) {
      errorFields.push("fio");
    }

    // check email
    if(!/^[\w\d\.]*@(?:(?:ya\.ru)|(yandex\.(?:ru|ua|by|com)))/.test(getData.email)) {
      errorFields.push("email");
    }

    // check phone
    let rawPhone = getData.phone.replace(/\D/g,'');
    let phoneArr = rawPhone.split("");
    let phoneSum = phoneArr.reduce((acc, curr) => acc + parseFloat(curr), 0);
    
    if (!/\+7\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}/.test(getData.phone) || phoneSum > 30) {
      errorFields.push("phone");
    }

    // check if there are errors
    if (errorFields.length > 0) {
      isValid = false;
    }

    toggleErrorClass(!isValid && errorFields);
  }
}

// add event listener
form.addEventListener("submit", MyForm.submit);

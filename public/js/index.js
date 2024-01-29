import '@babel/polyfill';
import { login, logout } from './login';
import { updateData, updatePassword, updateSettings } from './updateSettings';
import { NewUser } from './signup';
//DOM elements
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const updatePassForm = document.querySelector('.form-user-settings');
const SignupForm = document.querySelector('.form--createuser');

//DELEGATION
if (loginForm) {
  loginForm.addEventListener('submit', (el) => {
    el.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (updateForm) {
  updateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
  });
}

if (updatePassForm) {
  updatePassForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--savePassword').textContent = 'updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updatePassword(passwordCurrent, password, passwordConfirm);

    document.querySelector('.btn--savePassword').textContent = 'save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (SignupForm) {
  SignupForm.addEventListener('submit', (el) => {
    console.log('hello from the signupForm');
    el.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    NewUser(name, email, password, passwordConfirm);
  });
}

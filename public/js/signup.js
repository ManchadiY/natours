//create a new user
import axios from 'axios';
import { showAlert } from './alert';

export const NewUser = async (name, email, password, passwordConfirm) => {
  console.log(name, email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Account successfully created');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (error) {
    showAlert('error', error.res.data.message);
  }
};

// console.log(email, password);
//   try {
//     const response = await axios({
//       method: 'POST',
//       url: 'http://127.0.0.1:3000/api/v1/users/login',
//       data: {
//         email,
//         password,
//       },
//     });
//     console.log(response);
//     if (response.data.status === 'success') {
//       showAlert('success', 'logged in successfully');
//       window.setTimeout(() => {
//         location.assign('/');
//       }, 500);
//     }
//   } catch (error) {
//     showAlert('error', error.response.data.message);
//   }

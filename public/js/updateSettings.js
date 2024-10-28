//update username and email //similar to login
import axios from 'axios';
import { showAlert } from './alert';

//updateData function

//type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    // console.log('inside the updatesettings');
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';
    const response = await axios({
      method: 'PATCH',
      url,
      data,
    });
    // console.log(response);
    if (response.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
      window.setTimeout(() => {
        location.reload();
      }, 500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const updateData = async (name, email) => {
  try {
    // console.log('inside the update data');
    const response = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe ',
      data: {
        name,
        email,
      },
    });
    // console.log(response);
    if (response.data.status === 'success') {
      showAlert('success', 'successfully updated user data');
      // window.setTimeout(() => {
      //   location.assign('/me');
      // }, 500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const updatePassword = async (
  passwordCurrent,
  password,
  passwordConfirm
) => {
  try {
    // console.log('inside the update password');
    const response = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updatePassword ',
      data: {
        passwordCurrent,
        password,
        passwordConfirm,
      },
    });
    // console.log(response);
    if (response.data.status === 'success') {
      showAlert('success', 'successfully updated user password');
      // window.setTimeout(() => {
      //   location.assign('/me');
      // }, 500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

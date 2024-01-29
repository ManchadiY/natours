const express = require('express');
const viewcontroller = require('./../controller/viewcontroller');
const Authcontroller = require('./../controller/authcontroller');

const Router = express.Router();

Router.get('/', Authcontroller.isLoggedIn, viewcontroller.getOverview);
Router.get('/tour/:id', Authcontroller.isLoggedIn, viewcontroller.getTour);
Router.get('/login', Authcontroller.isLoggedIn, viewcontroller.getLoginForm);
Router.get('/signup', Authcontroller.isLoggedIn, viewcontroller.getSignupForm);

Router.get('/me', Authcontroller.protect, viewcontroller.getAccount);

module.exports = Router;

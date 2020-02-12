import axios from 'axios';
import setAlert from './alert';
import {
    REGISTER_SUCCESS,
    REGISTER_FAILURE,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    CLEAR_PROFILE
} from '../actions/types';

import setAuthToken from '../util/setAuthToken';

// load user

export const loadUser = () => async dispatch => {
    if (localStorage.token) {
        setAuthToken(localStorage.token)
    }

    try {
        const res = await axios.get("http://localhost:3000/api/auth");
        dispatch({
            type: USER_LOADED,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: AUTH_ERROR
        })
    }
}


// register
export const register = ({ name, email, password }) => async dispatch => {

    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    const body = JSON.stringify({ name, email, password });

    try {
        const res = await axios.post("http://localhost:3000/api/users", body, config);
        dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data
        });
        dispatch(loadUser());
    } catch (err) {
        const errors = err.response.data;
        console.log(JSON.stringify(errors));
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }
        dispatch({
            type: REGISTER_FAILURE
        });
    }
}

// login

export const login = (email, password) => async dispatch => {

    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    const body = JSON.stringify({ email, password });

    try {

        const res = await axios.post("http://localhost:3000/api/auth", body, config);
        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        });

        dispatch(loadUser());

    } catch (err) {
        console.log(JSON.stringify(err.response));
        const errors = err.response.data.errors;
        console.log(JSON.stringify(errors));

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }

        dispatch({
            type: LOGIN_FAIL
        })

    }
}

// logout clear profile

export const logout = () => dispatch => {
    dispatch({ type: CLEAR_PROFILE })
    dispatch({ type: LOGOUT })
}

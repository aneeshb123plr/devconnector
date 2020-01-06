import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

const setALert = (msg, actionType) => (dispatch) => {
 const id = uuid.v4();
 dispatch({
     type: SET_ALERT,
     payload: { id, msg, actionType }
 })
}
export default setALert;
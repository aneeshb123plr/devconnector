import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

const setALert = (msg, alertType,timeout=3000) => (dispatch) => {
 const id = uuid.v4();
 dispatch({
     type: SET_ALERT,
     payload: { id, msg, alertType }
 })

 setTimeout(()=> dispatch({
     type:REMOVE_ALERT,
     payload:id
     }),timeout);
}
export default setALert;
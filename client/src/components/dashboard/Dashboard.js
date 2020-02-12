import React, { useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getCurrentProfile } from '../../actions/profile';
import DashboardAction from './DashboardAction';
import Experience from './Experience';
import Education from './Education';
import PropType from 'prop-types';
import Spinner from '../layout/Spinner';
const Dashboard = ({ auth:{ user }, profile:{ profile, loading }, getCurrentProfile}) => {

    useEffect(() => {
        getCurrentProfile();
    },[]);
    return loading && profile === null ? <Spinner/>: <Fragment>
       <h1 className="large text-primary">Dashboard</h1>
       <p className="lead">
           <i className="fas fa-user"></i> Welcome { user && user.name }
       </p>
       {profile !== null ? 
       (
       <Fragment>

           <DashboardAction/>
           <Experience experience = {profile.experience}/>
           <Education education = { profile.education }/>
       </Fragment>
       ):( 
       <Fragment>
           <p>You have not yet setup a profile, please add some info</p>
           <Link to="/create-profile" className="btn btn-primary my-1">
               Create Profile
           </Link>
       </Fragment>
       )}
    </Fragment>
}

Dashboard.propType = ({
 getCurrentProfile: PropType.func.isRequired,
 auth: PropType.object.isRequired,
 profile: PropType.object.isRequired
})

const mapStateToProps = state =>({
    auth: state.auth,
    profile: state.profile
})
export default connect(mapStateToProps, { getCurrentProfile })(Dashboard);

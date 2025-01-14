import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import flow from 'lodash/flow';
// Ui
import { Grid, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import {
    Person,
} from '@material-ui/icons';

// actions
import {
    getFlows, stopFlow, createFlow, switchAddState,
} from '../../action/flows';
import { getTenants } from '../../action/tenants';
import { getUsers } from '../../action/users';

const useStyles = {
    avatar: {
        margin: '25px',
        background: 'rgb(243, 243, 243)',
        borderRadius: '50%',
        height: '150px',
        width: '150px',
    },
    headline: {
        fontSize: '32px',
        lineHeight: '52px',
        fontFamily: '"Saira", sans-serif',
        fontWeight: '300',
    },
    contentAuth: {
        height: '200px',
        marginTop: '150px',
        borderRadius: '15px',
    },
    contentFlows: {
        marginTop: '50px',
        background: 'rgb(243, 243, 243)',
        borderRadius: '15px',
    },
    indicator: {
        height: '10px',
        width: '10px',
        borderRadius: '50%',
        display: 'inline-block',
        marginRight: '10px',
    },
    flowsContainer: {
        background: 'white',
        borderRadius: '15px',
        margin: '20px',
    },
};

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showSideSheet: false,
        };
        props.getFlows();
        props.getUsers();
        props.getTenants();
    }

    getFlows(classes) {
        const activeFlows = this.props.flows.all.filter(item => item.status === 'active');
        activeFlows.length = 5;
        if (activeFlows && activeFlows.length) {
            return (
                <Grid container item xs={12} justify='center'>
                    {
                        activeFlows.map((activeFlow, index) => (
                            <Grid
                                container
                                item
                                xs={2}
                                key={`flowItem-${index}`}
                                className={classes.flowsContainer}
                                justify='flex-end'>
                                <Grid item style={{ margin: '8px' }}>
                                    <span className={classes.indicator} style={{ backgroundColor: 'green' }}/>
                                    {activeFlow.status}
                                </Grid>
                                <Grid item xs={12} style={{ margin: '8px' }}>
                                    {activeFlow.name}
                                </Grid>
                                <Grid item>
                                    <Button
                                        style={{
                                            width: '100px',
                                            background: 'lightgrey',
                                            margin: '8px',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            this.props.stopFlow(activeFlow.id);
                                        }}>
                                        stop
                                    </Button>
                                </Grid>
                            </Grid>
                        ))
                    }
                </Grid>);
        }
        return null;
    }

    render() {
        const { classes } = this.props;
        return (
            <Grid container justify='center'>

                <Grid container item xs={11} className={classes.contentAuth}>

                    {
                        this.props.auth.avatar
                            ? <Grid item xs={2}>
                                <img className={classes.avatar} src={this.props.auth.avatar} alt="Avatar"/>
                            </Grid>

                            : <Grid item xs={2}>
                                <Person className={classes.avatar}/>
                            </Grid>
                    }
                    <Grid container item xs={5} direction='column' justify='center'>
                        <Grid item>Welcome back {this.props.auth.firstname} {this.props.auth.lastname}</Grid>
                        <Grid item>({this.props.auth.username})</Grid>
                        <Button
                            onClick={() => {
                                this.props.history.push('/profile');
                            }}
                            style={{ width: '100px', background: 'rgb(243, 243, 243)', marginTop: '8px' }}>
                            Profile
                        </Button>
                    </Grid>


                </Grid>
                <Grid container item xs={11} className={classes.contentFlows} spacing={5}>
                    <Grid item xs={9} className={classes.headline}>Your Active Flows</Grid>
                    <Grid container item xs={3} justify='flex-end'>
                        <Grid item>
                            <Button
                                style={{
                                    width: '100px',
                                    background: 'rgb(230, 230, 230)',
                                    margin: '8px',
                                }}
                                onClick={() => {
                                    this.props.history.push('/flows');
                                }}>
                                all Flows
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button style={{
                                width: '100px',
                                background: 'rgb(230, 230, 230)',
                                margin: '8px',
                            }}
                            onClick={() => {
                                this.props.switchAddState();
                                this.props.history.push('/flows');
                            }}>
                                add Flow
                            </Button>
                        </Grid>

                    </Grid>

                    {
                        this.props.flows.all.length ? this.getFlows(classes) : null
                    }

                </Grid>
            </Grid>
        );
    }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired,
};


const mapStateToProps = state => ({
    flows: state.flows,
    auth: state.auth,
    users: state.users,
    tenants: state.tenants,
});
const mapDispatchToProps = dispatch => bindActionCreators({
    getFlows,
    stopFlow,
    createFlow,
    switchAddState,
    getTenants,
    getUsers,
}, dispatch);

export default flow(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withRouter,
    withStyles(useStyles),
)(Home);

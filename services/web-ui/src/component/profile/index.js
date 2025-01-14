import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import flow from 'lodash/flow';
// Ui
import {
    Grid, Button, ListItemText, ListItem, List, Input, FormControl, InputLabel, Select, MenuItem,
} from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import {
    Add, Remove,
} from '@material-ui/icons';

import withForm from '../../hoc/with-form';
import { getConfig } from '../../conf';

// actions
import { updateUser } from '../../action/users';


const conf = getConfig();

const useStyles = {
    wrapper: {
        width: '100%',
        padding: '10vh 0 0 0',
    },
    form: {
        float: 'none',
        marginTop: '60px',
        width: 500,
    },
    frame: {
        height: '100vh',
    },
    formControl: {
        margin: '10px',
        width: '100%',
    },
};

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pending: false,
            succeeded: false,
            selectValue: '',
            roles: [],
            selectableroles: [],
        };
    }

    componentDidMount() {
        const currentUser = this.props.users.all.find(user => user._id === this.props.auth._id);
        const currentTenantOfUser = currentUser.tenant && this.props.tenants.all.find(tenant => tenant._id === currentUser.tenant);
        this.props.setFormData({
            _id: currentUser._id,
            username: currentUser.username,
            firstname: currentUser.firstname,
            lastname: currentUser.lastname,
            tenant: currentTenantOfUser || '',
            role: currentUser.role,
            status: currentUser.status,
            password: '',
        });
        if (currentUser && !currentUser.roles) currentUser.roles = [];
        if (this.props.roles && currentUser.roles) {
            const arr = [];
            const arrSelectable = [];
            // eslint-disable-next-line no-restricted-syntax
            for (const role of this.props.roles.all) {
                if (currentUser.roles.includes(role._id)) arr.push(role);
                else arrSelectable.push(role);
            }
            this.setState({
                roles: arr,
                selectableroles: arrSelectable,
            });
        }
    }

    componentDidUpdate(prefProps, prefstate) {
        if (prefstate.roles.length !== this.state.roles.length) {
            if (this.state.roles) {
                const arrSelectable = [];
                // eslint-disable-next-line no-restricted-syntax
                for (const role of this.props.roles.all) {
                    if (!this.state.roles.find(item => item._id === role._id)) arrSelectable.push(role);
                }
                this.setState({
                    selectableroles: arrSelectable,
                });
            }
        }
    }

    submit = (e) => {
        e.preventDefault();
        const data = JSON.parse(JSON.stringify(this.props.formData));
        if (this.state.roles.length) data.roles = this.state.roles;

        this.props.updateUser(data);
        this.setState({
            pending: true,
            succeeded: false,
        });
    }

    render() {
        const { classes } = this.props;
        const {
            username, firstname, lastname, password, status, tenant,
        } = this.props.formData;

        return (
            <Grid container justify='center'>
                <form onSubmit={this.submit.bind(this)} className={classes.form}>
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="username">username</InputLabel>
                        <Input
                            required
                            inputProps={{
                                pattern: '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
                                type: 'email',
                            }}
                            id="username"
                            name="username"
                            onChange={this.props.setVal.bind(this, 'username')}
                            value={username || ''}
                            error={!this.props.isValid('username')}
                        />
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="firstname">firstname</InputLabel>
                        <Input
                            required
                            id="firstname"
                            name="firstname"
                            onChange={this.props.setVal.bind(this, 'firstname')}
                            value={firstname || ''}
                            error={!this.props.isValid('firstname')}
                        />
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="lastname">lastname</InputLabel>
                        <Input
                            required
                            id="lastname"
                            name="lastname"
                            onChange={this.props.setVal.bind(this, 'lastname')}
                            value={lastname || ''}
                            error={!this.props.isValid('lastname')}
                        />
                    </FormControl>

                    {
                        this.props.auth.role === 'ADMIN'
                                && <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="tenant">tenant</InputLabel>
                                    <Select
                                        id='tenant'
                                        value={tenant || ''}
                                        onChange={this.props.setVal.bind(this, 'tenant')}
                                    >
                                        {this.props.tenants.all.map(item => <MenuItem key={item._id} value={item}>{item.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                    }

                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="roles">roles</InputLabel>
                        <Select
                            id='roles'
                            value={this.state.selectValue}
                            onChange={ (e) => {
                                this.setState({
                                    selectValue: e.target.value,
                                });
                            }
                            }
                        >
                            {this.state.selectableroles && this.state.selectableroles.map(item => <MenuItem key={item._id} value={item}>{item.name}</MenuItem>)}
                        </Select>
                        <Button
                            type='button'
                            variant="contained"
                            onClick={ () => {
                                if (this.state.selectValue) {
                                    const tempArr = [...this.state.roles];
                                    tempArr.push(this.state.selectValue);
                                    this.setState({
                                        roles: tempArr,
                                        selectValue: '',
                                    });
                                }
                            }}>
                            <Add/>
                        </Button>
                    </FormControl>
                    {
                        this.state.roles.length
                            ? <List dense={true}>
                                {this.state.roles.map(item => <ListItem key={item._id}>
                                    <ListItemText
                                        primary={item.name}
                                    />
                                    <Button
                                        type='button'
                                        variant="contained"
                                        onClick={ () => {
                                            const tempArr = [...this.state.roles];
                                            this.setState({
                                                roles: tempArr.filter(tempArrItem => tempArrItem._id !== item._id),
                                            });
                                        }}>
                                        <Remove/>
                                    </Button>
                                </ListItem>)}
                            </List>

                            : null
                    }


                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="status">status</InputLabel>
                        <Select
                            value={status || conf.account.status.ACTIVE}
                            onChange={this.props.setVal.bind(this, 'status')}
                        >
                            {Object.keys(conf.account.status).map(key_ => <MenuItem key={key_} value={key_}>{key_}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <React.Fragment>
                            <InputLabel htmlFor="password">password</InputLabel>
                            <Input
                                required
                                id="password"
                                type="password"
                                name="password"
                                onChange={this.props.setVal.bind(this, 'password')}
                                value={password || ''}
                            />
                        </React.Fragment>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <Button
                            disabled={this.state.pending}
                            type='submit'
                            variant="contained"
                            color="secondary">{this.state.pending ? 'Saving...' : 'Save'}
                        </Button>
                    </FormControl>

                </form>
            </Grid>
        );
    }
}

Profile.propTypes = {
    classes: PropTypes.object.isRequired,
};


const mapStateToProps = state => ({
    users: state.users,
    roles: state.roles,
    tenants: state.tenants,
    auth: state.auth,
});
const mapDispatchToProps = dispatch => bindActionCreators({
    updateUser,
}, dispatch);

export default flow(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withStyles(useStyles),
    withForm,
)(Profile);

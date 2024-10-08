import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
// material
import { styled } from '@mui/material/styles';
import { Card, Stack, Link, Container, Typography } from '@mui/material';
import { getErrorMessage } from '../utils/appUtils';
// components;
import Page from '../components/Page';
import { loginAdmin } from '../actions/adminActions/adminLogin';

import { LoginForm } from '../sections/authentication/login';
// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

function Login(props) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const onError = (err) => {
    const error = getErrorMessage(err);
    if (error) {
      enqueueSnackbar(error, {
        variant: 'error'
      });
    }
  };

  const tryLogin = (value) => {
    props.loginAdmin(
      {
        email: value.email,
        password: value.password
      },
      navigate,
      (err) => onError(err)
    );
  };
  return (
    <RootStyle title="Login | GK-Mcq-UI">
      <SectionStyle sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
          Hi, Welcome Back
        </Typography>
        <img src="/static/illustrations/illustration_login.png" alt="login" />
      </SectionStyle>

      <Container maxWidth="sm">
        <ContentStyle>
          <Stack sx={{ mb: 5 }}>
            <Typography variant="h4" gutterBottom>
              Sign in to General Knowledge MCQ
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>Enter your details below.</Typography>
          </Stack>

          <LoginForm tryLogin={tryLogin} loading={props.adminDataLoading} />
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}

const mapStateToProps = (state) => ({
  adminData: state.adminData.admin,
  adminDataLoading: state.adminData.loading
});

export default connect(mapStateToProps, {
  loginAdmin
})(Login);

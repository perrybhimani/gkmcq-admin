import PropTypes from 'prop-types';
// material
import { alpha, styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton } from '@mui/material';
import { connect } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGOUT, LOGOUT_MESSAGE } from '../../utils/strings';
import CommonDialog from '../../components/CommonDialog';
import { logoutAdmin } from '../../actions/adminActions/adminLogin';
// components
import Iconify from '../../components/Iconify';
//
import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
import LanguagePopover from './LanguagePopover';
import NotificationsPopover from './NotificationsPopover';

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;
const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  [theme.breakpoints.up('lg')]: {
    width: `calc(100% - ${DRAWER_WIDTH + 1}px)`
  }
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5)
  }
}));

// ----------------------------------------------------------------------

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func,
  logoutAdmin: PropTypes.func
};

function DashboardNavbar(props) {
  const navigate = useNavigate();
  const [logoutDialog, setLogoutDialog] = useState(false);

  return (
    <RootStyle>
      <ToolbarStyle>
        <IconButton
          onClick={props.onOpenSidebar}
          sx={{ mr: 1, color: 'text.primary', display: { lg: 'none' } }}
        >
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>

        {/* <Searchbar /> */}
        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
          {/* <LanguagePopover /> */}
          {/* <NotificationsPopover /> */}
          <AccountPopover logout={() => setLogoutDialog(true)} />
        </Stack>
      </ToolbarStyle>
      <CommonDialog
        open={logoutDialog}
        close={() => setLogoutDialog(false)}
        onSuccess={() => props.logoutAdmin(navigate)}
        dialogTitle={LOGOUT}
        dialogMessage={LOGOUT_MESSAGE}
      />
    </RootStyle>
  );
}

const mapStateToProps = (state) => ({
  adminData: state.adminData.admin
});

export default connect(mapStateToProps, {
  logoutAdmin
})(DashboardNavbar);

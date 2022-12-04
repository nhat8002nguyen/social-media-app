import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import * as React from "react";
import { useSelector } from "react-redux";
import {
  SnackbarState,
  toggleSnackbar,
} from "redux/slices/statusNotifications/snackbarsSlice";
import { RootState, useAppDispatch } from "redux/store/store";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomizedSnackbars() {
  const dispatch = useAppDispatch();
  const [openSeverity, setOpenSeverity] =
    React.useState<SnackbarState["severity"]>("none");
  const { message, severity }: SnackbarState = useSelector(
    (state: RootState) => state.snackbar
  );

  React.useEffect(() => {
    setOpenSeverity(severity);
  }, [severity]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSeverity("none");
    dispatch(toggleSnackbar({ message: "", severity: "none" }));
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Snackbar
        open={openSeverity == "success"}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSeverity == "error"}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert severity="error">{message}</Alert>
      </Snackbar>
      <Snackbar
        open={openSeverity == "warning"}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert severity="warning">{message}</Alert>
      </Snackbar>
      <Snackbar
        open={openSeverity == "info"}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert severity="info">{message}</Alert>
      </Snackbar>
    </Stack>
  );
}

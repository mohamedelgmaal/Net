import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { useSelector, useDispatch } from "react-redux";
import {
  setOpen,
  getDialogTrailerMovie,
  getId,
} from "../redux/movieSlice";
import { IoClose } from "react-icons/io5";
import VideoBackground from "./VideoBackground";

export default function MovieDialog() {
  const { open, id } = useSelector((store) => store.movie);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(setOpen(false));
    dispatch(getDialogTrailerMovie(null));
    dispatch(getId(""));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: {
            xs: "calc(100% - 16px)",
            sm: "90vw",
            md: "85vw",
            lg: "min(1000px, 85vw)",
          },
          maxWidth: "none",
          margin: { xs: 1, sm: 2 },
          backgroundColor: "#080808",
          borderRadius: { xs: "8px", sm: "12px" },
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        aria-label="Close video"
        sx={{
          position: "absolute",
          top: { xs: 6, sm: 10 },
          right: { xs: 6, sm: 10 },
          zIndex: 10,
          color: "#fff",
          backgroundColor: "rgba(0,0,0,0.75)",
          width: { xs: 34, sm: 42 },
          height: { xs: 34, sm: 42 },
          "&:hover": {
            backgroundColor: "#e50914",
          },
        }}
      >
        <IoClose size={24} />
      </IconButton>

      <DialogContent
        sx={{
          padding: "0 !important",
          backgroundColor: "#000",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {open && <VideoBackground movieId={id} bool={true} />}
      </DialogContent>
    </Dialog>
  );
}
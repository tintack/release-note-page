import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  Icon,
  Input,
  Toolbar,
  Typography
} from "@material-ui/core";
import { EventNote } from "@material-ui/icons";

export default ({ open, title, content, onClose }) => (
  <Dialog fullScreen open={open} onClose={onClose}>
    <Toolbar>
      <Icon style={{ marginRight: 10 }}>
        <EventNote />
      </Icon>
      <Typography variant="title" color="inherit" style={{ flex: 1 }}>
        {title}
      </Typography>
      <Button onClick={onClose} color="inherit">
        Close
      </Button>
    </Toolbar>
    <DialogContent>
      <Input
        style={{ fontFamily: "monospace" }}
        fullWidth
        disableUnderline
        multiline
        rows={40}
        value={content}
      />
    </DialogContent>
  </Dialog>
);

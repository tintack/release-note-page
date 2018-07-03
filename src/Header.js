import React from "react";
import {
  AppBar,
  Button,
  Icon,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
import { EventNote, Refresh, ArrowDownward } from "@material-ui/icons";
import withWidth, { isWidthDown } from "@material-ui/core/withWidth";

export default withWidth()(({ title, onMarkdown, onReload, width }) => (
  <AppBar position="sticky">
    <Toolbar>
      <Icon style={{ marginRight: 10 }}>
        <EventNote />
      </Icon>
      <Typography variant="title" noWrap color="inherit" style={{ flex: 1 }}>
        {title}
      </Typography>

      {isWidthDown("xs", width) ? (
        <IconButton color="inherit" onClick={onReload}>
          <Refresh />
        </IconButton>
      ) : (
        <Button color="inherit" onClick={onReload}>
          Reload
        </Button>
      )}
      {isWidthDown("xs", width) ? (
        <IconButton color="inherit" onClick={onMarkdown}>
          <ArrowDownward />
        </IconButton>
      ) : (
        <Button color="inherit" onClick={onMarkdown}>
          Markdown
        </Button>
      )}
    </Toolbar>
  </AppBar>
));

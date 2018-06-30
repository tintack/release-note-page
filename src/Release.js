import React from "react";
import {
  AppBar,
  Avatar,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Divider,
  Grid,
  Icon,
  Input,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Toolbar,
  Typography
} from "@material-ui/core";
import { ExpandMore, ChevronRight, EventNote } from "@material-ui/icons";

import update from "immutability-helper";
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from "react-sortable-hoc";

import { notesToMarkdown } from "./util.js";
import testdata from "./assets/testdata.json";

const Header = ({ title, onMarkdown, onReload }) => (
  <AppBar position="sticky">
    <Toolbar>
      <Icon style={{ marginRight: 10 }}>
        <EventNote />
      </Icon>
      <Typography variant="title" color="inherit" style={{ flex: 1 }}>
        {title}
      </Typography>

      <Button color="inherit" onClick={onReload}>
        Reload
      </Button>
      <Button color="inherit" onClick={onMarkdown}>
        Markdown
      </Button>
    </Toolbar>
  </AppBar>
);

const MarkdownDialog = ({ open, title, content, onClose }) => (
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

class EntryBody extends React.Component {
  state = { open: false };

  handleClickOpen = () => {
    // this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { issue_number, html_url, title, user, special_thanks } = this.props;
    return (
      <React.Fragment>
        <ListItem ContainerComponent="div" onClick={this.handleClickOpen}>
          <ListItemText>
            {title} (<a href={html_url}>#{issue_number}</a>)
          </ListItemText>
          <ListItemSecondaryAction>
            {special_thanks ? <Avatar src={user.avatar_url} /> : null}
          </ListItemSecondaryAction>
        </ListItem>

        <Dialog open={this.state.open} onClose={this.handleClose}>
          <DialogTitle>
            Pull Request <a href={html_url}>#{issue_number}</a>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Avatar src={user.avatar_url} />
              {user.login}
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }
}

const Entry = SortableElement(({ entry, index }) => (
  <EntryBody index={index} {...entry} />
));

const EntryList = SortableContainer(({ entries }) => (
  <List component="div" disablePadding>
    {entries.map((entry, i, arr) => {
      return (
        <React.Fragment>
          <Entry index={i} entry={entry} />
          {arr.length - 1 === i ? null : <Divider component="li" />}
        </React.Fragment>
      );
    })}
  </List>
));

class Section extends React.Component {
  state = { open: true };

  handleClick = () => {
    this.setState(s => ({ open: !s.open }));
  };

  onEntryDragEnd = ({ oldIndex, newIndex }) => {
    const { index, onEntryDragEnd } = this.props;
    onEntryDragEnd(index, oldIndex, newIndex);
  };

  shouldCancelStart = e => {
    // Cancel sorting if the event target is an anchor tag (`a`)
    if (e.target.tagName.toLowerCase() === "a") {
      return true; // Return true to cancel sorting
    }
  };

  render() {
    const { name, entries } = this.props;
    const onEntryDragEnd = this.onEntryDragEnd;
    const shouldCancelStart = this.shouldCancelStart;

    return (
      <div style={{ margin: 20 }}>
        <Button onClick={this.handleClick}>
          {this.state.open ? <ExpandMore /> : <ChevronRight />}
          <ListItemText primary={name} />
        </Button>
        <Paper>
          <Collapse in={this.state.open} timeout="auto" unmountOnExit>
            <EntryList
              entries={entries}
              onSortEnd={onEntryDragEnd}
              shouldCancelStart={shouldCancelStart}
            />
          </Collapse>
        </Paper>
      </div>
    );
  }
}

export default class extends React.Component {
  state = { markdownOpen: false };

  onMarkdownOpen = () => {
    this.setState({ markdownOpen: true });
  };

  onMarkdownClose = () => {
    this.setState({ markdownOpen: false });
  };

  onReload = () => {
    this.setState({ data: testdata });
  };

  onEntryDragEnd = (sectionIndex, oldEntryIndex, newEntryIndex) => {
    const testdataT = this.state.testdata;
    const { sections } = testdataT;
    const section = sections[sectionIndex];
    const { entries } = section;
    const newSection = update(section, {
      entries: { $set: arrayMove(entries, oldEntryIndex, newEntryIndex) }
    });

    this.setState({
      testdata: update(testdataT, {
        sections: {
          $splice: [[sectionIndex, 1, newSection]]
        }
      })
    });
  };

  render() {
    const { match } = this.props;
    const { org, repo, version } = match.params;

    const data = this.state.data;

    const onEntryDragEnd = this.onEntryDragEnd;
    const onMarkdownOpen = this.onMarkdownOpen;
    const onMarkdownClose = this.onMarkdownClose;
    const { markdownOpen } = this.state;
    const onReload = this.onReload;

    return (
      <React.Fragment>
        <Header
          title={`Release Note ${org}/${repo}/${version}`}
          onMarkdown={onMarkdownOpen}
          onReload={onReload}
        />
        <Grid container justify="center">
          {
            // <Grid item xs={8}>
            //   <CircularProgress size={100} style={{ margin: "auto" }} />
            // </Grid>
          }
          <Grid item xs={12} md={10} lg={8}>
            {data ? (
              <List component="div">
                {data.sections.map(function(section, index) {
                  const { name } = section;
                  return (
                    <Section
                      key={name}
                      index={index}
                      onEntryDragEnd={onEntryDragEnd}
                      {...section}
                    />
                  );
                })}
              </List>
            ) : (
              <h1>no data</h1>
            )}
          </Grid>
        </Grid>
        <MarkdownDialog
          open={markdownOpen}
          title={`Release Note v${version}.0`}
          content={notesToMarkdown(testdata)}
          onClose={onMarkdownClose}
        />
      </React.Fragment>
    );
  }
}

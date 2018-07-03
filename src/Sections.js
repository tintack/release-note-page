import React from "react";
import {
  Avatar,
  Button,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper
} from "@material-ui/core";
import { ExpandMore, ChevronRight } from "@material-ui/icons";

import { SortableContainer, SortableElement } from "react-sortable-hoc";

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
        <React.Fragment key={entry.issue_number}>
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
      <div style={{ marginBottom: 20 }}>
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

export default ({ sections, onEntryDragEnd }) => (
  <List component="div" padding={0}>
    {sections.map(function(section, index) {
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
);

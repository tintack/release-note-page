import React from "react";
import { CircularProgress, Grid } from "@material-ui/core";

import update from "immutability-helper";
import { arrayMove } from "react-sortable-hoc";

import axios from "axios";
import queryString from "qs";

import Header from "./Header.js";
import MarkdownDialog from "./MarkdownDialog.js";
import Sections from "./Sections.js";

import { notesToMarkdown } from "./util.js";
import testdata from "./assets/testdata.json";

export default class extends React.Component {
  state = { loading: false, markdownOpen: false };

  onMarkdownOpen = () => {
    this.setState({ markdownOpen: true });
  };

  onMarkdownClose = () => {
    this.setState({ markdownOpen: false });
  };

  onReload = () => {
    const { match } = this.props;
    const { org, repo, version } = match.params;
    const parsed = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true
    });
    const { token } = parsed;

    this.setState({
      data: undefined,
      loading: true
    });
    axios
      .get(`/api/release`, {
        params: {
          org: org,
          repo: repo,
          version: version,
          token: token
        }
      })
      .then(response => {
        console.log(JSON.stringify(response));
        const { data } = response;
        const { sections } = data;
        if (sections) {
          this.setState({ data: data, loading: false });
        } else {
          throw new Error(
            `sections missing in received data ${JSON.stringify(response)}`
          );
        }
      })
      .catch(e => {
        console.log(e);
        alert(`failed to load: ${e}, showing testdata`);
        this.setState({ data: testdata, loading: false });
      });
  };

  onEntryDragEnd = (sectionIndex, oldEntryIndex, newEntryIndex) => {
    const dataT = this.state.data;
    const { sections } = dataT;
    const section = sections[sectionIndex];
    const { entries } = section;
    const newSection = update(section, {
      entries: { $set: arrayMove(entries, oldEntryIndex, newEntryIndex) }
    });

    this.setState({
      data: update(dataT, {
        sections: {
          $splice: [[sectionIndex, 1, newSection]]
        }
      })
    });
  };

  render() {
    const { match } = this.props;
    const { org, repo, version } = match.params;

    const { data, markdownOpen, loading } = this.state;
    const onEntryDragEnd = this.onEntryDragEnd;
    const onMarkdownOpen = this.onMarkdownOpen;
    const onMarkdownClose = this.onMarkdownClose;
    const onReload = this.onReload;

    return (
      <React.Fragment>
        <Header
          title={`Release Note ${org}/${repo}/${version}`}
          onMarkdown={onMarkdownOpen}
          onReload={onReload}
        />
        <Grid container justify="center">
          {loading ? (
            <Grid item xs={8}>
              <CircularProgress size={100} style={{ margin: "auto" }} />
            </Grid>
          ) : null}
          <Grid item xs={12} md={10} lg={8}>
            {data ? (
              data.sections ? (
                <Sections
                  sections={data.sections}
                  onEntryDragEnd={onEntryDragEnd}
                />
              ) : (
                <h1>no data.sections</h1>
              )
            ) : (
              <h1>no data</h1>
            )}
          </Grid>
        </Grid>
        <MarkdownDialog
          open={markdownOpen}
          title={`Release Note ${version}.0`}
          content={notesToMarkdown(data)}
          onClose={onMarkdownClose}
        />
      </React.Fragment>
    );
  }
}

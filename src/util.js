function entryToMarkdown(entry) {
  var ret = entry.title + " (#" + entry.issue_number + ")";
  if (entry.special_thanks) {
    ret += "\n    * Special Thanks: @" + entry.user.login;
  }
  return ret;
}

function entriesToMarkdown(entries) {
  return entries.reduce(function(total, current) {
    return total + "  * " + entryToMarkdown(current) + "\n";
  }, "");
}

function notesToMarkdown(notes) {
  return notes.sections.reduce(function(total, current) {
    return (
      total + "# " + current.name + "\n" + entriesToMarkdown(current.entries)
    );
  }, "");
}

export { notesToMarkdown };

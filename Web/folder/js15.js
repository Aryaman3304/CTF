"use strict";

var _ReactBootstrap = ReactBootstrap,
    Badge = _ReactBootstrap.Badge,
    Button = _ReactBootstrap.Button,
    ButtonGroup = _ReactBootstrap.ButtonGroup,
    Glyphicon = _ReactBootstrap.Glyphicon,
    Col = _ReactBootstrap.Col,
    Input = _ReactBootstrap.Input,
    ListGroup = _ReactBootstrap.ListGroup,
    ListGroupItem = _ReactBootstrap.ListGroupItem,
    NavItem = _ReactBootstrap.NavItem,
    Panel = _ReactBootstrap.Panel,
    PanelGroup = _ReactBootstrap.PanelGroup,
    ProgressBar = _ReactBootstrap.ProgressBar,
    Row = _ReactBootstrap.Row,
    Tab = _ReactBootstrap.Tab,
    Table = _ReactBootstrap.Table,
    Tabs = _ReactBootstrap.Tabs;
var update = React.addons.update;

var renderAchievementMessage = _.template($("#achievement-message-template").remove().text());

window.ratingMetrics = ["Difficulty", "Enjoyment", "Educational Value"];
window.ratingQuestion = {
  Difficulty: "How difficult is this problem?",
  Enjoyment: "Did you enjoy this problem?",
  "Educational Value": "How much did you learn while solving this problem?"
};
window.ratingChoices = {
  Difficulty: ["Too easy", "", "A bit challenging", "", "Very hard"],
  Enjoyment: ["Hated it!", "", "It was okay.", "", "Loved it!"],
  "Educational Value": ["Nothing at all", "", "Something useful", "", "Learned a lot!"]
};
window.timeValues = ["5 minutes or less", "10 minutes", "20 minutes", "40 minutes", "1 hour", "2 hours", "3 hours", "4 hours", "5 hours", "6 hours", "8 hours", "10 hours", "15 hours", "20 hours", "30 hours", "40 hours or more"];

var sanitizeMetricName = function sanitizeMetricName(metric) {
  return metric.toLowerCase().replace(" ", "-");
};

var constructAchievementCallbackChainHelper = function constructAchievementCallbackChainHelper(achievements, index) {
  $(".modal-backdrop").remove();

  if (index >= 0) {
    messageDialog(renderAchievementMessage({
      achievement: achievements[index]
    }), "Achievement Unlocked!", "OK", function () {
      return constructAchievementCallbackChainHelper(achievements, index - 1);
    });
  }
};

var constructAchievementCallbackChain = function constructAchievementCallbackChain(achievements) {
  return constructAchievementCallbackChainHelper(achievements, achievements.length - 1);
}; // apiCall "GET", "/api/v1/achievements"
// .done (data) ->
//   if data['status'] is 1
//     new_achievements = (x for x in data.data when !x.seen)
//     constructAchievementCallbackChain new_achievements


var addProblemReview = function addProblemReview(e) {
  var target = $(e.target);
  var pid = target.data("pid");
  var feedback = {
    liked: target.data("setting") === "up"
  };
  var postData = {
    feedback: feedback,
    pid: pid
  };
  apiCall("POST", "/api/v1/feedback", postData).done(function (data) {
    apiNotify({
      status: 1,
      message: "Your feedback has been accepted."
    });
    var selector = "#".concat(pid, "-thumbs").concat(feedback.liked ? "down" : "up");
    $(selector).removeClass("active");
    target.addClass("active");
    gtag('event', 'Review', {
      'event_category': 'Problem',
      'event_label': 'Basic'
    });
  }).fail(function (jqXHR) {
    return apiNotify({
      status: 0,
      message: jqXHR.responseJSON.message
    });
  });
}; // apiCall "GET", "/api/v1/achievements"
// .done (data) ->
//   if data['status'] is 1
//     new_achievements = (x for x in data.data when !x.seen)
//     constructAchievementCallbackChain new_achievements


var updateScoreStats = function updateScoreStats(selector) {
  drawTeamProgressionGraph("#team-progression-graph");
  apiCall("GET", "/api/v1/team/score").done(function (data) {
    if (data) {
      $(selector).children("#team-score").remove();
      $(selector).append("<span id='team-score' class='pull-right'>Score: ".concat(data.score, "</span>"));
    }
  });
};

var SortableButton = React.createClass({
  displayName: "SortableButton",
  propTypes: {
    name: React.PropTypes.string.isRequired
  },
  handleClick: function handleClick(e) {
    this.props.onFocus(this.props.name);

    if (this.props.active) {
      this.props.onSortChange(this.props.name, !this.props.ascending);
    } else {
      //Make it active. No-op on sorting.
      this.props.onSortChange(this.props.name, this.props.ascending);
    }
  },
  render: function render() {
    var glyph = this.props.ascending ? React.createElement(Glyphicon, {
      glyph: "chevron-down"
    }) : React.createElement(Glyphicon, {
      glyph: "chevron-up"
    });
    return React.createElement(Button, {
      bsSize: "small",
      active: this.props.active,
      onClick: this.handleClick
    }, this.props.name, " ", glyph);
  }
});
var SortableButtonGroup = React.createClass({
  displayName: "SortableButtonGroup",
  getInitialState: function getInitialState() {
    var result = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.props.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        name = _step.value;
        result.push([name, {
          active: false,
          ascending: true
        }]);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var state = _.object(result);

    state[this.props.activeSort.name] = {
      active: true,
      ascending: this.props.activeSort.ascending
    };
    return state;
  },
  handleClick: function handleClick(name) {
    //Reset all active states.
    var activeStates = _.reduce(this.getInitialState(), function (memo, sortState, name) {
      memo[name] = {
        active: false,
        ascending: true
      };
      return memo;
    }, {});

    activeStates[name].active = true;
    this.setState(activeStates);
  },
  render: function render() {
    var _this = this;

    var activeState = this.state;
    activeState[this.props.activeSort.name] = {
      active: true,
      ascending: this.props.activeSort.ascending
    };
    return React.createElement(ButtonGroup, null, this.props.data.map(function (name, i) {
      return React.createElement(SortableButton, {
        key: i,
        active: activeState[name].active,
        ascending: activeState[name].ascending,
        name: name,
        onSortChange: _this.props.onSortChange,
        onFocus: _this.handleClick
      });
    }));
  }
});
var ProblemFilter = React.createClass({
  displayName: "ProblemFilter",
  propTypes: {
    onFilterChange: React.PropTypes.func.isRequired,
    filter: React.PropTypes.string
  },
  getInitialState: function getInitialState() {
    return {
      filter: this.props.filter
    };
  },
  onChange: function onChange() {
    var filterValue = this.refs.filter.getInputDOMNode().value;
    this.setState({
      filter: filterValue
    });
    this.props.onFilterChange(filterValue);
  },
  render: function render() {
    var glyph = React.createElement(Glyphicon, {
      glyph: "search"
    });
    return React.createElement(Panel, null, React.createElement(Col, {
      xs: 12
    }, "Search", React.createElement(Input, {
      type: "text",
      className: "form-control",
      ref: "filter",
      addonBefore: glyph,
      onChange: this.onChange,
      value: this.state.filter
    })), React.createElement(Col, {
      xs: 12
    }, React.createElement(SortableButtonGroup, {
      key: this.props.activeSort,
      activeSort: this.props.activeSort,
      onSortChange: this.props.onSortChange,
      data: ["name", "category", "score"]
    })));
  }
});
var ClassifierItem = React.createClass({
  displayName: "ClassifierItem",
  handleClick: function handleClick(e) {
    this.props.setClassifier(!this.props.active, this.props.classifier, this.props.name);
    this.props.onExclusiveClick(this.props.name);
  },
  render: function render() {
    var glyph = React.createElement(Glyphicon, {
      glyph: "ok"
    });
    return React.createElement(ListGroupItem, {
      onClick: this.handleClick,
      className: "classifier-item"
    }, this.props.name, " ", this.props.active ? glyph : undefined, " ", React.createElement("div", {
      className: "pull-right"
    }, React.createElement(Badge, null, this.props.size)));
  }
});
var ProblemClassifier = React.createClass({
  displayName: "ProblemClassifier",
  getInitialState: function getInitialState() {
    return _.object(this.props.data.map(function (classifier) {
      return [classifier.name, false];
    }));
  },
  handleClick: function handleClick(name) {
    var activeStates = this.getInitialState();
    activeStates[name] = !this.state[name];
    this.setState(activeStates);
  },
  render: function render() {
    var _this2 = this;

    return React.createElement(Panel, {
      header: this.props.name,
      defaultExpanded: true,
      collapsible: true
    }, React.createElement(ListGroup, {
      fill: true
    }, this.props.data.map(function (data, i) {
      return React.createElement(ClassifierItem, Object.assign({
        onExclusiveClick: _this2.handleClick,
        active: _this2.state[data.name],
        key: i,
        setClassifier: _this2.props.setClassifier
      }, data));
    })));
  }
});
var ProblemClassifierList = React.createClass({
  displayName: "ProblemClassifierList",
  render: function render() {
    var categories = _.groupBy(this.props.problems, "category");

    var categoryData = _.map(categories, function (problems, category) {
      return {
        name: "Only ".concat(category),
        size: problems.length,
        classifier: function classifier(problem) {
          return problem.category === category;
        }
      };
    });

    categoryData = _.sortBy(categoryData, "name");

    var solvedState = _.groupBy(this.props.problems, "solved");

    var solvedData = _.map(solvedState, function (problems, solved) {
      return {
        name: solved == 'true' ? "Solved" : "Unsolved",
        size: problems.length,
        classifier: function classifier(problem) {
          return problem.solved.toString() === solved;
        }
      };
    }); //solvedData = _.sortBy(solvedData, "name");


    return React.createElement(PanelGroup, {
      className: "problem-classifier",
      collapsible: true
    }, React.createElement(ProblemClassifier, Object.assign({
      name: "Categories",
      data: categoryData
    }, this.props)), React.createElement(ProblemClassifier, Object.assign({
      name: "Solved",
      data: solvedData
    }, this.props)));
  }
});
var ProblemHintTable = React.createClass({
  displayName: "ProblemHintTable",
  render: function render() {
    return React.createElement(ListGroup, null, React.createElement("div", {
      className: "panel-body"
    }, this.props.hints.map(function (hint, i) {
      return React.createElement(ListGroupItem, {
        key: i,
        dangerouslySetInnerHTML: {
          __html: hint
        }
      });
    })));
  }
});
var ProblemSubmit = React.createClass({
  displayName: "ProblemSubmit",
  getInitialState: function getInitialState() {
    return {
      value: ""
    };
  },
  handleChange: function handleChange(e) {
    this.setState({
      value: e.target.value
    });
  },
  submitProblem: function submitProblem(e) {
    var _this3 = this;

    e.preventDefault();
    var input = $(e.target).find("input");
    apiCall("POST", "/api/v1/submissions", {
      pid: this.props.pid,
      key: this.state.value,
      method: "web"
    }).done(function (data) {
      if (data.correct) {
        gtag('event', 'Solve', {
          'event_category': 'Problem',
          'event_label': 'Basic'
        });
        apiNotify({
          status: 1,
          message: data.message
        });

        _this3.setState({
          value: ""
        });

        _this3.props.toggleExpand();

        _this3.props.updateProblemsList();
      } else {
        gtag('event', 'Wrong', {
          'event_category': 'Problem',
          'event_label': 'Basic'
        });
        apiNotify({
          status: 0,
          message: data.message
        });
      }
    }).fail(function (jqXHR) {
      return apiNotify({
        status: 0,
        message: jqXHR.responseJSON.message
      });
    });
  },
  render: function render() {
    var submitButton = React.createElement(Button, {
      className: "btn-primary",
      type: "submit"
    }, "Submit!");
    var upButton = React.createElement(Button, {
      id: this.props.pid + "-thumbsup",
      "data-pid": this.props.pid,
      "data-setting": "up",
      style: {
        borderRadius: 0,
        top: 0
      },
      className: "rating-button glyphicon glyphicon-thumbs-up pull-left ".concat(this.props.thumbs.upClass),
      onClick: addProblemReview
    });
    var downButton = React.createElement(Button, {
      id: this.props.pid + "-thumbsdown",
      "data-pid": this.props.pid,
      "data-setting": "down",
      style: {
        top: 0
      },
      className: "rating-button glyphicon glyphicon-thumbs-down pull-right ".concat(this.props.thumbs.downClass),
      onClick: addProblemReview
    });
    return React.createElement(Col, null, React.createElement("p", {
      className: "problem-description",
      dangerouslySetInnerHTML: {
        __html: this.props.description
      }
    }), React.createElement("form", {
      className: "problem-submit",
      onSubmit: this.submitProblem
    }, React.createElement(Row, null, React.createElement(Input, {
      buttonBefore: submitButton,
      type: "text",
      value: this.state.value,
      placeholder: "picoCTF{FLAG}",
      onChange: this.handleChange
    }, React.createElement("span", {
      className: "input-group-btn"
    }, upButton), React.createElement("span", {
      className: "input-group-btn"
    }, downButton)))));
  }
});
var Problem = React.createClass({
  displayName: "Problem",
  getInitialState: function getInitialState() {
    if (this.props.solved) {
      return {
        expanded: false
      };
    } else {
      return {
        expanded: true
      };
    }
  },
  handleExpand: function handleExpand(e) {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      expanded: !this.state.expanded
    });
  },
  render: function render() {
    var problemHeader = React.createElement("div", null, React.createElement("span", {
      className: "do-expand"
    }, this.props.name, " - Points: ", this.props.score, " - (Solves: ", this.props.solves, ")"), React.createElement("div", {
      className: "pull-right"
    }, this.props.category, " - ", this.props.solved ? "Solved" : "Unsolved")); //Do something interesting here.

    var panelStyle = this.props.disabled ? "default" : "default";
    var alreadyReviewed = false;
    var review = null;

    for (var i = 0; i < this.props.reviewData.length; i++) {
      if (this.props.reviewData[i].pid === this.props.pid) {
        alreadyReviewed = true;
        review = this.props.reviewData[i].feedback;
      }
    }

    var thumbs = {
      upClass: alreadyReviewed && review.liked ? "active" : "",
      downClass: alreadyReviewed && !review.liked ? "active" : ""
    };

    if (this.state.expanded && this.props.hints.length > 0) {
      return React.createElement(Panel, {
        bsStyle: panelStyle,
        header: problemHeader,
        collapsible: true,
        expanded: this.state.expanded,
        onSelect: this.handleExpand
      }, React.createElement(Tabs, {
        defaultActiveKey: this.props.pid + "solve",
        bsStyle: "tabs"
      }, React.createElement(Tab, {
        eventKey: this.props.pid + "solve",
        title: "Solve"
      }, React.createElement("div", {
        className: "panel-body"
      }, React.createElement(ProblemSubmit, Object.assign({
        thumbs: thumbs,
        updateProblemsList: this.props.updateProblemsList,
        toggleExpand: this.handleExpand
      }, this.props)))), React.createElement(Tab, {
        eventKey: this.props.pid + "hint",
        title: "Hints"
      }, React.createElement(ProblemHintTable, {
        hints: this.props.hints
      }))));
    } else if (this.state.expanded && this.props.hints.length == 0) {
      return React.createElement(Panel, {
        bsStyle: panelStyle,
        header: problemHeader,
        collapsible: true,
        expanded: this.state.expanded,
        onSelect: this.handleExpand
      }, React.createElement(Tabs, {
        defaultActiveKey: this.props.pid + "solve",
        bsStyle: "tabs"
      }, React.createElement(Tab, {
        eventKey: this.props.pid + "solve",
        title: "Solve"
      }, React.createElement("div", {
        className: "panel-body"
      }, React.createElement(ProblemSubmit, Object.assign({
        thumbs: thumbs,
        toggleExpand: this.handleExpand
      }, this.props))))));
    } else {
      return React.createElement(Panel, {
        bsStyle: panelStyle,
        header: problemHeader,
        collapsible: true,
        expanded: this.state.expanded,
        onSelect: this.handleExpand
      });
    }
  }
});
var ProblemList = React.createClass({
  displayName: "ProblemList",
  propTypes: {
    problems: React.PropTypes.array.isRequired
  },
  render: function render() {
    var _this4 = this;

    if (this.props.problems.length === 0) {
      return React.createElement("h4", null, "No matching problems are available.");
    }

    var problemComponents = this.props.problems.map(function (problem, i) {
      return React.createElement(Col, {
        key: i,
        xs: 12
      }, React.createElement(Problem, Object.assign({
        key: problem.name,
        reviewData: _this4.props.reviewData,
        updateProblemsList: _this4.props.updateProblemsList
      }, problem)));
    });
    return React.createElement(Row, null, problemComponents);
  }
});
var ProblemView = React.createClass({
  displayName: "ProblemView",
  getInitialState: function getInitialState() {
    return {
      reviewData: [],
      filterRegex: /.*/,
      activeSort: {
        name: "score",
        ascending: true
      },
      problemClassifier: [{
        name: "all",
        func: function func(problem) {
          return true;
        }
      }]
    };
  },
  componentDidMount: function componentDidMount() {
    this.updateFeedback();
  },
  updateFeedback: function updateFeedback() {
    var _this5 = this;

    apiCall("GET", "/api/v1/feedback").done(function (data) {
      _this5.setState({
        reviewData: data
      });
    }).fail(function (jqXHR) {
      return apiNotify({
        status: 0,
        message: jqXHR.responseJSON.message
      });
    });
  },
  onFilterChange: function onFilterChange(filter) {
    try {
      var newFilter = new RegExp(filter, "i");
      this.setState({
        filterRegex: newFilter
      });
    } catch (error) {}
  },
  // We shouldn't do anything.
  onSortChange: function onSortChange(name, ascending) {
    this.setState({
      activeSort: {
        name: name,
        ascending: ascending
      }
    });
  },
  setClassifier: function setClassifier(classifierState, classifier, name) {
    if (classifierState) {
      this.setState(update(this.state, {
        problemClassifier: {
          $push: [{
            name: name,
            func: classifier
          }]
        }
      }));
    } else {
      var otherClassifiers = _.filter(this.state.problemClassifier, function (classifierObject) {
        return classifierObject.name !== name;
      });

      this.setState({
        problemClassifier: otherClassifiers
      });
    }
  },
  filterProblems: function filterProblems(problems) {
    var _this6 = this;

    var visibleProblems = _.filter(problems, function (problem) {
      return _this6.state.filterRegex.exec(problem.name) !== null && _.all(_this6.state.problemClassifier.map(function (classifier) {
        return classifier.func(problem);
      }));
    });

    var sortedProblems = _.sortBy(visibleProblems, this.state.activeSort.name);

    if (this.state.activeSort.ascending) {
      return sortedProblems;
    } else {
      return sortedProblems.reverse();
    }
  },
  render: function render() {
    var filteredProblems = this.filterProblems(this.props.problems);
    return React.createElement(Row, {
      className: "pad"
    }, React.createElement(Col, {
      md: 3
    }, React.createElement(Row, null, React.createElement(ProblemFilter, {
      onSortChange: this.onSortChange,
      filter: "",
      activeSort: this.state.activeSort,
      onFilterChange: this.onFilterChange
    })), React.createElement(Row, null, React.createElement(ProblemClassifierList, {
      setClassifier: this.setClassifier,
      problems: filteredProblems
    }))), React.createElement(Col, {
      md: 9
    }, React.createElement(ProblemList, {
      problems: filteredProblems,
      reviewData: this.state.reviewData,
      updateProblemsList: this.props.updateProblemsList
    })));
  }
});
var ProblemProgress = React.createClass({
  displayName: "ProblemProgress",
  getInitialState: function getInitialState() {
    return {
      team: {},
      user: {}
    };
  },
  componentDidMount: function componentDidMount() {
    var _this7 = this;

    apiCall("GET", "/api/v1/team").done(function (data) {
      _this7.setState({
        team: data
      });
    }).fail(function (jqXHR) {
      return apiNotify({
        status: 0,
        message: jqXHR.responseJSON.message
      });
    });
    addAjaxListener("problemInfoState", "/api/v1/user", function (data) {
      _this7.setState({
        user: data
      });
    });
  },
  render: function render() {
    var panelHeader;

    var allProblemsByCategory = _.groupBy(this.props.problems, "category");

    var solvedProblemsByCategory = _.groupBy(this.props.solvedProblems, "category");

    var categories = _.keys(allProblemsByCategory);

    var styles = ["success", "info", "primary", "warning", "danger"];
    var glyphs = {
      Cryptography: "/img/lock.svg",
      "Web Exploitation": "/img/browser.svg",
      "Binary Exploitation": "/img/binary.svg",
      "Reverse Engineering": "/img/reversecog.svg",
      Forensics: "/img/search.svg",
      Tutorial: "/img/laptop.svg"
    };

    if (this.state.team && this.state.team.length > 0 && this.state.user.username !== this.state.team.team_name && this.state.team.team_name.length > 0) {
      panelHeader = React.createElement("div", null, "Category Overview", React.createElement("span", {
        className: "pull-right"
      }, "Team: ", React.createElement("b", null, this.state.team.team_name)));
    } else {
      panelHeader = React.createElement("div", null, "Category Overview");
    }

    return React.createElement(Panel, {
      header: panelHeader
    }, categories.map(function (category, i) {
      var currentlySolved = solvedProblemsByCategory[category] ? solvedProblemsByCategory[category].length : 0;
      return React.createElement(Row, {
        key: i
      }, React.createElement(Col, {
        sm: 8,
        md: 6,
        lg: 8,
        className: "progress-container"
      }, React.createElement(ProgressBar, {
        now: currentlySolved,
        bsStyle: styles[i % styles.length],
        max: allProblemsByCategory[category].length,
        label: "%(now)s / %(max)s"
      })), React.createElement(Col, {
        sm: 4,
        md: 6,
        lg: 4,
        className: "progress-label"
      }, React.createElement("img", {
        className: "category-icon",
        src: glyphs[category] ? glyphs[category] : "/img/laptop.svg"
      }), React.createElement("div", {
        className: "pull-right"
      }, category)));
    }));
  }
});
var ProblemRoot = React.createClass({
  displayName: "ProblemRoot",
  getInitialState: function getInitialState() {
    return {
      problems: [],
      solvedProblems: []
    };
  },
  componentDidMount: function componentDidMount() {
    this.updateProblemsList();
  },
  updateProblemsList: function updateProblemsList() {
    var _this8 = this;

    updateScoreStats("#title");
    apiCall("GET", "/api/v1/problems").done(function (data) {
      _this8.setState({
        problems: data
      });

      _this8.setState({
        solvedProblems: data.filter(function (problem) {
          return problem.solved;
        })
      });
    }).fail(function (jqXHR) {
      return apiNotify({
        status: 0,
        message: jqXHR.responseJSON.message
      });
    });
  },
  render: function render() {
    var progressHeader = React.createElement("div", null, React.createElement(Glyphicon, {
      glyph: "stats"
    }), " Progress Tracker");
    return React.createElement("div", null, React.createElement(Row, null, React.createElement(Panel, {
      header: progressHeader,
      defaultExpanded: false,
      collapsible: true
    }, React.createElement(Row, null, React.createElement(Col, {
      md: 6
    }, React.createElement(ProblemProgress, {
      problems: this.state.problems,
      solvedProblems: this.state.solvedProblems
    })), React.createElement(Col, {
      md: 6
    }, React.createElement(Panel, {
      header: "Score Progression over Time"
    }, React.createElement("div", {
      id: "team-progression-graph"
    })))))), React.createElement(Row, null, React.createElement(ProblemView, {
      problems: this.state.problems,
      updateProblemsList: this.updateProblemsList
    })));
  }
});
$(function () {
  ReactDOM.render(React.createElement(ProblemRoot, null), document.getElementById("problem-root-holder"));
});
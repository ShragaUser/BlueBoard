import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  Icon,
  Popover,
  Pane,
  Button,
  Table,
} from "evergreen-ui";
import "./Watch.scss";

class Watch extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    boardId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    currentWatchMode: PropTypes.string.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSelection = newWatchMode => {
    const { dispatch, boardId, userId } = this.props;
    if (newWatchMode !== this.props.currentWatchMode) {
      dispatch({
        type: "CHANGE_USER_WATCH",
        payload: { boardId, userId, newWatchMode }
      });
    }
  };

  addVIcon(watchMode) {
    const { currentWatchMode } = this.props;
    return watchMode === currentWatchMode ? (
      <Icon icon="tick-circle" color="success" marginRight={0} />
    ) : null;
  }

  renderWatchDiv = (mode, description) => {
    const { t } = this.props;
    return (
      <div>
        <span className="div-heading">{t(mode)}</span>
        <span className="div-description">{t(description)}</span>
      </div>
    );
  };

  render() {
    const { t } = this.props;
    const watchModes = [
      {
        mode: "Watching",
        description: "Be notified of all conversations"
      },
      {
        mode: "Not watching",
        description: "Be notified only when assign"
      },
      {
        mode: "Ignoring",
        description: "Never be notified"
      }
    ];

    return (
      <div>
        <Popover
          content={
            <Pane width={200}>
              {watchModes.map((watchMode, index) => {
                return (
                  <div className="row">
                    <Table.Row
                      height={60}
                      paddingY={12}
                      key={index}
                      isSelectable
                      onSelect={() => this.handleSelection(watchMode.mode)}
                    >
                      <Table.TextCell>
                        {this.renderWatchDiv(
                          watchMode.mode,
                          watchMode.description
                        )}
                      </Table.TextCell>
                      <Table.Cell className="v-icon-wrapper" flex="none">
                        {this.addVIcon(watchMode.mode)}
                      </Table.Cell>
                    </Table.Row>
                  </div>
                );
              })}
            </Pane>
          }
        >
          <Button isActive={false} appearance="minimal" height={40}>
            <Icon
              appearance="minimal"
              height={40}
              icon="eye-open"
              color="#ffffff"
            />
            <div className="watch-header">{t("Watch")}</div>
          </Button>
        </Popover>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { boardId } = ownProps.match.params;
  const { user } = state;
  return {
    boardId,
    userId: user._id,
    currentWatchMode: state.boardsById[boardId].users.find(
      boardUser => boardUser.id === user._id
    ).watch
  };
};

export default withRouter(connect(mapStateToProps)(withTranslation()(Watch)));